"use server";

import { FieldValue } from "firebase-admin/firestore";
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
    /** Message que l'hôte envoie avec son lien, s'il l'a personnalisé. */
    messagePartage: string | null;
    /**
     * Fin de la session de modification payée, si elle court encore.
     *
     * Ne concerne que l'Essentielle : le Confort modifie sans limite.
     */
    editionJusquA: number | null;
    /** Une résiliation est demandée, effective à l'échéance. */
    resiliationDemandee: boolean;
  } | null;
  stats: LivretStats;
  commande: {
    reference: string;
    statut: OrderStatus;
    date: number;
    /*
     * Acheminement, renseigné par Guidz. C'est ce que l'hôte vient chercher
     * une fois qu'il a payé : sans nouvelles, il écrit ; avec un suivi, il
     * attend.
     */
    transporteur: string | null;
    numeroSuivi: string | null;
    lienSuivi: string | null;
    expedieeLe: number | null;
    livraisonPrevue: number | null;
    motDeGuidz: string | null;
  } | null;
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

/**
 * Retrouve le livret et vérifie qu'il appartient bien à l'appelant.
 *
 * Chaque geste destructeur passe par ici : sans cette vérification, un
 * identifiant deviné suffirait à résilier — ou supprimer — le compte d'un
 * autre.
 */
async function livretDeLHote(
  accommodationId: string,
  jetonHote?: string
): Promise<Accommodation> {
  if (!jetonHote) throw new Error("Connectez-vous pour poursuivre.");
  const jeton = await adminAuth.verifyIdToken(jetonHote);

  const doc = await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).get();
  if (!doc.exists) throw new Error("Livret introuvable.");

  const livret = { ...(doc.data() as Accommodation), id: doc.id };
  if (!livret.ownerUid || livret.ownerUid !== jeton.uid) {
    throw new Error("Ce livret n’est pas rattaché à votre compte.");
  }
  return livret;
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
      messagePartage: livret.shareMessage || null,
      editionJusquA:
        livret.editionUntil && livret.editionUntil > Date.now() ? livret.editionUntil : null,
      resiliationDemandee: Boolean(livret.cancelAtPeriodEnd),
    },
    stats: (statsSnap?.exists ? statsSnap.data() : {}) as LivretStats,
    commande: commandes[0]
      ? {
          reference: commandes[0].reference,
          statut: commandes[0].status,
          date: commandes[0].createdAt,
          transporteur: commandes[0].carrier || null,
          numeroSuivi: commandes[0].trackingNumber || null,
          lienSuivi: commandes[0].trackingUrl || null,
          expedieeLe: commandes[0].shippedAt || null,
          livraisonPrevue: commandes[0].estimatedDelivery || null,
          motDeGuidz: commandes[0].clientNote || null,
        }
      : null,
    abonnement,
  };
}

/**
 * Enregistre le message que l'hôte joint à son lien.
 *
 * Le lien lui-même n'y figure jamais : il est ajouté au moment de l'envoi.
 * L'adresse d'un livret peut changer tant qu'il n'est pas payé, et un message
 * figé enverrait alors les voyageurs dans le vide.
 */
export async function enregistrerMessagePartage(
  accommodationId: string,
  message: string,
  jetonHote?: string
): Promise<void> {
  if (!jetonHote) throw new Error("Connectez-vous pour enregistrer votre message.");
  const jeton = await adminAuth.verifyIdToken(jetonHote);

  const ref = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Livret introuvable.");

  const livret = doc.data() as Accommodation;
  if (!livret.ownerUid || livret.ownerUid !== jeton.uid) {
    throw new Error("Ce livret n’est pas rattaché à votre compte.");
  }

  const propre = message.trim().slice(0, 500);
  await ref.update({
    shareMessage: propre || FieldValue.delete(),
    updatedAt: Date.now(),
  });
}

/**
 * Résilie l'abonnement Confort à la fin de la période payée.
 *
 * On ne coupe pas immédiatement : l'hôte a payé son mois ou son année, il en
 * garde le bénéfice. À l'échéance, le webhook fera retomber le livret en
 * Essentielle — sa page reste en ligne et sa plaque continue de fonctionner.
 */
