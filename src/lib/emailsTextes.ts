/**
 * Le texte des e-mails : types, variables et valeurs d'origine.
 *
 * Dans un module ordinaire, et non dans le fichier server-only : l'écran
 * d'administration a besoin de la liste des variables et des textes par
 * défaut, et il tourne dans le navigateur. Un import server-only y ferait
 * échouer la compilation du paquet client.
 */

export type CleMessage = "bienvenue" | "commande" | "expedition" | "devis";

export interface TexteMessage {
  sujet: string;
  titre: string;
  /** Un paragraphe par entrée, dans l'ordre. */
  paragraphes: string[];
  postScriptum: string;
}

export type TextesEmails = Record<CleMessage, TexteMessage>;

/**
 * Les valeurs que l'on peut appeler dans le texte, par message.
 *
 * Affichées dans l'administration : sans cette liste, on écrit `{nom}` en
 * espérant, et le client reçoit `{nom}` en toutes lettres.
 */
export const VARIABLES: Record<CleMessage, { cle: string; sens: string }[]> = {
  bienvenue: [
    { cle: "{prenom}", sens: "Le prénom de l’hôte, s’il est connu" },
    { cle: "{formule}", sens: "Confort ou Essentielle" },
  ],
  commande: [
    { cle: "{prenom}", sens: "Le prénom de l’hôte" },
    { cle: "{reference}", sens: "GUIDZ-1042" },
    { cle: "{logement}", sens: "Le nom du logement" },
    { cle: "{formule}", sens: "Confort ou Essentielle" },
    { cle: "{lien_page}", sens: "L’adresse publique du livret" },
  ],
  expedition: [
    { cle: "{prenom}", sens: "Le prénom de l’hôte" },
    { cle: "{reference}", sens: "GUIDZ-1042" },
    { cle: "{logement}", sens: "Le nom du logement" },
    { cle: "{transporteur}", sens: "Colissimo, Mondial Relay…" },
    { cle: "{suivi}", sens: "Le numéro de suivi" },
  ],
  devis: [
    { cle: "{prenom}", sens: "Le prénom du demandeur" },
    { cle: "{societe}", sens: "Sa société, si elle est renseignée" },
    { cle: "{offre}", sens: "Multi-biens ou Signature" },
    { cle: "{logements}", sens: "Le nombre de logements indiqué" },
  ],
};

export const TEXTES_PAR_DEFAUT: TextesEmails = {
  bienvenue: {
    sujet: "Votre espace Guidz est ouvert",
    titre: "Bienvenue, {prenom}",
    paragraphes: [
      "Votre compte est créé, et votre livret d’accueil vous attend.",
      "Composez-le à votre rythme : tout s’enregistre au fur et à mesure, vous pouvez fermer la page et reprendre demain sans rien perdre. Rien n’est visible de personne tant que vous ne l’avez pas décidé.",
      "Le plus simple est de commencer par le wifi et l’arrivée : ce sont les deux choses qu’un voyageur cherche en premier, et souvent les deux seules pour lesquelles il vous écrirait.",
    ],
    postScriptum:
      "Vous pouvez changer de formule librement tant que votre livret n’est pas publié. Une question ? Répondez à ce message — une vraie personne vous lira.",
  },
  commande: {
    sujet: "Votre commande {reference} est confirmée",
    titre: "C’est confirmé, merci {prenom}",
    paragraphes: [
      "Votre paiement est bien reçu. Votre livret est en ligne dès maintenant, et votre plaque part en fabrication.",
      "Vous pouvez déjà partager votre page avec vos voyageurs : {lien_page}. Elle fonctionne sans attendre la plaque, et son adresse ne changera plus.",
      "Vérifiez l’adresse de livraison ci-dessous — c’est celle à laquelle nous posterons la plaque. Si quelque chose ne va pas, répondez à ce message : nous corrigerons avant la gravure.",
    ],
    postScriptum:
      "Chaque plaque est gravée à la main, une par une : comptez quelques jours. Nous vous écrirons dès que la vôtre part, avec son numéro de suivi.",
  },
  expedition: {
    sujet: "Votre plaque est en route — {reference}",
    titre: "Votre plaque est partie",
    paragraphes: [
      "Bonjour {prenom}, votre plaque « {logement} » a quitté l’atelier.",
      "Elle voyage avec {transporteur}. Le détail est ci-dessous, et le bouton vous mène directement au suivi.",
      "À la réception, il n’y a rien à configurer : le QR code est déjà relié à votre livret. Une vis, un adhésif double-face, et c’est en place.",
    ],
    postScriptum:
      "Le QR continuera de fonctionner même si vous renommez votre logement ou modifiez votre page : il pointe vers une adresse permanente, gravée une fois pour toutes.",
  },
  devis: {
    sujet: "Votre demande de devis est bien reçue",
    titre: "Bien reçu, {prenom}",
    paragraphes: [
      "Merci pour votre demande. Elle nous est parvenue et nous la regardons.",
      "Nous revenons vers vous sous un jour ouvré avec une proposition chiffrée, adaptée au nombre de logements que vous nous avez indiqué. Pas de formulaire supplémentaire à remplir : une vraie réponse, écrite à la main.",
      "Si vous avez d’autres éléments à nous transmettre entre-temps — un lien vers vos annonces, une contrainte de délai — répondez simplement à ce message.",
    ],
    postScriptum:
      "Vous n’avez rien à faire d’ici là. Si vous n’avez aucune nouvelle sous 48 heures, écrivez-nous : c’est qu’un message se sera perdu en route.",
  },
};

