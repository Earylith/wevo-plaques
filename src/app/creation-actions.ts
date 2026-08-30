"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Accommodation } from "@/lib/types/accommodation";
import { createEmptyAccommodation } from "@/lib/livret";
import { slugify } from "@/lib/utils";

/**
 * Ouverture d'un livret par un hôte, depuis la page de tarifs.
 *
 * Le livret est créé AVANT tout paiement, en brouillon : l'hôte remplit son
 * contenu gratuitement, et ne paie qu'au moment de le mettre en ligne. C'est
 * l'inverse d'un lien de paiement, qui encaisse sans rien créer.
 */

const ACCOMMODATIONS = "accommodations";

/** Retire les `undefined`, que Firestore refuse. */
function nettoyer<T>(valeur: T): T {
  return JSON.parse(JSON.stringify(valeur)) as T;
}

/**
 * Fabrique une adresse publique libre.
 *
 * Le nom du logement n'est pas encore connu à cette étape : on part du début
 * de l'adresse e-mail, et on suffixe tant que la place est prise. Un doublon
 * ferait pointer deux livrets sur la même page.
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

export interface LivretOuvert {
  id: string;
  slug: string;
  /** Le livret existait déjà : on n'en a pas créé un second. */
  existant: boolean;
}

/**
 * Ouvre — ou retrouve — le livret Confort de l'hôte connecté.
 *
 * Idempotent par construction : un hôte qui revient sur la page de tarifs, ou
 * qui clique deux fois, retrouve son brouillon au lieu d'en accumuler. Sans
 * cela, chaque retour laisserait un livret vide de plus en base.
 */
export async function ouvrirLivretConfort(jetonHote: string): Promise<LivretOuvert> {
  if (!jetonHote) throw new Error("Connectez-vous pour commencer.");

  // Le jeton est vérifié côté serveur : un identifiant envoyé par le
  // navigateur ne prouve rien par lui-même.
  const jeton = await adminAuth.verifyIdToken(jetonHote);
  const uid = jeton.uid;
  const email = jeton.email || "";

  const deja = await adminDb
    .collection(ACCOMMODATIONS)
    .where("ownerUid", "==", uid)
    .limit(1)
    .get();

  if (!deja.empty) {
    const doc = deja.docs[0];
    return { id: doc.id, slug: (doc.data() as Accommodation).slug, existant: true };
  }

  const slug = await slugDisponible(email.split("@")[0] || "livret");
  const livret: Accommodation = {
    ...createEmptyAccommodation(slug),
    offerType: "comfort",
    template: "cleo",
    // Brouillon : rien n'est visible avant le paiement.
    isActive: false,
    ownerUid: uid,
    owner: {
      name: jeton.name || "",
      email,
      phone: "",
    },
  };

  const cree = await adminDb.collection(ACCOMMODATIONS).add(nettoyer(livret));
  return { id: cree.id, slug, existant: false };
}
