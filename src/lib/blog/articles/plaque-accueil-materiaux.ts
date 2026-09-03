import type { Article } from "../types";

/**
 * L'article produit.
 *
 * Il attrape une recherche très concrète — « quelle plaque QR pour ma
 * location » — et c'est celui où notre avantage est le plus factuel : nous
 * sommes les seuls du comparatif à livrer l'objet. La comparaison des
 * matériaux reste néanmoins vraie pour qui choisirait autre chose ; c'est
 * ce qui lui donne le droit d'exister.
 */
export const plaqueAccueilMateriaux: Article = {
  slug: "plaque-accueil-qr-code-materiaux",
  titre: "Plaque d’accueil avec QR code : bois, plexiglas, PVC ou autocollant ?",
  titreSeo:
    "Plaque d’accueil avec QR code : quel matériau choisir pour sa location ?",
  description:
    "Bois gravé, plexiglas, PVC, vinyle, papier plastifié : ce que chaque matériau tient vraiment, comment dimensionner le QR code et où le fixer sans tout refaire.",
  chapo:
    "Un livret d’accueil en ligne ne vaut que par l’objet qui y mène. C’est cet objet que votre voyageur voit en entrant, qu’il photographie parfois, et qui décide s’il scanne ou s’il vous écrit. Le choix du matériau n’est donc pas une question de décoration : c’est ce qui détermine si votre accueil tient trois semaines ou dix ans.",
  categorie: "Le support",
  motsCles: [
    "plaque accueil location saisonnière",
    "plaque qr code bois",
    "support qr code airbnb",
    "panneau wifi location",
    "plaque gravée laser location",
    "plaque accueil personnalisée",
  ],
  datePublication: "2026-09-03",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 10,
  accent: "#5C3D2E",
  accentPale: "#F2EBE4",
  accentSombre: "#41291D",
  motif: "briques",
  icone: "plaque",
  vedette: true,
  aRetenir: [
    "Un support imprimé pâlit au soleil en une saison ; une gravure ne peut pas s’effacer, puisqu’elle est creusée dans la matière.",
    "Le QR code doit mesurer au moins 5 cm de côté, 8 cm idéalement, sur une surface mate.",
    "Le pire matériau n’est pas le moins cher : c’est celui qu’on n’ose pas laisser en évidence.",
    "Un support ne devrait jamais contenir une information — seulement une adresse qui, elle, ne change pas.",
  ],
  blocs: [
    { type: "h2", id: "pourquoi", texte: "Pourquoi le lien ne suffit jamais" },
    {
      type: "p",
      texte:
        "Beaucoup d’hôtes créent un livret en ligne très correct, envoient le lien la veille de l’arrivée, et concluent que « les voyageurs ne le lisent pas ». Le contenu n’est presque jamais en cause. Ce qui manque, c’est un objet.",
    },
    {
      type: "p",
      texte:
        "Trois situations, très banales, le montrent. Le voyageur cherche le code du chauffage le troisième soir : le message de la veille de l’arrivée est enterré sous quarante autres. Un ami du groupe cherche le Wi-Fi : il n’a jamais reçu vos messages, puisqu’il n’a pas réservé. La femme de ménage remplace au pied levé : elle n’a ni réservation, ni conversation, ni lien.",
    },
    {
      type: "citation",
      texte:
        "Un lien s’adresse à une personne, une fois. Un objet posé dans l’entrée s’adresse à tout le monde, tout le temps.",
    },
    {
      type: "p",
      texte:
        "C’est la raison d’être du support physique — et pourquoi son choix mérite mieux qu’une impression de dernière minute. Le reste du raisonnement, familles de solutions comprises, est dans notre [comparatif des solutions de livret d’accueil](/blog/comparatif-livret-accueil-numerique#tableau).",
    },

    { type: "h2", id: "materiaux", texte: "Les six matériaux, comparés" },
    {
      type: "p",
      texte:
        "Le tableau ci-dessous compare ce qui compte vraiment dans un logement loué : la tenue dans le temps, la lisibilité du code par un téléphone, et l’effet produit sur quelqu’un qui découvre les lieux.",
    },
    {
      type: "tableau",
      legende: "Les matériaux de support d’accueil, comparés à l’usage réel",
      colonnes: [
        "Matériau",
        "Tenue dans le temps",
        "Lisibilité du QR",
        "Effet produit",
        "Verdict",
      ],
      colonneMiseEnAvant: 4,
      lignes: [
        [
          "Papier plastifié",
          "Une saison, se corne et jaunit",
          "Bonne, si le film est mat",
          "Provisoire, assumé",
          "Dépannage seulement",
        ],
        [
          "Autocollant vinyle",
          "1 à 2 ans, se décolle avec l’humidité",
          "Bonne au début, pâlit au soleil",
          "Discret, un peu commercial",
          "Bon complément, mauvais principal",
        ],
        [
          "PVC / Dibond imprimé",
          "Plusieurs années, résiste bien",
          "Bonne, sauf finition brillante",
          "Signalétique, plutôt froid",
          "Solide, sans charme",
        ],
        [
          "Plexiglas gravé",
          "Très longue, mais se raye",
          "Variable : les reflets gênent",
          "Contemporain, un peu clinique",
          "Beau en vitrine, moyen en logement",
        ],
        [
          "Métal gravé",
          "Excellente",
          "Bonne si finition brossée mate",
          "Haut de gamme, froid",
          "Cher, très bien en immeuble",
        ],
        [
          "Bois gravé au laser",
          "Décennies, ne se décolore pas",
          "Excellente : mat, fort contraste",
          "Chaleureux, s’intègre partout",
          "Le meilleur compromis en location",
        ],
      ],
    },
    {
      type: "p",
      texte:
        "Une précision utile : les colonnes « tenue » et « lisibilité » ne dépendent pas seulement du matériau, mais de la **technique**. Un bois imprimé pâlit comme n’importe quelle impression. C’est la gravure qui change tout, et c’est le sujet de la section suivante.",
    },

    { type: "h2", id: "gravure", texte: "Gravure ou impression : la différence qui dure" },
    {
      type: "p",
      texte:
        "Une impression dépose de l’encre **sur** une surface. Une gravure laser retire de la matière : le motif n’est pas posé, il est creusé. La conséquence est simple et définitive — une gravure ne peut pas s’effacer, se rayer partiellement ou pâlir, parce qu’il n’y a rien à retirer.",
    },
    {
      type: "opposition",
      titreOui: "Ce que la gravure garantit",
      oui: [
        "Un contraste stable, même plein sud",
        "Aucune encre à écailler ou à laver",
        "Un relief qui accroche la lumière rasante",
        "Une finition mate, idéale pour le scan",
      ],
      titreNon: "Ce que l’impression finit par faire",
      non: [
        "Pâlir derrière une fenêtre en quelques mois",
        "S’effacer au produit ménager",
        "Renvoyer le plafonnier dans l’objectif",
        "Faire échouer un scan sur un code délavé",
      ],
    },
    {
      type: "encadre",
      ton: "alerte",
      titre: "Le scan qui échoue en fin de saison",
      texte:
        "C’est la panne la plus fréquente et la plus invisible : le code fonctionne en avril, il ne fonctionne plus en septembre. Personne ne vous le signale — le voyageur vous écrit simplement pour demander le Wi-Fi, et vous ne faites pas le lien. Un support gravé supprime purement et simplement ce mode de défaillance.",
    },
    {
      type: "p",
      texte:
        "C’est le raisonnement qui nous a fait choisir le bois gravé et découpé au laser, fabriqué en France, pour toutes nos plaques — [Essentiel comme Confort](/#offres). Le Confort ajoute votre phrase de signature, gravée elle aussi.",
    },

    { type: "h2", id: "dimensions", texte: "Taille, contraste, fixation : les règles qui marchent" },
    {
      type: "p",
      texte:
        "Un support raté l’est presque toujours pour une raison géométrique, jamais esthétique. Quatre règles suffisent.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "Un QR code d’au moins 5 cm de côté",
          texte:
            "Un téléphone scanne confortablement à une trentaine de centimètres. En dessous de 5 cm, il faut s’approcher et viser ; à 8 cm, le scan est immédiat, y compris pour quelqu’un qui tient une valise de l’autre main.",
        },
        {
          titre: "Une surface mate, jamais brillante",
          texte:
            "Un vernis glacé renvoie le plafonnier exactement là où l’appareil photo cherche à lire. C’est la première cause de scan raté le soir, quand l’éclairage devient ponctuel.",
        },
        {
          titre: "Une légende à côté du code",
          texte:
            "Un carré noir seul se scanne beaucoup moins qu’un carré accompagné d’une phrase. « Wi-Fi, consignes et bonnes adresses » suffit : on scanne ce dont on connaît la récompense.",
        },
        {
          titre: "Une pose entre 1,30 m et 1,60 m",
          texte:
            "À hauteur de regard, sur un mur dégagé, sans contre-jour de fenêtre. Le détail pièce par pièce est dans [notre guide du placement](/blog/qr-code-location-saisonniere#placement).",
        },
      ],
    },
    {
      type: "chiffres",
      items: [
        { valeur: "8 cm", libelle: "taille idéale du QR code gravé" },
        { valeur: "1,45 m", libelle: "hauteur de pose la plus confortable" },
        { valeur: "2", libelle: "supports suffisent dans un studio" },
      ],
    },

    { type: "h2", id: "adresse", texte: "Ce qu’on grave, et ce qu’on ne grave jamais" },
    {
      type: "p",
      texte:
        "C’est la règle la plus importante de cet article, et celle qu’on découvre trop tard : **un support ne doit jamais contenir une information**. Il doit contenir une adresse.",
    },
    {
      type: "p",
      texte:
        "Gravez le mot de passe du Wi-Fi et la plaque devient fausse le jour où vous changez de box. Gravez l’heure de départ et elle devient fausse à la première évolution de vos conditions. Gravez une adresse web stable, et la même plaque reste juste après dix ans de changements, parce que c’est la page derrière qui bouge.",
    },
    {
      type: "opposition",
      titreOui: "À graver",
      oui: [
        "Le QR code vers une adresse permanente",
        "L’adresse en toutes lettres, lisible et courte",
        "Le nom du logement",
        "Une phrase d’accueil qui vous ressemble",
      ],
      titreNon: "À ne jamais graver",
      non: [
        "Le mot de passe du Wi-Fi",
        "Le code du portail ou du digicode",
        "Les horaires d’arrivée et de départ",
        "Un numéro de téléphone susceptible de changer",
      ],
    },
    {
      type: "p",
      texte:
        "L’adresse en clair mérite une mention particulière : c’est votre filet de sécurité. Si un téléphone refuse de scanner — appareil photo capricieux, écran cassé, code sali —, le voyageur peut la recopier. Encore faut-il qu’elle soit lisible : une suite de caractères aléatoires est inutilisable.",
    },

    {
      type: "cta",
      titre: "Une plaque gravée, une page qui change",
      texte:
        "Bois gravé et découpé au laser, fabriqué en France, avec votre QR code unique. Derrière : votre livret, modifiable sans jamais toucher au support.",
      href: "/#offres",
      libelle: "Voir les formules et les tarifs",
      hrefSecondaire: "/livrets-demo",
      libelleSecondaire: "Ouvrir un livret de démonstration",
    },

    { type: "h2", id: "erreurs", texte: "Cinq erreurs qu’on voit toutes les semaines" },
    {
      type: "liste",
      ordonnee: true,
      items: [
        "**La feuille A4 scotchée au frigo.** Elle fonctionne, et elle défait en une seconde l’impression laissée par un logement soigné. C’est le seul élément d’un accueil qui coûte peu et se voit beaucoup.",
        "**Le support posé dans la chambre du fond.** Les questions urgentes se posent à l’entrée. Un code placé après le moment où l’on en a besoin ne sert plus à rien.",
        "**Le code imprimé en couleur pâle sur fond crème.** Joli sur l’écran du logiciel de mise en page, illisible pour un appareil photo dans une entrée peu éclairée.",
        "**Le support jamais testé sur place.** Deux téléphones différents, le soir, dans les conditions réelles d’éclairage : deux minutes qui évitent une saison de scans ratés.",
        "**Le support qui redirige vers un raccourcisseur de liens.** Le jour où le service tiers ferme ou expire, tous vos supports imprimés meurent en même temps. Le sujet est développé dans [notre guide du QR code](/blog/qr-code-location-saisonniere#statique-dynamique).",
      ],
    },

    { type: "h2", id: "notre-choix", texte: "Notre choix, et ce qu’il vous coûte" },
    {
      type: "p",
      texte:
        "Nous fabriquons en France des plaques en bois, gravées et découpées au laser. Ce n’est ni le matériau le moins cher, ni le plus technique : c’est celui qui coche les trois cases en même temps — il dure, il se scanne bien, et on l’assume dans un salon.",
    },
    {
      type: "liste",
      items: [
        "**Formule Essentiel, 49 €** en paiement unique : la plaque gravée avec son QR code, et la page d’accueil qui va avec. Aucun abonnement.",
        "**Formule Confort, 69 €** puis 1,99 €/mois ou 19 €/an : la même plaque avec votre phrase de signature gravée, et une page que vous modifiez en illimité.",
        "**Plusieurs logements** : plaques harmonisées et conditions dégressives, [sur devis](/devis?offre=multibien).",
      ],
    },
    {
      type: "p",
      texte:
        "Le détail du calcul, abonnements du marché compris, est dans notre article sur [le prix réel d’un livret d’accueil](/blog/prix-livret-accueil-numerique). Et si vous hésitez encore entre les familles de solutions, [le comparatif](/blog/comparatif-livret-accueil-numerique#verdict) donne notre recommandation par profil, y compris quand ce n’est pas nous.",
    },
  ],
  faq: [
    {
      question: "Quel matériau choisir pour une plaque d’accueil avec QR code ?",
      reponse:
        "Le bois gravé au laser offre le meilleur compromis en location saisonnière : il dure des décennies, sa finition mate se scanne très bien et il s’intègre dans un intérieur sans faire signalétique. Le PVC et le métal durent aussi, mais rendent un effet plus froid ; le papier plastifié et l’autocollant ne tiennent qu’une saison ou deux.",
    },
    {
      question: "Quelle taille doit faire un QR code sur une plaque ?",
      reponse:
        "Au moins 5 cm de côté, 8 cm idéalement. Un téléphone scanne confortablement à une trentaine de centimètres : en dessous de 5 cm, il faut s’approcher et viser, ce qui décourage les voyageurs chargés ou pressés.",
    },
    {
      question: "Faut-il graver le mot de passe du Wi-Fi sur la plaque ?",
      reponse:
        "Non. Une information gravée devient fausse au premier changement, et condamne le support. Il faut graver une adresse stable : c’est la page derrière qui porte le mot de passe, et elle se modifie sans toucher à la plaque.",
    },
    {
      question: "Une gravure laser est-elle plus durable qu’une impression ?",
      reponse:
        "Oui, et la différence est structurelle : une impression dépose de l’encre sur la surface, une gravure retire de la matière. Une gravure ne peut donc ni pâlir au soleil, ni s’effacer au produit ménager, ce qui arrive couramment aux supports imprimés au bout d’une saison.",
    },
    {
      question: "Combien de plaques faut-il par logement ?",
      reponse:
        "Deux suffisent dans un studio — entrée et cuisine —, trois dans un T3, quatre dans une maison. Au-delà, on ne gagne plus rien : le voyageur a compris qu’une page existe et l’a gardée ouverte ou mise en favori.",
    },
  ],
  connexes: [
    "qr-code-location-saisonniere",
    "comparatif-livret-accueil-numerique",
    "prix-livret-accueil-numerique",
  ],
};
