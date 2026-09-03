"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Accommodation } from "@/lib/types/accommodation";
import { sessionModificationActive } from "@/lib/livret";
import {
  stripe, tarifsFormule, tarifsBascule, tarifSessionModification,
  paiementConfigure, RythmeAbonnement,
} from "@/lib/stripe";

/**
 * Ouverture du paiement, quelle que soit la formule.
 *
 * Le paiement est ce qui fait basculer un livret de brouillon à publié, et qui
 * déclenche la commande de plaque. Ces deux effets sont produits par le
 * webhook, JAMAIS ici : tant que Stripe n'a pas confirmé l'encaissement, rien
 * ne doit changer en base. Un client qui ferme l'onglet de paiement ne doit
 * pas se retrouver avec un livret en ligne et une plaque en production.
 */

const ACCOMMODATIONS = "accommodations";

/**
 * Pays où nous acceptons d'expédier une plaque.
 *
 * Restreint volontairement : au-delà, les frais de port dépassent le prix de
 * l'objet, et la douane s'invite. La liste s'élargira quand l'expédition
 * suivra — pas avant, sous peine de vendre ce qu'on ne sait pas livrer.
 */
const PAYS_LIVRES = [
  "FR", "BE", "CH", "LU", "MC", "ES", "IT", "PT", "DE", "NL",
] as const;

/**
 * Vérifie que l'appelant a le droit de payer pour ce livret.
 *
 * Deux entrées possibles : l'administration Guidz par son cookie, ou l'hôte
 * par son jeton Firebase. Sans cette vérification, n'importe qui pourrait
 * ouvrir un paiement pour le livret d'un autre — et le publier en payant.
 */
async function verifierAcces(livret: Accommodation, jetonHote?: string) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value === "true") return;

  if (!jetonHote) {
    throw new Error("Connectez-vous pour poursuivre votre commande.");
  }
  const jeton = await adminAuth.verifyIdToken(jetonHote);
  if (!livret.ownerUid || livret.ownerUid !== jeton.uid) {
    throw new Error("Ce livret n’est pas rattaché à votre compte.");
  }
}

export interface OuvertureSession {
  url: string;
  reference: string;
}

/**
 * Crée la session de paiement et renvoie l'adresse où envoyer le client.
 *
 * `client_reference_id` et les métadonnées portent l'identifiant du livret :
 * c'est ainsi que le webhook saura quoi publier, sans avoir à deviner.
 */
export async function ouvrirPaiement(
  accommodationId: string,
  origin: string,
  jetonHote?: string,
  rythme: RythmeAbonnement = "mensuel"
): Promise<OuvertureSession> {
  if (!paiementConfigure()) {
    throw new Error(
      "Le paiement n’est pas encore configuré. Ajoutez STRIPE_SECRET_KEY et les identifiants de tarif dans .env.local."
    );
  }

  const doc = await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).get();
  if (!doc.exists) throw new Error("Livret introuvable — enregistrez-le avant de payer.");
  const livret = { ...(doc.data() as Accommodation), id: doc.id };

  await verifierAcces(livret, jetonHote);

  // La formule du livret décide de ce qui est facturé.
  const { ponctuel, abonnement } = tarifsFormule(livret.offerType, rythme);
  const lignes = [{ price: ponctuel, quantity: 1 }];
  if (abonnement) lignes.push({ price: abonnement, quantity: 1 });

  const session = await stripe().checkout.sessions.create({
    // Dès qu'un abonnement est dans le panier, la session doit être en mode
    // `subscription` : le tarif ponctuel y est porté par la première facture.
    mode: abonnement ? "subscription" : "payment",
    line_items: lignes,
    client_reference_id: accommodationId,
    customer_email: livret.owner?.email || undefined,
    // Ce que le webhook relira pour agir. On y fige la configuration de
    // plaque : elle pourrait changer entre le paiement et sa confirmation.
    metadata: {
      accommodationId,
      offre: livret.offerType,
      slug: livret.slug || "",
      plaqueWood: livret.plaque?.wood || "noyer",
      plaqueTagline: livret.plaque?.engravedTagline || "",
      rythme,
    },
    /*
     * Où envoyer la plaque.
     *
     * Rien ne le demandait, nulle part : on vendait un objet en bois sans
     * jamais demander où l'envoyer. L'e-mail du client ne dit pas où il
     * habite, et une plaque gravée sans adresse reste sur l'établi. Stripe
     * pose la question dans le même écran que le paiement — pas de
     * formulaire supplémentaire à franchir.
     */
    shipping_address_collection: { allowed_countries: [...PAYS_LIVRES] },
    // Les transporteurs réclament un numéro pour annoncer la livraison.
    phone_number_collection: { enabled: true },
    success_url: `${origin}/commande/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/admin/hebergements/${accommodationId}`,
    locale: "fr",
    allow_promotion_codes: true,
  });

  if (!session.url) throw new Error("Stripe n’a pas renvoyé d’adresse de paiement.");
  return { url: session.url, reference: session.id };
}

