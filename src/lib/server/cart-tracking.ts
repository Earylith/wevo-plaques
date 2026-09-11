import "server-only";

import type Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import type { Accommodation } from "@/lib/types/accommodation";
import type { RythmeAbonnement } from "@/lib/stripe";

export const CART_TRACKING_COLLECTION = "cart_tracking";
export const CART_CHECKOUTS_COLLECTION = "cart_checkout_attempts";

type CartItemSnapshot = Pick<Accommodation, "offerType" | "slug"> & {
  id: string;
  name: string;
  city: string;
  plaqueWood: string;
  plaqueTagline: string;
};

function itemSnapshot(item: Accommodation & { id: string }): CartItemSnapshot {
  return {
    id: item.id,
    name: item.property?.name || item.slug || "Livret sans nom",
    city: item.property?.city || "",
    offerType: item.offerType,
    slug: item.slug || "",
    plaqueWood: item.plaque?.wood || "noyer",
    plaqueTagline: item.plaque?.engravedTagline || "",
  };
}

/** Mesure une consultation réelle du tiroir panier, sans bloquer son affichage. */
export async function recordCartView(params: {
  ownerUid: string;
  ownerEmail: string;
  ownerName: string;
  itemIds: string[];
}): Promise<void> {
  const now = Date.now();
  const ref = adminDb.collection(CART_TRACKING_COLLECTION).doc(params.ownerUid);
  await adminDb.runTransaction(async (transaction) => {
    const known = await transaction.get(ref);
    transaction.set(ref, {
      ownerUid: params.ownerUid,
      ownerEmail: params.ownerEmail,
      ownerName: params.ownerName,
      firstSeenAt: known.exists ? known.data()?.firstSeenAt || now : now,
      lastViewedAt: now,
      lastActivityAt: now,
      currentItemIds: params.itemIds,
      status: "ACTIVE",
      viewCount: FieldValue.increment(1),
      updatedAt: now,
    }, { merge: true });
  });
}

/**
 * Fige le panier présenté à Stripe. Cette trace est distincte du panier
 * courant : le client peut ensuite revenir, changer une formule et réessayer.
 */
export async function recordCartCheckout(params: {
  ownerUid: string;
  ownerEmail: string;
  ownerName: string;
  items: Array<Accommodation & { id: string }>;
  rhythm: RythmeAbonnement;
  session: Stripe.Checkout.Session;
}): Promise<void> {
  const now = Date.now();
  const items = params.items.map(itemSnapshot);
  const data = {
    ownerUid: params.ownerUid,
    ownerEmail: params.ownerEmail,
    ownerName: params.ownerName,
    itemIds: items.map((item) => item.id),
    items,
    itemCount: items.length,
    rhythm: params.rhythm,
    checkoutSessionId: params.session.id,
    checkoutStatus: params.session.status || "open",
    paymentStatus: params.session.payment_status || "unpaid",
    amountSubtotalCents: params.session.amount_subtotal || 0,
    amountTotalCents: params.session.amount_total || 0,
    discountCents: params.session.total_details?.amount_discount || 0,
    currency: params.session.currency || "eur",
    status: "OPEN",
    expiresAt: params.session.expires_at ? params.session.expires_at * 1000 : null,
    createdAt: now,
    updatedAt: now,
  };

  const batch = adminDb.batch();
  batch.set(adminDb.collection(CART_CHECKOUTS_COLLECTION).doc(params.session.id), data);
  batch.set(adminDb.collection(CART_TRACKING_COLLECTION).doc(params.ownerUid), {
    ownerUid: params.ownerUid,
    ownerEmail: params.ownerEmail,
    ownerName: params.ownerName,
    lastCheckoutAt: now,
    lastCheckoutExpiresAt: params.session.expires_at ? params.session.expires_at * 1000 : null,
    lastActivityAt: now,
    currentItemIds: data.itemIds,
    lastCheckoutSessionId: params.session.id,
    lastCheckoutAmountCents: data.amountTotalCents,
    lastCheckoutRhythm: params.rhythm,
    status: "CHECKOUT_OPEN",
    updatedAt: now,
  }, { merge: true });
  await batch.commit();
}

/** Le webhook signé est seul autorisé à déclarer le panier encaissé. */
export async function completeCartCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const ownerUid = session.metadata?.ownerUid || "";
  const now = Date.now();
  const batch = adminDb.batch();
  batch.set(adminDb.collection(CART_CHECKOUTS_COLLECTION).doc(session.id), {
    checkoutStatus: session.status || "complete",
    paymentStatus: session.payment_status || "paid",
    amountTotalCents: session.amount_total || 0,
    status: "COMPLETED",
    completedAt: now,
    updatedAt: now,
  }, { merge: true });
  if (ownerUid) {
    batch.set(adminDb.collection(CART_TRACKING_COLLECTION).doc(ownerUid), {
      status: "COMPLETED",
      completedAt: now,
      lastActivityAt: now,
      lastCheckoutSessionId: session.id,
      updatedAt: now,
    }, { merge: true });
  }
  await batch.commit();
}
