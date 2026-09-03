import type { Article } from "../types";

/**
 * L'article pilier du groupe « livret d'accueil ».
 *
 * Tous les autres articles y renvoient, et lui renvoie vers tous : c'est
 * cette page qui doit remonter sur la requête générique, les autres se
 * partagent les intentions précises.
 */
export const livretAccueilNumerique: Article = {
  slug: "livret-accueil-numerique-location-saisonniere",
  titre: "Livret d’accueil numérique : le guide complet pour une location saisonnière",
  titreSeo:
    "Livret d’accueil numérique pour location saisonnière : le guide complet",
  description:
    "Que mettre dans un livret d’accueil, quel format choisir, comment le tenir à jour sans y passer ses soirées : la méthode complète, rubrique par rubrique.",
  chapo:
    "Un voyageur pose une poignée de questions par séjour. Presque toutes portent sur des informations que vous connaissez par cœur, et que vous avez déjà écrites quelque part. Le livret d’accueil n’invente rien : il range ces réponses à l’endroit où on les cherche, au moment où on les cherche.",
  categorie: "Les fondamentaux",
  motsCles: [
    "livret d'accueil numérique",
    "livret d'accueil location saisonnière",
    "livret accueil airbnb",
    "guide voyageur location",
    "livret accueil digital",
    "que mettre dans un livret d'accueil",
  ],
  datePublication: "2026-01-14",
  dateMaj: "2026-08-26",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 11,
  accent: "#C4714A",
  accentPale: "#F7EBE4",
  accentSombre: "#A35A38",
  motif: "arches",
  icone: "livre",
  vedette: true,
  aRetenir: [
    "Douze rubriques suffisent à couvrir l’essentiel des questions posées pendant un séjour.",
    "Le format compte moins que l’accessibilité : la bonne information est celle qu’on trouve sans demander.",
    "Un livret figé se périme en une saison — le Wi-Fi change, le boulanger ferme, la poubelle déménage.",
    "L’écrire une fois prend une heure. Le tenir à jour doit prendre deux minutes.",
  ],
  blocs: [
    {
      type: "h2",
      id: "pourquoi",
      texte: "Pourquoi le classeur plastifié a fait son temps",
    },
    {
      type: "p",
      texte:
        "Le classeur posé sur la table basse a rendu de vrais services. Il a un défaut structurel : il ment dès qu’une information change. Vous changez de box internet en mars, la page Wi-Fi devient fausse pour toute la saison. Le restaurant que vous recommandiez ferme en juin, vous continuez à l’envoyer à vos voyageurs jusqu’en septembre.",
    },
    {
      type: "p",
      texte:
        "Le deuxième défaut est plus discret : **personne ne le lit au bon moment**. Un voyageur cherche le code du portail sur le trottoir, sous la pluie, une valise dans une main. Le classeur, lui, est à l’intérieur. La question qu’il pose alors — « bonjour, désolé de vous déranger, c’est quoi le code ? » — n’est pas une question sur le portail. C’est le symptôme d’une information rangée du mauvais côté de la porte.",
    },
    {
      type: "citation",
      texte:
        "Une information d’accueil ne vaut que par le moment où elle est disponible. Une consigne parfaite arrivée dix minutes trop tard est une consigne manquante.",
    },
    {
      type: "p",
      texte:
        "Le livret numérique ne remplace pas l’attention portée à vos voyageurs. Il la déplace : au lieu de répéter vingt fois la même chose, vous l’écrivez une fois, correctement, et vous gardez votre énergie pour ce qui mérite vraiment un message personnel.",
    },
    {
      type: "chiffres",
      items: [
        { valeur: "12", libelle: "rubriques couvrent l’essentiel des questions d’un séjour" },
        { valeur: "1 h", libelle: "pour écrire un livret complet, la première fois" },
        { valeur: "0", libelle: "application à installer côté voyageur" },
      ],
    },

    { type: "h2", id: "contenu", texte: "Ce qu’un livret d’accueil doit contenir" },
    {
      type: "p",
      texte:
        "Il existe une tentation, quand on écrit son premier livret : tout mettre. C’est une erreur. Un livret de quarante pages n’est pas lu, il est refermé. La bonne mesure tient en douze rubriques, ordonnées selon le déroulé réel d’un séjour — arriver, s’installer, vivre, partir.",
    },
    { type: "h3", texte: "Avant et pendant l’arrivée" },
    {
      type: "liste",
      items: [
        "**L’accès au logement** : l’adresse exacte, l’étage, la porte, le code de l’immeuble, l’emplacement de la boîte à clés — et une photo de la façade, qui vaut mieux qu’un paragraphe.",
        "**Le stationnement** : où se garer, à quel prix, la zone à éviter le jour du marché. C’est la première source de stress à l’arrivée en ville.",
        "**Les horaires** : heure d’arrivée possible, heure de départ, et ce qu’il faut faire si le train a du retard.",
        "**Le Wi-Fi** : le nom exact du réseau et le mot de passe, majuscules comprises. À rendre copiable d’un geste, jamais à recopier depuis une étiquette collée derrière un meuble.",
      ],
    },
    { type: "h3", texte: "Pendant le séjour" },
    {
      type: "liste",
      items: [
        "**Le mode d’emploi des équipements** : la plaque à induction qui ne s’allume pas, le lave-vaisselle et son programme, le chauffage, la télécommande de la climatisation. Une ligne par appareil suffit.",
        "**Les règles du logement** : ce qui est interdit et surtout *pourquoi*. « Pas de fête » se comprend mieux formulé en « les murs sont fins, les voisins travaillent tôt ».",
        "**Le tri et les poubelles** : le jour de la collecte, l’endroit exact du conteneur. Rubrique ingrate, très consultée.",
        "**Les bonnes adresses** : cinq à dix, pas trente. La boulangerie, l’épicerie ouverte le dimanche, deux restaurants, la pharmacie, le médecin.",
        "**Les transports** : la ligne de bus, l’arrêt le plus proche, le temps de marche jusqu’à la gare.",
      ],
    },
    { type: "h3", texte: "Le départ, et le reste" },
    {
      type: "liste",
      items: [
        "**Les consignes de départ** : ce qu’il faut faire du linge, de la vaisselle, des clés. Trois points, pas dix — une liste trop longue est appliquée à moitié.",
        "**Les contacts** : votre numéro, celui de la conciergerie, les urgences (15, 18) et le 112, que composeront naturellement vos voyageurs étrangers.",
        "**Les informations locales** : marché du mercredi, fête du village, horaires de la déchèterie. Ce qui rend le séjour meilleur sans qu’on ait eu à le demander.",
      ],
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Le test des trente secondes",
      texte:
        "Ouvrez votre livret sur votre téléphone et cherchez le code du portail. Si vous mettez plus de trente secondes, votre voyageur, lui, vous enverra un message. C’est le seul test qui compte.",
    },

    { type: "h2", id: "formats", texte: "Papier, PDF, page web : ce qui change vraiment" },
    {
      type: "p",
      texte:
        "Les trois formats coexistent dans la vraie vie, et chacun résout un problème différent. Le tableau ci-dessous ne cherche pas à désigner un vainqueur universel : il montre où chacun casse.",
    },
    {
      type: "tableau",
      legende: "Comparaison des formats de livret d’accueil",
      colonnes: ["Critère", "Classeur papier", "PDF envoyé", "Page web dédiée"],
      colonneMiseEnAvant: 3,
      lignes: [
        ["Disponible avant l’arrivée", "Non", "Oui", "Oui"],
        ["Disponible devant la porte", "Non", "Si le PDF est retrouvé", "Oui, par le QR code"],
        ["Mise à jour d’une information", "Réimpression", "Fichier à renvoyer", "Immédiate"],
        ["Lisible sur téléphone", "Sans objet", "Zoom obligatoire", "Conçu pour"],
        ["Traduction pour un voyageur étranger", "Non", "Version à refaire", "Automatique"],
        ["Numéro cliquable, itinéraire, plan", "Non", "Rarement", "Oui"],
        ["Résiste au café renversé", "Non", "Oui", "Oui"],
      ],
    },
    {
      type: "p",
      texte:
        "Le PDF paraît être un bon compromis. Il en a l’air jusqu’au premier changement : chaque correction impose de renvoyer le fichier à tout le monde, et les voyageurs qui ont déjà téléchargé l’ancienne version gardent l’ancienne version. C’est le format qui vieillit le plus mal, précisément parce qu’il donne l’illusion d’être à jour.",
    },
    {
      type: "p",
      texte:
        "Le tableau complet des solutions du marché — applications dédiées, modules de logiciels de gestion, tablettes en chambre — se trouve dans notre [comparatif des solutions de livret d’accueil](/blog/comparatif-livret-accueil-numerique#tableau).",
    },

    {
      type: "cta",
      titre: "Voir à quoi ressemble un livret terminé",
      texte:
        "Nos livrets de démonstration sont ouverts au public. Ce sont de vraies pages en ligne, pas des maquettes : ouvrez-les sur votre téléphone, c’est là qu’ils se jouent.",
      href: "/livrets-demo",
      libelle: "Ouvrir les livrets de démonstration",
      hrefSecondaire: "/#offres",
      libelleSecondaire: "Voir les formules",
    },

    { type: "h2", id: "methode", texte: "La méthode : votre livret en une heure" },
    {
      type: "p",
      texte:
        "La plupart des livrets ne sont jamais finis parce qu’ils sont commencés par le mauvais bout — la mise en page. Voici l’ordre qui fonctionne.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "Videz votre historique de messages",
          texte:
            "Remontez vos vingt dernières conversations avec des voyageurs et notez chaque question posée. Vous obtenez, sans effort d’imagination, la liste exacte de ce qui manque à votre accueil. C’est le seul vrai travail de la démarche.",
        },
        {
          titre: "Classez par moment, pas par thème",
          texte:
            "« Avant d’arriver », « en arrivant », « pendant », « en partant ». Un voyageur ne cherche jamais une catégorie, il cherche une réponse à l’instant où il en a besoin.",
        },
        {
          titre: "Écrivez court, en phrases entières",
          texte:
            "Une information par ligne. Pas de « merci de bien vouloir veiller à » : « fermez la vanne d’eau en partant » se lit en une seconde et s’applique.",
        },
        {
          titre: "Ajoutez les photos qui remplacent un paragraphe",
          texte:
            "La façade, la boîte à clés, le tableau électrique, le local à poubelles. Quatre photos économisent quatre échanges de messages.",
        },
        {
          titre: "Faites relire par quelqu’un qui ne connaît pas le logement",
          texte:
            "C’est l’étape que tout le monde saute, et celle qui révèle les évidences non écrites : le digicode qu’il faut valider par la touche dièse, la porte qui se pousse en tirant.",
        },
        {
          titre: "Rendez-le accessible depuis le logement",
          texte:
            "Un lien envoyé la veille se perd dans une conversation. Un support fixe, visible, avec un QR code, reste disponible tout le séjour — y compris pour le deuxième voyageur du groupe, celui à qui vous n’avez jamais écrit. Le choix du support est un sujet à part entière : [bois gravé, PVC, autocollant, ce que chacun tient vraiment](/blog/plaque-accueil-qr-code-materiaux#materiaux).",
        },
      ],
    },
    {
      type: "p",
      texte:
        "Ce dernier point est celui qu’on sous-estime le plus. Vous communiquez avec la personne qui a réservé ; les autres n’ont jamais vu vos messages. La méthode complète pour couper le volume d’échanges est détaillée dans [la méthode des douze questions](/blog/reduire-messages-voyageurs#douze-questions).",
    },

    { type: "h2", id: "erreurs", texte: "Les erreurs qui coûtent des messages" },
    {
      type: "opposition",
      titreOui: "Ce qui fonctionne",
      oui: [
        "Le mot de passe Wi-Fi copiable en un geste",
        "Une photo de la façade et de la boîte à clés",
        "Cinq bonnes adresses choisies, avec l’itinéraire",
        "Les consignes de départ en trois points",
        "Un numéro de téléphone cliquable",
        "Une page qui se traduit pour un voyageur étranger",
      ],
      titreNon: "Ce qui coûte du temps",
      non: [
        "Un PDF de trente pages envoyé la veille",
        "Le mot de passe écrit à la main sur un aimant",
        "Trente restaurants « tous très bien »",
        "Des règles rédigées comme un règlement de copropriété",
        "Une information juste, mais seulement à l’intérieur",
        "Un livret rédigé en français uniquement",
      ],
    },
    {
      type: "p",
      texte:
        "Il faut ajouter une erreur qui ne se voit pas dans un tableau : **le livret qu’on n’ose plus modifier**. Dès que la mise à jour coûte quelque chose — une réimpression, un mail au prestataire, une manipulation compliquée — elle n’est plus faite. Le livret se périme lentement, et l’on recommence à répondre à la main. Le vrai critère de choix d’un outil n’est pas ce qu’il permet de créer, c’est ce qu’il coûte de le corriger un mardi soir.",
    },

    { type: "h2", id: "cout", texte: "Combien ça coûte, réellement" },
    {
      type: "p",
      texte:
        "Un livret d’accueil se compare rarement à zéro : il se compare au temps que vous passez à répondre. Comptez cinq minutes par message, quatre messages évitables par séjour, quarante séjours par an — vous êtes à plus de treize heures par an consacrées à réécrire un code de portail.",
    },
    {
      type: "p",
      texte:
        "Côté dépense, il faut distinguer trois postes : le support physique qui rend le livret accessible dans le logement, l’hébergement de la page, et le droit de la modifier. Chez Guidz, [l’Essentiel est à 49 € en paiement unique](/#offres) et [le Confort à 69 € puis 1,99 €/mois ou 19 €/an](/#offres) — c’est la formule qui ouvre les modifications illimitées depuis votre espace. Au-delà de quelques logements, les [tarifs multi-biens](/devis?offre=multibien) se chiffrent au cas par cas. Le calcul complet, abonnements du marché compris, est détaillé dans [notre article sur le prix d’un livret d’accueil](/blog/prix-livret-accueil-numerique#trois-ans).",
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Un repère utile",
      texte:
        "Si votre livret vous fait gagner un seul message par séjour, il est amorti en une saison. S’il vous évite une nuit blanche à cause d’un voyageur bloqué devant une porte à 23 h, il l’est dès la première fois.",
    },

    {
      type: "cta",
      titre: "Composez le vôtre, sans engagement",
      texte:
        "L’éditeur se remplit sous vos yeux, avec un aperçu de téléphone à côté. Rien n’est publié tant que vous ne l’avez pas décidé.",
      href: "/commencer",
      libelle: "Créer mon livret",
      hrefSecondaire: "/#offres",
      libelleSecondaire: "Comparer les formules",
    },
  ],
  faq: [
    {
      question: "Qu’est-ce qu’un livret d’accueil numérique ?",
      reponse:
        "C’est la version en ligne du classeur d’accueil : une page web dédiée à un logement, qui rassemble le Wi-Fi, les codes d’accès, le mode d’emploi des équipements, les règles, les bonnes adresses et les contacts. Le voyageur y accède en scannant un QR code ou en ouvrant un lien, sans installer d’application.",
    },
    {
      question: "Que faut-il mettre dans un livret d’accueil de location saisonnière ?",
      reponse:
        "Douze rubriques couvrent l’essentiel : accès et codes, stationnement, horaires d’arrivée et de départ, Wi-Fi, mode d’emploi des équipements, règles du logement, tri et poubelles, bonnes adresses, transports, consignes de départ, contacts et urgences, informations locales. Au-delà, le livret devient trop long pour être lu.",
    },
    {
      question: "Un livret d’accueil est-il obligatoire ?",
      reponse:
        "Aucun texte n’impose de livret d’accueil pour une location saisonnière. Certaines informations doivent en revanche être portées à la connaissance du voyageur, comme le montant de la taxe de séjour et les consignes de sécurité. Le livret est l’endroit naturel où les regrouper.",
    },
    {
      question: "Faut-il garder un livret papier en plus ?",
      reponse:
        "Un support physique reste utile, mais son rôle change : il ne contient plus l’information, il y donne accès. Une plaque gravée avec un QR code assure la présence dans le logement, tandis que le contenu reste modifiable à tout moment sans rien réimprimer.",
    },
    {
      question: "Comment traduire son livret pour des voyageurs étrangers ?",
      reponse:
        "Traduire manuellement chaque version est ingérable dès la première mise à jour. Une page web peut se traduire dans la langue du visiteur : c’est le cas de la formule Confort de Guidz, où la page est multilingue sans travail supplémentaire de votre côté.",
    },
  ],
  connexes: [
    "comparatif-livret-accueil-numerique",
    "reduire-messages-voyageurs",
    "prix-livret-accueil-numerique",
  ],
};
