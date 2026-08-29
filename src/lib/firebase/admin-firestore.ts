import { cache } from "react";
import { adminDb } from "./admin";
import { Accommodation } from "../types/accommodation";

const COLLECTION_NAME = "accommodations";

/**
 * Délai maximal accordé à une lecture Firestore.
 *
 * Sans borne, le SDK gRPC réessaie pendant plus d'une minute quand le réseau
 * est coupé : une page publique restait 88 s en attente avant de tomber en
 * erreur, ce qui donne l'impression que le serveur entier est bloqué.
 */
const READ_TIMEOUT_MS = 6000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Firestore injoignable (${label}) : délai de ${READ_TIMEOUT_MS} ms dépassé.`)),
      READ_TIMEOUT_MS
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

export const getAccommodationBySlugAdmin = async (slug: string): Promise<Accommodation | null> => {
  const querySnapshot = await withTimeout(
    adminDb.collection(COLLECTION_NAME).where("slug", "==", slug).get(),
    `slug=${slug}`
  );

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    // L'identifiant du document prime sur un éventuel champ `id` stocké.
    return { ...docSnap.data(), id: docSnap.id } as Accommodation;
  }
  return null;
};

/**
 * Données de secours des livrets de démonstration.
 *
 * Elles ne sont servies que si Firestore ne contient pas le document, ou si la
 * base est injoignable : ces trois livrets sont des vitrines, ils doivent
 * s'afficher en toutes circonstances. Un livret réel, lui, ne doit JAMAIS être
 * remplacé par du contenu d'emprunt.
 */
const DEMO_SLUGS = ["demo-essentielle", "demo-confort", "demo-confort2"] as const;

export const isDemoSlug = (slug: string): boolean =>
  (DEMO_SLUGS as readonly string[]).includes(slug);

const loadDemoFallback = async (slug: string): Promise<Accommodation | null> => {
  if (!isDemoSlug(slug)) return null;
  const demos = await import("../demoData");
  if (slug === "demo-essentielle") return demos.demoEssentielle;
  if (slug === "demo-confort") return demos.demoConfort;
  return demos.demoConfortMarseille;
};

export type AccommodationLookup =
  | { status: "ok"; data: Accommodation; source: "firestore" | "demo" }
  | { status: "missing" }
  | { status: "unavailable"; reason: string };

/**
 * Point d'entrée unique des pages publiques.
 *
 * - Le SLUG fait autorité : c'est l'URL publique. L'identifiant de document
 *   n'est qu'un repli, pour ne pas exposer chaque livret sous deux URL.
 * - `cache()` déduplique l'appel : `generateMetadata` et le composant de page
 *   le sollicitent tous les deux à chaque rendu dynamique.
 * - Une panne Firestore renvoie `unavailable` (page d'attente lisible) plutôt
 *   qu'une trace d'erreur — sauf pour les démos, qui ont une source statique.
 */
export const lookupAccommodation = cache(async (slugOrId: string): Promise<AccommodationLookup> => {
  try {
    const bySlug = await getAccommodationBySlugAdmin(slugOrId);
    if (bySlug) return { status: "ok", data: bySlug, source: "firestore" };

    const byId = await withTimeout(
      adminDb.collection(COLLECTION_NAME).doc(slugOrId).get(),
      `id=${slugOrId}`
    );
    if (byId.exists) {
      return { status: "ok", data: { ...byId.data(), id: byId.id } as Accommodation, source: "firestore" };
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Erreur Firestore inconnue";
    console.error(`[lookupAccommodation] "${slugOrId}" — ${reason}`);

    const demo = await loadDemoFallback(slugOrId);
    if (demo) return { status: "ok", data: demo, source: "demo" };
    return { status: "unavailable", reason };
  }

  const demo = await loadDemoFallback(slugOrId);
  if (demo) return { status: "ok", data: demo, source: "demo" };
  return { status: "missing" };
});

/** Variante « objet ou null », pratique pour `generateMetadata`. */
export const resolveAccommodation = async (slugOrId: string): Promise<Accommodation | null> => {
  const result = await lookupAccommodation(slugOrId);
  return result.status === "ok" ? result.data : null;
};
