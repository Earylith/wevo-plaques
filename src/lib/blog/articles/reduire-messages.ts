import type { Article } from "../types";

/**
 * L'article « douleur ».
 *
 * Il part du symptôme que l'hôte ressent — le téléphone qui sonne — et non
 * du produit. C'est celui qui convertit le mieux, à condition de donner la
 * méthode complète avant de proposer quoi que ce soit.
 */
export const reduireMessages: Article = {
  slug: "reduire-messages-voyageurs",
  titre: "Diviser par deux les messages de vos voyageurs : la méthode des douze questions",
  titreSeo:
    "Réduire les messages des voyageurs : la méthode des douze questions",
  description:
    "Douze questions représentent l’essentiel des messages reçus pendant un séjour. Voici lesquelles, où placer la réponse, et le modèle de message d’arrivée qui coupe le reste.",
  chapo:
    "Personne ne loue un logement pour devenir standardiste. Pourtant, la plupart des hôtes passent plusieurs heures par mois à répondre aux mêmes questions, souvent aux mêmes heures — 17 h, 22 h, et le dimanche matin. La bonne nouvelle est que ce volume est presque entièrement prévisible, donc évitable.",
  categorie: "Organisation",
  motsCles: [
    "réduire messages voyageurs airbnb",
    "questions fréquentes voyageurs location",
    "message arrivée airbnb modèle",
    "automatiser accueil location",
    "gagner du temps location saisonnière",
  ],
  datePublication: "2026-04-08",
  dateMaj: "2026-08-26",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 10,
  accent: "#D4A34A",
  accentPale: "#FDF3DC",
  accentSombre: "#A87B2C",
  motif: "collines",
  icone: "messages",
  vedette: true,
  aRetenir: [
    "Douze questions concentrent la grande majorité des messages reçus pendant un séjour.",
    "Une réponse n’a de valeur qu’au moment où elle est cherchée : avant, pendant, ou sur le pas de la porte.",
    "Vous écrivez à la personne qui a réservé ; les autres voyageurs du groupe n’ont jamais lu vos messages.",
    "Le bon indicateur n’est pas « ai-je répondu vite ? » mais « la question a-t-elle été posée ? ».",
  ],
  blocs: [
    { type: "h2", id: "cout", texte: "Le coût réel d’un message" },
    {
      type: "p",
      texte:
        "Un message ne coûte pas trente secondes. Il coûte l’interruption, la recherche de l’information, la rédaction, la relecture, et le moment où l’on repense à la conversation deux heures plus tard. Les études sur le travail interrompu situent le retour à la concentration bien au-delà de la durée de l’interruption elle-même : pour un message d’hôte, cinq minutes est une estimation prudente.",
    },
    {
      type: "chiffres",
      items: [
        { valeur: "4", libelle: "messages évitables par séjour, en moyenne observée" },
        { valeur: "5 min", libelle: "coût réel d’un message, interruption comprise" },
        { valeur: "13 h", libelle: "par an, pour quarante séjours" },
      ],
    },
    {
      type: "p",
      texte:
        "Treize heures, c’est deux jours de travail passés à réécrire un code de portail. Et ce n’est pas le pire : le pire, c’est le message de 23 h d’un voyageur bloqué dehors, qui coûte une soirée et, souvent, une étoile.",
    },

    { type: "h2", id: "douze-questions", texte: "Les douze questions qui font le volume" },
    {
      type: "p",
      texte:
        "Reprenez vos vingt dernières conversations. Vous retrouverez ces douze-là, dans cet ordre ou presque. Chacune a un moment propre — et c’est ce moment, plus que la réponse, qui détermine où l’écrire.",
    },
    {
      type: "tableau",
      legende: "Les douze questions récurrentes et l’endroit où la réponse doit vivre",
      colonnes: ["La question", "Quand elle arrive", "Où placer la réponse"],
      colonneMiseEnAvant: 2,
      lignes: [
        ["« C’est quoi le code du portail ? »", "Devant la porte", "Livret, accessible sans lien"],
        ["« Où est la boîte à clés ? »", "Devant la porte", "Livret, avec une photo"],
        ["« Où puis-je me garer ? »", "En route", "Livret + message de la veille"],
        ["« Le mot de passe du Wi-Fi ? »", "Cinq minutes après l’arrivée", "Livret, copiable en un geste"],
        ["« Comment marche la plaque / le four ? »", "Le premier soir", "Livret, rubrique équipements"],
        ["« Comment allumer le chauffage ? »", "Le premier soir", "Livret, avec photo du thermostat"],
        ["« Où sont les poubelles, quel jour ? »", "Jour 2", "Livret, rubrique tri"],
        ["« Un bon restaurant à côté ? »", "Jour 1 et 2", "Livret, bonnes adresses"],
        ["« Comment aller à la plage / au centre ? »", "Jour 1", "Livret, transports et itinéraires"],
        ["« On peut arriver plus tôt ? »", "La veille", "Message automatique + livret"],
        ["« À quelle heure doit-on partir ? »", "L’avant-dernier soir", "Livret, consignes de départ"],
        ["« Qu’est-ce qu’on fait des clés ? »", "Le matin du départ", "Livret, consignes de départ"],
      ],
    },
    {
      type: "p",
      texte:
        "Neuf de ces douze réponses vivent au même endroit : dans le logement, disponibles à tout moment, sans qu’on ait à retrouver un lien. C’est précisément ce que règle un support fixe avec QR code — le sujet est traité en détail dans notre [guide du placement du QR code](/blog/qr-code-location-saisonniere#placement).",
    },

    { type: "h2", id: "trois-moments", texte: "Trois moments, trois canaux" },
    {
      type: "p",
      texte:
        "L’erreur classique consiste à tout mettre dans le message de bienvenue. C’est généreux et parfaitement inefficace : un pavé de vingt lignes envoyé à J-1 n’est pas lu, et surtout, il n’est plus retrouvable à J+2.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "Avant l’arrivée — le message court",
          texte:
            "Trois informations, pas plus : l’adresse exacte, comment entrer, et le lien vers le livret. Tout le reste attend. Ce message doit tenir sur un écran de téléphone sans faire défiler.",
        },
        {
          titre: "Pendant le séjour — le livret dans le logement",
          texte:
            "C’est le canal principal, et le seul qui fonctionne sans vous. Il doit être accessible depuis un objet visible, pas depuis un lien enfoui dans une conversation. Il sert à tout le groupe, pas seulement à celui qui a réservé.",
        },
        {
          titre: "Après — la relance courte",
          texte:
            "Un message la veille du départ rappelant l’essentiel : heure, clés, linge. Deux lignes, envoyées à 18 h plutôt qu’à 8 h le matin même, quand tout le monde est déjà en train de plier bagage.",
        },
      ],
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Le voyageur invisible",
      texte:
        "Sur une réservation à quatre, vous n’écrivez qu’à une personne. Les trois autres n’ont jamais vu vos messages — et ce sont souvent eux qui cherchent le Wi-Fi ou le code des poubelles. Un livret présent dans le logement est le seul canal qui les atteint.",
    },

    { type: "h2", id: "modele", texte: "Le modèle de message d’arrivée qui fonctionne" },
    {
      type: "p",
      texte:
        "Voici une trame éprouvée, à envoyer la veille en fin d’après-midi. Elle tient volontairement en six lignes.",
    },
    {
      type: "citation",
      texte:
        "Bonjour {Prénom}, votre logement vous attend demain à partir de 16 h. L’adresse exacte : {adresse}, {étage / porte}. Pour entrer : {code ou boîte à clés, en une phrase}. Tout le reste — Wi-Fi, équipements, bonnes adresses, départ — est sur votre livret : {lien}. Une plaque avec le QR code est aussi à l’entrée, vous le retrouverez à tout moment. Bonne route, et à demain.",
      source: "Trame de message d’arrivée",
    },
    {
      type: "opposition",
      titreOui: "Ce que ce message fait",
      oui: [
        "Il donne les deux seules informations urgentes",
        "Il annonce le livret et sa présence physique",
        "Il se lit en dix secondes sur un quai de gare",
        "Il évite la question du « on entre comment ? »",
      ],
      titreNon: "Ce qu’il évite",
      non: [
        "Vingt lignes de consignes qui ne seront pas lues",
        "Un PDF joint que personne n’ouvrira",
        "Le mot de passe Wi-Fi noyé au milieu du texte",
        "Un lien qu’il faudra retrouver trois jours plus tard",
      ],
    },

    {
      type: "cta",
      titre: "Écrire les réponses une fois pour toutes",
      texte:
        "Ouvrez un livret de démonstration : vous y verrez comment ces douze réponses se rangent pour être trouvées en trois secondes, sur un téléphone.",
      href: "/livrets-demo",
      libelle: "Voir un livret complet",
      hrefSecondaire: "/#offres",
      libelleSecondaire: "Voir les formules",
    },

    { type: "h2", id: "mesurer", texte: "Mesurer, puis corriger" },
    {
      type: "p",
      texte:
        "Une fois le livret en place, tenez un décompte simple pendant dix séjours : une ligne par question reçue. Deux enseignements en sortent toujours.",
    },
    {
      type: "liste",
      items: [
        "**Les questions qui restent** signalent une information absente du livret, ou mal nommée. Une question posée trois fois est une rubrique à réécrire, pas un voyageur distrait.",
        "**Les questions qui disparaissent** vous disent où placer votre attention ensuite : ce temps libéré vaut mieux investi dans la qualité du logement que dans la vitesse de réponse.",
      ],
    },
    {
      type: "p",
      texte:
        "L’objectif n’est pas zéro message — un voyageur qui écrit pour dire merci ou demander un conseil, c’est très bien. L’objectif est zéro message **évitable**. La différence entre les deux est exactement ce qui sépare un hôte débordé d’un hôte disponible.",
    },
    {
      type: "p",
      texte:
        "Et ce temps rendu ne se voit pas que dans votre agenda : il se retrouve dans les évaluations. C’est l’objet de notre article sur [ce qui se joue dans les dix premières minutes d’un séjour](/blog/avis-5-etoiles-accueil-voyageur#dix-minutes).",
    },
  ],
  faq: [
    {
      question: "Comment réduire le nombre de messages de mes voyageurs ?",
      reponse:
        "En identifiant les douze questions récurrentes d’un séjour et en plaçant chaque réponse là où elle est cherchée : un message court avant l’arrivée pour l’adresse et l’entrée, un livret accessible dans le logement pour tout le reste, une relance de deux lignes la veille du départ.",
    },
    {
      question: "Faut-il tout mettre dans le message de bienvenue ?",
      reponse:
        "Non. Un long message n’est pas lu et devient introuvable dès le lendemain. Trois informations suffisent : l’adresse exacte, comment entrer, et le lien vers le livret. Le reste doit vivre dans le livret, consultable à tout moment.",
    },
    {
      question: "Combien de temps un hôte passe-t-il à répondre aux messages ?",
      reponse:
        "En comptant l’interruption, un message coûte environ cinq minutes. À raison de quatre messages évitables par séjour et quarante séjours par an, cela représente plus de treize heures annuelles consacrées à des réponses répétitives.",
    },
    {
      question: "Les réponses automatiques suffisent-elles ?",
      reponse:
        "Elles aident avant l’arrivée, mais ne couvrent pas le séjour : elles s’adressent à une seule personne du groupe et restent enfouies dans une conversation. Un livret présent dans le logement reste consultable par tout le monde, tout le temps.",
    },
  ],
  connexes: [
    "livret-accueil-numerique-location-saisonniere",
    "avis-5-etoiles-accueil-voyageur",
    "airbnb-booking-reservation-directe-accueil",
  ],
};
