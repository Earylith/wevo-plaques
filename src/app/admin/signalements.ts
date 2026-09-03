"use server";

import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { MotifSignalement } from "@/lib/signalement";

/**
 * Lecture et traitement des signalements.
 *
 * Le canal de signalement existait déjà côté voyageur, mais rien ne le
 * lisait : les signalements s'entassaient dans une collection que personne
 * n'ouvrait. Un signalement qu'on ne lit pas ne protège personne — il donne
 * seulement l'impression d'avoir fait quelque chose.
 */

const SIGNALEMENTS = "reports";

async function exigerAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Accès réservé.");
  }
}

export type StatutSignalement = "nouveau" | "traite" | "rejete";

export interface Signalement {
  id: string;
  livretId: string;
  slug: string;
  motif: MotifSignalement;
  details: string;
  statut: StatutSignalement;
  createdAt: number;
  traiteLe?: number;
  /** Ce que Guidz a décidé, pour s'en souvenir dans six mois. */
  note?: string;
}

export async function listerSignalements(): Promise<Signalement[]> {
  await exigerAdmin();

  const snap = await adminDb.collection(SIGNALEMENTS).get();
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<Signalement, "id">), id: d.id }))
    /*
     * Les non traités d'abord, puis du plus récent au plus ancien. Un
     * signalement en attente doit être en haut de l'écran, quel que soit son
     * âge : c'est le seul ordre qui reflète ce qu'il reste à faire.
     */
    .sort((a, b) => {
      const aEnAttente = a.statut === "nouveau" ? 0 : 1;
      const bEnAttente = b.statut === "nouveau" ? 0 : 1;
      if (aEnAttente !== bEnAttente) return aEnAttente - bEnAttente;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
}

/**
 * Clôt un signalement.
 *
 * « Traité » veut dire qu'on a agi — retiré, corrigé, contacté l'hôte.
 * « Rejeté » veut dire qu'on a regardé et qu'il n'y avait rien. Les deux
 * ferment le dossier ; les distinguer permet de savoir, plus tard, si un
 * livret signalé plusieurs fois l'a été à tort ou à raison.
 */
export async function classerSignalement(
  id: string,
  statut: StatutSignalement,
  note?: string
): Promise<{ ok: true }> {
  await exigerAdmin();

  const champs: Record<string, unknown> = {
    statut,
    traiteLe: Date.now(),
  };
  // Firestore refuse `undefined` : on n'écrit la note que si elle existe.
  const propre = (note || "").trim().slice(0, 1000);
  if (propre) champs.note = propre;

  await adminDb.collection(SIGNALEMENTS).doc(id).update(champs);
  revalidatePath("/admin/signalements");
  return { ok: true };
}

/**
 * Combien de signalements attendent ?
 *
 * Affiché dans la navigation : sans ce compteur, l'écran ne s'ouvre que
 * lorsqu'on y pense, c'est-à-dire trop tard.
 */
export async function signalementsEnAttente(): Promise<number> {
  await exigerAdmin();
  const snap = await adminDb
    .collection(SIGNALEMENTS)
    .where("statut", "==", "nouveau")
    .get();
  return snap.size;
}
