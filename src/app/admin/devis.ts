"use server";

import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { DemandeDevis } from "@/app/devis-actions";

/**
 * Lecture des demandes de devis, réservée à Guidz.
 *
 * Séparée de l'action publique qui les enregistre : celle-ci est ouverte à
 * tous par nature, et un module « use server » expose chacun de ses exports
 * au navigateur. Mélanger les deux rendrait la liste des prospects appelable
 * depuis n'importe quelle page.
 */

const DEMANDES = "quote_requests";

export interface DemandeEnregistree extends DemandeDevis {
  id: string;
  statut: string;
  createdAt: number;
  notifiedAt?: number;
}

async function exigerAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Accès réservé à l’administration.");
  }
}

export async function listerDemandesDevis(): Promise<DemandeEnregistree[]> {
  await exigerAdmin();

  const snapshot = await adminDb.collection(DEMANDES).get();

  /*
   * Tri en mémoire plutôt que par requête : `orderBy` sur une collection sans
   * index composite finirait par échouer en production, et le volume attendu
   * ici se compte en dizaines.
   */
  return snapshot.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<DemandeEnregistree, "id">) }))
    .sort((a, b) => {
      // Les demandes en attente passent devant, puis la plus récente d'abord.
      const aTraitee = a.statut === "traitee" ? 1 : 0;
      const bTraitee = b.statut === "traitee" ? 1 : 0;
      if (aTraitee !== bTraitee) return aTraitee - bTraitee;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
}

export async function marquerDemandeTraitee(id: string): Promise<void> {
  await exigerAdmin();
  await adminDb.collection(DEMANDES).doc(id).update({
    statut: "traitee",
    handledAt: Date.now(),
  });
}
