/**
 * Consentement aux traceurs, par finalité.
 *
 * Le RGPD ne se satisfait pas d'un « accepter / refuser » global : chaque
 * finalité se consent séparément, et refuser doit être aussi simple
 * qu'accepter. Un bandeau qui ne propose que le tout ou rien recueille un
 * consentement qui ne vaut rien.
 *
 * Ce module ne dépose RIEN par lui-même : il enregistre un choix et le fait
 * connaître. Ce sont les scripts de mesure qui l'écoutent, et ils ne se
 * chargent qu'après.
 */

export const FINALITES = {
  mesure: {
    titre: "Mesure d’audience",
    texte:
      "Comprendre combien de personnes visitent le site et quelles pages elles consultent, pour améliorer ce qui sert et retirer ce qui ne sert pas.",
    exemple: "Google Analytics",
  },
  publicite: {
    titre: "Publicité",
    texte:
      "Mesurer si nos annonces amènent réellement des clients, et éviter de les montrer à ceux qui ont déjà commandé.",
    exemple: "Pixel Meta (Facebook, Instagram)",
  },
} as const;

export type Finalite = keyof typeof FINALITES;

export interface Consentement {
  mesure: boolean;
  publicite: boolean;
  /** Date du choix : un consentement se redemande au bout de treize mois. */
  date: number;
}

const CLE = "guidz-consentement";

/**
 * Durée de validité, telle que la CNIL la recommande.
 *
 * Passé ce délai, la question se repose. Un consentement de 2019 ne dit rien
 * de ce que la personne accepterait aujourd'hui.
 */
const VALIDITE_MS = 13 * 30 * 24 * 60 * 60 * 1000;

/** Le choix enregistré, ou `null` s'il n'existe pas ou n'est plus valide. */
export function lireConsentement(): Consentement | null {
  if (typeof window === "undefined") return null;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const c = JSON.parse(brut) as Consentement;
    if (typeof c?.date !== "number" || Date.now() - c.date > VALIDITE_MS) return null;
    return {
      mesure: Boolean(c.mesure),
      publicite: Boolean(c.publicite),
      date: c.date,
    };
  } catch {
    /*
     * Navigation privée, stockage bloqué, ou valeur corrompue : on redemande.
     * Redemander est toujours préférable à déposer sans avoir demandé.
     */
    return null;
  }
}

/** Enregistre le choix et le fait connaître aux scripts qui l'attendent. */
export function ecrireConsentement(choix: { mesure: boolean; publicite: boolean }): Consentement {
  const consentement: Consentement = { ...choix, date: Date.now() };
  try {
    window.localStorage.setItem(CLE, JSON.stringify(consentement));
  } catch {
    // Le refus de stockage ne doit pas bloquer la navigation.
  }
  /*
   * Un événement plutôt qu'un rechargement : les scripts se chargent au
   * moment du consentement, et jamais avant. Sonder le stockage les aurait
   * obligés à être déjà présents — donc déjà chargés.
   */
  window.dispatchEvent(new CustomEvent("guidz-consentement", { detail: consentement }));
  return consentement;
}

/** Efface le choix, pour que la question se repose. */
export function effacerConsentement(): void {
  try {
    window.localStorage.removeItem(CLE);
  } catch {
    // Sans stockage, il n'y avait rien à effacer.
  }
}