/**
 * Paiement de la bascule vers le Confort, pour une Essentielle DÉJÀ publiée.
 *
 * L'hôte a payé sa page et sa plaque : il règle l'écart entre les formules,
 * une fois, et démarre l'abonnement. Rien n'est modifié ici — c'est le
 * webhook qui fait basculer la formule, une fois l'encaissement confirmé.
 *
 * Un brouillon n'a rien à payer : il change de formule librement et réglera
 * le Confort au moment de publier. Le refuser ici évite qu'un hôte paie deux
 * fois la même chose.
 */
export async function ouvrirBasculeConfort(
  accommodationId: string,
  origin: string,
  jetonHote?: string,
  rythme: RythmeAbonnement = "mensuel"
): Promise<OuvertureSession> {
  if (!paiementConfigure()) {
    throw new Error(
      "Le paiement n’est pas encore configuré. Ajoutez STRIPE_SECRET_KEY et les identifiants de tarif dans .env.local."
    );
  }

  const doc = await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).get();
  if (!doc.exists) throw new Error("Livret introuvable.");
  const livret = { ...(doc.data() as Accommodation), id: doc.id };

  await verifierAcces(livret, jetonHote);

  if (livret.offerType === "comfort") {
    throw new Error("Votre livret est déjà en formule Confort.");
  }
  if (!livret.isActive) {
    throw new Error(
      "Votre livret n’est pas encore publié : vous pouvez changer de formule sans payer, depuis l’éditeur."
    );
  }

  const { ponctuel, abonnement } = tarifsBascule(rythme);
  const lignes = [{ price: ponctuel, quantity: 1 }];
  if (abonnement) lignes.push({ price: abonnement, quantity: 1 });

  const session = await stripe().checkout.sessions.create({
    mode: abonnement ? "subscription" : "payment",
    line_items: lignes,
    client_reference_id: accommodationId,
    customer_email: livret.owner?.email || undefined,
    /*
     * `type` distingue cette session d'un premier achat. Sans lui, le webhook
     * la traiterait comme une publication et lancerait une SECONDE plaque
     * pour un hôte qui en a déjà une.
     */
    metadata: {
      accommodationId,
      type: "bascule-confort",
      slug: livret.slug || "",
      rythme,
    },
    success_url: `${origin}/proprietaire/dashboard?bascule=ok`,
    cancel_url: `${origin}/proprietaire/dashboard`,
    locale: "fr",
    allow_promotion_codes: true,
  });

  if (!session.url) throw new Error("Stripe n’a pas renvoyé d’adresse de paiement.");
  return { url: session.url, reference: session.id };
}

/**
 * Ouvre une session de modification, pour une Essentielle DÉJÀ publiée.
 *
 * L'Essentielle est une page composée une fois. Plutôt que de renvoyer l'hôte
 * vers nous pour la moindre correction, il ouvre sa page lui-même : cinq
 * euros, et il modifie TOUT ce qu'il veut pendant une semaine.
 *
 * Sept jours et non « une seule modification » : une session qui se
 * consommerait au premier enregistrement transformerait un clic malheureux en
 * cinq euros perdus. L'hôte doit pouvoir revenir, relire, corriger.
 *
 * Rien n'est ouvert ici : c'est le webhook qui accorde la session, une fois
 * l'encaissement confirmé.
 */
export async function ouvrirSessionModification(
  accommodationId: string,
  origin: string,
  jetonHote?: string
): Promise<OuvertureSession> {
  if (!paiementConfigure()) {
    throw new Error("Le paiement n’est pas encore configuré.");
  }

  const doc = await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).get();
  if (!doc.exists) throw new Error("Livret introuvable.");
  const livret = { ...(doc.data() as Accommodation), id: doc.id };

  await verifierAcces(livret, jetonHote);

  if (livret.offerType === "comfort") {
    throw new Error("Votre formule Confort vous permet déjà de modifier sans limite.");
  }
  if (!livret.isActive) {
    throw new Error("Votre livret n’est pas encore publié : vous pouvez le modifier librement.");
  }
  if (sessionModificationActive(livret)) {
    throw new Error("Votre session de modification est déjà ouverte.");
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: tarifSessionModification(), quantity: 1 }],
    client_reference_id: accommodationId,
    customer_email: livret.owner?.email || undefined,
    metadata: {
      accommodationId,
      type: "session-modification",
      slug: livret.slug || "",
    },
    success_url: `${origin}/proprietaire/dashboard?session=ok`,
    cancel_url: `${origin}/proprietaire/dashboard`,
    locale: "fr",
    allow_promotion_codes: true,
  });

  if (!session.url) throw new Error("Stripe n’a pas renvoyé d’adresse de paiement.");
  return { url: session.url, reference: session.id };
}

/**
 * État d'une session, pour la page de remerciement.
 *
 * Elle ne DÉCIDE de rien : la publication reste au webhook. Elle sert
 * seulement à dire au client où en est sa commande, y compris si le webhook
 * n'a pas encore été reçu.
 */
export async function etatPaiement(sessionId: string): Promise<{
  paye: boolean;
  accommodationId: string | null;
  email: string | null;
}> {
  if (!paiementConfigure()) return { paye: false, accommodationId: null, email: null };
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    return {
      paye: session.payment_status === "paid" || session.status === "complete",
      accommodationId: session.client_reference_id || null,
      email: session.customer_details?.email || null,
    };
  } catch (error) {
    console.error("[etatPaiement]", error);
    return { paye: false, accommodationId: null, email: null };
  }
}
