"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireAdminSession } from "@/lib/server/admin-auth";
import {
  CART_CHECKOUTS_COLLECTION,
  CART_TRACKING_COLLECTION,
} from "@/lib/server/cart-tracking";
import type { Accommodation, OfferType } from "@/lib/types/accommodation";
import { envoyerCourriel, messagerieConfiguree } from "@/lib/server/email";
import { messagePanierAbandonne } from "@/lib/server/emails/messages";

const ACCOMMODATIONS = "accommodations";
const ABANDON_MS = 3 * 86400000;
const PRICES = { essential: 4900, comfort: 6900, mensuel: 199, annuel: 1900 } as const;

export interface AdminCartItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  offerType: OfferType;
  plaqueWood: string;
  plaqueTagline: string;
  imageUrl: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export type AdminCartStatus = "ACTIVE" | "ABANDONED" | "CHECKOUT_OPEN" | "COMPLETED";

export interface AdminCart {
  ownerUid: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: AdminCartStatus;
  items: AdminCartItem[];
  itemCount: number;
  comfortCount: number;
  essentialCount: number;
  rhythm: "mensuel" | "annuel";
  estimatedTotalCents: number;
  recurringCents: number;
  firstSeenAt: number | null;
  lastViewedAt: number | null;
  lastActivityAt: number | null;
  lastCheckoutAt: number | null;
  viewCount: number;
  checkoutCount: number;
  lastCheckoutSessionId: string | null;
  lastCheckoutAmountCents: number | null;
  lastReminderAt: number | null;
  reminderCount: number;
  canRemind: boolean;
}

export interface AdminCartCheckout {
  sessionId: string;
  ownerUid: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  paymentStatus: string;
  items: Array<{
    id: string;
    name: string;
    city: string;
    offerType: OfferType;
  }>;
  rhythm: "mensuel" | "annuel";
  amountSubtotalCents: number;
  amountTotalCents: number;
  discountCents: number;
  currency: string;
  createdAt: number | null;
  completedAt: number | null;
  expiresAt: number | null;
}

export interface AdminCartCenter {
  generatedAt: number;
  stats: {
    current: number;
    abandoned: number;
    checkoutOpen: number;
    completed: number;
    currentValueCents: number;
    currentItems: number;
  };
  carts: AdminCart[];
  checkouts: AdminCartCheckout[];
}

