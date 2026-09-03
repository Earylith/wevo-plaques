"use server";

import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { Creneau } from "@/lib/rappel";

/**
 * Les demandes de rappel, côté Guidz.
 *
 * Une demande de rappel a une durée de vie très courte : celui qui laisse son
 * numéro un mardi soir n'attend pas le vendredi. L'écran est donc trié par
 * urgence, et signale ce qui traîne — c'est la seule information qui compte
 * ici.
 */

const RAPPELS = "callbacks";

async function exigerAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Accès réservé.");
  }
}

export type StatutRappel = "a_rappeler" | "rappele" | "injoignable";

export interface Rappel {
  id: string;
  nom: string;
  telephone: string;
  creneau: Creneau;
  message: string;
  statut: StatutRappel;
  createdAt: number;
  traiteLe?: number;
  note?: string;
}

export async function listerRappels(): Promise<Rappel[]> {
  await exigerAdmin();

  const snap = await adminDb.collection(RAPPELS).get();
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<Rappel, "id">), id: d.id }))
    /*
     * À rappeler d'abord, du plus ancien au plus récent : dans cette file,
     * c'est celui qui attend depuis le plus longtemps qui doit être appelé
     * en premier. L'ordre inverse d'un historique.
     */
    .sort((a, b) => {
      const aEnAttente = a.statut === "a_rappeler" ? 0 : 1;
      const bEnAttente = b.statut === "a_rappeler" ? 0 : 1;
      if (aEnAttente !== bEnAttente) return aEnAttente - bEnAttente;
      return aEnAttente === 0
        ? (a.createdAt || 0) - (b.createdAt || 0)
        : (b.createdAt || 0) - (a.createdAt || 0);
    });
}

/**
 * Clôt une demande.
 *
 * « Injoignable » est distingué de « rappelé » : il permet de rappeler une
 * seconde fois plus tard sans confondre avec quelqu'un à qui on a déjà parlé.
 */
export async function classerRappel(
  id: string,
  statut: StatutRappel,
  note?: string
): Promise<{ ok: true }> {
  await exigerAdmin();

  const champs: Record<string, unknown> = { statut, traiteLe: Date.now() };
  // Firestore refuse `undefined` : on n'écrit la note que si elle existe.
  const propre = (note || "").trim().slice(0, 1000);
  if (propre) champs.note = propre;

  await adminDb.collection(RAPPELS).doc(id).update(champs);
  return { ok: true };
}
