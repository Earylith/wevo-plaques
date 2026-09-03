import type { Article } from "../types";

/**
 * L'article de comparaison.
 *
 * Il nomme des concurrents, ce qui impose deux règles que le texte tient de
 * bout en bout : aucun tarif tiers n'est cité — ils changent et une erreur
 * se retourne contre nous —, et la comparaison porte sur des critères
 * vérifiables par le lecteur lui-même. La section « où Guidz n'est pas le
 * bon choix » n'est pas une coquetterie : sans elle, le reste de l'article
 * ne se croit pas.
 */
export const comparatifConcurrents: Article = {
  slug: "comparatif-livret-accueil-numerique",
  titre: "Quelle solution de livret d’accueil choisir ? Le comparatif honnête",
  titreSeo:
    "Comparatif des solutions de livret d’accueil numérique : lequel choisir ?",
  description:
    "Applications dédiées, modules de PMS, tablettes, PDF Canva, Guidz : les cinq familles de solutions comparées sur des critères vérifiables — et ce que chacune coûte vraiment.",
  chapo:
    "Il existe cinq façons de faire un livret d’accueil, et elles ne se disputent pas le même problème. Certaines créent une belle page mais ne la mettent jamais entre les mains du voyageur. D’autres font l’inverse. Voici où chacune tient, où chacune casse, et à quel endroit nous nous plaçons — y compris les cas où nous ne sommes pas le meilleur choix.",
  categorie: "Comparatif",
  motsCles: [
    "comparatif livret d'accueil numérique",
    "alternative Touch Stay",
    "alternative Hostfully",
    "meilleur livret d'accueil location",
    "logiciel livret accueil airbnb",
    "guide voyageur numérique comparatif",
  ],
  datePublication: "2026-02-11",
  dateMaj: "2026-08-26",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 13,
  accent: "#2B5F75",
  accentPale: "#E4EEF3",
  accentSombre: "#1A3F52",
  motif: "grille",
  icone: "balance",
  vedette: true,
  aRetenir: [
    "La vraie ligne de partage n’est pas la richesse de l’éditeur, mais la présence de l’information dans le logement.",
    "Un module de livret inclus dans un logiciel de gestion coûte peu — tant que vous restez sur ce logiciel.",
    "Les tablettes en chambre résolvent l’accessibilité, au prix d’un parc matériel à charger, mettre à jour et remplacer.",
    "Guidz n’est pas un logiciel de gestion locative : si vous cherchez un channel manager, ce n’est pas nous.",
  ],
  blocs: [
    {
      type: "h2",
      id: "familles",
      texte: "Les cinq familles de solutions",
    },
    {
      type: "p",
      texte:
        "Avant de comparer des noms, il faut comparer des natures. Un PDF fait par vos soins et une plateforme d’hospitality ne jouent pas au même jeu, et les opposer directement n’a pas de sens. Cinq familles se partagent le marché.",
    },
    {
      type: "liste",
      ordonnee: true,
      items: [
        "**Le fait-maison** : classeur imprimé, PDF composé sur Canva, page Notion ou Google Docs partagée par lien.",
        "**Les applications dédiées au livret d’accueil** : des outils comme Touch Stay, Hostfully ou Vousy, spécialisés dans le guide voyageur en ligne.",
        "**Les modules inclus dans un logiciel de gestion locative** (PMS) : Smoobu, Superhote, Lodgify, Beds24 proposent souvent un guide voyageur en complément du planning et du channel manager.",
        "**Les tablettes en chambre** : un écran posé dans le logement, avec une application maison — l’approche héritée de l’hôtellerie.",
        "**Le support gravé relié à une page web**, notre approche : un objet fixe dans le logement, un QR code, une page modifiable derrière.",
      ],
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Sur les tarifs des autres",
      texte:
        "Cet article ne cite aucun prix de concurrent. Ils évoluent, varient selon les paliers et les pays, et un chiffre faux ici deviendrait un argument malhonnête. Les critères comparés ci-dessous sont en revanche vérifiables en dix minutes sur les sites concernés.",
    },

    { type: "h2", id: "tableau", texte: "Le comparatif, en un tableau" },
    {
      type: "p",
      texte:
        "Sept critères suffisent à départager les cinq familles. Ce sont ceux qui, dans la vraie vie d’une saison, finissent par décider si le livret est lu ou pas.",
    },
    {
      type: "tableau",
      legende:
        "Les cinq familles de solutions comparées sur les critères qui décident de l’usage réel",
      colonnes: [
        "Critère",
        "Fait-maison (PDF, Notion)",
        "Application dédiée",
        "Module de PMS",
        "Tablette en chambre",
        "Guidz",
      ],
      colonneMiseEnAvant: 5,
      lignes: [
        [
          "Accessible depuis le logement, sans lien retrouvé",
          "Non",
          "Selon le support ajouté",
          "Non",
          "Oui",
          "Oui, plaque gravée",
        ],
        [
          "Mise à jour instantanée",
          "Non (PDF) / Oui (Notion)",
          "Oui",
          "Oui",
          "Oui",
          "Oui",
        ],
        [
          "Rien à installer côté voyageur",
          "Oui",
          "Oui",
          "Oui",
          "Sans objet",
          "Oui",
        ],
        [
          "Traduction automatique",
          "Non",
          "Souvent",
          "Variable",
          "Souvent",
          "Oui (Confort)",
        ],
        [
          "Indépendant de votre logiciel de réservation",
          "Oui",
          "Oui",
          "Non",
          "Oui",
          "Oui",
        ],
        [
          "Matériel à entretenir",
          "Non",
          "Non",
          "Non",
          "Oui (charge, vol, casse)",
          "Non, le bois ne tombe pas en panne",
        ],
        [
          "Coût récurrent",
          "Nul",
          "Abonnement",
          "Inclus dans l’abonnement du PMS",
          "Matériel + abonnement",
          "1,99 €/mois ou 19 €/an, ou aucun en Essentiel",
        ],
      ],
    },

    { type: "h2", id: "fait-maison", texte: "Le fait-maison : gratuit, jusqu’au premier changement" },
    {
      type: "p",
      texte:
        "Un PDF composé sur Canva peut être superbe. Une page Notion peut être bien structurée. Ces solutions ont un mérite indiscutable : elles ne coûtent rien et vous en gardez la maîtrise totale.",
    },
    {
      type: "p",
      texte:
        "Elles échouent sur deux points, toujours les mêmes. **La distribution** d’abord : un lien envoyé dans une conversation est mort le lendemain, enseveli sous les messages suivants — et jamais vu par les trois autres personnes du groupe. **La péremption** ensuite, pour le PDF : chaque correction impose un nouvel envoi, et les anciennes versions continuent de circuler.",
    },
    {
      type: "p",
      texte:
        "Notion s’en sort mieux sur la mise à jour, moins bien sur l’usage : ce n’est pas une interface pensée pour un voyageur pressé sur un téléphone, et l’adresse partagée n’inspire pas la même confiance qu’une page dédiée à votre logement. C’est un très bon brouillon de livret. Rarement un bon livret.",
    },

    {
      type: "h2",
      id: "applications",
      texte: "Les applications dédiées : puissantes, à condition d’être ouvertes",
    },
    {
      type: "p",
      texte:
        "Les plateformes spécialisées — **Touch Stay**, **Hostfully**, **Vousy** et quelques autres — font très bien ce pour quoi elles sont faites : des guides riches, multilingues, structurés, avec des modèles réutilisables d’un logement à l’autre. Si vous cherchez la profondeur fonctionnelle maximale sur le contenu, c’est cette famille qu’il faut regarder.",
    },
    {
      type: "p",
      texte:
        "Leur angle mort est physique. Ces outils produisent un lien ; ce qui met ce lien devant les yeux du voyageur reste à votre charge. Beaucoup d’hôtes finissent par imprimer un QR code sur une feuille A4 scotchée au frigo — ce qui règle le problème, mais annule d’un coup le soin apporté au reste de l’accueil. La question à poser à ces solutions n’est pas « que sait faire l’éditeur ? », mais « **par quel objet mon voyageur y arrive-t-il ?** »",
    },
    {
      type: "citation",
      texte:
        "Un livret extraordinaire que personne n’ouvre vaut moins qu’un livret correct qu’on trouve en trois secondes.",
    },

    { type: "h2", id: "pms", texte: "Le module de PMS : pratique, tant que vous y restez" },
    {
      type: "p",
      texte:
        "**Smoobu**, **Superhote**, **Lodgify**, **Beds24** : les logiciels de gestion locative embarquent souvent un guide voyageur. L’argument est solide — c’est déjà payé, c’est branché sur vos réservations, l’envoi peut s’automatiser après chaque réservation.",
    },
    {
      type: "p",
      texte:
        "Deux réserves. La première est la **dépendance** : votre livret vit dans un outil que vous avez choisi pour son planning et son channel manager. Le jour où vous changez de logiciel — ce qui arrive plus souvent qu’on ne le croit —, le livret ne suit pas, et le contenu est à ressaisir. La seconde tient au niveau de soin : le guide est rarement le cœur du produit, et cela se voit. Ce sont des modules honnêtes, rarement remarquables.",
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Les deux ne s’excluent pas",
      texte:
        "Rien n’empêche de garder votre PMS pour la réservation et d’installer un livret dédié dans le logement. Notre page ne remplace ni votre planning ni votre channel manager : elle occupe l’espace que ces outils ne couvrent pas, celui de l’intérieur du logement.",
    },

    { type: "h2", id: "tablettes", texte: "La tablette en chambre : le bon geste, le mauvais objet" },
    {
      type: "p",
      texte:
        "La tablette posée sur la table basse résout élégamment le problème de la distribution : l’information est là, allumée, dans le logement. C’est la solution la plus proche de l’hôtellerie, et sur ce point précis, elle a raison.",
    },
    {
      type: "p",
      texte:
        "Le coût réel apparaît ensuite. Il faut la charger, la mettre à jour, la nettoyer, la ressortir du tiroir où le voyageur précédent l’a rangée, la remplacer quand elle tombe, gérer sa disparition. Multipliez par le nombre de logements et vous avez créé un parc informatique. Ajoutez-y le fait qu’un écran générique dans un mas provençal ou un chalet vieillit très mal esthétiquement — et l’essentiel du sujet, en location courte durée, c’est justement l’impression laissée.",
    },
    {
      type: "chiffres",
      items: [
        { valeur: "0 W", libelle: "consommation d’une plaque gravée" },
        { valeur: "0", libelle: "mise à jour logicielle à faire dans le logement" },
        { valeur: "1", libelle: "objet, qui ne se range pas dans un tiroir" },
      ],
    },

    { type: "h2", id: "guidz", texte: "Où nous nous plaçons — et pourquoi" },
    {
      type: "p",
      texte:
        "Notre parti pris tient en une phrase : **le contenu doit vivre en ligne, l’accès doit vivre dans le logement**. D’un côté une page web dédiée à votre logement, modifiable à tout moment. De l’autre une plaque en bois gravée au laser, fabriquée en France, qui porte le QR code et reste là, à sa place, tout le séjour.",
    },
    {
      type: "liste",
      items: [
        "**Le QR code ne change jamais**, même quand vous modifiez tout le contenu de la page. La plaque n’est jamais à refaire.",
        "**Aucune application** à télécharger : le voyageur scanne, la page s’ouvre dans son navigateur.",
        "**Indépendant de votre logiciel de réservation** : Airbnb, Booking, réservation directe ou les trois à la fois, cela ne nous regarde pas.",
        "**Un objet qu’on assume de laisser en évidence** : c’est du bois gravé, pas une affiche scotchée.",
        "**Une page qui se traduit** dans la langue du visiteur, en formule Confort.",
      ],
    },
    {
      type: "p",
      texte:
        "Sur le tarif, nous sommes volontairement lisibles : [l’Essentiel à 49 €, en paiement unique et sans abonnement](/#offres) ; [le Confort à 69 € puis 1,99 €/mois ou 19 €/an](/#offres), qui ouvre les modifications illimitées, les photos, les bonnes adresses et la traduction. Les deux formules sont détaillées, ligne à ligne, dans le comparatif de la page d’accueil.",
    },
    {
      type: "cta",
      titre: "Jugez sur pièces, pas sur promesse",
      texte:
        "Nos livrets de démonstration sont de vraies pages publiées. Comparez-les à ce que produisent les autres solutions : c’est le test le plus rapide et le plus honnête.",
      href: "/livrets-demo",
      libelle: "Voir les livrets de démonstration",
      hrefSecondaire: "/#offres",
      libelleSecondaire: "Voir les tarifs",
    },

    { type: "h2", id: "pas-pour-vous", texte: "Quand Guidz n’est pas le bon choix" },
    {
      type: "p",
      texte:
        "Une comparaison qui conclut à sa propre supériorité sur tous les critères ne vaut rien. Voici les cas où il faut aller voir ailleurs, et ils sont réels.",
    },
    {
      type: "liste",
      items: [
        "**Vous cherchez un logiciel de gestion locative.** Nous ne faisons ni planning, ni synchronisation de calendriers, ni channel manager, ni encaissement des séjours. Regardez du côté des PMS cités plus haut.",
        "**Vous ne pouvez rien fixer dans le logement** — logement partagé, copropriété très stricte, chambre chez l’habitant sans mur disponible. Une part de notre intérêt disparaît avec le support.",
        "**Vous voulez un guide de cent pages avec vidéos intégrées et parcours conditionnels.** Les plateformes spécialisées vont plus loin que nous sur la profondeur éditoriale pure.",
        "**Vous gérez un hôtel avec room service et réservation d’activités.** C’est un autre métier : nous le traitons en [offre sur mesure](/devis?offre=signature), pas avec la formule standard.",
      ],
    },
    {
      type: "p",
      texte:
        "Dans tous les autres cas — un à cinquante logements en location courte durée, un accueil qu’on veut soigné, des informations qui bougent d’une saison à l’autre — nous pensons que le couple objet + page est le meilleur rapport entre ce que ça coûte et ce que ça évite. Si vous gérez un parc, les [conditions multi-biens](/devis?offre=multibien) et la méthode d’industrialisation sont détaillées dans notre [guide pour conciergeries](/blog/conciergerie-accueil-plusieurs-logements#socle).",
    },
  ],
  faq: [
    {
      question: "Quelle est la meilleure solution de livret d’accueil numérique ?",
      reponse:
        "Il n’y en a pas une seule : cela dépend de ce qui vous manque. Si votre problème est la richesse du contenu, les plateformes spécialisées comme Touch Stay ou Hostfully vont loin. Si votre problème est que le livret n’est jamais consulté, c’est la distribution qu’il faut corriger — donc un support fixe dans le logement avec un QR code.",
    },
    {
      question: "Existe-t-il une alternative française à Touch Stay ou Hostfully ?",
      reponse:
        "Oui. Plusieurs solutions françaises existent, dont Vousy côté application pure et Guidz côté support gravé relié à une page web. La différence principale avec les plateformes anglo-saxonnes tient moins aux fonctionnalités qu’à la manière dont le voyageur accède au livret une fois sur place.",
    },
    {
      question: "Le livret inclus dans mon PMS suffit-il ?",
      reponse:
        "Il suffit si vos voyageurs l’ouvrent. Le point à vérifier est double : la qualité de lecture sur téléphone, et surtout la portabilité — un livret hébergé dans un logiciel de gestion ne vous suit pas si vous changez de logiciel.",
    },
    {
      question: "Une tablette en chambre est-elle une meilleure idée ?",
      reponse:
        "Elle règle la question de l’accessibilité, mais crée un parc matériel à charger, mettre à jour et remplacer. Sur un ou deux logements haut de gamme, elle se défend. Au-delà, le coût d’exploitation dépasse largement celui d’un support passif avec QR code.",
    },
    {
      question: "Faut-il un abonnement pour avoir un livret d’accueil Guidz ?",
      reponse:
        "Non. La formule Essentiel est un paiement unique de 49 €, sans abonnement, avec des modifications à la demande. L’abonnement concerne la formule Confort, à 69 € puis 1,99 €/mois ou 19 €/an, et c’est lui qui donne accès aux modifications illimitées en autonomie.",
    },
  ],
  connexes: [
    "livret-accueil-numerique-location-saisonniere",
    "conciergerie-accueil-plusieurs-logements",
    "qr-code-location-saisonniere",
  ],
};