type Identity = { name: string; email: string; phone: string };

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function loadCartControlCenter(): Promise<AdminCartCenter> {
  await requireAdminSession();

  const [accommodationsSnap, trackingSnap, checkoutSnap, users] = await Promise.all([
    adminDb.collection(ACCOMMODATIONS).get(),
    adminDb.collection(CART_TRACKING_COLLECTION).get().catch(() => null),
    adminDb.collection(CART_CHECKOUTS_COLLECTION).get().catch(() => null),
    adminAuth.listUsers(1000),
  ]);

  const identities = new Map<string, Identity>();
  users.users.forEach((user) => identities.set(user.uid, {
    name: user.displayName || "",
    email: user.email || "",
    phone: user.phoneNumber || "",
  }));

  const draftsByOwner = new Map<string, AdminCartItem[]>();
  accommodationsSnap.docs.forEach((doc) => {
    const item = doc.data() as Accommodation;
    if (!item.ownerUid) return;
    const known = identities.get(item.ownerUid);
    identities.set(item.ownerUid, {
      name: known?.name || item.owner?.name || "",
      email: known?.email || item.owner?.email || "",
      phone: known?.phone || item.owner?.phone || "",
    });
    if (item.isActive) return;
    const items = draftsByOwner.get(item.ownerUid) || [];
    items.push({
      id: doc.id,
      name: item.property?.name || item.slug || "Livret sans nom",
      slug: item.slug || "",
      city: item.property?.city || "",
      offerType: item.offerType === "comfort" ? "comfort" : "essential",
      plaqueWood: item.plaque?.wood || "noyer",
      plaqueTagline: item.plaque?.engravedTagline || "",
      imageUrl: item.property?.mainImageUrl || item.property?.gallery?.[0] || null,
      createdAt: numberOrNull(item.createdAt),
      updatedAt: numberOrNull(item.updatedAt),
    });
    draftsByOwner.set(item.ownerUid, items);
  });

  const tracking = new Map<string, FirebaseFirestore.DocumentData>();
  trackingSnap?.docs.forEach((doc) => tracking.set(doc.id, doc.data()));
  const checkoutCount = new Map<string, number>();
  checkoutSnap?.docs.forEach((doc) => {
    const ownerUid = doc.data()?.ownerUid;
    if (typeof ownerUid === "string") checkoutCount.set(ownerUid, (checkoutCount.get(ownerUid) || 0) + 1);
  });

  const ownerIds = new Set([...draftsByOwner.keys(), ...tracking.keys()]);
  const now = Date.now();
  const carts = [...ownerIds].map((ownerUid): AdminCart => {
    const items = (draftsByOwner.get(ownerUid) || []).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const trace = tracking.get(ownerUid) || {};
    const person = identities.get(ownerUid) || { name: "", email: "", phone: "" };
    const firstItemAt = items.reduce<number | null>((oldest, item) => {
      if (!item.createdAt) return oldest;
      return oldest === null ? item.createdAt : Math.min(oldest, item.createdAt);
    }, null);
    const lastItemAt = items.reduce((latest, item) => Math.max(latest, item.updatedAt || item.createdAt || 0), 0) || null;
    const lastViewedAt = numberOrNull(trace.lastViewedAt);
    const lastCheckoutAt = numberOrNull(trace.lastCheckoutAt);
    const lastCheckoutExpiresAt = numberOrNull(trace.lastCheckoutExpiresAt);
    const lastActivityAt = Math.max(lastItemAt || 0, lastViewedAt || 0, lastCheckoutAt || 0) || null;
    const rhythm = trace.lastCheckoutRhythm === "annuel" ? "annuel" : "mensuel";
    const comfortCount = items.filter((item) => item.offerType === "comfort").length;
    const essentialCount = items.length - comfortCount;
    const recurringCents = comfortCount * PRICES[rhythm];
    const estimatedTotalCents = essentialCount * PRICES.essential + comfortCount * PRICES.comfort + recurringCents;

    let status: AdminCartStatus = "ACTIVE";
    if (items.length === 0 && trace.status === "COMPLETED") status = "COMPLETED";
    else if (lastCheckoutAt && (!lastCheckoutExpiresAt || lastCheckoutExpiresAt > now)) status = "CHECKOUT_OPEN";
    else if (lastActivityAt && now - lastActivityAt >= ABANDON_MS) status = "ABANDONED";

    return {
      ownerUid,
      ownerName: person.name || (typeof trace.ownerName === "string" ? trace.ownerName : ""),
      ownerEmail: person.email || (typeof trace.ownerEmail === "string" ? trace.ownerEmail : ""),
      ownerPhone: person.phone,
      status,
      items,
      itemCount: items.length,
      comfortCount,
      essentialCount,
      rhythm,
      estimatedTotalCents,
      recurringCents,
      firstSeenAt: numberOrNull(trace.firstSeenAt) || firstItemAt,
      lastViewedAt,
      lastActivityAt,
      lastCheckoutAt,
      viewCount: typeof trace.viewCount === "number" ? trace.viewCount : 0,
      checkoutCount: checkoutCount.get(ownerUid) || 0,
      lastCheckoutSessionId: typeof trace.lastCheckoutSessionId === "string" ? trace.lastCheckoutSessionId : null,
      lastCheckoutAmountCents: numberOrNull(trace.lastCheckoutAmountCents),
      lastReminderAt: numberOrNull(trace.lastReminderAt),
      reminderCount: typeof trace.reminderCount === "number" ? trace.reminderCount : 0,
      canRemind: !numberOrNull(trace.lastReminderAt) || now - (numberOrNull(trace.lastReminderAt) || 0) >= 24 * 60 * 60 * 1000,
    };
  }).sort((a, b) => {
    const rank: Record<AdminCartStatus, number> = { CHECKOUT_OPEN: 0, ABANDONED: 1, ACTIVE: 2, COMPLETED: 3 };
    return rank[a.status] - rank[b.status] || (b.lastActivityAt || 0) - (a.lastActivityAt || 0);
  });

  const checkouts: AdminCartCheckout[] = (checkoutSnap?.docs || []).map((doc): AdminCartCheckout => {
    const data = doc.data();
    const ownerUid = typeof data.ownerUid === "string" ? data.ownerUid : "";
    const person = identities.get(ownerUid) || { name: "", email: "", phone: "" };
    const items = Array.isArray(data.items) ? data.items : [];
    const createdAt = numberOrNull(data.createdAt);
    const expiresAt = numberOrNull(data.expiresAt);
    const storedStatus = typeof data.status === "string" ? data.status : "OPEN";
    return {
      sessionId: doc.id,
      ownerUid,
      ownerName: person.name || (typeof data.ownerName === "string" ? data.ownerName : ""),
      ownerEmail: person.email || (typeof data.ownerEmail === "string" ? data.ownerEmail : ""),
      status: storedStatus === "OPEN" && expiresAt && expiresAt <= now ? "EXPIRED" : storedStatus,
      paymentStatus: typeof data.paymentStatus === "string" ? data.paymentStatus : "unpaid",
      items: items.map((item: Record<string, unknown>): AdminCartCheckout["items"][number] => ({
        id: typeof item.id === "string" ? item.id : "",
        name: typeof item.name === "string" ? item.name : "Livret sans nom",
        city: typeof item.city === "string" ? item.city : "",
        offerType: item.offerType === "comfort" ? "comfort" : "essential",
      })),
      rhythm: data.rhythm === "annuel" ? "annuel" : "mensuel",
      amountSubtotalCents: numberOrNull(data.amountSubtotalCents) || 0,
      amountTotalCents: numberOrNull(data.amountTotalCents) || 0,
      discountCents: numberOrNull(data.discountCents) || 0,
      currency: typeof data.currency === "string" ? data.currency : "eur",
      createdAt,
      completedAt: numberOrNull(data.completedAt),
      expiresAt,
    };
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const current = carts.filter((cart) => cart.itemCount > 0);
  return {
    generatedAt: now,
    stats: {
      current: current.length,
      abandoned: current.filter((cart) => cart.status === "ABANDONED").length,
      checkoutOpen: current.filter((cart) => cart.status === "CHECKOUT_OPEN").length,
      completed: carts.filter((cart) => cart.status === "COMPLETED").length,
      currentValueCents: current.reduce((sum, cart) => sum + cart.estimatedTotalCents, 0),
      currentItems: current.reduce((sum, cart) => sum + cart.itemCount, 0),
    },
    carts,
    checkouts,
  };
}

/** Envoi explicite uniquement, depuis le bouton du centre Paniers. */
export async function sendCartReminder(ownerUid: string): Promise<{ ok: boolean; detail: string; sentAt?: number }> {
  await requireAdminSession();
  if (!ownerUid) return { ok: false, detail: "Propriétaire introuvable." };
  if (!messagerieConfiguree()) {
    return { ok: false, detail: "BREVO_API_KEY n’est pas configurée : aucun message n’a été envoyé." };
  }

  const trackingRef = adminDb.collection(CART_TRACKING_COLLECTION).doc(ownerUid);
  const [traceSnap, itemsSnap, user] = await Promise.all([
    trackingRef.get(),
    adminDb.collection(ACCOMMODATIONS).where("ownerUid", "==", ownerUid).get(),
    adminAuth.getUser(ownerUid).catch(() => null),
  ]);
  const trace = traceSnap.data() || {};
  const lastReminderAt = numberOrNull(trace.lastReminderAt);
  if (lastReminderAt && Date.now() - lastReminderAt < 24 * 60 * 60 * 1000) {
    return { ok: false, detail: `Une relance a déjà été envoyée ${depuisServeur(lastReminderAt)}. Attendez 24 heures avant de recommencer.` };
  }

  const items = itemsSnap.docs
    .map((doc) => ({ ...(doc.data() as Accommodation), id: doc.id }))
    .filter((item) => !item.isActive);
  if (!items.length) return { ok: false, detail: "Ce panier est vide ou a déjà été commandé." };

  const email = user?.email || items[0]?.owner?.email || "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, detail: "Ce client n’a pas d’adresse e-mail valide." };
  }

  const name = user?.displayName || items[0]?.owner?.name || "";
  const rhythm = trace.lastCheckoutRhythm === "annuel" ? "annuel" : "mensuel";
  const comfort = items.filter((item) => item.offerType === "comfort").length;
  const essential = items.length - comfort;
  const totalCents = essential * PRICES.essential + comfort * PRICES.comfort + comfort * PRICES[rhythm];
  const amount = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalCents / 100);
  const message = await messagePanierAbandonne({
    prenom: name.trim().split(/\s+/)[0],
    logements: items.map((item) => item.property?.name || item.slug || "Livret"),
    montant: amount,
    nombre: items.length,
    confort: comfort,
    essentielle: essential,
  });

  const result = await envoyerCourriel({
    destinataire: email,
    nomDestinataire: name || undefined,
    sujet: message.sujet,
    html: message.html,
    texte: message.texte,
    etiquette: "relance-panier",
  });
  if (!result.envoye) {
    const reason = result.raison === "refuse" ? "Brevo a refusé l’envoi" : result.raison === "injoignable" ? "Brevo est injoignable" : "Messagerie non configurée";
    return { ok: false, detail: `${reason}${result.detail ? ` : ${result.detail}` : "."}` };
  }

  const sentAt = Date.now();
  await trackingRef.set({
    lastReminderAt: sentAt,
    reminderCount: FieldValue.increment(1),
    updatedAt: sentAt,
  }, { merge: true });
  return { ok: true, detail: `Relance envoyée à ${email}.`, sentAt };
}

function depuisServeur(value: number): string {
  const hours = Math.max(0, Math.floor((Date.now() - value) / 3600000));
  return hours < 1 ? "il y a moins d’une heure" : `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
}
