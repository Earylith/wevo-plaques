/**
 * Identifiant permanent gravé dans le QR code.
 *
 * Le QR d'une plaque est gravé une fois pour toutes dans le bois. Il ne peut
 * donc pas pointer vers une adresse dérivée du nom du logement : renommer
 * « La Villa des Pins » en « Villa des Pins » tuerait toutes les plaques déjà
 * produites.
 *
 * La plaque grave donc `/g/<identifiant>`, qui redirige vers le livret courant
 * quelle que soit son adresse lisible.
 */

/**
 * Alphabet sans caractères ambigus : ni O/0, ni I/l/1.
 *
 * Un client peut avoir à recopier le code à la main quand la caméra ne veut
 * pas lire le QR — autant qu'il ne se trompe pas.
 */
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const LENGTH = 6;

/**
 * Tire un identifiant. Avec 31^6 ≈ 887 millions de combinaisons, une
 * collision est improbable — et l'appelant vérifie malgré tout l'unicité
 * avant d'écrire.
 */
export function generatePermanentId(): string {
  let out = "";
  for (let i = 0; i < LENGTH; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Forme attendue d'un identifiant permanent. */
export function isPermanentId(value: string): boolean {
  return new RegExp(`^[${ALPHABET}]{${LENGTH}}$`).test(value);
}

/** URL absolue gravée sur la plaque. */
export function permanentUrl(origin: string, id: string): string {
  return `${origin.replace(/\/$/, "")}/g/${id}`;
}
