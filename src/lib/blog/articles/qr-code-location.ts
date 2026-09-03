import type { Article } from "../types";

/**
 * L'article technique du groupe.
 *
 * Il attrape les recherches pratiques (« QR code wifi », « QR statique ou
 * dynamique ») et les ramène vers le pilier et vers les formules.
 */
export const qrCodeLocation: Article = {
  slug: "qr-code-location-saisonniere",
  titre: "QR code dans une location : où le placer, comment le faire scanner",
  titreSeo:
    "QR code pour location saisonnière : placement, Wi-Fi et erreurs à éviter",
  description:
    "Statique ou dynamique, où le poser dans le logement, comment partager le Wi-Fi en un scan : le mode d’emploi du QR code en location courte durée.",
  chapo:
    "Le QR code est passé du gadget au réflexe : on scanne une carte au restaurant sans y penser. En location saisonnière, il règle un problème précis — mettre la bonne information à portée de main au moment exact où elle manque. Encore faut-il choisir le bon type de code, et surtout le poser au bon endroit.",
  categorie: "Pratique",
  motsCles: [
    "qr code location saisonnière",
    "qr code airbnb",
    "qr code wifi location",
    "plaque qr code logement",
    "qr code statique ou dynamique",
    "partager wifi qr code",
  ],
  datePublication: "2026-03-05",
  dateMaj: "2026-08-26",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 9,
  accent: "#5A7A4E",
  accentPale: "#EBF0E6",
  accentSombre: "#3F5836",
  motif: "cercles",
  icone: "qr",
  aRetenir: [
    "Un QR code imprimé ne se corrige pas : ce qu’il doit contenir, c’est une adresse stable, jamais une information.",
    "L’entrée et la cuisine captent l’essentiel des scans. Le reste est du confort.",
    "Un QR Wi-Fi connecte, mais ne montre rien d’autre : préférez une page qui contient aussi le mot de passe.",
    "Un code trop petit, trop clair ou posé trop bas ne sera pas scanné — la géométrie compte autant que le contenu.",
  ],
  blocs: [
    { type: "h2", id: "principe", texte: "Ce qu’un QR code fait, et ce qu’il ne fait pas" },
    {
      type: "p",
      texte:
        "Un QR code n’est rien d’autre qu’un texte écrit en carrés noirs. Ce texte peut être une adresse web, un mot de passe Wi-Fi, un numéro de téléphone. Le téléphone le lit et propose l’action correspondante. Il n’y a ni intelligence, ni connexion, ni suivi dans le carré lui-même : tout se joue dans ce qu’on a décidé d’y inscrire.",
    },
    {
      type: "p",
      texte:
        "D’où la règle la plus importante de cet article : **on n’inscrit jamais une information dans un QR code imprimé, on y inscrit une adresse**. Le mot de passe du Wi-Fi changera. L’heure de départ changera. L’adresse de votre page, elle, peut rester la même pendant dix ans, et c’est la page qui change derrière.",
    },
    {
      type: "encadre",
      ton: "alerte",
      titre: "L’erreur qui oblige à tout refaire",
      texte:
        "Graver un QR code contenant directement le mot de passe Wi-Fi condamne le support le jour où vous changez de box. Le même support, pointant vers une page, survit à tous les changements — c’est exactement pour cette raison que le QR code d’une plaque Guidz ne bouge jamais, quoi que vous modifiiez dans votre livret. Le choix du support lui-même est traité à part : [bois, plexiglas, PVC ou autocollant](/blog/plaque-accueil-qr-code-materiaux#materiaux).",
    },

    { type: "h2", id: "statique-dynamique", texte: "Statique ou dynamique : la vraie différence" },
    {
      type: "p",
      texte:
        "Un **QR statique** encode directement sa destination. Une fois imprimé, il est définitif. Un **QR dynamique** encode une adresse de redirection : le carré reste identique, mais on peut changer la page d’arrivée à tout moment — et compter les scans au passage. La contrepartie est la dépendance : si le service de redirection ferme ou si l’abonnement s’arrête, tous vos codes imprimés meurent en même temps.",
    },
    {
      type: "tableau",
      legende: "QR statique, QR dynamique et page dédiée",
      colonnes: ["Critère", "QR statique brut", "QR dynamique (raccourcisseur)", "QR vers page dédiée"],
      colonneMiseEnAvant: 3,
      lignes: [
        ["Destination modifiable", "Non", "Oui", "Inutile : le contenu change, pas l’adresse"],
        ["Dépend d’un service tiers", "Non", "Oui", "Non, l’adresse est la vôtre"],
        ["Statistiques de scan", "Non", "Oui", "Oui, côté page"],
        ["Survit à l’arrêt d’un abonnement", "Oui", "Non", "La page reste, le support aussi"],
        ["Adresse lisible par un humain", "Selon", "Non", "Oui, on peut la taper à la main"],
      ],
    },
    {
      type: "p",
      texte:
        "La bonne configuration est souvent la troisième, et elle est sous-estimée : un code statique qui pointe vers **une adresse propre et permanente**, chez vous. Vous n’avez alors ni redirection à payer, ni service tiers à surveiller, et l’adresse reste lisible — un voyageur dont le téléphone refuse de scanner peut la recopier.",
    },

    { type: "h2", id: "placement", texte: "Où le placer, pièce par pièce" },
    {
      type: "p",
      texte:
        "Le placement décide de tout. Un code parfait posé dans un couloir sombre à hauteur de genou ne sera jamais scanné. Voici l’ordre de priorité, établi par le moment où le voyageur a besoin d’aide.",
    },
    {
      type: "tableau",
      legende: "Emplacements par ordre d’efficacité",
      colonnes: ["Emplacement", "Le moment qu’il couvre", "Priorité"],
      colonneMiseEnAvant: 2,
      lignes: [
        ["Entrée, à hauteur de regard", "Les cinq premières minutes : Wi-Fi, chauffage, consignes", "Indispensable"],
        ["Cuisine, près du plan de travail", "Le mode d’emploi des appareils, le tri", "Indispensable"],
        ["Salon, table basse ou meuble TV", "Les bonnes adresses, la soirée, la météo", "Recommandé"],
        ["Chambre, table de chevet", "Le départ, l’heure de restitution des clés", "Utile"],
        ["Extérieur, boîte à clés ou local", "L’arrivée tardive, quand personne ne répond", "Selon le logement"],
      ],
    },
    {
      type: "p",
      texte:
        "Deux emplacements suffisent dans un studio, trois dans un T3, quatre dans une maison. Au-delà, on ne gagne plus rien : le voyageur a compris qu’il existe une page, il l’a mise en favori ou l’a laissée ouverte dans un onglet.",
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "La hauteur qui marche",
      texte:
        "Entre 1,30 m et 1,60 m du sol, sur un mur dégagé, sans reflet direct d’une fenêtre ou d’un spot. Un téléphone scanne à environ trente centimètres : un code de cinq centimètres de côté est un minimum confortable, huit centimètres est idéal.",
    },

    { type: "h2", id: "wifi", texte: "Le cas particulier du Wi-Fi" },
    {
      type: "p",
      texte:
        "Le QR code Wi-Fi existe depuis longtemps : il encode le nom du réseau et le mot de passe dans un format que le téléphone reconnaît, et propose la connexion en un geste. C’est séduisant, et cela a trois défauts que l’on découvre à l’usage.",
    },
    {
      type: "liste",
      items: [
        "Il **ne montre rien d’autre** : le voyageur est connecté, mais toujours sans réponse sur le chauffage ou l’heure de départ.",
        "Il **contient le mot de passe en clair** : n’importe qui de passage peut le lire depuis le trottoir si le code est visible d’une fenêtre.",
        "Il **meurt au changement de box**, et il faut réimprimer.",
      ],
    },
    {
      type: "p",
      texte:
        "La formule qui règle les trois : un code unique vers votre page, où le mot de passe est affiché en gros, copiable d’un geste — et où se trouve aussi tout le reste. Le voyageur fait un scan au lieu de deux, et vous ne réimprimez plus jamais rien. C’est ce que fait la [page d’un livret Guidz](/livrets-demo), quelle que soit la formule.",
    },

    { type: "h2", id: "erreurs", texte: "Les six erreurs qu’on voit le plus souvent" },
    {
      type: "etapes",
      items: [
        {
          titre: "Le code sans légende",
          texte:
            "Un carré noir seul, sans un mot pour dire ce qu’il y a derrière, se scanne beaucoup moins. Écrivez à côté ce qu’on va y trouver : « Wi-Fi, consignes et bonnes adresses ».",
        },
        {
          titre: "Le contraste insuffisant",
          texte:
            "Un code clair sur fond clair, ou en couleur pâle, met le téléphone en difficulté. Le noir sur clair reste imbattable — et une gravure profonde vaut mieux qu’une impression délavée par le soleil.",
        },
        {
          titre: "Le code sous plastique brillant",
          texte:
            "Un film glacé renvoie la lumière du plafonnier exactement là où l’appareil photo cherche à lire. Préférez une surface mate.",
        },
        {
          titre: "L’adresse imprononçable",
          texte:
            "Si le scan échoue, on tape l’adresse. Une suite de caractères aléatoires est alors inutilisable. Une adresse courte et lisible est un filet de sécurité.",
        },
        {
          titre: "Le code posé trop tard dans le parcours",
          texte:
            "Dans la chambre du fond, il ne sert plus : les questions urgentes se posent à l’entrée. Commencez toujours par l’entrée.",
        },
        {
          titre: "Le code jamais testé après installation",
          texte:
            "Testez-le sur place, avec deux téléphones différents, dans les conditions réelles d’éclairage du soir. C’est deux minutes, et cela évite une saison de scans ratés.",
        },
      ],
    },

    {
      type: "cta",
      titre: "Un QR code gravé, une page qui change",
      texte:
        "La plaque est fabriquée en France, gravée au laser, avec votre QR code unique. Le contenu de la page derrière reste modifiable — sans jamais toucher au support.",
      href: "/#offres",
      libelle: "Voir les formules et les tarifs",
      hrefSecondaire: "/livrets-demo",
      libelleSecondaire: "Ouvrir une démonstration",
    },

    { type: "h2", id: "mesurer", texte: "Mesurer ce qui est réellement scanné" },
    {
      type: "p",
      texte:
        "Un livret sans mesure est une intuition. Regarder le nombre de consultations par séjour répond à des questions concrètes : le code est-il bien placé ? Les voyageurs reviennent-ils sur la page pendant le séjour, ou seulement le premier jour ? Une rubrique est-elle systématiquement ouverte, signe qu’elle mériterait d’être plus claire ?",
    },
    {
      type: "p",
      texte:
        "Les statistiques de consultation sont incluses dans les deux formules Guidz, dans l’[espace propriétaire](/proprietaire/dashboard). Le bon réflexe est de les regarder après cinq séjours : en dessous, les chiffres racontent surtout du hasard.",
    },
    {
      type: "p",
      texte:
        "Si le taux de scan vous paraît faible, le problème est presque toujours le placement, jamais le voyageur. Reprenez [le tableau des emplacements](#placement) et déplacez le support à l’entrée avant d’en tirer une conclusion. Pour la suite — quelles réponses mettre derrière ce code —, tout est dans notre [guide du livret d’accueil](/blog/livret-accueil-numerique-location-saisonniere#contenu).",
    },
  ],
  faq: [
    {
      question: "Un QR code peut-il expirer ?",
      reponse:
        "Le carré lui-même n’expire jamais : c’est un texte imprimé. Ce qui peut disparaître, c’est la page qu’il désigne, ou le service de redirection si vous utilisez un QR dynamique. C’est pourquoi un code pointant vers une adresse permanente est plus sûr qu’un code passant par un raccourcisseur.",
    },
    {
      question: "Faut-il un QR code statique ou dynamique pour une location ?",
      reponse:
        "Un code statique pointant vers une page dédiée est le meilleur compromis : rien à renouveler, aucune dépendance à un service tiers, et le contenu reste modifiable puisqu’il vit sur la page et non dans le code.",
    },
    {
      question: "Comment partager le Wi-Fi par QR code ?",
      reponse:
        "Un QR Wi-Fi encode le nom du réseau et le mot de passe, et connecte en un geste. Il devient inutilisable dès que vous changez de box, et n’affiche aucune autre information. Un code unique vers une page qui contient le mot de passe copiable et le reste du livret évite ces deux limites.",
    },
    {
      question: "Où placer le QR code dans un logement ?",
      reponse:
        "À l’entrée en priorité, à hauteur de regard, entre 1,30 m et 1,60 m du sol, sur un mur dégagé et sans reflet. La cuisine vient ensuite. Deux à quatre emplacements suffisent selon la taille du logement.",
    },
    {
      question: "Le QR code change-t-il si je modifie mon livret ?",
      reponse:
        "Non. Le QR code d’une plaque Guidz désigne une adresse fixe. Vous pouvez réécrire l’intégralité du contenu de la page, changer de Wi-Fi ou de bonnes adresses : le support reste valable et n’est jamais à refaire.",
    },
  ],
  connexes: [
    "livret-accueil-numerique-location-saisonniere",
    "reduire-messages-voyageurs",
    "plaque-accueil-qr-code-materiaux",
  ],
};
