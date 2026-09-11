"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Accommodation, OfferType, OrderStatus, PlaqueOrder } from "@/lib/types/accommodation";
import { LivretStats } from "@/lib/stats";
import { stripe, paiementConfigure } from "@/lib/stripe";
import { createEmptyAccommodation } from "@/lib/livret";
import { slugify } from "@/lib/utils";

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

export interface LivretResume {
  id: string;
  nom: string;
  slug: string;
  formule: OfferType;
  enLigne: boolean;
  imageCouverture: string | null;
  ville: string | null;
  adresse?: string | null;
  plaqueWood?: string;
  plaqueTagline?: string;
  createdAt?: number;
}

export interface EspaceClient {
  livret: {
    id: string;
    slug: string;
    nom: string;
    formule: OfferType;
    enLigne: boolean;
    /** Image de couverture principale du logement (Confort). */
    imageCouverture: string | null;
    /** Ville du logement. */
    ville: string | null;
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
  tousLesLivrets: LivretResume[];
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
  const jeton = await adminAuth.verifyIdToken(jetonHote, true);

  const doc = await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).get();
  if (!doc.exists) throw new Error("Livret introuvable.");

  const livret = { ...(doc.data() as Accommodation), id: doc.id };
  if (!livret.ownerUid || livret.ownerUid !== jeton.uid) {
    throw new Error("Ce livret n’est pas rattaché à votre compte.");
  }
  return livret;
}

/** Retire les undefined, que Firestore refuse. */
function nettoyer<T>(valeur: T): T {
  return JSON.parse(JSON.stringify(valeur)) as T;
}

/**
 * Fabrique une adresse publique libre pour un nouveau livret.
 */
async function slugDisponible(base: string): Promise<string> {
  const racine = slugify(base) || "livret";
  for (let essai = 0; essai < 30; essai++) {
    const candidat = essai === 0 ? racine : `${racine}-${essai + 1}`;
    const pris = await adminDb
      .collection(ACCOMMODATIONS)
      .where("slug", "==", candidat)
      .limit(1)
      .get();
    if (pris.empty) return candidat;
  }
  return `${racine}-${Date.now().toString(36)}`;
}

/**
 * Crée un nouveau livret (brouillon) pour un propriétaire connecté.
 * Permet d'ajouter un logement supplémentaire, de le configurer dans l'éditeur,
 * et de commander une nouvelle plaque via Stripe lors de la publication.
 */
export async function creerNouveauLivret(
  jetonHote: string,
  nomLogement: string,
  formule: OfferType = "comfort"
): Promise<{ id: string; slug: string }> {
  if (!jetonHote) throw new Error("Connectez-vous pour créer un nouveau livret.");
  const jeton = await adminAuth.verifyIdToken(jetonHote, true);
  const uid = jeton.uid;
  const email = jeton.email || "";

  const nomNettoye = (nomLogement || "").trim() || "Nouveau logement";
  const slug = await slugDisponible(nomNettoye);

  const baseLivret = createEmptyAccommodation(slug);
  const livret: Accommodation = {
    ...baseLivret,
    offerType: formule,
    template: formule === "comfort" ? "cleo" : "essential",
    isActive: false,
    ownerUid: uid,
    owner: {
      name: jeton.name || "",
      email,
      phone: "",
    },
    property: {
      ...baseLivret.property,
      name: nomNettoye,
    },
  };

  const docCree = await adminDb.collection(ACCOMMODATIONS).add(nettoyer(livret));
  return { id: docCree.id, slug };
}

