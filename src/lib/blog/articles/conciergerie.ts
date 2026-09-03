import type { Article } from "../types";

/**
 * L'article professionnel.
 *
 * Il vise les conciergeries et les propriétaires multi-biens, et sa sortie
 * naturelle n'est pas le paiement en ligne mais le devis : le tarif se
 * chiffre au parc, pas à l'unité.
 */
export const conciergerie: Article = {
  slug: "conciergerie-accueil-plusieurs-logements",
  titre: "Conciergerie : standardiser l’accueil sur dix, trente ou cent logements",
  titreSeo:
    "Conciergerie : standardiser l’accueil sur plusieurs logements",
  description:
    "Socle commun, fiches spécifiques, ouverture d’un nouveau lot, passations d’équipe : la méthode pour industrialiser l’accueil sans le rendre impersonnel.",
  chapo:
    "À un logement, l’accueil est une affaire de mémoire. À dix, c’est une affaire de méthode. À cinquante, c’est une affaire de système — et l’absence de système se paie en appels du samedi soir, en interventions inutiles et en avis moyens dont personne ne comprend l’origine.",
  categorie: "Professionnels",
  motsCles: [
    "conciergerie airbnb organisation",
    "gérer plusieurs logements location",
    "livret accueil conciergerie",
    "standardiser accueil location courte durée",
    "process conciergerie location saisonnière",
  ],
  datePublication: "2026-06-17",
  dateMaj: "2026-08-26",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 10,
  accent: "#4A849E",
  accentPale: "#E4EEF3",
  accentSombre: "#2B5F75",
  motif: "vagues",
  icone: "immeubles",
  aRetenir: [
    "Quatre-vingts pour cent d’un livret est commun à tout un parc : seul le reste mérite d’être écrit logement par logement.",
    "Le coût de la non-standardisation ne se voit pas dans un budget — il se voit dans le nombre d’appels.",
    "Une fiche d’accueil est aussi un outil interne : femme de ménage, agent d’état des lieux, remplaçant du dimanche.",
    "Ce qui décide de la tenue d’un parc dans le temps, c’est le coût unitaire d’une correction.",
  ],
  blocs: [
    { type: "h2", id: "cout-cache", texte: "Le coût caché du sur-mesure permanent" },
    {
      type: "p",
      texte:
        "Une conciergerie qui grandit passe presque toujours par la même phase : chaque logement a son classeur, son PDF, ses habitudes, souvent hérités du propriétaire. Tant que le parc est petit, cela tient par la mémoire des gens. Puis un salarié part, un propriétaire change de box internet, une saison arrive — et l’édifice se met à consommer du temps sans qu’on sache le mesurer.",
    },
    {
      type: "chiffres",
      items: [
        { valeur: "80 %", libelle: "du contenu d’un livret est identique d’un logement à l’autre" },
        { valeur: "3", libelle: "personnes différentes lisent la fiche d’un logement chaque mois" },
        { valeur: "1", libelle: "correction doit coûter quelques secondes, pas une intervention" },
      ],
    },
    {
      type: "p",
      texte:
        "Le symptôme le plus fiable n’est pas financier, il est téléphonique : **le nombre d’appels que vous recevez le samedi soir**. Un parc bien documenté est silencieux le week-end. Un parc mal documenté sonne, et il sonne toujours pour les mêmes trois choses.",
    },

    { type: "h2", id: "socle", texte: "Le socle commun, et ce qui reste spécifique" },
    {
      type: "p",
      texte:
        "La bonne façon de découper n’est pas « par logement », mais « par ce qui varie ». Une fois posée, cette distinction rend l’ouverture d’un nouveau lot presque mécanique.",
    },
    {
      type: "tableau",
      legende: "Ce qui se duplique et ce qui s’écrit à la main",
      colonnes: ["Rubrique", "Nature", "Traitement"],
      colonneMiseEnAvant: 2,
      lignes: [
        ["Consignes de départ", "Politique d’agence", "Socle commun, un seul texte pour tout le parc"],
        ["Règles du logement", "Politique d’agence + exceptions", "Socle, avec une ligne locale si besoin"],
        ["Contacts et urgences", "Agence", "Socle commun"],
        ["Tri et poubelles", "Commune", "Socle par ville, ajusté par logement"],
        ["Bonnes adresses", "Quartier", "Socle par quartier, deux ou trois ajouts propres au bien"],
        ["Accès, codes, boîte à clés", "Strictement local", "Écrit une fois, à l’ouverture du lot"],
        ["Wi-Fi", "Strictement local", "Écrit une fois, corrigé à chaque changement de box"],
        ["Équipements et notices", "Local", "Photo + une ligne par appareil"],
      ],
    },
    {
      type: "p",
      texte:
        "Une fois ce découpage adopté, l’ouverture d’un logement se réduit à remplir la colonne « strictement local ». Le reste se duplique. C’est ce qui permet d’intégrer un nouveau mandat en une visite plutôt qu’en trois allers-retours.",
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Pourquoi l’harmonisation est aussi un argument commercial",
      texte:
        "Un propriétaire qui vous confie son bien voit très vite la différence entre « on s’occupe de tout » et un accueil visiblement industrialisé, cohérent d’un logement à l’autre. Des pages harmonisées à vos couleurs valent une page de présentation dans un dossier de mandat.",
    },

    { type: "h2", id: "ouverture", texte: "La procédure d’ouverture d’un logement" },
    {
      type: "p",
      texte:
        "Voici une procédure qui tient en une visite, et qui produit un livret publiable le soir même.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "Photographier avant d’écrire",
          texte:
            "Façade, entrée, boîte à clés, tableau électrique, thermostat, plaque de cuisson, local à poubelles. Sept photos, prises dans l’ordre du parcours voyageur. Elles remplaceront la moitié des explications.",
        },
        {
          titre: "Relever les identifiants sur place",
          texte:
            "Nom du réseau Wi-Fi tel qu’il apparaît réellement — pas celui que le propriétaire croit —, mot de passe recopié caractère par caractère, codes d’accès testés dans la main.",
        },
        {
          titre: "Dupliquer le socle",
          texte:
            "Partir d’un logement existant du même quartier et n’ajuster que la colonne locale. Écrire de zéro est une perte de temps et une source d’oublis.",
        },
        {
          titre: "Poser le support à l’entrée",
          texte:
            "L’objet compte : la plaque doit être visible dès le seuil, à hauteur de regard. Le détail du placement est traité dans notre [guide du QR code](/blog/qr-code-location-saisonniere#placement).",
        },
        {
          titre: "Faire relire par quelqu’un qui n’y est jamais allé",
          texte:
            "Un membre de l’équipe qui ne connaît pas le bien repère en cinq minutes les évidences non écrites. C’est le contrôle qualité le moins cher qui existe.",
        },
      ],
    },

    {
      type: "cta",
      titre: "Chiffrer un parc, pas un logement",
      texte:
        "Au-delà de quelques biens, les conditions se calculent sur le volume, avec des pages harmonisées, la duplication et la mise à jour groupée. Dites-nous la taille de votre parc, nous revenons vers vous avec une proposition.",
      href: "/devis?offre=multibien",
      libelle: "Demander un devis multi-biens",
      hrefSecondaire: "/livrets-demo",
      libelleSecondaire: "Voir des livrets en ligne",
    },

    { type: "h2", id: "equipes", texte: "Le livret comme outil interne" },
    {
      type: "p",
      texte:
        "On construit un livret pour les voyageurs, et l’on découvre après coup qu’il sert surtout aux équipes. La femme de ménage qui remplace au pied levé, l’agent d’état des lieux, le prestataire qui vient réparer un volet : tous cherchent la même chose — où c’est, comment on entre, qui prévenir.",
    },
    {
      type: "liste",
      items: [
        "**La passation du dimanche** : un remplaçant autonome, c’est un appel de moins pour l’astreinte.",
        "**Le suivi du ménage** : les fiches de passage et l’état des lieux vivent au même endroit que le reste, et non dans une conversation.",
        "**La preuve** : ce qui est écrit et daté règle proprement un désaccord sur l’état d’un logement.",
      ],
    },
    {
      type: "p",
      texte:
        "Cette double fonction est ce qui fait tenir un livret dans le temps. Un document qui ne sert qu’au voyageur finit par ne plus être mis à jour ; un document dont vos propres équipes dépendent reste vivant.",
    },

    { type: "h2", id: "erreurs", texte: "Les trois erreurs classiques d’un parc en croissance" },
    {
      type: "etapes",
      items: [
        {
          titre: "Laisser chaque propriétaire imposer son format",
          texte:
            "Vous héritez alors de quinze logiques différentes et vous perdez toute possibilité de duplication. Le format est votre outil de travail : il se négocie une fois, à la signature du mandat.",
        },
        {
          titre: "Confier le livret au logiciel de réservation",
          texte:
            "C’est confortable au début et bloquant ensuite : le jour où vous changez de PMS, le contenu ne suit pas. Le sujet est développé dans notre [comparatif des solutions](/blog/comparatif-livret-accueil-numerique#pms).",
        },
        {
          titre: "Ne rien mettre dans le logement",
          texte:
            "Un lien envoyé par message ne survit pas à un changement de voyageur, et n’atteint jamais les autres personnes du groupe. Sur un parc, c’est la première cause d’appels évitables.",
        },
      ],
    },

    { type: "h2", id: "rentabilite", texte: "Ce que ça rapporte, concrètement" },
    {
      type: "p",
      texte:
        "Une conciergerie ne calcule pas le retour sur investissement d’un livret en gain de chiffre d’affaires, mais en charge évitée. Trois postes se mesurent facilement.",
    },
    {
      type: "liste",
      ordonnee: true,
      items: [
        "**Les appels d’astreinte**, en particulier hors horaires — ce sont les plus coûteux et les plus démoralisants pour les équipes.",
        "**Les interventions physiques inutiles** : un déplacement pour rebrancher une box ou montrer où est le local à vélos coûte une heure et un trajet.",
        "**Les notes d’arrivée et de communication**, qui pèsent sur la visibilité des annonces que vous gérez, donc sur le taux d’occupation que vous devez au propriétaire.",
      ],
    },
    {
      type: "p",
      texte:
        "Le chiffrage complet, parc par parc et sur trois ans, est détaillé dans [notre article sur le prix d’un livret d’accueil](/blog/prix-livret-accueil-numerique#parc). Et si vos logements sont ouverts sur plusieurs canaux, la façon de n’entretenir qu’un seul accueil est décrite dans [notre guide multi-plateformes](/blog/airbnb-booking-reservation-directe-accueil#socle).",
    },
    {
      type: "p",
      texte:
        "Pour un groupe hôtelier ou une résidence avec des besoins plus larges — room service, réservation d’activités, marque complète, intégrations —, c’est l’[offre sur mesure](/devis?offre=signature) qu’il faut regarder. Et si vous démarrez seulement, commencez par la structure : tout est dans [le guide du livret d’accueil](/blog/livret-accueil-numerique-location-saisonniere).",
    },
  ],
  faq: [
    {
      question: "Comment standardiser l’accueil sur plusieurs logements ?",
      reponse:
        "En séparant ce qui est commun de ce qui est local. Consignes de départ, règles, contacts et bonnes adresses de quartier constituent un socle dupliqué ; seuls les accès, le Wi-Fi et les équipements s’écrivent logement par logement. L’ouverture d’un nouveau lot se réduit alors à remplir cette partie locale.",
    },
    {
      question: "Combien de logements faut-il pour passer à une offre multi-biens ?",
      reponse:
        "Il n’y a pas de seuil strict : l’intérêt apparaît dès que la duplication et la mise à jour groupée vous font gagner du temps, en pratique à partir de quelques logements. Les conditions se chiffrent sur devis, en fonction de la taille du parc.",
    },
    {
      question: "Le livret sert-il aussi aux équipes de ménage ?",
      reponse:
        "Oui, et c’est souvent son usage le plus rentable. Un remplaçant qui trouve seul l’accès, le local à linge et les consignes n’appelle pas l’astreinte. Les fiches de ménage et d’état des lieux vivent au même endroit que le livret, ce qui évite de chercher l’information dans une conversation.",
    },
    {
      question: "Peut-on harmoniser les pages aux couleurs de la conciergerie ?",
      reponse:
        "Oui. L’offre multi-biens prévoit des pages harmonisées, la duplication d’un logement à l’autre et la mise à jour groupée. C’est aussi un argument commercial vis-à-vis des propriétaires, qui voient un accueil cohérent sur tout le parc.",
    },
  ],
  connexes: [
    "comparatif-livret-accueil-numerique",
    "livret-accueil-numerique-location-saisonniere",
    "prix-livret-accueil-numerique",
  ],
};
