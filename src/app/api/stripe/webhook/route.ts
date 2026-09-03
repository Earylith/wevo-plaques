import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Accommodation, PlaqueConfig } from "@/lib/types/accommodation";
import { creerCommandeInterne, commandeDejaPassee } from "@/lib/server/plaqueOrders";
import { configPlaqueComplete } from "@/lib/plaque";
import { DUREE_SESSION_MODIFICATION_MS } from "@/lib/livret";
import { adresseDepuisStripe } from "@/lib/adressePostale";
import { envoyerCourriel } from "@/lib/server/email";
import { messageCommande, messageResiliation } from "@/lib/server/emails/messages";

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
    abonnementRythme: session.metadata?.rythme === "annuel" ? "annuel" : "mensuel",
    upgradedAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.info("[stripe] livret", accommodationId, "basculé en formule Confort");
}

/**
 * Session de modification accordée, pour une Essentielle publiée.
 *
 * Rien à publier ni à graver : l'hôte a déjà sa page et sa plaque. On lui
 * ouvre simplement l'éditeur pour une semaine.
 *
 * La date se CUMULE si une session court déjà : payer deux fois doit donner
 * deux fois le temps, jamais le remettre à zéro.
 */
async function traiterSessionModification(session: Stripe.Checkout.Session) {
  const accommodationId = session.client_reference_id || session.metadata?.accommodationId;
  if (!accommodationId) {
    console.error("[stripe] session de modification sans identifiant", session.id);
    return;
  }

  const docRef = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await docRef.get();
  if (!doc.exists) {
    console.error("[stripe] livret introuvable pour la session", accommodationId);
    return;
  }

  const livret = doc.data() as Accommodation;
  const depart = Math.max(Date.now(), livret.editionUntil || 0);

  await docRef.update({
    editionUntil: depart + DUREE_SESSION_MODIFICATION_MS,
    updatedAt: Date.now(),
  });

  console.info("[stripe] session de modification ouverte pour", accommodationId);
}

/**
 * Fin d'abonnement : le livret retombe en Essentielle.
 *
 * Il n'est jamais supprimé ni dépublié. L'hôte a payé sa plaque, et son QR
 * pointe sur cette page : la faire disparaître parce qu'un abonnement à 1,99 €
 * s'arrête transformerait un objet en bois en morceau de bois inutile. Le
 * contenu Confort reste en base et réapparaît intact s'il revient.
 */
async function traiterFinAbonnement(abonnement: Stripe.Subscription) {
  const trouves = await adminDb
    .collection(ACCOMMODATIONS)
    .where("stripeSubscriptionId", "==", abonnement.id)
    .limit(1)
    .get();

  if (trouves.empty) {
    console.warn("[stripe] aucun livret pour l'abonnement", abonnement.id);
    return;
  }

  const doc = trouves.docs[0];
  await doc.ref.update({
    offerType: "essential",
    template: "essential",
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: null,
    // Plus d'abonnement, donc plus de rythme : le laisser gonflerait le
    // revenu récurrent d'un client qui est parti.
    abonnementRythme: FieldValue.delete(),
    downgradedAt: Date.now(),
    updatedAt: Date.now(),
  });

  console.info("[stripe] livret", doc.id, "repassé en Essentielle");
}

/**
 * Résiliation demandée, pas encore effective.
 *
 * On l'enregistre pour que l'espace client l'annonce — « se termine le … » —
 * plutôt que de laisser l'hôte croire que rien ne s'est passé. Le retour à
 * l'Essentielle n'aura lieu qu'à la fin de la période payée.
 */
async function traiterMajAbonnement(abonnement: Stripe.Subscription) {
  const trouves = await adminDb
    .collection(ACCOMMODATIONS)
    .where("stripeSubscriptionId", "==", abonnement.id)
    .limit(1)
    .get();

  if (trouves.empty) return;

  const doc = trouves.docs[0];
  const livret = doc.data() as Accommodation;
  const demandee = Boolean(abonnement.cancel_at_period_end);

  /*
   * L'accusé de résiliation ne part qu'au BASCULEMENT.
   *
   * Stripe émet `subscription.updated` à chaque changement — renouvellement,
   * moyen de paiement, montant. Envoyer à chaque fois écrirait dix fois « votre
   * abonnement prend fin » à quelqu'un qui n'a rien demandé. On compare donc à
   * ce qu'on savait déjà.
   */
  const nouvelleDemande = demandee && !livret.cancelAtPeriodEnd;

  await doc.ref.update({
    cancelAtPeriodEnd: demandee,
    updatedAt: Date.now(),
  });

  if (!nouvelleDemande) return;

  const destinataire = livret.owner?.email || "";
  if (!destinataire) {
    console.warn("[stripe] résiliation sans adresse e-mail", doc.id);
    return;
  }

  /*
   * `cancel_at` porte la date de fin quand la résiliation est programmée.
   * `current_period_end` a migré sur l'élément d'abonnement selon les
   * versions d'API : on le lit en repli, sans se fier au type.
   */
  const finSecondes =
    abonnement.cancel_at ||
    (abonnement as unknown as { current_period_end?: number }).current_period_end ||
    null;

  const message = await messageResiliation({
    prenom: (livret.owner?.name || "").trim().split(/\s+/)[0],
    nomLogement: livret.property?.name || livret.slug,
    finLe: finSecondes ? finSecondes * 1000 : null,
    rythme: livret.abonnementRythme,
  });

  await envoyerCourriel({
    destinataire,
    nomDestinataire: livret.owner?.name || undefined,
    sujet: message.sujet,
    html: message.html,
    texte: message.texte,
    etiquette: "resiliation",
  });
}

