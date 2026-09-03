import type { Article } from "../types";

/**
 * L'article de comparaison.
 *
 * Il nomme des concurrents, ce qui impose deux règles que le texte tient de
 * bout en bout : aucun tarif tiers n'est cité — ils changent et une erreur
 * se retourne contre nous —, et la comparaison porte sur des critères que
 * le lecteur peut vérifier lui-même en dix minutes.
 *
 * L'article prend clairement parti pour Guidz. C'est assumé : c'est notre
 * site. Ce qui le rend crédible malgré tout, ce sont les deux sections qui
 * ne trichent pas — les objections traitées de front, et les cas où il faut
 * aller voir ailleurs. Sans elles, un lecteur qui compare vraiment ferme la
 * page à la troisième ligne.
 */
export const comparatifConcurrents: Article = {
  slug: "comparatif-livret-accueil-numerique",
  titre: "Quelle solution de livret d’accueil choisir ? Le comparatif complet",
  titreSeo:
    "Comparatif des solutions de livret d’accueil numérique : lequel choisir ?",
  description:
    "Touch Stay, Hostfully, Vousy, modules de PMS, tablettes, PDF Canva, Guidz : les cinq familles comparées sur des critères vérifiables, coût sur trois ans compris.",
  chapo:
    "Il existe cinq façons de faire un livret d’accueil, et elles ne résolvent pas le même problème. Certaines produisent une belle page que le voyageur n’ouvrira jamais. D’autres résolvent l’accès mais créent un parc de matériel à entretenir. Voici où chacune tient, où chacune casse, ce que chacune coûte réellement sur trois ans — et pourquoi nous pensons occuper la place la plus utile.",
  categorie: "Comparatif",
  motsCles: [
    "comparatif livret d'accueil numérique",
    "alternative Touch Stay",
    "alternative Hostfully",
    "meilleur livret d'accueil location",
    "logiciel livret accueil airbnb",
    "guide voyageur numérique comparatif",
    "livret accueil sans abonnement",
  ],
  datePublication: "2026-02-11",
  dateMaj: "2026-09-03",
  auteur: { nom: "L’équipe Guidz", role: "Accueil voyageur & hospitalité" },
  tempsLecture: 16,
  accent: "#2B5F75",
  accentPale: "#E4EEF3",
  accentSombre: "#1A3F52",
  motif: "grille",
  icone: "balance",
  vedette: true,
  aRetenir: [
    "La ligne de partage n’est pas la richesse de l’éditeur, mais la présence de l’information dans le logement : une solution qui ne livre qu’un lien laisse le plus dur à votre charge.",
    "Sur trois ans, un abonnement mensuel coûte plusieurs fois le prix d’un paiement unique — c’est le seul écart de prix vraiment structurel du marché.",
    "Un livret hébergé dans votre logiciel de réservation ne vous suit pas le jour où vous en changez.",
    "Guidz est la seule des cinq familles à livrer l’objet et la page ensemble, avec une formule sans aucun abonnement.",
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
        "Avant de comparer des noms, il faut comparer des natures. Un PDF fait sur Canva et une plateforme d’hospitality ne jouent pas au même jeu, et les opposer directement n’a pas de sens. Cinq familles se partagent le marché.",
    },
    {
      type: "liste",
      ordonnee: true,
      items: [
        "**Le fait-maison** : classeur imprimé, PDF composé sur Canva, page Notion ou Google Docs partagée par lien.",
        "**Les applications dédiées au livret d’accueil** : des outils comme Touch Stay, Hostfully ou Vousy, spécialisés dans le guide voyageur en ligne.",
        "**Les modules inclus dans un logiciel de gestion locative** (PMS) : Smoobu, Superhote, Lodgify, Beds24 proposent souvent un guide voyageur en complément du planning et du channel manager.",
        "**Les tablettes en chambre** : un écran posé dans le logement, avec une application maison — l’approche héritée de l’hôtellerie.",
        "**Le support gravé relié à une page web**, notre approche : un objet fixe dans le logement, un QR code permanent, une page modifiable derrière.",
      ],
    },
    {
      type: "encadre",
      ton: "info",
      titre: "Sur les tarifs des autres",
      texte:
        "Cet article ne cite aucun prix de concurrent. Ils évoluent, varient selon les paliers et les pays, et un chiffre faux ici deviendrait un argument malhonnête. Les critères comparés ci-dessous sont en revanche vérifiables en dix minutes sur les sites concernés — et le calcul de coût plus bas se fait avec **vos** chiffres, pas les nôtres.",
    },

    { type: "h2", id: "verdict", texte: "Le verdict, par profil" },
    {
      type: "p",
      texte:
        "Si vous ne lisez qu’un seul bloc de cet article, que ce soit celui-ci. Il dit ce que nous recommanderions à quelqu’un qui nous appellerait, y compris quand la réponse n’est pas nous.",
    },
    {
      type: "tableau",
      legende: "Ce que nous recommandons selon votre situation",
      colonnes: ["Votre situation", "Ce qui compte pour vous", "Notre recommandation"],
      colonneMiseEnAvant: 2,
      lignes: [
        [
          "1 à 3 logements, budget serré",
          "Ne pas payer d’abonnement à vie",
          "Guidz Essentiel — 49 € une fois, rien ensuite",
        ],
        [
          "1 à 10 logements, informations qui bougent",
          "Corriger soi-même, tout le temps",
          "Guidz Confort — modifications illimitées",
        ],
        [
          "Conciergerie, 10 logements et plus",
          "Dupliquer, harmoniser, mettre à jour en lot",
          "Guidz multi-biens, sur devis",
        ],
        [
          "Vous voulez un guide de 100 pages avec vidéos",
          "Profondeur éditoriale maximale",
          "Une plateforme spécialisée (Touch Stay, Hostfully)",
        ],
        [
          "Vous cherchez un planning et un channel manager",
          "La réservation, pas l’accueil",
          "Un PMS — puis Guidz par-dessus, pour le logement",
        ],
        [
          "Hôtel, résidence, room service, activités",
          "Une expérience complète et marquée",
          "Notre offre sur mesure, sur devis",
        ],
      ],
    },
    {
      type: "p",
      texte:
        "Quatre situations sur six nous désignent, et nous allons dire précisément pourquoi. Les deux autres sont traitées à la fin, dans [les cas où il faut aller voir ailleurs](#pas-pour-vous) — cette section n’est pas là pour faire joli.",
    },

    { type: "h2", id: "tableau", texte: "Le comparatif, en un tableau" },
    {
      type: "p",
      texte:
        "Dix critères suffisent à départager les cinq familles. Ce sont ceux qui, dans la vraie vie d’une saison, décident si le livret est lu ou pas.",
    },
    {
      type: "tableau",
      legende:
        "Les cinq familles comparées sur les critères qui décident de l’usage réel",
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
          "Accessible dans le logement, sans retrouver un lien",
          "Non",
          "Selon le support ajouté",
          "Non",
          "Oui",
          "Oui, plaque gravée à l’entrée",
        ],
        [
          "Atteint TOUT le groupe, pas seulement qui a réservé",
          "Non",
          "Selon le support ajouté",
          "Non",
          "Oui",
          "Oui",
        ],
        ["Mise à jour instantanée", "Non (PDF) / Oui (Notion)", "Oui", "Oui", "Oui", "Oui"],
        ["Rien à installer côté voyageur", "Oui", "Oui", "Oui", "Sans objet", "Oui"],
        ["Traduction automatique", "Non", "Souvent", "Variable", "Souvent", "Oui (Confort)"],
        [
          "Indépendant de votre canal de réservation",
          "Oui",
          "Oui",
          "Non",
          "Oui",
          "Oui",
        ],
        ["Matériel à charger, réparer, remplacer", "Non", "Non", "Non", "Oui", "Non"],
        [
          "Formule sans aucun abonnement",
          "Oui",
          "Rare",
          "Non",
          "Non",
          "Oui — Essentiel, 49 € une fois",
        ],
        [
          "Objet qu’on assume de laisser en évidence",
          "Non",
          "Non",
          "Non",
          "Discutable",
          "Bois gravé, fabriqué en France",
        ],
        [
          "Livrets clients tenus hors des moteurs de recherche",
          "À votre charge",
          "Variable",
          "Variable",
          "Sans objet",
          "Oui, par défaut",
        ],
      ],
    },
    {
      type: "p",
      texte:
        "Deux lignes méritent qu’on s’y arrête, parce qu’elles sont rarement mises en avant ailleurs. **Atteindre tout le groupe** : vous écrivez à une personne, les trois autres n’ont jamais vu vos messages — et ce sont souvent elles qui cherchent le Wi-Fi. Et **les livrets tenus hors des moteurs** : un livret contient un code de porte et un mot de passe. Chez nous, les pages des clients sont explicitement non indexables ; seules les démonstrations publiques le sont. Vous pouvez le vérifier vous-même dans le code source de n’importe quel livret.",
    },

    { type: "h2", id: "cout", texte: "Le coût sur trois ans, calculé avec vos chiffres" },
    {
      type: "p",
      texte:
        "C’est l’écart le plus structurel du marché, et le plus facile à ignorer au moment de choisir. La quasi-totalité des solutions dédiées fonctionne à l’abonnement, souvent par logement. Un abonnement ne se compare pas à un prix : il se compare à une durée.",
    },
    {
      type: "p",
      texte:
        "Le tableau ci-dessous n’attribue aucun tarif à personne. Il pose trois hypothèses d’abonnement mensuel — à vous d’y placer le prix réel de la solution que vous regardez — et les met en face de nos deux formules.",
    },
    {
      type: "tableau",
      legende:
        "Coût cumulé pour UN logement. Les trois premières colonnes sont des hypothèses, à remplacer par le tarif réel de la solution que vous comparez.",
      colonnes: [
        "Durée",
        "Abonnement 3 €/mois",
        "Abonnement 5 €/mois",
        "Abonnement 10 €/mois",
        "Guidz Essentiel",
        "Guidz Confort",
      ],
      colonneMiseEnAvant: 4,
      lignes: [
        ["1re année", "36 €", "60 €", "120 €", "49 € (tout compris)", "69 € + 19 €"],
        ["2 ans", "72 €", "120 €", "240 €", "49 €", "107 €"],
        ["3 ans", "108 €", "180 €", "360 €", "49 €", "126 €"],
        ["5 ans", "180 €", "300 €", "600 €", "49 €", "164 €"],
        ["Le support physique est-il inclus ?", "Non", "Non", "Non", "Oui", "Oui"],
      ],
    },
    {
      type: "p",
      texte:
        "Deux choses sautent aux yeux. La première : [notre formule Essentiel](/#offres) ne bouge jamais, parce qu’il n’y a rien à renouveler — 49 €, une fois, plaque comprise. La seconde : même notre formule avec abonnement reste sous les hypothèses basses du marché, parce que 1,99 €/mois — ou 19 € à l’année — a été fixé pour couvrir l’hébergement et les traductions, pas pour financer une équipe commerciale.",
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Le calcul qu’on oublie de faire",
      texte:
        "Multipliez la ligne « 3 ans » par votre nombre de logements. C’est le montant que vous engagez en signant, et c’est là que les écarts deviennent des milliers d’euros pour une conciergerie. Le détail poste par poste est dans notre article sur [le prix réel d’un livret d’accueil](/blog/prix-livret-accueil-numerique#trois-ans).",
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
        "Elles échouent sur deux points, toujours les mêmes. **La distribution** d’abord : un lien envoyé dans une conversation est mort le lendemain, enseveli sous les messages suivants — et jamais vu par les autres personnes du groupe. **La péremption** ensuite, pour le PDF : chaque correction impose un nouvel envoi, et les anciennes versions continuent de circuler.",
    },
    {
      type: "p",
      texte:
        "Notion s’en sort mieux sur la mise à jour, moins bien sur l’usage : ce n’est pas une interface pensée pour un voyageur pressé sur un téléphone, et l’adresse partagée n’inspire pas la même confiance qu’une page dédiée à votre logement. C’est un très bon brouillon de livret. Rarement un bon livret.",
    },
    {
      type: "opposition",
      titreOui: "Ce que le fait-maison fait bien",
      oui: [
        "Coût nul, maîtrise totale du contenu",
        "Aucune dépendance à un prestataire",
        "Parfait pour rédiger le brouillon",
      ],
      titreNon: "Ce qu’il ne réglera jamais",
      non: [
        "Être trouvable depuis le logement, sans lien",
        "Atteindre les voyageurs qui n’ont pas réservé",
        "Rester juste après un changement de box",
        "Se traduire pour un voyageur étranger",
      ],
    },

    {
      type: "h2",
      id: "applications",
      texte: "Les applications dédiées : puissantes, mais elles s’arrêtent au lien",
    },
    {
      type: "p",
      texte:
        "Les plateformes spécialisées — **Touch Stay**, **Hostfully**, **Vousy** et quelques autres — font très bien ce pour quoi elles sont faites : des guides riches, multilingues, structurés, avec des modèles réutilisables d’un logement à l’autre. Si vous cherchez la profondeur fonctionnelle maximale sur le contenu, c’est cette famille qu’il faut regarder, et nous le disons sans détour.",
    },
    {
      type: "p",
      texte:
        "Leur angle mort est physique. Ces outils produisent un lien ; ce qui met ce lien devant les yeux du voyageur reste à votre charge. Beaucoup d’hôtes finissent par imprimer un QR code sur une feuille A4 scotchée au frigo — ce qui règle le problème, et annule d’un coup le soin apporté au reste de l’accueil. La question à poser à ces solutions n’est pas « que sait faire l’éditeur ? », mais « **par quel objet mon voyageur y arrive-t-il ?** »",
    },
    {
      type: "citation",
      texte:
        "Un livret extraordinaire que personne n’ouvre vaut moins qu’un livret correct qu’on trouve en trois secondes.",
    },
    {
      type: "p",
      texte:
        "S’ajoute la question du modèle économique : ces plateformes sont des abonnements, souvent par logement, souvent en dollars. Reportez-vous [au calcul sur trois ans](#cout) avant de signer — c’est là que la différence se joue, pas sur la liste de fonctionnalités.",
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
        "Deux réserves. La première est la **dépendance** : votre livret vit dans un outil choisi pour son planning et son channel manager. Le jour où vous changez de logiciel — ce qui arrive plus souvent qu’on ne le croit —, le livret ne suit pas, et tout est à ressaisir. La seconde tient au niveau de soin : le guide n’est pas le cœur du produit, et cela se voit. Ce sont des modules honnêtes, rarement remarquables.",
    },
    {
      type: "p",
      texte:
        "Il y a un troisième point, moins évident : un livret rattaché à une réservation ne s’adresse qu’à cette réservation. Le locataire de longue durée, l’artisan qui vient réparer un volet, la femme de ménage qui remplace au pied levé n’ont pas de réservation — et pourtant ils cherchent les mêmes informations. Un support fixe dans le logement les sert tous.",
    },
    {
      type: "encadre",
      ton: "astuce",
      titre: "Les deux ne s’excluent pas",
      texte:
        "Rien n’empêche de garder votre PMS pour la réservation et d’installer Guidz dans le logement. Nous ne remplaçons ni votre planning ni votre channel manager : nous occupons l’espace que ces outils ne couvrent pas, celui de l’intérieur du logement. C’est d’ailleurs la configuration la plus fréquente chez nos utilisateurs multi-biens.",
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
        "Le coût réel apparaît ensuite. Il faut la charger, la mettre à jour, la nettoyer, la ressortir du tiroir où le voyageur précédent l’a rangée, la remplacer quand elle tombe, gérer sa disparition. Multipliez par le nombre de logements et vous avez créé un parc informatique. Ajoutez-y qu’un écran générique dans un mas provençal ou un chalet vieillit très mal — et l’essentiel du sujet, en location courte durée, c’est justement l’impression laissée.",
    },
    {
      type: "chiffres",
      items: [
        { valeur: "0 W", libelle: "consommation d’une plaque gravée" },
        { valeur: "0", libelle: "mise à jour à faire dans le logement" },
        { valeur: "1", libelle: "objet, qui ne se range pas dans un tiroir" },
      ],
    },

    { type: "h2", id: "guidz", texte: "Ce que nous faisons, et que les autres ne font pas" },
    {
      type: "p",
      texte:
        "Notre parti pris tient en une phrase : **le contenu doit vivre en ligne, l’accès doit vivre dans le logement**. Toutes les autres familles renoncent à l’une des deux moitiés. Voici les six points sur lesquels nous sommes seuls, ou presque.",
    },
    {
      type: "etapes",
      items: [
        {
          titre: "L’objet et la page sont livrés ensemble",
          texte:
            "Vous ne recevez pas un lien à imprimer : vous recevez une plaque en bois gravée et découpée au laser, fabriquée en France, avec votre QR code dessus. Aucune application dédiée ne livre l’objet ; aucun fabricant de plaques ne livre la page.",
        },
        {
          titre: "Une formule sans le moindre abonnement",
          texte:
            "L’Essentiel est un paiement unique de 49 €. Pas de reconduction, pas de carte à mettre à jour, pas de page qui s’éteint si un prélèvement échoue. C’est rare sur ce marché, et c’est un choix : un livret d’accueil n’a pas de raison structurelle d’être une rente.",
        },
        {
          titre: "Le QR code ne change jamais",
          texte:
            "Réécrivez tout votre contenu, changez de box, déplacez vos bonnes adresses : le code gravé reste valable. La plaque n’est jamais à refaire, et vous ne dépendez d’aucun service de redirection qui pourrait fermer.",
        },
        {
          titre: "Indépendant de votre canal de réservation",
          texte:
            "Airbnb, Booking, Abritel, réservation directe, ou les quatre à la fois : cela ne nous regarde pas, et c’est précisément l’intérêt. Le sujet est développé dans notre guide sur [l’accueil multi-plateformes](/blog/airbnb-booking-reservation-directe-accueil).",
        },
        {
          titre: "Les livrets des clients restent hors des moteurs",
          texte:
            "Une page qui contient un code de porte et un mot de passe Wi-Fi n’a rien à faire dans Google. Nos livrets clients sont non indexables par défaut ; seules les démonstrations publiques sont référencées. Peu de solutions le disent, et c’est vérifiable en trois clics.",
        },
        {
          titre: "Vous pouvez juger sur pièces avant de payer",
          texte:
            "Nos livrets de démonstration sont de vraies pages publiées, ouvertes à tous, sans inscription ni période d’essai à résilier. Ouvrez-les sur votre téléphone et comparez avec ce que produisent les autres solutions.",
        },
      ],
    },
    {
      type: "p",
      texte:
        "Sur le tarif, nous sommes volontairement lisibles : [l’Essentiel à 49 €, en paiement unique](/#offres) ; [le Confort à 69 € puis 1,99 €/mois ou 19 €/an](/#offres), qui ouvre les modifications illimitées, les photos, les bonnes adresses, le livre d’or et la traduction automatique. Les deux formules sont détaillées ligne à ligne sur la page d’accueil, et le comparatif s’ouvre en un clic.",
    },
    {
      type: "cta",
      titre: "Jugez sur pièces, pas sur promesse",
      texte:
        "Nos livrets de démonstration sont de vraies pages publiées. C’est le test le plus rapide et le plus honnête : ouvrez-en un sur votre téléphone, puis ouvrez celui d’un concurrent.",
      href: "/livrets-demo",
      libelle: "Voir les livrets de démonstration",
      hrefSecondaire: "/#offres",
      libelleSecondaire: "Voir les tarifs",
    },

    { type: "h2", id: "questions", texte: "Les sept questions à poser à n’importe quelle solution" },
    {
      type: "p",
      texte:
        "Utilisez cette liste face à n’importe quel commercial, y compris nous. Nos réponses sont dans la colonne de droite — comparez-les à celles que vous obtiendrez ailleurs.",
    },
    {
      type: "tableau",
      legende: "Les sept questions, et nos réponses",
      colonnes: ["La question à poser", "Notre réponse"],
      colonneMiseEnAvant: 1,
      lignes: [
        [
          "Par quel objet mon voyageur accède-t-il au livret ?",
          "Une plaque en bois gravée, fournie, posée à l’entrée",
        ],
        [
          "Combien cela me coûte-t-il sur trois ans ?",
          "49 € en Essentiel. 126 € en Confort, plaque comprise",
        ],
        [
          "Que se passe-t-il si j’arrête de payer ?",
          "En Essentiel, rien : il n’y a rien à payer ensuite",
        ],
        [
          "Le support est-il à refaire si je change une information ?",
          "Jamais. Le QR code désigne une adresse fixe",
        ],
        [
          "Mes codes de porte peuvent-ils finir dans Google ?",
          "Non. Les livrets clients sont non indexables par défaut",
        ],
        [
          "Suis-je lié à mon logiciel de réservation ?",
          "Non. Aucun lien avec votre canal ou votre PMS",
        ],
        [
          "Puis-je voir un vrai livret avant d’acheter ?",
          "Oui, publiquement, sans inscription",
        ],
      ],
    },

    { type: "h2", id: "objections", texte: "« Oui, mais… » — les cinq objections qu’on nous fait" },
    {
      type: "p",
      texte:
        "Autant les traiter ici plutôt que de vous laisser les découvrir seul.",
    },
    { type: "h3", texte: "« Une plaque, ça fait un objet de plus dans le logement. »" },
    {
      type: "p",
      texte:
        "C’est vrai, et c’est le principe. La vraie question est de savoir si cet objet est beau. Une feuille A4 plastifiée sur un frigo est un objet de plus, elle aussi — en moins réussi. Le bois gravé, lui, se pose à côté d’un cadre sans jurer, et plusieurs de nos utilisateurs le photographient dans leur annonce.",
    },
    { type: "h3", texte: "« 1,99 €/mois, c’est encore un abonnement. »" },
    {
      type: "p",
      texte:
        "Sur le Confort, oui, et il finance l’hébergement, les traductions et les modifications illimitées. Si le principe même vous dérange, prenez l’Essentiel : 49 €, une fois, et plus rien. Nous sommes l’une des rares solutions à laisser ce choix ouvert plutôt qu’à l’imposer.",
    },
    { type: "h3", texte: "« Et si Guidz ferme ? »" },
    {
      type: "p",
      texte:
        "Question légitime, rarement posée aux autres. Vos contenus vous appartiennent et restent exportables ; la plaque, elle, garde sa valeur d’objet. C’est d’ailleurs un argument contre les QR dynamiques passant par un raccourcisseur tiers : dans ce cas-là, la fermeture d’un service tue tous les supports imprimés d’un coup. [Notre guide du QR code](/blog/qr-code-location-saisonniere#statique-dynamique) explique pourquoi nous ne fonctionnons pas ainsi.",
    },
    { type: "h3", texte: "« Mon PMS le fait déjà. »" },
    {
      type: "p",
      texte:
        "Alors gardez-le pour ce qu’il fait bien, et regardez ce qu’il ne fait pas : être présent dans le logement, atteindre les voyageurs qui n’ont pas réservé, survivre à un changement de logiciel. Nous cohabitons très bien avec un PMS ; c’est même la configuration la plus fréquente.",
    },
    { type: "h3", texte: "« Mes voyageurs ne scannent pas les QR codes. »" },
    {
      type: "p",
      texte:
        "Neuf fois sur dix, c’est un problème de placement, pas de public : un code posé dans une chambre du fond, trop bas, ou sans légende disant ce qu’il y a derrière. Le tableau des emplacements, pièce par pièce, est [dans notre guide dédié](/blog/qr-code-location-saisonniere#placement).",
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
        "Dans tous les autres cas — un à cinquante logements en location courte durée, un accueil qu’on veut soigné, des informations qui bougent d’une saison à l’autre — nous pensons que le couple objet + page offre le meilleur rapport entre ce qu’il coûte et ce qu’il évite. Si vous gérez un parc, les [conditions multi-biens](/devis?offre=multibien) et la méthode d’industrialisation sont détaillées dans notre [guide pour conciergeries](/blog/conciergerie-accueil-plusieurs-logements#socle).",
    },
    {
      type: "cta",
      titre: "Le plus simple reste de commencer",
      texte:
        "Composez votre livret dans l’éditeur, avec l’aperçu du téléphone à côté. Rien n’est publié tant que vous ne l’avez pas décidé, et rien n’est prélevé avant.",
      href: "/commencer",
      libelle: "Créer mon livret",
      hrefSecondaire: "/devis?offre=multibien",
      libelleSecondaire: "Demander un devis multi-biens",
    },
  ],
  faq: [
    {
      question: "Quelle est la meilleure solution de livret d’accueil numérique ?",
      reponse:
        "Cela dépend de ce qui vous manque. Si votre problème est la richesse du contenu, les plateformes spécialisées comme Touch Stay ou Hostfully vont très loin. Si votre problème est que le livret n’est jamais consulté, c’est la distribution qu’il faut corriger : un support fixe dans le logement avec un QR code permanent, comme le propose Guidz, résout ce point que les solutions purement logicielles laissent à votre charge.",
    },
    {
      question: "Existe-t-il un livret d’accueil numérique sans abonnement ?",
      reponse:
        "Oui, mais c’est rare : la plupart des solutions du marché fonctionnent par abonnement mensuel, souvent par logement. La formule Essentiel de Guidz est un paiement unique de 49 €, plaque gravée comprise, sans reconduction ni frais récurrents.",
    },
    {
      question: "Existe-t-il une alternative française à Touch Stay ou Hostfully ?",
      reponse:
        "Oui. Plusieurs solutions françaises existent, dont Vousy côté application pure et Guidz côté support gravé relié à une page web. La différence principale avec les plateformes anglo-saxonnes tient moins aux fonctionnalités qu’à la manière dont le voyageur accède au livret une fois sur place, et au modèle de prix.",
    },
    {
      question: "Le livret inclus dans mon PMS suffit-il ?",
      reponse:
        "Il suffit si vos voyageurs l’ouvrent. Trois points sont à vérifier : la qualité de lecture sur téléphone, la portabilité — un livret hébergé dans un logiciel de gestion ne vous suit pas si vous changez de logiciel —, et le fait qu’un livret rattaché à une réservation n’atteint ni les autres voyageurs du groupe, ni vos prestataires.",
    },
    {
      question: "Combien coûte un livret d’accueil numérique sur trois ans ?",
      reponse:
        "Avec un abonnement à 5 €/mois, comptez 180 € par logement sur trois ans, hors support physique. Chez Guidz, la formule Essentiel revient à 49 € une fois pour toutes, plaque comprise, et la formule Confort à 126 € sur trois ans avec les modifications illimitées.",
    },
    {
      question: "Une tablette en chambre est-elle une meilleure idée ?",
      reponse:
        "Elle règle la question de l’accessibilité, mais crée un parc matériel à charger, mettre à jour et remplacer. Sur un ou deux logements haut de gamme, elle se défend. Au-delà, le coût d’exploitation dépasse largement celui d’un support passif avec QR code.",
    },
    {
      question: "Les livrets d’accueil sont-ils visibles sur Google ?",
      reponse:
        "Cela dépend de la solution, et c’est un point à vérifier : un livret contient des codes d’accès et un mot de passe Wi-Fi. Chez Guidz, les livrets des clients sont non indexables par défaut ; seuls les livrets de démonstration publics sont référencés.",
    },
  ],
  connexes: [
    "prix-livret-accueil-numerique",
    "plaque-accueil-qr-code-materiaux",
    "conciergerie-accueil-plusieurs-logements",
  ],
};
