import { AdressePostale } from "@/lib/types/accommodation";

/**
 * Mise en forme d'une adresse de livraison.
 *
 * Sert deux usages qui n'en font qu'un : afficher l'adresse à l'écran, et
 * la copier d'un geste pour la coller dans l'interface du transporteur.
 * Recopier une adresse à la main, c'est un chiffre de code postal inversé
 * tôt ou tard — et une plaque gravée qui part au mauvais endroit.
 */

/** Pays courants pour Guidz, affichés en clair plutôt qu'en code ISO. */
const PAYS: Record<string, string> = {
  FR: "France",
  BE: "Belgique",
  CH: "Suisse",
  LU: "Luxembourg",
  MC: "Monaco",
  ES: "Espagne",
  IT: "Italie",
  PT: "Portugal",
  DE: "Allemagne",
  NL: "Pays-Bas",
  GB: "Royaume-Uni",
  CA: "Canada",
};

export function nomDuPays(code?: string): string {
  if (!code) return "";
  return PAYS[code.toUpperCase()] || code.toUpperCase();
}

/**
 * L'adresse est-elle exploitable pour expédier ?
 *
 * On exige la rue, le code postal et la ville. Une adresse à laquelle il
 * manque l'un des trois n'est pas « incomplète », elle est inutilisable —
 * autant le dire franchement dans l'admin.
 */
export function adresseExpediable(a?: AdressePostale | null): boolean {
  if (!a) return false;
  return Boolean(a.line1?.trim() && a.postalCode?.trim() && a.city?.trim());
}

/** Les lignes de l'étiquette, dans l'ordre où on les écrit sur un colis. */
export function lignesAdresse(
  a?: AdressePostale | null,
  destinataire?: string
): string[] {
  if (!a) return [];
  const lignes = [
    (destinataire || "").trim(),
    (a.line1 || "").trim(),
    (a.line2 || "").trim(),
    [a.postalCode, a.city].filter(Boolean).join(" ").trim(),
    nomDuPays(a.country),
  ];
  return lignes.filter(Boolean);
}

/** L'étiquette complète, prête à coller. */
export function adresseEnTexte(
  a?: AdressePostale | null,
  destinataire?: string
): string {
  return lignesAdresse(a, destinataire).join("\n");
}

/**
 * Convertit une adresse Stripe en la nôtre.
 *
 * Stripe renvoie `null` sur les champs non renseignés ; Firestore refuse
 * `undefined`. On normalise donc tout en chaînes, et on omet ce qui est
 * vide plutôt que d'écrire des cases blanches.
 */
export function adresseDepuisStripe(source?: {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
} | null): AdressePostale | null {
  if (!source) return null;
  const adresse: AdressePostale = {
    line1: source.line1 || "",
    postalCode: source.postal_code || "",
    city: source.city || "",
    country: source.country || "",
  };
  if (source.line2) adresse.line2 = source.line2;
  if (source.state) adresse.state = source.state;
  return adresseExpediable(adresse) ? adresse : null;
}

/**
 * Adresse débarrassée de ses champs vides.
 *
 * Firestore refuse `undefined` : une adresse saisie sans complément
 * ferait échouer l'écriture au lieu d'enregistrer les quatre lignes utiles.
 */
export function adresseNettoyee(a: AdressePostale): AdressePostale {
  const propre: AdressePostale = {
    line1: (a.line1 || "").trim(),
    postalCode: (a.postalCode || "").trim(),
    city: (a.city || "").trim(),
    country: (a.country || "FR").trim().toUpperCase(),
  };
  if (a.line2?.trim()) propre.line2 = a.line2.trim();
  if (a.state?.trim()) propre.state = a.state.trim();
  return propre;
}
