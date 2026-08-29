"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Accommodation } from "@/lib/types/accommodation";
import { stripe, tarifsConfort, paiementConfigure } from "@/lib/stripe";

/**
 * Ouverture d'un paiement Confort.
 *
 * Le paiement est ce qui fait basculer un livret de brouillon à publié, et qui
 * déclenche la commande de plaque. Ces deux effets sont produits par le
 * webhook, JAMAIS ici : tant que Stripe n'a pas confirmé l'encaissement, rien
 * ne doit changer en base. Un client qui ferme l'onglet de paiement ne doit
 * pas se retrouver avec un livret en ligne et une plaque en production.
 */

const ACCOMMODATIONS = "accommodations";

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
export async function ouvrirPaiementConfort(
  accommodationId: string,
  origin: string,
  jetonHote?: string
): Promise<OuvertureSession> {
  if (!paiementConfigure()) {
    throw new Error(
      "Le paiement n’est pas encore configuré. Ajoutez STRIPE_SECRET_KEY et STRIPE_PRICE_CONFORT dans .env.local."
    );
  }

  const doc = await adminDb.collection(ACCOMMODATIONS).doc(accommodationId).get();
  if (!doc.exists) throw new Error("Livret introuvable — enregistrez-le avant de payer.");
  const livret = { ...(doc.data() as Accommodation), id: doc.id };

  await verifierAcces(livret, jetonHote);

  const { ponctuel, abonnement } = tarifsConfort();
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
      slug: livret.slug || "",
      plaqueWood: livret.plaque?.wood || "noyer",
      plaqueTagline: livret.plaque?.engravedTagline || "",
    },
    success_url: `${origin}/commande/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/admin/hebergements/${accommodationId}`,
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
