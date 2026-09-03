import type { Article } from "../types";

/**
 * L'article multi-canaux.
 *
 * Il vend une propriété que nous avons et que les modules de PMS n'ont pas
 * — l'indépendance vis-à-vis du canal de réservation. Un point d'attention
 * dans la rédaction : rien ne doit ressembler à un conseil de contournement
 * des plateformes. Le livret sert l'accueil, pas le détournement de
 * réservation, et le texte le dit explicitement.
 */
export const accueilMultiCanaux: Article = {
  slug: "airbnb-booking-reservation-directe-accueil",
  titre: "Airbnb, Booking, réservation directe : un seul accueil pour trois canaux",
  titreSeo:
    "Airbnb, Booking et réservation directe : unifier l’accueil voyageur",
  description:
    "Chaque plateforme impose ses règles de communication, mais vos voyageurs dorment tous dans le même logement. Comment construire un accueil unique, indépendant du canal.",
  chapo:
    "Un logement loué sur trois canaux, ce sont trois messageries, trois politiques de communication, trois moments où l’information part — et un seul logement où tout le monde arrive. La plupart des hôtes finissent par entretenir trois accueils parallèles qui divergent lentement. Il existe une manière plus simple de s’en sortir.",
  categorie: "Organisation",
  motsCles: [
    "airbnb et booking en même temps",
    "réservation directe location saisonnière",
    "accueil voyageur multi plateformes",
    "gérer plusieurs canaux location",
    "livret accueil indépendant plateforme",
  ],
  datePublication: "2026-09-03",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 9,
  accent: "#4A849E",
  accentPale: "#E4EEF3",
  accentSombre: "#2B5F75",
  motif: "chevrons",
  icone: "canaux",
  aRetenir: [
    "Les canaux diffèrent sur la communication avant l’arrivée, pas sur ce qui se passe une fois la porte franchie.",
    "Un accueil rattaché à une plateforme ne suit pas quand vous changez de canal — et vous en changerez.",
    "Le seul élément commun aux trois canaux est physique : ce qui est posé dans le logement.",
    "Le livret sert l’accueil, jamais le contournement des règles d’une plateforme.",
  ],
  blocs: [
    { type: "h2", id: "probleme", texte: "Trois canaux, trois accueils qui divergent" },
    {
      type: "p",
      texte:
        "Le scénario est toujours le même. Vous démarrez sur une plateforme, vous rédigez un message d’arrivée soigné. Vous ouvrez un second canal, vous recopiez le message en l’adaptant. Vous montez un site de réservation directe, vous en écrivez un troisième. Six mois plus tard, vous changez de box internet : vous corrigez deux des trois, et le troisième continue d’envoyer un mot de passe qui ne fonctionne plus.",
    },
    {
      type: "p",
      texte:
        "Ce n’est pas un problème de rigueur, c’est un problème de structure. **Toute information dupliquée finit par diverger.** La seule parade consiste à n’avoir qu’un exemplaire de chaque information, et à faire pointer les trois canaux vers lui.",
    },
    {
      type: "citation",
      texte:
        "Vos voyageurs viennent de trois endroits différents. Ils dorment tous dans la même chambre, cherchent le même Wi-Fi, et sortent les mêmes poubelles.",
    },

    { type: "h2", id: "ce-qui-change", texte: "Ce qui change vraiment d’un canal à l’autre" },
    {
      type: "p",
      texte:
        "Moins de choses qu’on ne le croit, et pas celles qu’on imagine. Les différences se concentrent sur la période **avant** l’arrivée ; après, elles disparaissent presque toutes.",
    },
    {
      type: "tableau",
      legende: "Ce qui diffère, et ce qui ne diffère pas, selon le canal",
      colonnes: ["Ce dont il s’agit", "Airbnb", "Booking", "Réservation directe"],
      colonneMiseEnAvant: 3,
      lignes: [
        [
          "Messagerie avant l’arrivée",
          "Interne, encadrée",
          "Interne, encadrée",
          "Libre (courriel, SMS)",
        ],
        [
          "Coordonnées du voyageur",
          "Communiquées tardivement",
          "Selon le paramétrage",
          "Vous les avez",
        ],
        ["Automatisations de messages", "Oui", "Oui", "Selon vos outils"],
        ["Le voyageur arrive devant la même porte", "Oui", "Oui", "Oui"],
        ["Il cherche le même Wi-Fi", "Oui", "Oui", "Oui"],
        ["Il pose les mêmes douze questions", "Oui", "Oui", "Oui"],
        ["Il repart avec la même impression", "Oui", "Oui", "Oui"],
      ],
    },
    {
      type: "p",
      texte:
        "Les quatre dernières lignes sont la démonstration : **l’accueil sur place n’a pas de canal**. Tout ce qui se passe après la porte est identique, et c’est précisément la partie qui pèse le plus lourd dans les évaluations. Le détail de ces douze questions récurrentes est dans [notre méthode dédiée](/blog/reduire-messages-voyageurs#douze-questions).",
    },

    { type: "h2", id: "socle", texte: "Un socle unique, trois portes d’entrée" },
    {
      type: "p",
      texte:
        "La structure qui tient dans le temps est simple : une source unique d’information, et trois façons d’y accéder.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "Une seule page, pour le logement — pas pour la réservation",
          texte:
            "L’information appartient au logement, pas au séjour. Une page attachée au bien reste juste quel que soit le canal, quel que soit le voyageur, et sert aussi vos prestataires — qui n’ont, eux, aucune réservation.",
        },
        {
          titre: "Trois messages courts, un seul lien",
          texte:
            "Sur chaque canal, le message d’arrivée se réduit à trois éléments : l’adresse exacte, comment entrer, et le lien vers la page. Trois lignes à maintenir au lieu de trois pavés, et la correction se fait une seule fois, sur la page.",
        },
        {
          titre: "Un support physique dans le logement",
          texte:
            "C’est le seul canal qui fonctionne sans vous, sans réservation et sans messagerie. Il sert le voyageur qui a réservé comme les trois autres personnes du groupe, quelle que soit la plateforme d’origine.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Le test de divergence",
      texte:
        "Ouvrez vos trois messages d’arrivée côte à côte. Si une information factuelle — code, horaire, mot de passe — apparaît dans les trois, elle est en train de diverger. Elle doit sortir des messages et vivre dans le livret.",
    },

    { type: "h2", id: "independance", texte: "Pourquoi l’accueil ne doit dépendre d’aucune plateforme" },
    {
      type: "p",
      texte:
        "Beaucoup d’outils proposent un guide voyageur intégré à la réservation : il part automatiquement après la confirmation, ce qui est confortable. Le confort a un prix, et il se paie plus tard.",
    },
    {
      type: "liste",
      items: [
        "**Vous changerez de canal.** Un canal qui prend trop de commission, une plateforme qui perd du trafic dans votre région, un site direct qui décolle : la répartition bouge tous les deux ou trois ans.",
        "**Vous changerez d’outil.** Un livret hébergé dans un logiciel de gestion locative ne suit pas quand vous en changez ; le contenu est à ressaisir logement par logement.",
        "**Une partie de vos visiteurs n’a pas de réservation.** L’agent d’entretien, l’artisan, le voisin qui relève un compteur, l’ami du groupe. Un accueil rattaché à une réservation les ignore tous.",
      ],
    },
    {
      type: "p",
      texte:
        "C’est le raisonnement qui nous a conduits à ne connecter Guidz à aucune plateforme et à aucun logiciel de réservation. Votre livret appartient à votre logement : il survit à vos changements de canal, de PMS et d’outils. Les conséquences de cette indépendance, comparées aux autres familles de solutions, sont détaillées dans [notre comparatif](/blog/comparatif-livret-accueil-numerique#pms).",
    },

    {
      type: "cta",
      titre: "Un accueil qui ne dépend d’aucun canal",
      texte:
        "Une plaque gravée dans le logement, une page rattachée au bien. Airbnb, Booking, direct ou les trois : rien à reconfigurer, rien à dupliquer.",
      href: "/#offres",
      libelle: "Voir les formules",
      hrefSecondaire: "/livrets-demo",
      libelleSecondaire: "Ouvrir un livret de démonstration",
    },

    { type: "h2", id: "regles", texte: "Ce que le livret ne doit pas être" },
    {
      type: "p",
      texte:
        "Une mise au point nécessaire, parce que la question revient souvent. Chaque plateforme encadre ce que vous pouvez communiquer à un voyageur venu par elle — notamment tout ce qui ressemble à une incitation à réserver ailleurs. Ces règles évoluent et diffèrent d’un canal à l’autre : c’est à vous de les vérifier dans les conditions en vigueur.",
    },
    {
      type: "p",
      texte:
        "Notre position est nette : **un livret d’accueil sert l’accueil**. Il donne le Wi-Fi, les codes, le mode d’emploi du four et l’adresse de la bonne boulangerie. Il n’est ni un canal de démarchage, ni un moyen de contourner une plateforme, et le construire ainsi vous expose sans rien vous rapporter — un compte suspendu coûte infiniment plus cher qu’une commission.",
    },
    {
      type: "opposition",
      titreOui: "Ce qui a sa place dans un livret",
      oui: [
        "Les codes d’accès et le Wi-Fi",
        "Le mode d’emploi des équipements",
        "Les consignes de départ et le tri",
        "Vos bonnes adresses et les transports",
        "Vos coordonnées en cas de problème",
      ],
      titreNon: "Ce qui n’y a pas sa place",
      non: [
        "Une incitation à réserver hors plateforme",
        "Une remise conditionnée à un canal",
        "Un tarif concurrent de celui de l’annonce",
        "Une collecte de données sans information claire",
      ],
    },

    { type: "h2", id: "operations", texte: "La mise en pratique, canal par canal" },
    {
      type: "p",
      texte:
        "Concrètement, voici ce que devient votre exploitation quand l’information vit à un seul endroit.",
    },
    {
      type: "tableau",
      legende: "Ce qui reste à faire sur chaque canal",
      colonnes: ["Canal", "Ce que vous y maintenez", "Ce qui vit dans le livret"],
      colonneMiseEnAvant: 2,
      lignes: [
        [
          "Airbnb",
          "Un message d’arrivée de trois lignes",
          "Wi-Fi, équipements, règles, adresses, départ",
        ],
        [
          "Booking",
          "Le même message, adapté au ton du canal",
          "Idem, sans rien dupliquer",
        ],
        [
          "Réservation directe",
          "Un courriel de confirmation avec le lien",
          "Idem",
        ],
        [
          "Sur place",
          "Rien : la plaque est déjà posée",
          "Tout, accessible sans lien ni réservation",
        ],
      ],
    },
    {
      type: "p",
      texte:
        "Trois messages de trois lignes remplacent trois pavés divergents. Une correction se fait une fois. Et le jour où vous ouvrez un quatrième canal, il n’y a rien à recréer : vous collez le même lien.",
    },
    {
      type: "p",
      texte:
        "Si vous gérez plusieurs logements sur plusieurs canaux, la logique se prolonge en un socle commun dupliqué d’un bien à l’autre — la méthode complète est dans [notre guide pour conciergeries](/blog/conciergerie-accueil-plusieurs-logements#socle), et les conditions se chiffrent [sur devis](/devis?offre=multibien).",
    },
  ],
  faq: [
    {
      question: "Peut-on utiliser le même livret d’accueil sur Airbnb et Booking ?",
      reponse:
        "Oui, et c’est même la seule structure qui tient dans le temps. Le livret est attaché au logement, pas à la réservation : chaque canal se contente d’un message d’arrivée court renvoyant vers la même page, et une correction faite une fois vaut pour tous les canaux.",
    },
    {
      question: "Un livret d’accueil peut-il servir à obtenir des réservations directes ?",
      reponse:
        "Ce n’est pas son rôle, et les plateformes encadrent strictement ce que vous pouvez communiquer à un voyageur venu par elles. Un livret sert l’accueil : codes, Wi-Fi, équipements, consignes. Y placer une incitation à réserver ailleurs vous expose à une sanction sans rapport avec le gain espéré.",
    },
    {
      question: "Faut-il un livret différent selon la plateforme de réservation ?",
      reponse:
        "Non. Ce qui diffère entre canaux se situe avant l’arrivée — messagerie, coordonnées, automatisations. Une fois la porte franchie, tous les voyageurs cherchent les mêmes informations. Dupliquer le livret par canal garantit surtout qu’ils finiront par se contredire.",
    },
    {
      question: "Que devient mon livret si je change de logiciel de réservation ?",
      reponse:
        "S’il est hébergé dans ce logiciel, il ne vous suit pas et le contenu est à ressaisir. C’est pourquoi un livret indépendant de tout PMS et de toute plateforme, rattaché au logement lui-même, reste valable quels que soient vos changements d’outils ou de canaux.",
    },
  ],
  connexes: [
    "comparatif-livret-accueil-numerique",
    "reduire-messages-voyageurs",
    "conciergerie-accueil-plusieurs-logements",
  ],
};
