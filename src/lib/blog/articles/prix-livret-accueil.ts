import type { Article } from "../types";

/**
 * L'article de prix.
 *
 * C'est celui qui convertit le mieux et celui où la tentation de tricher
 * est la plus forte. Deux garde-fous : les 5 € par session de modification
 * de l'Essentiel apparaissent dans le tableau et non en note de bas de
 * page, et aucun tarif de concurrent n'est inventé — le lecteur remplit
 * les hypothèses lui-même. Un comparatif de prix qui cache une ligne se
 * retourne toujours contre celui qui l'a écrit.
 */
export const prixLivretAccueil: Article = {
  slug: "prix-livret-accueil-numerique",
  titre: "Combien coûte un livret d’accueil numérique ? Le calcul complet",
  titreSeo:
    "Prix d’un livret d’accueil numérique : le vrai calcul sur trois ans",
  description:
    "Support, hébergement, droit de modifier, temps passé : les quatre postes de coût d’un livret d’accueil, le calcul sur trois ans, et à partir de quand il est amorti.",
  chapo:
    "La question « combien ça coûte » a deux réponses très différentes selon qu’on regarde le prix affiché ou le montant réellement engagé. Un abonnement à 5 € par mois et par logement paraît indolore ; sur une conciergerie de vingt biens et trois ans, il représente 3 600 €. Voici la méthode pour comparer ce qui est comparable, avec vos chiffres.",
  categorie: "Budget",
  motsCles: [
    "prix livret d'accueil numérique",
    "combien coûte un livret d'accueil",
    "livret accueil sans abonnement",
    "tarif livret accueil airbnb",
    "coût accueil location saisonnière",
  ],
  datePublication: "2026-09-03",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 11,
  accent: "#5A7A4E",
  accentPale: "#EBF0E6",
  accentSombre: "#3F5836",
  motif: "eventail",
  icone: "prix",
  vedette: true,
  aRetenir: [
    "Quatre postes composent le coût : le support, l’hébergement de la page, le droit de la modifier, et votre temps.",
    "Un abonnement ne se compare pas à un prix mais à une durée : multipliez toujours par trois ans et par votre nombre de logements.",
    "Le poste le plus cher n’apparaît sur aucune facture — c’est le temps passé à répondre aux mêmes questions.",
    "Un livret est amorti dès qu’il évite un message par séjour ; en pratique, en une saison.",
  ],
  blocs: [
    { type: "h2", id: "postes", texte: "Les quatre postes de coût, dont un invisible" },
    {
      type: "p",
      texte:
        "Un livret d’accueil n’a pas un prix, il en a quatre. Les comparer séparément est le seul moyen de ne pas se faire surprendre au bout de six mois.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "Le support physique",
          texte:
            "Ce qui met le livret entre les mains du voyageur dans le logement. Presque toutes les solutions logicielles l’excluent de leur tarif : c’est à vous d’imprimer, de plastifier ou de faire graver. Le choix du matériau et son coût sont détaillés dans [notre article sur les plaques d’accueil](/blog/plaque-accueil-qr-code-materiaux#materiaux).",
        },
        {
          titre: "L’hébergement de la page",
          texte:
            "Une page en ligne consomme peu, mais elle consomme : serveur, nom de domaine, sauvegardes, traductions. C’est ce que couvre un abonnement raisonnable — et ce que ne couvre pas un abonnement à dix euros par mois et par logement.",
        },
        {
          titre: "Le droit de modifier",
          texte:
            "C’est la ligne qui varie le plus d’une solution à l’autre. Certaines l’incluent, d’autres la facturent, d’autres encore la conditionnent à un palier supérieur. Posez la question avant de signer, pas au premier changement de box internet.",
        },
        {
          titre: "Votre temps",
          texte:
            "Le poste le plus lourd, et le seul qui n’apparaît sur aucune facture. Cinq minutes par message, quatre messages évitables par séjour, quarante séjours par an : plus de treize heures annuelles. C’est contre ce chiffre-là que tout le reste se compare.",
        },
      ],
    },
    {
      type: "chiffres",
      items: [
        { valeur: "13 h", libelle: "par an à répondre aux mêmes questions" },
        { valeur: "4", libelle: "messages évitables par séjour, en moyenne observée" },
        { valeur: "×20", libelle: "l’effet du parc sur un abonnement par logement" },
      ],
    },

    { type: "h2", id: "trois-ans", texte: "Le calcul sur trois ans, à faire avec vos chiffres" },
    {
      type: "p",
      texte:
        "L’essentiel du marché fonctionne par abonnement mensuel, souvent par logement. Un abonnement ne se compare pas à un prix : il se compare à une durée. Le tableau ci-dessous pose trois hypothèses — remplacez-les par le tarif réel de la solution que vous regardez.",
    },
    {
      type: "tableau",
      legende:
        "Chaque case donne le TOTAL DÉPENSÉ depuis le début, pour UN logement — et non un prix mensuel. Un abonnement à 5 € par mois coûte ainsi 180 € au bout de trois ans, un achat unique reste à son prix. Les trois premières colonnes sont des hypothèses de marché, pas les tarifs d’une solution précise.",
      colonnes: [
        "Total cumulé après",
        "Abonnement 3 €/mois",
        "Abonnement 5 €/mois",
        "Abonnement 10 €/mois",
        "Guidz Essentiel",
        "Guidz Confort",
      ],
      colonneMiseEnAvant: 4,
      lignes: [
        ["Mise en service", "0 €", "0 €", "0 €", "49 €", "69 €"],
        ["1re année", "36 €", "60 €", "120 €", "49 €", "88 €"],
        ["3 ans", "108 €", "180 €", "360 €", "49 €", "126 €"],
        ["5 ans", "180 €", "300 €", "600 €", "49 €", "164 €"],
        ["Support physique inclus", "Non", "Non", "Non", "Oui", "Oui"],
        [
          "Modifications",
          "Selon l’offre",
          "Selon l’offre",
          "Selon l’offre",
          "5 € la session",
          "Illimitées",
        ],
      ],
    },
    {
      type: "encadre",
      ton: "info",
      titre: "La ligne qu’il faut lire deux fois",
      texte:
        "En formule Essentiel, les modifications se font à la demande, au tarif de 5 € la session — et une session permet de reprendre la page entière, pas une ligne. C’est un vrai coût, et nous préférons l’écrire ici plutôt que de le laisser découvrir. Si vous prévoyez de corriger souvent, le Confort revient moins cher dès la troisième modification annuelle.",
    },
    {
      type: "p",
      texte:
        "Le calcul complet, avec les cinq familles de solutions du marché, est dans notre [comparatif des livrets d’accueil](/blog/comparatif-livret-accueil-numerique#cout).",
    },

    { type: "h2", id: "parc", texte: "Multipliez par votre parc : c’est là que ça se joue" },
    {
      type: "p",
      texte:
        "Sur un logement, l’écart entre les solutions se compte en dizaines d’euros. Sur un parc, il change de nature — et c’est le calcul que les conciergeries font trop tard.",
    },
    {
      type: "tableau",
      legende:
        "Total dépensé SUR TROIS ANS, selon la taille du parc. À 5 € par mois et par logement, un seul bien coûte 180 € sur la période — cinq biens, cinq fois plus.",
      colonnes: [
        "Nombre de logements",
        "Abonnement 5 €/mois — sur 3 ans",
        "Guidz Essentiel — une fois",
        "Écart sur 3 ans",
      ],
      colonneMiseEnAvant: 2,
      lignes: [
        ["1 logement", "180 €", "49 €", "131 €"],
        ["5 logements", "900 €", "245 €", "655 €"],
        ["10 logements", "1 800 €", "490 €", "1 310 €"],
        ["20 logements", "3 600 €", "980 €", "2 620 €"],
        ["50 logements", "9 000 €", "2 450 €", "6 550 €"],
      ],
    },
    {
      type: "p",
      texte:
        "Ces montants sont donnés au tarif public, sans remise. Au-delà de quelques biens, nos [conditions multi-biens](/devis?offre=multibien) sont dégressives, et s’accompagnent de la duplication d’un logement à l’autre et de la mise à jour groupée — deux fonctions qui font gagner davantage de temps que d’argent. La méthode d’organisation correspondante est dans notre [guide pour conciergeries](/blog/conciergerie-accueil-plusieurs-logements#socle).",
    },

    { type: "h2", id: "gratuit", texte: "Et le gratuit, alors ?" },
    {
      type: "p",
      texte:
        "Un PDF composé sur Canva ou une page Notion coûtent zéro euro. C’est vrai, et il serait malhonnête de prétendre le contraire. La question n’est donc pas leur prix, mais ce qu’ils laissent à votre charge.",
    },
    {
      type: "opposition",
      titreOui: "Ce que le gratuit vous donne",
      oui: [
        "Aucune dépense, aucune dépendance",
        "Une maîtrise totale du contenu",
        "Un excellent brouillon de livret",
      ],
      titreNon: "Ce qu’il vous laisse à faire",
      non: [
        "Fabriquer et poser un support vous-même",
        "Renvoyer le fichier à chaque correction",
        "Traduire chaque version à la main",
        "Répondre aux messages que le lien n’a pas évités",
      ],
    },
    {
      type: "p",
      texte:
        "Autrement dit : le gratuit ne coûte rien en euros et se paie en heures. Si votre temps vaut vingt euros de l’heure et que le livret vous en fait gagner treize par an, l’arbitrage se fait tout seul — et il se fait dès la première saison.",
    },

    { type: "h2", id: "amortissement", texte: "À partir de quand c’est rentable" },
    {
      type: "p",
      texte:
        "Le seuil est plus bas qu’on ne l’imagine, parce qu’il ne se calcule pas en revenus supplémentaires mais en charge évitée.",
    },
    {
      type: "liste",
      items: [
        "**Un message évité par séjour** : à cinq minutes le message et quarante séjours par an, vous récupérez plus de trois heures. La formule Essentiel est amortie avant la fin de la première saison.",
        "**Un déplacement évité** : un aller-retour pour rebrancher une box ou montrer un local à vélos coûte une heure, un trajet, et souvent une soirée.",
        "**Une étoile préservée** : c’est le gain le plus difficile à chiffrer et le plus rentable, parce qu’il joue sur la visibilité de votre annonce — donc sur le taux d’occupation. Le mécanisme est détaillé dans notre article sur [les dix premières minutes d’un séjour](/blog/avis-5-etoiles-accueil-voyageur#dix-minutes).",
      ],
    },
    {
      type: "citation",
      texte:
        "Un livret d’accueil ne se compare pas à zéro. Il se compare au temps que vous passez déjà à faire, à la main, ce qu’il ferait tout seul.",
    },

    {
      type: "cta",
      titre: "Deux formules, aucun piège",
      texte:
        "49 € en paiement unique, plaque gravée comprise. Ou 69 € puis 1,99 €/mois pour modifier votre page autant que vous voulez. Les deux sont détaillées ligne à ligne.",
      href: "/#offres",
      libelle: "Voir les formules et les tarifs",
      hrefSecondaire: "/livrets-demo",
      libelleSecondaire: "Voir un livret terminé",
    },

    { type: "h2", id: "questions-prix", texte: "Les trois questions à poser avant de payer" },
    {
      type: "liste",
      ordonnee: true,
      items: [
        "**« Que se passe-t-il si j’arrête de payer ? »** Une page qui s’éteint transforme vos supports imprimés en objets morts. En formule Essentiel, la question ne se pose pas : il n’y a rien à payer ensuite.",
        "**« Le support physique est-il compris ? »** Presque jamais, chez les solutions logicielles. Ajoutez son coût réel avant de comparer, sinon vous comparez une page à un accueil complet.",
        "**« Combien coûte une modification ? »** C’est la ligne la plus souvent découverte après coup. Demandez le tarif, et demandez ce que recouvre une « modification » : une ligne, une rubrique, ou la page entière.",
      ],
    },
    {
      type: "p",
      texte:
        "Ces questions valent pour nous comme pour les autres — c’est d’ailleurs pour cela que les réponses figurent en toutes lettres dans notre [comparatif](/blog/comparatif-livret-accueil-numerique#questions).",
    },
  ],
  faq: [
    {
      question: "Combien coûte un livret d’accueil numérique ?",
      reponse:
        "Le marché fonctionne majoritairement par abonnement, souvent entre 3 et 10 € par mois et par logement, support physique non compris. Chez Guidz, la formule Essentiel est un paiement unique de 49 € plaque gravée comprise, et la formule Confort revient à 69 € puis 1,99 €/mois ou 19 €/an avec les modifications illimitées.",
    },
    {
      question: "Existe-t-il un livret d’accueil sans abonnement ?",
      reponse:
        "Oui, mais c’est rare. La formule Essentiel de Guidz est un paiement unique de 49 € sans reconduction : la page reste en ligne et les modifications se font à la demande, au tarif de 5 € la session.",
    },
    {
      question: "Un livret d’accueil gratuit suffit-il ?",
      reponse:
        "Un PDF ou une page Notion ne coûtent rien et font un excellent brouillon. Ils laissent en revanche à votre charge le support physique, le renvoi du fichier à chaque correction, la traduction et les messages que le lien n’aura pas évités. Le coût se déplace des euros vers les heures.",
    },
    {
      question: "À partir de combien de séjours un livret est-il rentabilisé ?",
      reponse:
        "En comptant cinq minutes par message et un seul message évité par séjour, une formule à 49 € est amortie en une quinzaine de séjours si votre temps vaut vingt euros de l’heure — soit moins d’une saison pour la plupart des logements.",
    },
    {
      question: "Les tarifs baissent-ils pour plusieurs logements ?",
      reponse:
        "Oui. Au-delà de quelques biens, les conditions multi-biens sont dégressives et s’accompagnent de la duplication d’un logement à l’autre et de la mise à jour groupée. Le chiffrage se fait sur devis, en fonction de la taille du parc.",
    },
  ],
  connexes: [
    "comparatif-livret-accueil-numerique",
    "plaque-accueil-qr-code-materiaux",
    "conciergerie-accueil-plusieurs-logements",
  ],
};
