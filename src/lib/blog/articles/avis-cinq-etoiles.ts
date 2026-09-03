import type { Article } from "../types";

/**
 * L'article « résultat ».
 *
 * Il relie l'accueil à la note, qui est la métrique que tout hôte regarde.
 * Aucune promesse chiffrée n'y est faite sur les notes : elles dépendent de
 * trop de choses, et une promesse invérifiable abîme le reste du site.
 */
export const avisCinqEtoiles: Article = {
  slug: "avis-5-etoiles-accueil-voyageur",
  titre: "Avis 5 étoiles : ce qui se joue dans les dix premières minutes",
  titreSeo: "Obtenir plus d’avis 5 étoiles : le rôle décisif de l’accueil",
  description:
    "La note d’un séjour se décide en grande partie à l’arrivée. Ce qui fait perdre une étoile, ce qui la fait gagner, et comment demander un avis sans insister.",
  chapo:
    "Un voyageur note un séjour entier, mais il le note à partir d’une impression, et cette impression se forme très tôt. Dix minutes après avoir passé la porte, il a déjà décidé s’il est chez quelqu’un de sérieux ou s’il va devoir se débrouiller. Presque tout ce qui suit ne fera que confirmer ce jugement.",
  categorie: "Expérience voyageur",
  motsCles: [
    "avis 5 étoiles airbnb",
    "améliorer note airbnb",
    "accueil voyageur location",
    "demander un avis voyageur",
    "expérience voyageur location saisonnière",
  ],
  datePublication: "2026-05-20",
  dateMaj: "2026-08-26",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 9,
  accent: "#A35A38",
  accentPale: "#F7EBE4",
  accentSombre: "#7A3F26",
  motif: "rayons",
  icone: "etoile",
  aRetenir: [
    "L’impression décisive se forme avant même que la valise soit posée.",
    "On perd rarement une étoile sur un défaut : on la perd sur un défaut non annoncé.",
    "Un livret soigné est perçu comme un signe d’attention, avant même d’être utile.",
    "Une demande d’avis fonctionne mieux courte, personnelle et envoyée au bon moment.",
  ],
  blocs: [
    { type: "h2", id: "comment-se-forme", texte: "Comment une note se forme réellement" },
    {
      type: "p",
      texte:
        "Les plateformes découpent l’évaluation en critères — propreté, exactitude de l’annonce, communication, arrivée, emplacement, rapport qualité-prix. Le voyageur, lui, ne raisonne pas par critères. Il ressent une expérience globale, puis répartit cette impression sur les cases qu’on lui présente. C’est pourquoi une arrivée ratée fait souvent baisser des notes qui n’ont rien à voir avec elle.",
    },
    {
      type: "citation",
      texte:
        "On ne note pas un logement, on note le souvenir qu’on en garde. Et le souvenir se fabrique surtout au début et à la fin.",
    },
    {
      type: "p",
      texte:
        "Cette dissymétrie est une bonne nouvelle : elle veut dire que quelques minutes bien préparées pèsent plus lourd que beaucoup d’efforts répartis sur toute la semaine.",
    },

    { type: "h2", id: "dix-minutes", texte: "Les dix premières minutes, séquence par séquence" },
    {
      type: "etapes",
      items: [
        {
          titre: "Devant la porte — trouver et entrer",
          texte:
            "C’est le moment de tension maximale : le voyageur est fatigué, chargé, parfois en retard. Chaque hésitation ici coûte cher. Une entrée réussie, c’est une information disponible sans avoir à écrire à qui que ce soit.",
        },
        {
          titre: "Le seuil — la première impression visuelle",
          texte:
            "Odeur, lumière, ordre. Un mot d’accueil visible et un support d’accueil soigné disent en une seconde que quelqu’un s’est occupé de ce logement. C’est un signal, et les signaux comptent plus que les explications.",
        },
        {
          titre: "Les cinq premières minutes — le Wi-Fi",
          texte:
            "C’est la première chose cherchée, sans exception. Un mot de passe illisible ou introuvable ouvre la série des petites frictions. Un mot de passe copiable en un geste la referme avant qu’elle ne commence.",
        },
        {
          titre: "La dixième minute — l’autonomie",
          texte:
            "À ce stade, le voyageur sait s’il peut se débrouiller seul. S’il le sait, il n’écrira pas, et il se souviendra d’un séjour fluide. Sinon, chaque question posée deviendra une ligne mentale au débit de votre accueil.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Le mot d’accueil, gratuit et sous-estimé",
      texte:
        "Une phrase personnalisée qui nomme le logement et souhaite un bon séjour change la tonalité de l’arrivée. Sur la formule Confort, cette phrase peut être gravée sur la plaque elle-même — elle est là à chaque fois, sans rien de manuscrit à refaire entre deux séjours.",
    },

    { type: "h2", id: "perdre-une-etoile", texte: "Ce qui fait perdre une étoile" },
    {
      type: "p",
      texte:
        "Il existe une règle assez fiable en hospitalité : ce n’est presque jamais le défaut qui coûte une étoile, c’est la **surprise**. Un canapé un peu usé annoncé dans l’annonce ne coûte rien. Le même canapé découvert sur place coûte un point de « conformité à l’annonce ».",
    },
    {
      type: "opposition",
      titreOui: "Annoncé, donc accepté",
      oui: [
        "« L’escalier est raide, sans ascenseur »",
        "« Le marché du mardi rend la rue bruyante le matin »",
        "« La douche met une minute à chauffer »",
        "« La connexion suffit pour le streaming, pas pour du gros téléchargement »",
      ],
      titreNon: "Découvert sur place, donc reproché",
      non: [
        "Un chauffage dont personne ne sait se servir",
        "Un mot de passe Wi-Fi faux depuis trois semaines",
        "Une poubelle qu’on ne sait pas où sortir",
        "Une consigne de départ envoyée à 8 h le jour même",
      ],
    },
    {
      type: "p",
      texte:
        "Toutes les lignes de la colonne de droite ont un point commun : ce sont des informations, pas des travaux. Elles se règlent en les écrivant une fois, au bon endroit. C’est exactement la fonction d’un livret d’accueil bien construit — voir [les douze rubriques essentielles](/blog/livret-accueil-numerique-location-saisonniere#contenu).",
    },

    { type: "h2", id: "fin-de-sejour", texte: "La fin de séjour, l’autre moment qui compte" },
    {
      type: "p",
      texte:
        "L’avis n’est pas écrit pendant le séjour : il est écrit après. Le dernier souvenir pèse donc anormalement lourd. Un départ mal cadré — consignes floues, tâches inattendues, ménage déguisé en « petit geste » — peut effacer une semaine parfaite.",
    },
    {
      type: "liste",
      items: [
        "**Trois consignes de départ, pas dix.** Une liste longue est perçue comme du travail non rémunéré, et elle est appliquée à moitié.",
        "**Rappelées la veille au soir**, pas le matin même : personne n’aime lire des instructions la valise à la main.",
        "**Cohérentes avec vos frais de ménage.** Demander un ménage complet en plus d’un forfait de ménage est la source de rancune la plus fréquente en location courte durée.",
      ],
    },

    { type: "h2", id: "demander", texte: "Demander l’avis, sans insister" },
    {
      type: "p",
      texte:
        "Beaucoup d’hôtes n’osent pas demander, ou demandent mal. Trois principes suffisent.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "Le moment",
          texte:
            "Vingt-quatre à quarante-huit heures après le départ. Assez tôt pour que le souvenir soit vif, assez tard pour que la personne soit rentrée et posée.",
        },
        {
          titre: "Le ton",
          texte:
            "Court, personnel, sans formule commerciale. Nommer un détail du séjour — la randonnée, le marché, l’anniversaire fêté sur place — vaut mieux que trois lignes de remerciements génériques.",
        },
        {
          titre: "La sortie honorable",
          texte:
            "Proposer d’écrire en retour, et rappeler que toute remarque est bienvenue, y compris négative. Un voyageur mécontent qui vous écrit en privé plutôt que publiquement, c’est une étoile sauvée et un problème réglé.",
        },
      ],
    },
    {
      type: "p",
      texte:
        "Le livre d’or joue le même rôle en amont : il donne un endroit où déposer un mot pendant le séjour, souvent au moment où le voyageur est le plus enthousiaste. Il est disponible dans la formule Confort, et vous pouvez le voir en fonctionnement dans [nos livrets de démonstration](/livrets-demo).",
    },

    {
      type: "cta",
      titre: "Soigner les dix premières minutes",
      texte:
        "Une plaque gravée à l’entrée, une page qui répond avant qu’on ait à demander : c’est le point de départ le plus rentable d’un accueil.",
      href: "/#offres",
      libelle: "Découvrir les formules",
      hrefSecondaire: "/commencer",
      libelleSecondaire: "Créer mon livret",
    },
  ],
  faq: [
    {
      question: "Comment obtenir plus d’avis 5 étoiles sur une location ?",
      reponse:
        "En traitant l’arrivée comme le moment décisif : entrée sans friction, mot d’accueil visible, Wi-Fi immédiatement accessible, informations disponibles sans avoir à écrire. Ensuite, en cadrant un départ simple et en demandant l’avis dans les deux jours suivant le séjour.",
    },
    {
      question: "Pourquoi je perds une étoile alors que le logement est impeccable ?",
      reponse:
        "Parce que la note ne sanctionne pas les défauts, mais les surprises. Un inconvénient annoncé à l’avance est accepté ; le même inconvénient découvert sur place est reproché. Une grande partie de ces écarts se corrige en écrivant l’information, pas en faisant des travaux.",
    },
    {
      question: "Quand faut-il demander un avis à ses voyageurs ?",
      reponse:
        "Entre vingt-quatre et quarante-huit heures après le départ. Plus tôt, la personne est encore en déplacement ; plus tard, le souvenir s’estompe et la demande paraît tardive.",
    },
    {
      question: "Un livret d’accueil améliore-t-il vraiment les notes ?",
      reponse:
        "Il n’agit pas directement sur la note, mais sur ses causes : moins de frictions à l’arrivée, moins d’informations manquantes, moins de surprises. Ce sont précisément les motifs qui font descendre les notes de communication et d’arrivée.",
    },
  ],
  connexes: [
    "reduire-messages-voyageurs",
    "livret-accueil-numerique-location-saisonniere",
    "conciergerie-accueil-plusieurs-logements",
  ],
};
