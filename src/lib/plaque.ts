import { PlaqueConfig } from "@/lib/types/accommodation";

/**
 * Ce qui définit une plaque, indépendamment de l'interface.
 *
 * Ces valeurs vivaient dans un composant `"use client"`. Le webhook Stripe,
 * qui en a besoin pour composer une commande, ne pouvait donc pas les lire —
 * et il improvisait. C'est ainsi qu'une plaque a fini par partir sans phrase
 * du tout, et que la commande n'a jamais pu être écrite.
 */

/** La phrase gravée par défaut, quand l'hôte n'en a pas choisi d'autre. */
export const TAGLINE_PAR_DEFAUT = "Profitez pleinement de votre séjour !";

/** Longueur maximale de la phrase gravée. */
export const TAGLINE_MAX = 40;

/** L'essence retenue quand rien n'est précisé. */
export const ESSENCE_PAR_DEFAUT: PlaqueConfig["wood"] = "noyer";

/**
 * Fabrique une configuration de plaque COMPLÈTE à partir de sources partielles.
 *
 * Chaque champ reçoit une valeur réelle : jamais `undefined`. Firestore refuse
 * `undefined`, et un seul champ manquant suffisait à faire échouer toute la
 * création de commande — après que le livret avait été publié. Le client se
 * retrouvait alors avec sa page en ligne, mais sans plaque en production, et
 * rien dans l'administration pour le signaler.
 *
 * Les sources sont examinées dans l'ordre où elles font autorité : ce que le
 * client a validé au moment de payer d'abord, l'état actuel du livret ensuite,
 * et le défaut en dernier recours. Une plaque doit toujours pouvoir être
 * gravée — mieux vaut la phrase par défaut qu'aucune commande.
 */
export function configPlaqueComplete(
  ...sources: (Partial<PlaqueConfig> | null | undefined)[]
): PlaqueConfig {
  const premier = <K extends keyof PlaqueConfig>(champ: K): PlaqueConfig[K] | undefined => {
    for (const source of sources) {
      const valeur = source?.[champ];
      if (typeof valeur === "string" ? valeur.trim() !== "" : valeur !== undefined) {
        return valeur;
      }
    }
    return undefined;
  };

  return {
    wood: premier("wood") || ESSENCE_PAR_DEFAUT,
    engravedTagline: premier("engravedTagline") || TAGLINE_PAR_DEFAUT,
  };
}

/**
 * Retire récursivement les `undefined` d'un objet destiné à Firestore.
 *
 * Filet de sécurité, et non remplacement des valeurs par défaut ci-dessus :
 * un champ oublié doit être visiblement absent plutôt que faire échouer une
 * écriture qui suit un encaissement. Perdre un champ facultatif est ennuyeux ;
 * perdre une commande payée ne l'est pas au même titre.
 */
export function sansUndefined<T>(valeur: T): T {
  if (Array.isArray(valeur)) {
    return valeur.map((v) => sansUndefined(v)) as unknown as T;
  }
  if (valeur && typeof valeur === "object") {
    const sortie: Record<string, unknown> = {};
    for (const [cle, v] of Object.entries(valeur as Record<string, unknown>)) {
      if (v !== undefined) sortie[cle] = sansUndefined(v);
    }
    return sortie as T;
  }
  return valeur;
}
