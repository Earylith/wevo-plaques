"use server";

import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Le registre des e-mails partis, et ce qu'ils sont devenus.
 *
 * Deux sources, et il faut les deux :
 *
 *  - NOTRE journal dit ce que Guidz a tenté, quand, et si Brevo a accepté.
 *    C'est la seule source qui existe même quand l'envoi a échoué — un
 *    message refusé n'apparaît nulle part chez Brevo ;
 *  - les ÉVÉNEMENTS Brevo disent ce qui est arrivé ensuite : remis, ouvert,
 *    rejeté, classé indésirable. « Envoyé » ne veut pas dire « reçu », et
 *    c'est précisément la différence qui intéresse quand un client affirme
 *    n'avoir rien vu.
 *
 * Les événements ne sont pas recopiés en base : ils sont relus à chaque
 * ouverture de l'écran. Une copie divergerait, et Brevo est la source de
 * vérité sur son propre acheminement.
 */

const JOURNAL = "email_log";

async function exigerAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Accès réservé.");
  }
}

export type StatutEnvoi = "envoye" | "refuse" | "injoignable" | "non-configure";

/** Ce que le message est devenu, du plus grave au plus banal. */
export type Acheminement =
  | "probleme"
  | "ouvert"
  | "remis"
  | "en-route"
  | "inconnu";

export interface LigneJournal {
  id: string;
  etiquette: string;
  destinataire: string;
  sujet: string;
  statut: StatutEnvoi;
  messageId: string | null;
  erreur: string | null;
  envoyeLe: number;
  /** Complété depuis Brevo, quand le message y est retrouvé. */
  acheminement: Acheminement;
  /** L'événement Brevo brut, pour l'afficher tel quel. */
  evenement?: string;
  evenementLe?: number;
}

/**
 * Les événements Brevo qui signalent un échec de remise.
 *
 * Ils comptent davantage que tout le reste : une adresse qui rebondit
 * n'annonce pas un ennui passager, elle annonce un client injoignable.
 */
const ECHECS = new Set([
  "hardBounces", "hard_bounce", "softBounces", "soft_bounce",
  "blocked", "invalid", "spam", "error", "unsubscribed",
]);
const OUVERTURES = new Set(["opened", "uniqueOpened", "clicks", "click"]);

/**
 * Relève les événements récents chez Brevo, indexés par identifiant de
 * message.
 *
 * Brevo ne conserve ces événements qu'une trentaine de jours : au-delà, notre
 * journal reste, mais l'acheminement redevient inconnu. C'est dit à l'écran
 * plutôt que présenté comme une anomalie.
 */
async function evenementsBrevo(): Promise<Map<string, { etat: Acheminement; nom: string; date: number }>> {
  const index = new Map<string, { etat: Acheminement; nom: string; date: number }>();
  const cle = process.env.BREVO_API_KEY;
  if (!cle) return index;

  try {
    const reponse = await fetch(
      "https://api.brevo.com/v3/smtp/statistics/events?limit=500&sort=desc",
      { headers: { "api-key": cle, Accept: "application/json" }, cache: "no-store" }
    );
    if (!reponse.ok) {
      console.error("[journal] Brevo a refusé la lecture des événements", reponse.status);
      return index;
    }

    const corps = (await reponse.json()) as {
      events?: { messageId?: string; event?: string; date?: string }[];
    };

    /*
     * Un même message porte plusieurs événements — « delivered » puis
     * « opened ». On garde le plus significatif, pas le plus récent : savoir
     * qu'un message a rebondi importe plus que de savoir qu'il était parti.
     */
    const rang: Record<Acheminement, number> = {
      probleme: 4, ouvert: 3, remis: 2, "en-route": 1, inconnu: 0,
    };

    for (const e of corps.events || []) {
      if (!e.messageId || !e.event) continue;

      const etat: Acheminement = ECHECS.has(e.event)
        ? "probleme"
        : OUVERTURES.has(e.event)
          ? "ouvert"
          : e.event === "delivered"
            ? "remis"
            : "en-route";

      const connu = index.get(e.messageId);
      if (!connu || rang[etat] > rang[connu.etat]) {
        index.set(e.messageId, {
          etat,
          nom: e.event,
          date: e.date ? new Date(e.date).getTime() : Date.now(),
        });
      }
    }
  } catch (error) {
    console.error("[journal] événements Brevo injoignables", error);
  }

  return index;
}

export async function listerEnvois(limite = 300): Promise<LigneJournal[]> {
  await exigerAdmin();

  /*
   * Les deux lectures sont menées de front : Brevo peut être lent, et notre
   * journal n'a aucune raison d'attendre. Si Brevo ne répond pas, la liste
   * s'affiche quand même, acheminement inconnu.
   */
  const [snap, evenements] = await Promise.all([
    adminDb.collection(JOURNAL).orderBy("envoyeLe", "desc").limit(limite).get(),
    evenementsBrevo(),
  ]);

  return snap.docs.map((d) => {
    const data = d.data() as Omit<LigneJournal, "id" | "acheminement">;
    const suivi = data.messageId ? evenements.get(data.messageId) : undefined;

    return {
      ...data,
      id: d.id,
      erreur: data.erreur || null,
      acheminement: data.statut !== "envoye" ? "probleme" : suivi?.etat || "inconnu",
      evenement: suivi?.nom,
      evenementLe: suivi?.date,
    };
  });
}

/**
 * Efface les entrées les plus anciennes.
 *
 * Un registre qui grossit sans fin finit par coûter plus cher qu'il ne sert.
 * Rien n'est supprimé automatiquement : c'est un geste explicite, pour que
 * personne ne découvre un jour que l'historique s'est évaporé tout seul.
 */
export async function purgerJournal(avantJours: number): Promise<number> {
  await exigerAdmin();

  const limite = Date.now() - avantJours * 86400000;
  const vieux = await adminDb
    .collection(JOURNAL)
    .where("envoyeLe", "<", limite)
    .limit(400)
    .get();

  const lot = adminDb.batch();
  vieux.docs.forEach((d) => lot.delete(d.ref));
  await lot.commit();

  return vieux.size;
}
