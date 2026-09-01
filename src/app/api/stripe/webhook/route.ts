import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { Accommodation, PlaqueConfig } from "@/lib/types/accommodation";
import { creerCommandeInterne, commandeDejaPassee } from "@/lib/server/plaqueOrders";
import { configPlaqueComplete } from "@/lib/plaque";

/**
 * Réception des événements Stripe.
 *
 * C'est le SEUL endroit qui met un livret en ligne et lance une plaque en
 * production. Le navigateur du client ne décide de rien : il peut fermer
 * l'onglet, perdre le réseau, ou rejouer l'adresse de retour — seul
 * l'encaissement confirmé par Stripe fait foi.
 *
 * Trois précautions, toutes indispensables :
 *  1. la SIGNATURE est vérifiée sur le corps BRUT de la requête — sans elle,
 *     n'importe qui pourrait publier un livret en postant un faux événement ;
 *  2. le traitement est IDEMPOTENT — Stripe réémet un événement tant qu'il
 *     n'a pas reçu de 200, et deux plaques pour un paiement seraient une
 *     perte sèche ;
 *  3. une erreur de notre côté renvoie 500, pour que Stripe réessaie.
 */

/** Le corps doit rester brut : toute réécriture invaliderait la signature. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCOMMODATIONS = "accommodations";
const EVENEMENTS = "stripe_events";

/**
 * L'événement a-t-il déjà été traité ?
 *
 * On enregistre son identifiant AVANT d'agir, dans une transaction : deux
 * livraisons simultanées du même événement ne peuvent donc pas passer
 * toutes les deux.
 */
async function reserverEvenement(evenement: Stripe.Event): Promise<boolean> {
  const ref = adminDb.collection(EVENEMENTS).doc(evenement.id);
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return false;
    tx.set(ref, {
      type: evenement.type,
      receivedAt: Date.now(),
    });
    return true;
  });
}

/**
 * Bascule vers le Confort, pour une Essentielle déjà publiée.
 *
 * Rien à publier — la page est en ligne — et rien à graver : l'hôte a déjà sa
 * plaque, et son QR pointe sur une adresse permanente que le changement de
 * formule ne touche pas. Seuls la formule, le gabarit et l'abonnement
 * changent.
 */
async function traiterBascule(session: Stripe.Checkout.Session) {
  const accommodationId = session.client_reference_id || session.metadata?.accommodationId;
  if (!accommodationId) {
    console.error("[stripe] bascule sans identifiant de livret", session.id);
    return;
  }

  const docRef = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await docRef.get();
  if (!doc.exists) {
    console.error("[stripe] livret introuvable pour la bascule", accommodationId);
    return;
  }

  await docRef.update({
    offerType: "comfort",
    template: "cleo",
    stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
    stripeSubscriptionId:
      typeof session.subscription === "string" ? session.subscription : null,
    upgradedAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.info("[stripe] livret", accommodationId, "basculé en formule Confort");
}

/**
 * Encaissement confirmé : le livret passe en ligne et la plaque part en
 * production.
 */
async function traiterPaiement(session: Stripe.Checkout.Session, origin: string) {
  const accommodationId = session.client_reference_id || session.metadata?.accommodationId;
  if (!accommodationId) {
    console.error("[stripe] session sans identifiant de livret", session.id);
    return;
  }

  const docRef = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await docRef.get();
  if (!doc.exists) {
    console.error("[stripe] livret introuvable", accommodationId);
    return;
  }
  const livret = doc.data() as Accommodation;

  const maintenant = Date.now();

  // 1. Mise en ligne. `publishedAt` n'est posé qu'à la première publication :
  //    c'est la date d'ouverture du livret, pas celle du dernier paiement.
  await docRef.update({
    isActive: true,
    publishedAt: livret.publishedAt || maintenant,
    updatedAt: maintenant,
    stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
    stripeSubscriptionId:
      typeof session.subscription === "string" ? session.subscription : null,
    paidAt: maintenant,
  });

  // 2. Commande de plaque, sauf si une est déjà en cours : un renouvellement
  //    d'abonnement ne doit pas relancer une gravure.
  const existante = await commandeDejaPassee(accommodationId);
  if (existante) {
    console.info("[stripe] commande déjà passée", existante.reference);
    return;
  }

  /*
   * Ce que le client a validé en payant fait foi ; l'état du livret complète ;
   * le défaut ferme la marche. Aucun champ ne peut valoir `undefined` —
   * Firestore le refuse, et l'écriture échouerait APRÈS l'encaissement.
   */
  const plaque: PlaqueConfig = configPlaqueComplete(
    {
      wood: session.metadata?.plaqueWood as PlaqueConfig["wood"] | undefined,
      engravedTagline: session.metadata?.plaqueTagline,
    },
    livret.plaque
  );

  const commande = await creerCommandeInterne(accommodationId, plaque, origin);

  // Le paiement est encaissé : la commande n'est plus en attente.
  await adminDb.collection("orders").doc(commande.id!).update({
    status: "payee",
    stripeSessionId: session.id,
    updatedAt: Date.now(),
  });

  console.info("[stripe] commande", commande.reference, "créée pour", accommodationId);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET absente");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature absente." }, { status: 400 });
  }

  // Corps brut, avant toute analyse : c'est sur lui que porte la signature.
  const brut = await request.text();

  let evenement: Stripe.Event;
  try {
    evenement = stripe().webhooks.constructEvent(brut, signature, secret);
  } catch (error) {
    // 400 volontaire : l'événement est illégitime, Stripe ne doit PAS réessayer.
    console.error("[stripe] signature invalide", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  try {
    const premier = await reserverEvenement(evenement);
    if (!premier) {
      // Déjà traité : on acquitte pour que Stripe cesse de réémettre.
      return NextResponse.json({ received: true, deja: true });
    }

    if (evenement.type === "checkout.session.completed") {
      const session = evenement.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid" || session.status === "complete") {
        /*
         * Deux natures d'encaissement passent par ici. Les confondre ferait
         * graver une seconde plaque à un hôte qui en a déjà une : la session
         * porte donc son intention, posée à sa création.
         */
        if (session.metadata?.type === "bascule-confort") {
          await traiterBascule(session);
        } else {
          const origin =
            process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
          await traiterPaiement(session, origin);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    /*
     * La réservation est LEVÉE avant de rendre la main : elle a été posée
     * avant le traitement pour bloquer les livraisons simultanées, mais la
     * garder après un échec ferait passer la nouvelle tentative de Stripe
     * pour un doublon — et l'événement serait perdu pour de bon.
     */
    await adminDb.collection(EVENEMENTS).doc(evenement.id).delete().catch(() => {});
    // 500 volontaire : Stripe réessaiera, et l'événement n'est pas perdu.
    console.error("[stripe] traitement échoué", error);
    return NextResponse.json({ error: "Traitement échoué." }, { status: 500 });
  }
}
