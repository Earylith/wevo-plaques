/**
 * Les questions fréquentes de la page d'accueil.
 *
 * Sorties du composant d'affichage pour une raison précise : elles sont
 * désormais lues deux fois — par la section visible, et par le balisage
 * `FAQPage` que Google peut afficher déplié sous le résultat de recherche.
 * Ce balisage doit reprendre MOT POUR MOT ce que la page montre ; deux
 * copies divergeraient, et une FAQ balisée qui ne correspond pas au contenu
 * visible est une infraction aux consignes, pas une optimisation.
 */

export interface QuestionAccueil {
  q: string;
  a: string;
}

export const FAQ_ACCUEIL: QuestionAccueil[] = [
  {
    q: "Suis-je obligé de prendre un abonnement ?",
    a: "Non. La formule Essentiel est disponible en paiement unique. La formule Confort inclut un abonnement qui donne accès à l'espace propriétaire et aux modifications illimitées.",
  },
  {
    q: "Que comprend le paiement initial ?",
    a: "Il comprend la création de votre Guidz, la mise en place du QR code et la création de la page digitale associée à votre logement.",
  },
  {
    q: "Que se passe-t-il si mon Wi‑Fi ou mes consignes changent ?",
    a: "Avec la formule Essentiel, les modifications sont possibles à la demande. Avec la formule Confort, vous pouvez modifier vos informations vous-même depuis votre espace propriétaire, sans limite.",
  },
  {
    q: "Le QR code change-t-il si je modifie les informations ?",
    a: "Non. Le QR code reste le même. Les informations changent sur la page associée, sans avoir besoin de refaire le support.",
  },
  {
    q: "Le locataire doit-il installer une application ?",
    a: "Non. Le locataire scanne simplement le QR code avec son téléphone et accède à la page Guidz depuis son navigateur.",
  },
  {
    q: "Le support est-il personnalisable ?",
    a: "Oui, selon la formule choisie. La formule Essentiel propose un Guidz standard, tandis que la formule Confort permet une personnalisation plus avancée.",
  },
  {
    q: "Puis-je équiper plusieurs logements ?",
    a: "Oui. La formule Multi-biens est pensée pour les propriétaires et conciergeries qui souhaitent équiper plusieurs logements avec une gestion centralisée.",
  },
];