export async function resilierAbonnement(
  accommodationId: string,
  jetonHote?: string
): Promise<{ finLe: number | null }> {
  const livret = await livretDeLHote(accommodationId, jetonHote);

  if (!livret.stripeSubscriptionId) {
    throw new Error("Aucun abonnement en cours sur ce livret.");
  }
  if (!paiementConfigure()) {
    throw new Error("La facturation est momentanément injoignable. Réessayez.");
  }

  const abo = await stripe().subscriptions.update(livret.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const fin = (abo as unknown as { current_period_end?: number }).current_period_end;

  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).update({
    cancelAtPeriodEnd: true,
    updatedAt: Date.now(),
  });

  return { finLe: typeof fin === "number" ? fin * 1000 : null };
}

/** Annule une résiliation demandée, tant qu'elle n'a pas pris effet. */
export async function reprendreAbonnement(
  accommodationId: string,
  jetonHote?: string
): Promise<void> {
  const livret = await livretDeLHote(accommodationId, jetonHote);
  if (!livret.stripeSubscriptionId) throw new Error("Aucun abonnement en cours.");

  await stripe().subscriptions.update(livret.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).update({
    cancelAtPeriodEnd: false,
    updatedAt: Date.now(),
  });
}

/**
 * Supprime définitivement le compte et son livret.
 *
 * Immédiat et sans retour : la page disparaît, le compte aussi, et le QR de la
 * plaque ne mène plus nulle part. C'est la conséquence qu'il faut annoncer
 * AVANT le clic, pas découvrir après.
 *
 * L'abonnement est résilié sur-le-champ pour ne pas continuer à prélever
 * quelqu'un qui n'a plus rien. Les COMMANDES sont conservées : elles portent
 * la trace d'un objet réellement produit et payé, et notre comptabilité en
 * dépend. Elles ne contiennent que ce qui a été gravé.
 */
export async function supprimerCompte(
  accommodationId: string,
  jetonHote?: string
): Promise<void> {
  const livret = await livretDeLHote(accommodationId, jetonHote);

  if (livret.stripeSubscriptionId && paiementConfigure()) {
    try {
      await stripe().subscriptions.cancel(livret.stripeSubscriptionId);
    } catch (e) {
      // Un abonnement déjà résilié ne doit pas empêcher la suppression.
      console.error("[supprimerCompte] résiliation", e);
    }
  }

  await adminDb.collection(STATS).doc(accommodationId).delete().catch(() => {});
  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).delete();

  if (livret.ownerUid) {
    await adminAuth.deleteUser(livret.ownerUid).catch((e) => {
      console.error("[supprimerCompte] compte Firebase", e);
    });
  }
}

/**
 * Note le passage de l'hôte dans son éditeur.
 *
 * `updatedAt` ne suffisait pas : il ne bouge qu'à l'enregistrement. Un hôte
 * qui ouvre son livret, regarde, et referme sans rien changer laissait donc
 * exactement la même trace que celui qui n'est jamais revenu — alors que
 * l'un hésite et l'autre a abandonné. Les relancer de la même façon serait
 * maladroit dans les deux cas.
 *
 * N'échoue jamais : c'est une mesure, elle ne doit pas empêcher d'éditer.
 */
export async function marquerVisiteEditeur(
  accommodationId: string,
  jetonHote: string
): Promise<void> {
  try {
    const jeton = await adminAuth.verifyIdToken(jetonHote);
    const ref = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
    const doc = await ref.get();
    if (!doc.exists) return;

    const livret = doc.data() as Accommodation;
    // Le propriétaire, et lui seul : sans cette vérification, un identifiant
    // deviné suffirait à fausser la mesure d'un autre.
    if (livret.ownerUid !== jeton.uid) return;

    await ref.update({ derniereVisiteEditeur: Date.now() });
  } catch (error) {
    console.error("[visite éditeur]", error);
  }
}
