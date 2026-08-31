"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Accommodation, OfferType, OrderStatus, PlaqueOrder } from "@/lib/types/accommodation";
import { LivretStats } from "@/lib/stats";
import { stripe, paiementConfigure } from "@/lib/stripe";

/**
 * Données de l'espace client.
 *
 * Tout passe par le jeton Firebase de l'hôte, vérifié côté serveur : un
 * identifiant envoyé par le navigateur ne prouve rien, et cet écran expose
 * des chiffres d'audience et un état d'abonnement.
 */

const ACCOMMODATIONS = "accommodations";
const ORDERS = "orders";
const STATS = "stats";

export interface Abonnement {
  /** Libellé lisible : « actif », « paiement en retard »… */
  etat: string;
  /** L'abonnement court-il normalement ? */
  actif: boolean;
  /** Prochaine échéance, en millisecondes. */
  prochaineEcheance: number | null;
  /** L'abonnement s'arrêtera à la fin de la période en cours. */
  finProgrammee: boolean;
}

export interface EspaceClient {
  livret: {
    id: string;
    slug: string;
    nom: string;
    formule: OfferType;
    enLigne: boolean;
    /** Adresse permanente gravée, si une plaque a été commandée. */
    permanentId: string | null;
  } | null;
  stats: LivretStats;
  commande: { reference: string; statut: OrderStatus; date: number } | null;
  abonnement: Abonnement | null;
}

/** Traduit les états Stripe en langage d'hôte. */
const ETATS: Record<string, { etat: string; actif: boolean }> = {
  active: { etat: "Actif", actif: true },
  trialing: { etat: "Période d’essai", actif: true },
  past_due: { etat: "Paiement en retard", actif: false },
  unpaid: { etat: "Impayé", actif: false },
  canceled: { etat: "Résilié", actif: false },
  incomplete: { etat: "Paiement à finaliser", actif: false },
  incomplete_expired: { etat: "Paiement abandonné", actif: false },
  paused: { etat: "En pause", actif: false },
};

/**
 * Interroge Stripe pour l'état de l'abonnement.
 *
 * Un échec ne fait jamais tomber l'écran : l'hôte doit pouvoir consulter son
 * livret et ses statistiques même si la facturation est momentanément
 * injoignable. On renvoie alors `null`, et l'écran n'affiche simplement pas
 * ce bloc.
 */
async function lireAbonnement(id: string | null | undefined): Promise<Abonnement | null> {
  if (!id || !paiementConfigure()) return null;
  try {
    const abo = await stripe().subscriptions.retrieve(id);
    const connu = ETATS[abo.status] || { etat: abo.status, actif: false };
    // `current_period_end` est en secondes chez Stripe.
    const fin = (abo as unknown as { current_period_end?: number }).current_period_end;
    return {
      etat: connu.etat,
      actif: connu.actif,
      prochaineEcheance: typeof fin === "number" ? fin * 1000 : null,
      finProgrammee: Boolean(abo.cancel_at_period_end),
    };
  } catch (error) {
    console.error("[lireAbonnement]", error);
    return null;
  }
}

export async function chargerEspaceClient(jetonHote: string): Promise<EspaceClient> {
  if (!jetonHote) throw new Error("Connectez-vous pour accéder à votre espace.");

  const jeton = await adminAuth.verifyIdToken(jetonHote);

  const trouves = await adminDb
    .collection(ACCOMMODATIONS)
    .where("ownerUid", "==", jeton.uid)
    .limit(1)
    .get();

  if (trouves.empty) {
    return { livret: null, stats: {}, commande: null, abonnement: null };
  }

  const doc = trouves.docs[0];
  const livret = doc.data() as Accommodation;

  /*
   * Les trois lectures sont indépendantes : on les mène de front, et une
   * défaillance de l'une ne prive pas l'hôte des autres.
   */
  const [statsSnap, commandesSnap, abonnement] = await Promise.all([
    adminDb.collection(STATS).doc(doc.id).get().catch(() => null),
    adminDb.collection(ORDERS).where("accommodationId", "==", doc.id).get().catch(() => null),
    lireAbonnement(livret.stripeSubscriptionId),
  ]);

  const commandes = (commandesSnap?.docs || [])
    .map((d) => d.data() as PlaqueOrder)
    .filter((o) => o.status !== "annulee")
    .sort((a, b) => b.createdAt - a.createdAt);

  return {
    livret: {
      id: doc.id,
      slug: livret.slug,
      nom: livret.property?.name || livret.slug,
      formule: livret.offerType,
      enLigne: Boolean(livret.isActive),
      permanentId: livret.permanentId || null,
    },
    stats: (statsSnap?.exists ? statsSnap.data() : {}) as LivretStats,
    commande: commandes[0]
      ? { reference: commandes[0].reference, statut: commandes[0].status, date: commandes[0].createdAt }
      : null,
    abonnement,
  };
}
