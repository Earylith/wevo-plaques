"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Accommodation, OfferType } from "@/lib/types/accommodation";
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
 * Ouvre — ou retrouve — le livret de l'hôte connecté, dans la formule choisie.
 *
 * Idempotent par construction : un hôte qui revient sur la page de tarifs, ou
 * qui clique deux fois, retrouve son brouillon au lieu d'en accumuler. Sans
 * cela, chaque retour laisserait un livret vide de plus en base.
 */
export async function ouvrirLivret(
  jetonHote: string,
  offre: OfferType = "comfort"
): Promise<LivretOuvert> {
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
    const livretExistant = doc.data() as Accommodation;

    /*
     * Passage à la formule supérieure, RÉSERVÉ AUX BROUILLONS.
     *
     * Un brouillon n'a rien payé : il change de formule librement et réglera
     * le Confort au moment de publier. Une Essentielle DÉJÀ PUBLIÉE, elle, a
     * été encaissée — la faire basculer ici offrirait le Confort à qui
     * reviendrait sur la page de tarifs. Sa bascule passe par le paiement de
     * l'écart, dans l'espace client.
     *
     * On ne redescend jamais automatiquement : un retour à l'Essentielle
     * masquerait du contenu déjà saisi, et cela reste une décision explicite.
     */
    if (offre === "comfort" && livretExistant.offerType !== "comfort" && !livretExistant.isActive) {
      await doc.ref.update({
        offerType: "comfort",
        template: "cleo",
        updatedAt: Date.now(),
      });
    }

    return { id: doc.id, slug: livretExistant.slug, existant: true };
  }

  const slug = await slugDisponible(email.split("@")[0] || "livret");
  const livret: Accommodation = {
    ...createEmptyAccommodation(slug),
    offerType: offre,
    // Le gabarit découle de la formule : « cleo » est la page Confort,
    // l'Essentielle a la sienne.
    template: offre === "comfort" ? "cleo" : "essential",
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

/**
 * Change la formule d'un livret NON PUBLIÉ.
 *
 * Tant que rien n'est payé, l'hôte compose dans la formule qu'il veut et peut
 * revenir en arrière autant de fois qu'il le souhaite : ce qu'il paiera à la
 * publication, c'est la formule dans laquelle il se trouve à ce moment-là.
 *
 * Le contenu déjà saisi n'est JAMAIS effacé. Repasser à l'Essentielle masque
 * les rubriques qu'elle ne couvre pas ; elles réapparaissent intactes si
 * l'hôte revient au Confort. Supprimer serait irréversible pour un geste que
 * l'on présente comme un simple essayage.
 */
export async function changerFormuleBrouillon(
  accommodationId: string,
  offre: OfferType,
  jetonHote?: string
): Promise<{ formule: OfferType }> {
  const ref = adminDb.collection(ACCOMMODATIONS).doc(accommodationId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error("Livret introuvable.");
  const livret = doc.data() as Accommodation;

  /*
   * L'appelant doit être le propriétaire. Sans cette vérification, un
   * identifiant deviné suffirait à changer la formule du livret d'un autre.
   */
  if (!jetonHote) throw new Error("Connectez-vous pour changer de formule.");
  const jeton = await adminAuth.verifyIdToken(jetonHote);
  if (!livret.ownerUid || livret.ownerUid !== jeton.uid) {
    throw new Error("Ce livret n’est pas rattaché à votre compte.");
  }

  if (livret.isActive) {
    throw new Error(
      "Votre livret est déjà publié : le passage au Confort se fait depuis votre espace client."
    );
  }

  if (livret.offerType === offre) return { formule: offre };

  await ref.update({
    offerType: offre,
    template: offre === "comfort" ? "cleo" : "essential",
    updatedAt: Date.now(),
  });

  return { formule: offre };
}
