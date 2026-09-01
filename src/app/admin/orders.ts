"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  Accommodation, PlaqueOrder, PlaqueConfig, OrderStatus,
} from "@/lib/types/accommodation";
import { generatePermanentId, permanentUrl } from "@/lib/permanentId";

const ACCOMMODATIONS = "accommodations";
const ORDERS = "orders";
const COUNTERS = "counters";
const FIRESTORE_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Firestore injoignable (${label}). Vérifiez votre connexion, puis réessayez.`)),
      FIRESTORE_TIMEOUT_MS
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

async function requireAdminAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   IDENTIFIANT PERMANENT
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Attribue un identifiant permanent au livret s'il n'en a pas encore.
 *
 * Idempotent : un livret qui en possède déjà un le conserve à vie — c'est
 * précisément la garantie qui protège les plaques gravées.
 */
export async function ensurePermanentId(accommodationId: string): Promise<string> {
  await requireAdminAuth();

  const docRef = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await withTimeout(docRef.get(), `livret ${accommodationId}`);
  if (!doc.exists) throw new Error("Livret introuvable — enregistrez-le d'abord.");

  const current = doc.data() as Accommodation;
  if (current.permanentId) return current.permanentId;

  // On tire jusqu'à trouver un identifiant libre. La collision est très
  // improbable, mais elle ferait pointer deux plaques au même endroit.
  let candidate = "";
  for (let attempt = 0; attempt < 12; attempt++) {
    candidate = generatePermanentId();
    const taken = await withTimeout(
      adminDb.collection(ACCOMMODATIONS).where("permanentId", "==", candidate).limit(1).get(),
      "vérification d'identifiant"
    );
    if (taken.empty) break;
    candidate = "";
  }
  if (!candidate) throw new Error("Impossible d'attribuer un identifiant permanent. Réessayez.");

  await docRef.update({ permanentId: candidate, updatedAt: Date.now() });
  revalidatePath(`/admin/hebergements/${accommodationId}`);
  return candidate;
}

/* ══════════════════════════════════════════════════════════════════════════
   COMMANDES
   ══════════════════════════════════════════════════════════════════════════ */

/** Numéro de commande lisible et croissant : GUIDZ-1058. */
async function nextOrderReference(): Promise<string> {
  const counterRef = adminDb.collection(COUNTERS).doc("orders");
  const value = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const next = ((snap.exists ? (snap.data()?.value as number) : 0) || 1000) + 1;
    tx.set(counterRef, { value: next }, { merge: true });
    return next;
  });
  return `GUIDZ-${value}`;
}

/**
 * Enregistre une commande de plaque.
 *
 * Trois effets définitifs, dans cet ordre :
 *  1. le livret reçoit son identifiant permanent, s'il n'en avait pas ;
 *  2. son adresse publique est VERROUILLÉE — elle part à la gravure ;
 *  3. la configuration est figée dans la commande, pour qu'une modification
 *     ultérieure du livret n'altère jamais une plaque déjà produite.
 */
export async function createPlaqueOrder(
  accommodationId: string,
  plaque: PlaqueConfig,
  origin: string
): Promise<PlaqueOrder> {
  await requireAdminAuth();

  const docRef = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await withTimeout(docRef.get(), `livret ${accommodationId}`);
  if (!doc.exists) throw new Error("Livret introuvable — enregistrez-le avant de commander.");

  const livret = doc.data() as Accommodation;
  const permanentIdValue = livret.permanentId || (await ensurePermanentId(accommodationId));

  // Combien de plaques ont déjà été commandées pour ce logement ?
  const previous = await withTimeout(
    adminDb.collection(ORDERS).where("accommodationId", "==", accommodationId).get(),
    "commandes existantes"
  );

  const now = Date.now();
  const order: Omit<PlaqueOrder, "id"> = {
    reference: await nextOrderReference(),
    accommodationId,
    accommodationSlug: livret.slug,
    accommodationName: livret.property?.name || livret.slug,
    ownerName: livret.owner?.name || "",
    ownerEmail: livret.owner?.email || "",
    offerType: livret.offerType,
    permanentUrl: permanentUrl(origin, permanentIdValue),
    plaque,
    status: "en_attente_paiement",
    version: previous.size + 1,
    createdAt: now,
    updatedAt: now,
  };

  const created = await withTimeout(adminDb.collection(ORDERS).add(order), "création de commande");

  // L'adresse publique devient définitive : elle est gravée.
  await docRef.update({ slugLocked: true, plaque, updatedAt: now });

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/hebergements/${accommodationId}`);
  return { ...order, id: created.id };
}

