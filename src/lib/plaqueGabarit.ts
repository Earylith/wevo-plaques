/**
 * Le gabarit vectoriel de la plaque — un seul, nommé une seule fois.
 *
 * Son chemin était écrit en dur à TROIS endroits : la fabrication des
 * fichiers de gravure, la route de sondage du gabarit, et l'aperçu à l'écran.
 * Trois copies d'une même vérité, qui divergent le jour où l'on redessine la
 * plaque et où l'on n'en met à jour que deux — l'aperçu montrerait alors
 * autre chose que ce qui part au laser.
 *
 * Le nom est ici, et rien d'autre : le serveur en déduit le chemin disque, le
 * navigateur l'adresse publique.
 */

/** Nom du fichier, dans `public/images/plaques/`. */
export const GABARIT_FICHIER = "baseplaquesfinale.svg";

/** Adresse publique, pour l'aperçu rendu dans le navigateur. */
export const GABARIT_URL = `/images/plaques/${GABARIT_FICHIER}`;

/** Segments du chemin disque, à joindre avec `process.cwd()` côté serveur. */
export const GABARIT_SEGMENTS = ["public", "images", "plaques", GABARIT_FICHIER] as const;