export async function chargerEspaceClient(
  jetonHote: string,
  livretIdCible?: string
): Promise<EspaceClient> {
  if (!jetonHote) throw new Error("Connectez-vous pour accéder à votre espace.");

  const jeton = await adminAuth.verifyIdToken(jetonHote, true);

  const trouves = await adminDb
    .collection(ACCOMMODATIONS)
    .where("ownerUid", "==", jeton.uid)
    .get();

  if (trouves.empty) {
    return { livret: null, tousLesLivrets: [], stats: {}, commande: null, abonnement: null };
  }

  const tousLesLivrets: LivretResume[] = trouves.docs.map((d) => {
    const data = d.data() as Accommodation;
    return {
      id: d.id,
      nom: data.property?.name || data.slug,
      slug: data.slug,
      formule: data.offerType,
      enLigne: Boolean(data.isActive),
      imageCouverture: data.property?.mainImageUrl || data.property?.gallery?.[0] || null,
      ville: data.property?.city || null,
      adresse: data.property?.address || null,
      plaqueWood: data.plaque?.wood || "noyer",
      plaqueTagline: data.plaque?.engravedTagline || "",
      createdAt: data.createdAt || 0,
    };
  });

  const doc = (livretIdCible && trouves.docs.find((d) => d.id === livretIdCible)) || trouves.docs[0];
  const livret = doc.data() as Accommodation;

  // Si une résiliation individuelle avait été demandée pour cet hébergement et que l'échéance est passée :
  const dateFin = (livret as { resiliationDateFin?: number }).resiliationDateFin;
  if (
    livret.cancelAtPeriodEnd &&
    livret.offerType === "comfort" &&
    typeof dateFin === "number" &&
    dateFin <= Date.now()
  ) {
    await adminDb.collection(ACCOMMODATIONS).doc(doc.id).update({
      offerType: "essential",
      template: "essential",
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
      abonnementRythme: FieldValue.delete(),
      resiliationDateFin: FieldValue.delete(),
      downgradedAt: Date.now(),
      updatedAt: Date.now(),
    });
    livret.offerType = "essential";
    livret.cancelAtPeriodEnd = false;
    livret.stripeSubscriptionId = null;
  }

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
      imageCouverture: livret.property?.mainImageUrl || livret.property?.gallery?.[0] || null,
      ville: livret.property?.city || null,
      permanentId: livret.permanentId || null,
      messagePartage: livret.shareMessage || null,
      editionJusquA:
        livret.editionUntil && livret.editionUntil > Date.now() ? livret.editionUntil : null,
      resiliationDemandee: Boolean(livret.cancelAtPeriodEnd),
    },
    tousLesLivrets,
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
 * Modifie le mot d'accueil partagé avec le livret.
 *
 * `null` ou chaîne vide supprime le champ : pas de chaîne vide stockée, pas
 * de propriété inutile dans le document.
 */
export async function majMessagePartage(
  accommodationId: string,
  message: string,
  jetonHote?: string
): Promise<void> {
  await livretDeLHote(accommodationId, jetonHote);
  const propre = message.trim();
  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).update({
    shareMessage: propre || FieldValue.delete(),
    updatedAt: Date.now(),
  });
}

export const enregistrerMessagePartage = majMessagePartage;

/**
 * Résilie l'abonnement Confort hébergement par hébergement.
 *
 * Si l'hôte possède plusieurs hébergements groupés sur le même abonnement Stripe,
 * la résiliation ne vise QUE cet hébergement :
 *  - La quantité Stripe est décrémentée pour la prochaine échéance (aucun impact sur les autres).
 *  - Cet hébergement reste en Confort jusqu'à la fin de la période payée.
 *  - À l'échéance, seul cet hébergement repasse en Essentielle.
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

  // Vérifier combien d'hébergements partagent cet abonnement Stripe
  const collSnap = await adminDb
    .collection(ACCOMMODATIONS)
    .where("stripeSubscriptionId", "==", livret.stripeSubscriptionId)
    .where("offerType", "==", "comfort")
    .get();

  const autresActifs = collSnap.docs.filter(
    (d) => d.id !== accommodationId && !d.data().cancelAtPeriodEnd
  );

  let fin: number | null = null;

  if (autresActifs.length === 0) {
    // Dernier livret actif sur cet abonnement Stripe : on programme la fin globale
    const abo = await stripe().subscriptions.update(livret.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    const finSec = (abo as unknown as { current_period_end?: number }).current_period_end;
    fin = typeof finSec === "number" ? finSec * 1000 : null;
  } else {
    // D'autres hébergements continuent en Confort : on ajuste la quantité Stripe sans impacter les autres
    const abo = await stripe().subscriptions.retrieve(livret.stripeSubscriptionId);
    const finSec = (abo as unknown as { current_period_end?: number }).current_period_end;
    fin = typeof finSec === "number" ? finSec * 1000 : null;

    const item = abo.items?.data?.[0];
    if (item && typeof item.quantity === "number" && item.quantity > autresActifs.length) {
      await stripe().subscriptions.update(livret.stripeSubscriptionId, {
        proration_behavior: "none",
        items: [{ id: item.id, quantity: autresActifs.length }],
      });
    }
  }

  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).update({
    cancelAtPeriodEnd: true,
    resiliationDateFin: fin,
    updatedAt: Date.now(),
  });

  return { finLe: fin };
}

/** Annule une résiliation demandée pour cet hébergement, tant qu'elle n'a pas pris effet. */
export async function reprendreAbonnement(
  accommodationId: string,
  jetonHote?: string
): Promise<void> {
  const livret = await livretDeLHote(accommodationId, jetonHote);
  if (!livret.stripeSubscriptionId) throw new Error("Aucun abonnement en cours.");

  const abo = await stripe().subscriptions.retrieve(livret.stripeSubscriptionId);

  if (abo.cancel_at_period_end) {
    await stripe().subscriptions.update(livret.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });
  } else {
    // Si l'abonnement Stripe tournait à quantité réduite, réincrémenter pour cet hébergement
    const item = abo.items?.data?.[0];
    if (item && typeof item.quantity === "number") {
      await stripe().subscriptions.update(livret.stripeSubscriptionId, {
        proration_behavior: "none",
        items: [{ id: item.id, quantity: item.quantity + 1 }],
      });
    }
  }

  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).update({
    cancelAtPeriodEnd: false,
    resiliationDateFin: FieldValue.delete(),
    updatedAt: Date.now(),
  });
}

