import type { Article } from "../types";

/**
 * L'article « arrivée autonome ».
 *
 * Il attrape une intention très concrète — comment faire entrer quelqu'un
 * sans être là — et la relie au reste du groupe : c'est le moment où
 * l'absence d'information coûte le plus cher.
 */
export const arriveeAutonome: Article = {
  slug: "arrivee-autonome-check-in-sans-etre-la",
  titre: "Arrivée autonome : réussir un check-in sans être sur place",
  titreSeo:
    "Arrivée autonome en location : réussir un check-in sans être sur place",
  description:
    "Boîte à clés, serrure à code, remise par un tiers : comment organiser une arrivée autonome qui ne génère ni appel paniqué ni mauvaise surprise.",
  chapo:
    "L’arrivée autonome est devenue la norme en location courte durée. Elle libère l’hôte d’une contrainte d’horaire épuisante — et elle transfère au voyageur une responsabilité qu’il n’a pas demandée : se débrouiller seul, souvent de nuit, dans une ville qu’il ne connaît pas. Tout l’enjeu tient dans la préparation de ces quinze minutes.",
  categorie: "Pratique",
  motsCles: [
    "arrivée autonome airbnb",
    "check-in autonome location",
    "boîte à clés location saisonnière",
    "serrure à code location",
    "instructions arrivée voyageur",
  ],
  datePublication: "2026-07-15",
  dateMaj: "2026-08-26",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 8,
  accent: "#7A5544",
  accentPale: "#F2EBE4",
  accentSombre: "#5C3D2E",
  motif: "collines",
  icone: "livre",
  aRetenir: [
    "Une arrivée autonome réussie repose sur des instructions écrites comme un itinéraire, pas comme une notice.",
    "Une photo de la façade et une de la boîte à clés valent mieux que trois paragraphes.",
    "Le point de bascule est le téléphone déchargé ou sans réseau : prévoyez le cas.",
    "Ce qui se passe après l’ouverture de la porte compte autant que l’ouverture elle-même.",
  ],
  blocs: [
    { type: "h2", id: "solutions", texte: "Les quatre façons de faire entrer quelqu’un" },
    {
      type: "p",
      texte:
        "Elles ne se valent pas, et le choix dépend moins du budget que du type de bâtiment et du profil des voyageurs.",
    },
    {
      type: "tableau",
      legende: "Comparaison des modes de remise des clés",
      colonnes: ["Solution", "Points forts", "Limites"],
      colonneMiseEnAvant: 1,
      lignes: [
        [
          "Boîte à clés à code",
          "Peu coûteuse, universelle, aucune électronique à charger",
          "Visible dans la rue, code à changer entre voyageurs, gel possible l’hiver",
        ],
        [
          "Serrure à code",
          "Aucune clé à perdre, code unique par séjour, historique des ouvertures",
          "Investissement, piles à surveiller, accord de la copropriété parfois nécessaire",
        ],
        [
          "Remise par un tiers (commerce, voisin, concierge)",
          "Contact humain, contrôle de qui entre",
          "Dépend d’horaires, et d’une personne qui peut être absente",
        ],
        [
          "Consigne à clés de quartier",
          "Sécurisée, adaptée aux immeubles sans espace extérieur",
          "Trajet supplémentaire pour le voyageur, coût par séjour",
        ],
      ],
    },
    {
      type: "encadre",
      ton: "alerte",
      titre: "Le code qui ne change jamais",
      texte:
        "Une boîte à clés dont le code est resté le même depuis deux ans est un problème de sécurité, pas un détail d’organisation. Changez-le régulièrement — et assurez-vous que le nouveau code soit modifiable en trente secondes dans votre livret, sinon il ne le sera pas.",
    },

    { type: "h2", id: "instructions", texte: "Écrire des instructions qui fonctionnent la nuit" },
    {
      type: "p",
      texte:
        "La plupart des instructions d’arrivée sont écrites par quelqu’un qui connaît l’endroit par cœur, pour quelqu’un qui ne l’a jamais vu. C’est là que tout se joue. Une bonne instruction se lit comme un itinéraire à voix haute.",
    },
    {
      type: "opposition",
      titreOui: "Écrit comme un itinéraire",
      oui: [
        "« Façade bleue, juste à droite de la boulangerie »",
        "« Digicode à gauche de la porte : 4512, puis la touche cloche »",
        "« Boîte à clés grise, sur le mur du garage, à droite du compteur »",
        "« Une fois entré, l’interrupteur est derrière la porte, à gauche »",
      ],
      titreNon: "Écrit comme une notice",
      non: [
        "« L’immeuble se situe au 12 »",
        "« Composez le code d’accès »",
        "« Récupérez les clés dans la boîte prévue à cet effet »",
        "« La lumière se trouve à l’entrée »",
      ],
    },
    {
      type: "p",
      texte:
        "Les quatre phrases de gauche ont trois qualités : elles nomment un repère visible, elles disent le geste exact, et elles anticipent l’hésitation. Ajoutez-y deux photos — la façade de jour, la boîte à clés en gros plan — et le nombre d’appels à l’arrivée tombe presque à zéro.",
    },
    {
      type: "citation",
      texte:
        "Une instruction d’arrivée doit pouvoir être suivie par quelqu’un de fatigué, chargé, sous la pluie, à 23 h, avec 8 % de batterie.",
    },

    { type: "h2", id: "plan-b", texte: "Le plan B, celui qui sauve la soirée" },
    {
      type: "p",
      texte:
        "Toute arrivée autonome finit un jour par échouer : batterie vide, réseau absent, code mal noté, boîte à clés bloquée. Ce n’est pas l’incident qui abîme un séjour, c’est l’absence de recours.",
    },
    {
      type: "liste",
      items: [
        "**Un support physique dans l’entrée de l’immeuble ou du logement**, qui redonne accès aux informations sans dépendre d’un lien envoyé par message.",
        "**Un numéro joignable**, écrit en clair, et une seconde personne à contacter si vous ne répondez pas.",
        "**Une adresse courte et lisible**, qu’on peut taper à la main quand le scan échoue.",
        "**Un double des clés** accessible à moins de dix minutes — voisin, commerce, conciergerie.",
      ],
    },
    {
      type: "p",
      texte:
        "Le premier point mérite d’être souligné : la plupart des plans B échouent parce qu’ils supposent un téléphone en état de marche et un accès au fil de messages. Une plaque avec un QR code et une adresse lisible fonctionne aussi bien pour la personne qui a réservé que pour son ami arrivé deux heures plus tard — le sujet est développé dans [notre guide du QR code](/blog/qr-code-location-saisonniere#placement), et le choix du support dans [notre comparatif des matériaux](/blog/plaque-accueil-qr-code-materiaux).",
    },

    { type: "h2", id: "apres-la-porte", texte: "Ce qui se passe après la porte" },
    {
      type: "p",
      texte:
        "Une arrivée autonome ne s’arrête pas à l’ouverture. Le voyageur entre, pose ses sacs, et se retrouve seul avec une série de petites questions que personne n’est là pour traiter. C’est le moment où l’accueil autonome se distingue de l’accueil négligé.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "La lumière et le chauffage",
          texte:
            "Dites où sont les interrupteurs principaux et comment fonctionne le thermostat. En hiver, un logement froid dont on ne sait pas régler le chauffage donne le ton pour toute la semaine.",
        },
        {
          titre: "Le Wi-Fi, tout de suite",
          texte:
            "C’est la première chose cherchée. Un mot de passe copiable en un geste vaut mieux qu’une étiquette collée derrière la box.",
        },
        {
          titre: "L’eau, l’électricité, les coupures",
          texte:
            "Où est le tableau électrique, où est la vanne d’arrêt d’eau. Deux lignes qui, une fois par an, évitent un dégât des eaux.",
        },
        {
          titre: "Un mot d’accueil",
          texte:
            "Sans personne pour dire bonjour, un mot écrit remplace la poignée de main. C’est le seul geste chaleureux possible dans une arrivée autonome — il ne coûte rien et il se remarque.",
        },
      ],
    },

    {
      type: "cta",
      titre: "Tout ce qu’il faut savoir, dès le seuil",
      texte:
        "Une plaque gravée à l’entrée, un scan, et le voyageur a sous les yeux l’accès, le Wi-Fi, le chauffage et les contacts. Y compris quand vous dormez.",
      href: "/livrets-demo",
      libelle: "Ouvrir un livret de démonstration",
      hrefSecondaire: "/#offres",
      libelleSecondaire: "Voir les formules",
    },

    { type: "h2", id: "checklist", texte: "La checklist avant la première arrivée autonome" },
    {
      type: "liste",
      ordonnee: true,
      items: [
        "Tester le trajet complet **avec un téléphone qui n’a jamais vu le logement** : depuis la rue, jusqu’à la lumière allumée.",
        "Vérifier que la boîte à clés s’ouvre **avec des mains froides**, et de nuit.",
        "Photographier la façade de jour, la boîte à clés en gros plan, le thermostat.",
        "Vérifier le mot de passe Wi-Fi **caractère par caractère**, majuscules comprises.",
        "S’assurer que l’information reste accessible **sans le lien envoyé par message**.",
        "Prévoir qui répond si vous ne répondez pas.",
      ],
    },
    {
      type: "p",
      texte:
        "Cette checklist prend vingt minutes une seule fois. Elle vous évitera la série d’appels qui suit, invariablement, une première arrivée autonome improvisée. Pour la suite — que mettre dans le livret une fois la porte ouverte —, la liste complète des rubriques est [dans notre guide](/blog/livret-accueil-numerique-location-saisonniere#contenu).",
    },
  ],
  faq: [
    {
      question: "Comment organiser une arrivée autonome en location saisonnière ?",
      reponse:
        "En choisissant un mode de remise des clés adapté au bâtiment (boîte à clés, serrure à code, tiers de confiance), puis en rédigeant des instructions écrites comme un itinéraire, avec des repères visibles et deux photos. Il faut enfin prévoir un plan B qui ne dépende ni de la batterie du téléphone ni du fil de messages.",
    },
    {
      question: "Boîte à clés ou serrure à code : que choisir ?",
      reponse:
        "La boîte à clés coûte peu et fonctionne partout, mais elle est visible et son code doit être changé régulièrement. La serrure à code supprime les clés et permet un code par séjour, au prix d’un investissement, de piles à surveiller et parfois d’un accord de copropriété.",
    },
    {
      question: "Que faire si le voyageur n’arrive pas à entrer ?",
      reponse:
        "Prévoir le recours à l’avance : une information accessible depuis un support fixe dans le logement ou l’entrée, une adresse lisible qu’on peut taper à la main, un numéro joignable écrit en clair et une seconde personne à contacter, ainsi qu’un double des clés à moins de dix minutes.",
    },
    {
      question: "Faut-il quand même accueillir physiquement de temps en temps ?",
      reponse:
        "C’est une question de positionnement, pas d’organisation. Un accueil en personne se justifie sur un bien haut de gamme ou complexe. Dans tous les cas, les informations doivent exister par écrit : la personne qui accueille peut être absente, malade ou en retard.",
    },
  ],
  connexes: [
    "qr-code-location-saisonniere",
    "livret-accueil-numerique-location-saisonniere",
    "plaque-accueil-qr-code-materiaux",
  ],
};
