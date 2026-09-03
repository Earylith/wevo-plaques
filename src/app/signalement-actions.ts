"use server";

import { adminDb } from "@/lib/firebase/admin";
import { MOTIFS_SIGNALEMENT, MotifSignalement } from "@/lib/signalement";

/**
 * Signalements de livrets par les voyageurs.
 *
 * Nous hébergeons des pages écrites par des tiers. Sans ce canal, un contenu
 * haineux ou une photo déplacée resterait en ligne jusqu'à ce que quelqu'un
 * pense à nous écrire — c'est-à-dire souvent jamais.
 *
 * Aucun compte n'est demandé : exiger une inscription pour signaler garantit
 * que personne ne signale. En contrepartie, l'action est ouverte à tous et
 * doit donc se défendre seule contre les envois massifs — d'où les champs
 * bornés et le plafond par livret.
 */

const SIGNALEMENTS = "reports";

/**
 * Au-delà de ce nombre de signalements en attente, on cesse d'en enregistrer
 * pour un même livret.
 *
 * Le premier a déjà déclenché l'examen : les suivants n'apprennent rien de
 * plus et permettraient à quiconque de remplir la base. Le signaleur reçoit
 * néanmoins une confirmation — lui répondre « déjà signalé » lui apprendrait
 * ce qu'il n'a pas à savoir.
 */
const PLAFOND_PAR_LIVRET = 20;

export async function signalerLivret(signalement: {
  livretId: string;
  slug: string;
  motif: MotifSignalement;
  details: string;
}): Promise<void> {
  const { livretId, slug, motif } = signalement;

  if (!livretId || !(motif in MOTIFS_SIGNALEMENT)) {
    throw new Error("Signalement incomplet.");
  }

  const enAttente = await adminDb
    .collection(SIGNALEMENTS)
    .where("livretId", "==", livretId)
    .where("statut", "==", "nouveau")
    .limit(PLAFOND_PAR_LIVRET)
    .get();

  if (enAttente.size >= PLAFOND_PAR_LIVRET) {
    // Silencieux à dessein : le signaleur n'a pas à savoir combien d'autres
    // l'ont précédé, et l'examen est déjà déclenché.
    return;
  }

  await adminDb.collection(SIGNALEMENTS).add({
    livretId,
    slug: (slug || "").slice(0, 200),
    motif,
    details: (signalement.details || "").trim().slice(0, 2000),
    statut: "nouveau",
    createdAt: Date.now(),
  });
}