/**
 * Où et à qui envoyer la plaque, d'après la session de paiement.
 *
 * L'adresse vit sous `collected_information` depuis l'API 2026-08 —
 * l'ancien `session.shipping_details` n'existe plus. Si l'événement reçu ne
 * la porte pas, on redemande la session à Stripe : mieux vaut un appel
 * réseau de plus qu'une commande qu'on ne saura pas expédier.
 */
async function lireLivraison(session: Stripe.Checkout.Session): Promise<{
  adresse: ReturnType<typeof adresseDepuisStripe>;
  nom: string;
  telephone: string;
}> {
  let source = session;

  if (!source.collected_information?.shipping_details?.address) {
    try {
      source = await stripe().checkout.sessions.retrieve(session.id);
    } catch (error) {
      console.error("[stripe] relecture de session impossible", error);
    }
  }

  const details = source.collected_information?.shipping_details;
  return {
    adresse: adresseDepuisStripe(details?.address),
    nom: details?.name || source.customer_details?.name || "",
    telephone: source.customer_details?.phone || "",
  };
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
    // Le rythme n'a de sens que s'il y a un abonnement : une Essentielle
    // n'en a pas, et lui en attribuer un fausserait le revenu récurrent.
    abonnementRythme: session.subscription
      ? session.metadata?.rythme === "annuel" ? "annuel" : "mensuel"
      : FieldValue.delete(),
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

  /*
   * L'adresse de livraison suit la commande.
   *
   * Elle est recopiée ici plutôt que laissée dans Stripe : c'est l'écran de
   * production qu'on ouvre pour expédier, pas le tableau de bord Stripe. Une
   * commande doit se suffire à elle-même.
   */
  const livraison = await lireLivraison(session);

  const maj: Record<string, unknown> = {
    status: "payee",
    stripeSessionId: session.id,
    updatedAt: Date.now(),
  };
  // Firestore refuse `undefined` : on n'écrit que ce qu'on a réellement.
  if (livraison.adresse) maj.shippingAddress = livraison.adresse;
  if (livraison.nom) maj.shippingName = livraison.nom;
  if (livraison.telephone) maj.shippingPhone = livraison.telephone;

  await adminDb.collection("orders").doc(commande.id!).update(maj);

  if (!livraison.adresse) {
    // Signalé fort : une plaque sans adresse ne peut pas partir, et l'équipe
    // doit le savoir sans avoir à éplucher les commandes une par une.
    console.warn(
      "[stripe] commande",
      commande.reference,
      "encaissée SANS adresse de livraison — à réclamer au client"
    );
  }

  /*
   * La confirmation de commande.
   *
   * Envoyée depuis le webhook, et de nulle part ailleurs : c'est le seul
   * endroit qui sache que l'argent est réellement encaissé. L'envoyer depuis
   * la page de retour préviendrait aussi ceux dont le paiement a échoué.
   *
   * L'échec d'envoi ne fait pas échouer l'événement : renvoyer une erreur à
   * Stripe le ferait rejouer, et le rejeu passerait de toute façon par
   * `commandeDejaPassee`. Une confirmation manquée est un ennui ; une
   * commande perdue, non.
   */
  const destinataireEmail =
    livret.owner?.email || session.customer_details?.email || "";

  if (destinataireEmail) {
    const message = await messageCommande({
      prenom: (livret.owner?.name || livraison.nom || "").trim().split(/\s+/)[0],
      reference: commande.reference,
      nomLogement: commande.accommodationName,
      formule: livret.offerType,
      slug: commande.accommodationSlug,
      essence: plaque.wood === "clair" ? "Bois clair" : "Noyer",
      phraseGravee: plaque.engravedTagline,
      adresse: livraison.adresse,
      destinataire: livraison.nom || livret.owner?.name,
    });

    const envoi = await envoyerCourriel({
      destinataire: destinataireEmail,
      nomDestinataire: livret.owner?.name || livraison.nom || undefined,
      sujet: message.sujet,
      html: message.html,
      texte: message.texte,
      etiquette: "commande",
    });

    if (envoi.envoye) {
      await adminDb
        .collection("orders")
        .doc(commande.id!)
        .update({ confirmationEnvoyeeLe: Date.now() })
        .catch(() => {});
    }
  } else {
    console.warn("[stripe] commande", commande.reference, "sans adresse e-mail client");
  }

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
        } else if (session.metadata?.type === "session-modification") {
          await traiterSessionModification(session);
        } else {
          const origin =
            process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
          await traiterPaiement(session, origin);
        }
      }
    }

    /*
     * Cycle de vie de l'abonnement.
     *
     * Deux événements, et ils ne disent pas la même chose : le premier
     * annonce une résiliation à venir, le second constate qu'elle a eu lieu.
     * N'écouter que le premier laisserait un Confort actif à vie ; n'écouter
     * que le second ne préviendrait de rien.
     */
    if (evenement.type === "customer.subscription.deleted") {
      await traiterFinAbonnement(evenement.data.object as Stripe.Subscription);
    }
    if (evenement.type === "customer.subscription.updated") {
      await traiterMajAbonnement(evenement.data.object as Stripe.Subscription);
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
