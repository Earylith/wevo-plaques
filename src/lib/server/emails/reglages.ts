import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import {
  CleMessage, TexteMessage, TextesEmails, TEXTES_PAR_DEFAUT,
} from "@/lib/emailsTextes";

export type { CleMessage, TexteMessage, TextesEmails };
export { TEXTES_PAR_DEFAUT, VARIABLES } from "@/lib/emailsTextes";

/**
 * Le texte des e-mails, modifiable depuis l'administration.
 *
 * La STRUCTURE reste dans le code — l'enveloppe, l'encadré de faits, le
 * bouton, les liens. Seuls l'objet, le titre, les paragraphes et le
 * post-scriptum sont éditables. C'est délibéré : laisser modifier le gabarit
 * entier, c'est garantir qu'un jour le lien de suivi disparaîtra d'un
 * message d'expédition, ou que la référence de commande sautera d'une
 * confirmation.
 *
 * Les textes par défaut vivent ici. Tant que personne n'a rien modifié, ce
 * sont eux qui partent — l'administration n'a pas besoin d'être remplie pour
 * que les e-mails fonctionnent.
 */

const REGLAGES = "settings";
const DOCUMENT = "emails";

/**
 * Remplace les variables d'un texte par leurs valeurs.
 *
 * Une variable inconnue est effacée plutôt que laissée telle quelle : mieux
 * vaut une phrase amputée qu'un client qui lit « Bonjour {prenom} ».
 *
 * Le nettoyage qui suit ne touche QU'À la virgule et au point. Le
 * deux-points, le point-virgule, le point d'exclamation et le point
 * d'interrogation prennent une espace avant en français : les rapprocher
 * donnait « votre page avec vos voyageurs: » — une faute, dans un message
 * qui se veut soigné.
 */
export function appliquerVariables(
  texte: string,
  valeurs: Record<string, string | undefined>
): string {
  return texte
    .replace(/\{(\w+)\}/g, (_, cle: string) => (valeurs[cle] || "").trim())
    .replace(/[ \t]{2,}/g, " ")
    // « Bonjour , » quand le prénom manque.
    .replace(/[ \t]+([,.])/g, "$1")
    // « Bienvenue, » resté orphelin de son prénom, en fin de phrase.
    .replace(/[,;:]\s*$/g, "")
    // Une ponctuation doublée par la disparition d'une variable.
    .replace(/([,.!?])\1+/g, "$1")
    .trim();
}

/** Un texte enregistré est-il exploitable ? Sinon, on garde le défaut. */
function valide(t: unknown): t is TexteMessage {
  const c = t as TexteMessage;
  return Boolean(
    c &&
      typeof c.sujet === "string" && c.sujet.trim() &&
      typeof c.titre === "string" &&
      Array.isArray(c.paragraphes)
  );
}

/**
 * Lit les textes en vigueur.
 *
 * Ne lève jamais : une lecture Firestore ratée doit faire partir le message
 * par défaut, pas empêcher la confirmation d'une commande encaissée.
 */
export async function lireTextesEmails(): Promise<TextesEmails> {
  try {
    const doc = await adminDb.collection(REGLAGES).doc(DOCUMENT).get();
    if (!doc.exists) return TEXTES_PAR_DEFAUT;

    const enregistre = doc.data() as Partial<TextesEmails>;
    // Fusion clé par clé : un seul message modifié ne doit pas effacer les
    // deux autres, et un enregistrement abîmé ne doit rien casser.
    return {
      bienvenue: valide(enregistre.bienvenue) ? enregistre.bienvenue : TEXTES_PAR_DEFAUT.bienvenue,
      commande: valide(enregistre.commande) ? enregistre.commande : TEXTES_PAR_DEFAUT.commande,
      expedition: valide(enregistre.expedition) ? enregistre.expedition : TEXTES_PAR_DEFAUT.expedition,
      devis: valide(enregistre.devis) ? enregistre.devis : TEXTES_PAR_DEFAUT.devis,
    };
  } catch (error) {
    console.error("[emails] lecture des textes impossible, défauts utilisés", error);
    return TEXTES_PAR_DEFAUT;
  }
}

/** Enregistre le texte d'un message. */
export async function ecrireTexteEmail(cle: CleMessage, texte: TexteMessage): Promise<void> {
  const propre: TexteMessage = {
    sujet: texte.sujet.trim().slice(0, 200),
    titre: texte.titre.trim().slice(0, 200),
    paragraphes: texte.paragraphes
      .map((p) => p.trim().slice(0, 2000))
      .filter(Boolean)
      .slice(0, 8),
    postScriptum: (texte.postScriptum || "").trim().slice(0, 1000),
  };

  await adminDb.collection(REGLAGES).doc(DOCUMENT).set({ [cle]: propre }, { merge: true });
}

/** Efface la personnalisation d'un message : il repart sur le texte d'origine. */
export async function retablirTexteEmail(cle: CleMessage): Promise<void> {
  await adminDb
    .collection(REGLAGES)
    .doc(DOCUMENT)
    .set({ [cle]: TEXTES_PAR_DEFAUT[cle] }, { merge: true });
}
