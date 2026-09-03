import "server-only";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Envoi d'e-mails transactionnels, par l'API Brevo.
 *
 * Trois règles, dont dépend tout le reste :
 *
 *  1. CET ENVOI NE LÈVE JAMAIS. Un e-mail est une conséquence de l'action,
 *     pas l'action elle-même. Un compte créé, une commande encaissée ou un
 *     suivi enregistré doivent le rester même si Brevo est en panne — sinon
 *     une panne de messagerie devient une perte de commande.
 *  2. L'échec est JOURNALISÉ et REMONTÉ à l'appelant, qui décide s'il le
 *     signale. Avaler l'erreur en silence, c'est croire pendant des semaines
 *     qu'on prévient des clients qu'on ne prévient pas.
 *  3. Sans clé configurée, on ne tente rien et on le dit. En développement,
 *     c'est l'état normal : personne ne veut écrire à de vrais clients depuis
 *     sa machine.
 *
 * Le corps est envoyé en HTML ET en texte. Un message sans version texte
 * part plus volontiers en indésirable, et reste illisible pour qui lit ses
 * e-mails en texte brut.
 */

const API = "https://api.brevo.com/v3/smtp/email";

/** Le registre des envois. Voir `journaliser`. */
const JOURNAL = "email_log";

/**
 * Consigne une tentative d'envoi, réussie ou non.
 *
 * Sans ce registre, la seule trace d'un e-mail était une ligne de journal
 * serveur — introuvable trois jours plus tard, et absente en production. On
 * ne pouvait donc pas répondre à la question la plus banale du support :
 * « je n'ai rien reçu » — l'avons-nous vraiment envoyé, et quand ?
 *
 * Le CORPS n'est pas conservé : il se reconstruit à l'identique depuis les
 * gabarits, et le stocker gonflerait la base de plusieurs kilo-octets par
 * message pour rien.
 *
 * L'écriture est absorbée en cas d'échec. Un registre est un confort ; il ne
 * doit jamais empêcher un envoi ni faire échouer ce qui l'a déclenché.
 */
async function journaliser(entree: {
  etiquette: string;
  destinataire: string;
  sujet: string;
  statut: "envoye" | "refuse" | "injoignable" | "non-configure";
  messageId: string | null;
  erreur?: string;
}) {
  try {
    await adminDb.collection(JOURNAL).add({
      ...entree,
      // Firestore refuse `undefined` : l'erreur absente devient une absence.
      erreur: entree.erreur || null,
      envoyeLe: Date.now(),
    });
  } catch (error) {
    console.error("[email] journalisation impossible", error);
  }
}

/** L'expéditeur, tel qu'il apparaît chez le destinataire. */
function expediteur() {
  return {
    name: process.env.BREVO_SENDER_NAME || "Guidz",
    email: process.env.BREVO_SENDER_EMAIL || "contact@guidzme.fr",
  };
}

export interface Courriel {
  destinataire: string;
  nomDestinataire?: string;
  sujet: string;
  html: string;
  texte: string;
  /** Adresse à laquelle le client répondra s'il clique sur « Répondre ». */
  repondreA?: { email: string; nom?: string };
  /**
   * Étiquette Brevo : elle permet de retrouver, dans les journaux, tous les
   * envois d'un même type sans les compter à la main.
   */
  etiquette?: string;
}

export type ResultatEnvoi =
  | { envoye: true; id: string | null }
  | { envoye: false; raison: "non-configure" | "refuse" | "injoignable"; detail?: string };

export async function envoyerCourriel(courriel: Courriel): Promise<ResultatEnvoi> {
  const cle = process.env.BREVO_API_KEY;

  if (!cle) {
    console.info(
      "[email] envoi ignoré —",
      courriel.etiquette || "sans étiquette",
      "· BREVO_API_KEY absente"
    );
    await journaliser({
      etiquette: courriel.etiquette || "inconnu",
      destinataire: courriel.destinataire,
      sujet: courriel.sujet,
      statut: "non-configure",
      messageId: null,
      erreur: "BREVO_API_KEY absente",
    });
    return { envoye: false, raison: "non-configure" };
  }

  const destinataire = (courriel.destinataire || "").trim();
  if (!destinataire.includes("@")) {
    console.error("[email] destinataire invalide", destinataire);
    // Consigné comme les autres : un client sans adresse valable est
    // précisément le cas qu'on cherche en se demandant « pourquoi n'a-t-il
    // rien reçu ? ».
    await journaliser({
      etiquette: courriel.etiquette || "inconnu",
      destinataire: destinataire || "(vide)",
      sujet: courriel.sujet,
      statut: "refuse",
      messageId: null,
      erreur: "adresse du destinataire invalide",
    });
    return { envoye: false, raison: "refuse", detail: "destinataire invalide" };
  }

  try {
    const reponse = await fetch(API, {
      method: "POST",
      headers: {
        "api-key": cle,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: expediteur(),
        to: [{ email: destinataire, name: courriel.nomDestinataire || undefined }],
        replyTo: courriel.repondreA
          ? { email: courriel.repondreA.email, name: courriel.repondreA.nom }
          : { email: expediteur().email, name: expediteur().name },
        subject: courriel.sujet,
        htmlContent: courriel.html,
        textContent: courriel.texte,
        tags: courriel.etiquette ? [courriel.etiquette] : undefined,
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => "");
      console.error("[email] Brevo a refusé", courriel.etiquette, reponse.status, detail);
      const motif = `${reponse.status} ${detail}`.trim();
      await journaliser({
        etiquette: courriel.etiquette || "inconnu",
        destinataire,
        sujet: courriel.sujet,
        statut: "refuse",
        messageId: null,
        erreur: motif.slice(0, 800),
      });
      return { envoye: false, raison: "refuse", detail: motif };
    }

    const corps = (await reponse.json().catch(() => null)) as { messageId?: string } | null;
    console.info("[email] envoyé", courriel.etiquette, "→", destinataire);
    await journaliser({
      etiquette: courriel.etiquette || "inconnu",
      destinataire,
      sujet: courriel.sujet,
      statut: "envoye",
      messageId: corps?.messageId || null,
    });
    return { envoye: true, id: corps?.messageId || null };
  } catch (error) {
    console.error("[email] envoi impossible", courriel.etiquette, error);
    const message = error instanceof Error ? error.message : String(error);
    await journaliser({
      etiquette: courriel.etiquette || "inconnu",
      destinataire: courriel.destinataire,
      sujet: courriel.sujet,
      statut: "injoignable",
      messageId: null,
      erreur: message.slice(0, 800),
    });
    return {
      envoye: false,
      raison: "injoignable",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/** La messagerie est-elle branchée ? Sert à le dire dans l'administration. */
export function messagerieConfiguree(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}