/**
 * Supprime définitivement cet hébergement.
 *
 * Immédiat et sans retour pour cet hébergement précis : sa page disparaît,
 * et le QR de sa plaque ne mène plus nulle part.
 *
 * Si l'hôte possède d'autres hébergements, son compte et ses autres livrets
 * restent entièrement préservés et actifs.
 */
export async function supprimerCompte(
  accommodationId: string,
  jetonHote?: string
): Promise<void> {
  const livret = await livretDeLHote(accommodationId, jetonHote);

  if (livret.stripeSubscriptionId && paiementConfigure()) {
    try {
      const autresSnap = await adminDb
        .collection(ACCOMMODATIONS)
        .where("stripeSubscriptionId", "==", livret.stripeSubscriptionId)
        .where("offerType", "==", "comfort")
        .get();

      const autres = autresSnap.docs.filter((d) => d.id !== accommodationId);
      if (autres.length === 0) {
        await stripe().subscriptions.cancel(livret.stripeSubscriptionId);
      } else {
        // Décrémenter la quantité Stripe pour que les autres hébergements poursuivent leur abonnement normalement
        const abo = await stripe().subscriptions.retrieve(livret.stripeSubscriptionId);
        const item = abo.items?.data?.[0];
        if (item && typeof item.quantity === "number" && item.quantity > autres.length) {
          await stripe().subscriptions.update(livret.stripeSubscriptionId, {
            proration_behavior: "none",
            items: [{ id: item.id, quantity: autres.length }],
          });
        }
      }
    } catch (e) {
      console.error("[supprimerCompte] résiliation Stripe", e);
    }
  }

  await adminDb.collection(STATS).doc(accommodationId).delete().catch(() => {});
  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).delete();

  if (livret.ownerUid) {
    const autresHotes = await adminDb
      .collection(ACCOMMODATIONS)
      .where("ownerUid", "==", livret.ownerUid)
      .get();
    // Ne supprimer le compte Firebase utilisateur QUE si c'était son tout dernier hébergement
    if (autresHotes.empty) {
      await adminAuth.deleteUser(livret.ownerUid).catch((e) => {
        console.error("[supprimerCompte] compte Firebase", e);
      });
    }
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
    const jeton = await adminAuth.verifyIdToken(jetonHote, true);
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

/**
 * Supprime un livret brouillon (non publié) d'un propriétaire.
 * N'affecte PAS le compte Firebase ni les autres livrets de l'hôte.
 */
export async function supprimerLivretBrouillon(
  accommodationId: string,
  jetonHote: string
): Promise<void> {
  const livret = await livretDeLHote(accommodationId, jetonHote);
  if (livret.isActive) {
    throw new Error("Un livret déjà publié ne peut pas être supprimé depuis le panier.");
  }
  await adminDb.collection(STATS).doc(accommodationId).delete().catch(() => {});
  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).delete();
}

/**
 * Met à jour la configuration de plaque d'un livret brouillon depuis le panier.
 */
export async function modifierPlaqueBrouillon(
  accommodationId: string,
  wood: "noyer" | "clair",
  phraseGravee: string,
  jetonHote: string
): Promise<void> {
  const livret = await livretDeLHote(accommodationId, jetonHote);
  if (livret.isActive) {
    throw new Error("La plaque d'un livret déjà publié est figée.");
  }
  await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).update({
    "plaque.wood": wood,
    "plaque.engravedTagline": phraseGravee.trim().slice(0, 40),
    updatedAt: Date.now(),
  });
}
