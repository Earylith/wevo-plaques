/**
 * Créneaux de rappel téléphonique.
 *
 * Dans un module ordinaire, et non dans le fichier d'actions : un fichier
 * « use server » ne peut exporter QUE des fonctions asynchrones. Y laisser
 * cet objet casse la compilation de tout le paquet client — et avec elle
 * chaque action serveur appelée depuis le navigateur, y compris celles qui
 * n'ont rien à voir avec les rappels. C'est déjà arrivé avec les motifs de
 * signalement ; on ne le refait pas.
 */

export const CRENEAUX = {
  matin: "Le matin (9h – 12h)",
  apresmidi: "L’après-midi (14h – 18h)",
  soir: "En soirée (18h – 20h)",
  peu_importe: "Peu importe",
} as const;

export type Creneau = keyof typeof CRENEAUX;

export interface DemandeRappel {
  nom: string;
  telephone: string;
  creneau: Creneau;
  message: string;
}
