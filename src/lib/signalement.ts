/**
 * Motifs de signalement d'un livret.
 *
 * Dans un module ordinaire, et non dans le fichier d'actions : un fichier
 * « use server » ne peut exporter QUE des fonctions asynchrones. Y laisser
 * cet objet cassait la compilation de tout le paquet client — et avec elle
 * chaque action serveur appelée depuis le navigateur, y compris le changement
 * de formule, qui n'a pourtant rien à voir avec les signalements.
 */

export const MOTIFS_SIGNALEMENT = {
  contenu_haineux: "Propos haineux ou discriminatoires",
  contenu_sexuel: "Contenu sexuel ou choquant",
  arnaque: "Arnaque ou tentative de fraude",
  donnees_personnelles: "Données personnelles d’un tiers",
  autre: "Autre",
} as const;

export type MotifSignalement = keyof typeof MOTIFS_SIGNALEMENT;