export async function getPlaqueOrders(): Promise<PlaqueOrder[]> {
  await requireAdminAuth();
  const snapshot = await withTimeout(adminDb.collection(ORDERS).get(), "liste des commandes");
  return snapshot.docs
    .map((d) => ({ ...d.data(), id: d.id }) as PlaqueOrder)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getOrdersForAccommodation(accommodationId: string): Promise<PlaqueOrder[]> {
  await requireAdminAuth();
  const snapshot = await withTimeout(
    adminDb.collection(ORDERS).where("accommodationId", "==", accommodationId).get(),
    "commandes du livret"
  );
  return snapshot.docs
    .map((d) => ({ ...d.data(), id: d.id }) as PlaqueOrder)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdminAuth();

  const orderRef = adminDb.collection(ORDERS).doc(orderId);
  const snap = await withTimeout(orderRef.get(), `commande ${orderId}`);
  if (!snap.exists) throw new Error("Commande introuvable.");
  const order = snap.data() as PlaqueOrder;

  await withTimeout(
    orderRef.update({ status, updatedAt: Date.now() }),
    "mise à jour du statut"
  );

  /*
   * Une annulation doit RENDRE l'adresse publique.
   *
   * Le verrou n'existe que parce qu'une plaque part à la gravure ; si plus
   * aucune commande vivante ne le justifie, le maintenir enfermerait l'hôte
   * dans une adresse qu'aucun objet ne porte. On ne déverrouille donc que
   * lorsque toutes les commandes du logement sont annulées.
   */
  if (status === "annulee" && order.accommodationId) {
    const siblings = await withTimeout(
      adminDb.collection(ORDERS).where("accommodationId", "==", order.accommodationId).get(),
      "commandes du logement"
    );
    const encoreVivante = siblings.docs.some(
      (d) => d.id !== orderId && (d.data() as PlaqueOrder).status !== "annulee"
    );
    if (!encoreVivante) {
      await adminDb.collection(ACCOMMODATIONS).doc(order.accommodationId).update({
        slugLocked: FieldValue.delete(),
        updatedAt: Date.now(),
      });
      revalidatePath(`/admin/hebergements/${order.accommodationId}`);
    }
  }

  revalidatePath("/admin/commandes");
  return { ok: true as const };
}

/* ══════════════════════════════════════════════════════════════════════════
   STATISTIQUES
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Compteurs d'usage d'un livret.
 *
 * Renvoie un objet vide plutôt qu'une erreur si rien n'a encore été mesuré :
 * un livret qui vient d'être publié n'a pas de statistiques, ce n'est pas une
 * anomalie.
 */
export async function getLivretStats(accommodationId: string): Promise<Record<string, unknown>> {
  await requireAdminAuth();
  try {
    const doc = await withTimeout(
      adminDb.collection("stats").doc(accommodationId).get(),
      "statistiques"
    );
    return doc.exists ? (doc.data() as Record<string, unknown>) : {};
  } catch (error) {
    console.error("[getLivretStats]", error);
    return {};
  }
}

/** Ce que Guidz renseigne sur l'acheminement d'une plaque. */
export interface Expedition {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: number | null;
  clientNote?: string;
}

/**
 * Enregistre le suivi d'expédition d'une commande.
 *
 * Ces informations sont reprises telles quelles dans l'espace du client :
 * c'est la seule chose qu'il attend une fois qu'il a payé. Un client sans
 * nouvelles écrit ; un client qui suit son colis attend.
 *
 * Renseigner un suivi marque aussi la commande comme expédiée et date
 * l'envoi : demander à l'équipe de faire les deux gestes séparément, c'est
 * garantir qu'un des deux sera oublié.
 */
export async function updateOrderShipping(orderId: string, expedition: Expedition) {
  await requireAdminAuth();

  const orderRef = adminDb.collection(ORDERS).doc(orderId);
  const snap = await withTimeout(orderRef.get(), `commande ${orderId}`);
  if (!snap.exists) throw new Error("Commande introuvable.");
  const order = snap.data() as PlaqueOrder;

  const url = (expedition.trackingUrl || "").trim();
  if (url && !/^https?:\/\//i.test(url)) {
    throw new Error("Le lien de suivi doit commencer par http:// ou https://");
  }

  const maintenant = Date.now();
  const aUnSuivi = Boolean(url || (expedition.trackingNumber || "").trim());

  /*
   * Firestore refuse `undefined` : les champs vidés par l'équipe sont donc
   * effacés explicitement, et non laissés en suspens.
   */
  const champs: Record<string, unknown> = {
    carrier: (expedition.carrier || "").trim() || FieldValue.delete(),
    trackingNumber: (expedition.trackingNumber || "").trim() || FieldValue.delete(),
    trackingUrl: url || FieldValue.delete(),
    clientNote: (expedition.clientNote || "").trim() || FieldValue.delete(),
    estimatedDelivery: expedition.estimatedDelivery || FieldValue.delete(),
    updatedAt: maintenant,
  };

  // Un suivi renseigné vaut expédition : on date l'envoi et on avance l'état,
  // sauf si la commande est plus avancée ou annulée.
  if (aUnSuivi) {
    if (!order.shippedAt) champs.shippedAt = maintenant;
    if (order.status !== "annulee" && order.status !== "expediee") {
      champs.status = "expediee";
    }
  }

  await withTimeout(orderRef.update(champs), "mise à jour du suivi");
  revalidatePath("/admin/commandes");

  return { expediee: aUnSuivi };
}
