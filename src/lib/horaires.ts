/**
 * Les horaires d'arrivée et de départ, et leur valeur par défaut.
 *
 * Il y en avait TROIS, différentes, pour le même champ : l'éditeur affichait
 * « 14h00 » quand rien n'était saisi, un gabarit affichait « — », un autre
 * « 15:00 » — dans un format encore différent. L'hôte croyait donc son
 * horaire renseigné, et le voyageur lisait une barre.
 *
 * Une seule source, désormais, partagée par l'éditeur et les deux gabarits.
 * L'heure d'arrivée est la première question qu'un voyageur se pose : mieux
 * vaut une convention affichée qu'un tiret.
 */

export const HEURE_ARRIVEE_PAR_DEFAUT = "14h00";
export const HEURE_DEPART_PAR_DEFAUT = "11h00";

/** Une valeur saisie a-t-elle du contenu ? */
function renseignee(valeur?: string | null): boolean {
  return Boolean(valeur && valeur.trim());
}

/**
 * L'heure à afficher, saisie ou par défaut.
 *
 * Jamais vide : ce qui est montré à l'hôte dans l'éditeur est exactement ce
 * que verra son voyageur.
 */
export function heureArrivee(pratique?: { checkin?: string } | null): string {
  return renseignee(pratique?.checkin) ? pratique!.checkin!.trim() : HEURE_ARRIVEE_PAR_DEFAUT;
}

export function heureDepart(pratique?: { checkout?: string } | null): string {
  return renseignee(pratique?.checkout) ? pratique!.checkout!.trim() : HEURE_DEPART_PAR_DEFAUT;
}
