import { OrderStatus } from "@/lib/types/accommodation";

/**
 * Ce qu'on ne peut pas lire dans la fiche d'un livret.
 *
 * L'usage réel et l'état de la plaque vivent dans deux autres collections.
 * Les rapatrier ici évite d'ouvrir trois écrans pour répondre à la seule
 * question qui compte vraiment : ce livret sert-il à quelqu'un, et son
 * client a-t-il reçu ce qu'il a payé ?
 *
 * Déclaré hors des actions serveur : un fichier « use server » ne peut
 * exporter que des fonctions asynchrones.
 */
export interface IndicateurLivret {
  /** Ouvertures cumulées depuis la mise en ligne. */
  vues: number;
  /** Part des ouvertures venues d'un scan de la plaque. */
  scansQr: number;
  /** Ouvertures des trente derniers jours — la seule qui dise « vivant ». */
  vues30j: number;
  derniereVue: number | null;
  /** Commande de plaque la plus récente, s'il y en a une. */
  commandeRef: string | null;
  commandeStatut: OrderStatus | null;
  /** Une adresse de livraison est-elle connue ? Sinon, rien ne peut partir. */
  adresseConnue: boolean;
}
