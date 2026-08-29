import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import { Accommodation, PlaqueOrder, PlaqueConfig } from "@/lib/types/accommodation";
import { generatePermanentId, permanentUrl } from "@/lib/permanentId";

/**
 * Cœur de la commande de plaque, SANS contrôle d'accès.
 *
 * Volontairement séparé des actions serveur : un module « use server » expose
 * chacun de ses exports au navigateur, et une création de commande sans
 * autorisation y deviendrait appelable par n'importe qui. Ici, `server-only`
 * garantit l'inverse — ce fichier ne peut être importé que côté serveur.
 *
 * Deux appelants, chacun avec sa propre garde :
 *  - l'administration Guidz, qui vérifie son cookie ;
 *  - le webhook Stripe, qui vérifie la signature de l'événement.
 */

const ACCOMMODATIONS = "accommodations";
const ORDERS = "orders";
const COUNTERS = "counters";

/**
 * Attribue un identifiant permanent au livret s'il n'en a pas encore.
 *
 * Idempotent : un livret qui en possède déjà un le conserve à vie — c'est
 * précisément la garantie qui protège les plaques déjà gravées.
 */
export async function attribuerIdentifiantPermanent(accommodationId: string): Promise<string> {
  const docRef = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Livret introuvable.");

  const actuel = doc.data() as Accommodation;
  if (actuel.permanentId) return actuel.permanentId;

  // On tire jusqu'à trouver un identifiant libre. La collision est très
  // improbable, mais elle ferait pointer deux plaques au même endroit.
  let candidat = "";
  for (let essai = 0; essai < 12; essai++) {
    candidat = generatePermanentId();
    const pris = await adminDb
      .collection(ACCOMMODATIONS)
      .where("permanentId", "==", candidat)
      .limit(1)
      .get();
    if (pris.empty) break;
    candidat = "";
  }
  if (!candidat) throw new Error("Impossible d’attribuer un identifiant permanent.");

  await docRef.update({ permanentId: candidat, updatedAt: Date.now() });
  return candidat;
}

/** Numéro de commande lisible et croissant : GUIDZ-1058. */
export async function prochaineReference(): Promise<string> {
  const compteur = adminDb.collection(COUNTERS).doc("orders");
  const valeur = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(compteur);
    const suivant = ((snap.exists ? (snap.data()?.value as number) : 0) || 1000) + 1;
    tx.set(compteur, { value: suivant }, { merge: true });
    return suivant;
  });
  return `GUIDZ-${valeur}`;
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
export async function creerCommandeInterne(
  accommodationId: string,
  plaque: PlaqueConfig,
  origin: string
): Promise<PlaqueOrder> {
  const docRef = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error("Livret introuvable.");

  const livret = doc.data() as Accommodation;
  const identifiant = livret.permanentId || (await attribuerIdentifiantPermanent(accommodationId));

  const precedentes = await adminDb
    .collection(ORDERS)
    .where("accommodationId", "==", accommodationId)
    .get();

  const maintenant = Date.now();
  const commande: Omit<PlaqueOrder, "id"> = {
    reference: await prochaineReference(),
    accommodationId,
    accommodationSlug: livret.slug,
    accommodationName: livret.property?.name || livret.slug,
    ownerName: livret.owner?.name || "",
    ownerEmail: livret.owner?.email || "",
    offerType: livret.offerType,
    permanentUrl: permanentUrl(origin, identifiant),
    plaque,
    status: "en_attente_paiement",
    version: precedentes.size + 1,
    createdAt: maintenant,
    updatedAt: maintenant,
  };

  const creee = await adminDb.collection(ORDERS).add(commande);

  // L'adresse publique devient définitive : elle est gravée.
  await docRef.update({ slugLocked: true, plaque, updatedAt: maintenant });

  return { ...commande, id: creee.id };
}

/**
 * Y a-t-il déjà une commande vivante pour ce livret ?
 *
 * Sert au webhook : Stripe peut livrer deux fois le même événement, et rien
 * ne doit produire deux plaques pour un seul paiement.
 */
export async function commandeDejaPassee(accommodationId: string): Promise<PlaqueOrder | null> {
  const snapshot = await adminDb
    .collection(ORDERS)
    .where("accommodationId", "==", accommodationId)
    .get();

  const vivantes = snapshot.docs
    .map((d) => ({ ...(d.data() as PlaqueOrder), id: d.id }))
    .filter((o) => o.status !== "annulee")
    .sort((a, b) => b.createdAt - a.createdAt);

  return vivantes[0] || null;
}
