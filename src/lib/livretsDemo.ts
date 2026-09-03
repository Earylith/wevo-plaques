/**
 * Les livrets de démonstration ouverts au public.
 *
 * Partagés entre la page d'accueil, qui n'en montre qu'une sélection, et la
 * page qui les rassemble tous. Une seule source : deux listes finiraient par
 * diverger, et le visiteur verrait des vitrines différentes selon l'endroit
 * où il clique.
 *
 * Le résumé de chaque carte reprend le message d'accueil du livret : elle
 * doit annoncer ce que le visiteur trouvera derrière le lien. Les repères
 * restent thématiques, sans chiffres — le contenu vit dans Firestore, et un
 * décompte figé ici finirait par mentir.
 */

export type FormuleDemo = "Confort" | "Essentielle";

export interface LivretDemo {
  slug: string;
  /** Adresse d'ouverture, quand elle ne suit pas `/<slug>`. */
  href?: string;
  ville: string;
  nom: string;
  type: string;
  resume: string;
  /**
   * Photo de couverture — Confort uniquement.
   *
   * L'Essentielle n'a pas de photo : sa page n'en affiche aucune. En mettre
   * une sur la vignette promettrait ce que la formule ne livre pas.
   */
  image?: string;
  /** Nom de l'icône, résolu à l'affichage. */
  icone: "immeuble" | "montagne" | "soleil" | "vagues";
  accent: string;
  accentPale: string;
  reperes: string;
  formule: FormuleDemo;
  /** Mis en avant sur la page d'accueil. */
  vedette?: boolean;
}

export const LIVRETS_DEMO: LivretDemo[] = [
  {
    slug: "demo-paris",
    ville: "Paris 9e",
    nom: "Le Loft Haussmannien",
    type: "Appartement d'exception",
    resume:
      "Moulures, parquet point de Hongrie et balcon filant, entre l'Opéra Garnier et les Grands Boulevards.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=75",
    icone: "immeuble",
    accent: "#2B5F75",
    accentPale: "#E4EEF3",
    reperes: "Métro & transports · Bonnes adresses",
    formule: "Confort",
    vedette: true,
  },
  {
    slug: "demo-confort2",
    ville: "Les Goudes",
    nom: "Le Cabanon des Goudes",
    type: "Maison de pêcheur",
    resume:
      "Au bout de la route, à l'entrée des calanques : sentiers, navette maritime et le bus 20 toutes les 40 minutes.",
    image:
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=900&q=75",
    icone: "soleil",
    accent: "#C4714A",
    accentPale: "#F7EBE4",
    reperes: "Sentiers & navette · Codes d'accès",
    formule: "Confort",
    vedette: true,
  },
  {
    slug: "demo-essentielle",
    href: "/demo-essentielle",
    ville: "Lourmarin",
    nom: "Le Clos des Oliviers",
    type: "Maison de village",
    resume:
      "L'essentiel, bien rangé : arrivée, Wi-Fi, règlement et contacts, sur une page qui tient dans un écran.",
    icone: "soleil",
    accent: "#5A7A4E",
    accentPale: "#EBF0E6",
    reperes: "Arrivée & départ · Codes d'accès",
    formule: "Essentielle",
    vedette: true,
  },
  {
    slug: "demo-essentielle-2",
    href: "/h/demo-essentielle-2",
    ville: "Lyon 1er",
    nom: "Le Studio des Canuts",
    type: "Studio à la Croix-Rousse",
    resume:
      "Un studio de ville, avec ses codes d'immeuble et ses consignes de départ. Rien de plus, rien de moins.",
    icone: "immeuble",
    accent: "#2B5F75",
    accentPale: "#E4EEF3",
    reperes: "Boîte à clés · Règles de l'immeuble",
    formule: "Essentielle",
    vedette: true,
  },
  {
    slug: "demo-biarritz",
    ville: "Biarritz",
    nom: "La Villa Bleue Ocean",
    type: "Villa en bord de mer",
    resume:
      "Surplombant la Côte des Basques, jardin suspendu et spots de surf à trois minutes à pied.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=75",
    icone: "vagues",
    accent: "#4A849E",
    accentPale: "#E4EEF3",
    reperes: "Local à planches · Options sur place",
    formule: "Confort",
  },
  {
    slug: "demo-chamonix",
    ville: "Chamonix",
    nom: "Le Chalet Altitude 2000",
    type: "Chalet & spa montagne",
    resume:
      "Vue sur la chaîne du Mont-Blanc, sauna privatif et ski room chauffé pour rentrer les skis au sec.",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=75",
    icone: "montagne",
    accent: "#5A7A4E",
    accentPale: "#EBF0E6",
    reperes: "Ski room & garage · Consignes d'hiver",
    formule: "Confort",
  },
];

/**
 * La sélection de la page d'accueil.
 *
 * Quatre, soit une rangée pleine sur ordinateur et deux sur téléphone. Six
 * laissaient une carte seule sur une deuxième rangée, et faisaient défiler
 * longtemps sur mobile. Deux de chaque formule : le visiteur doit voir les
 * deux produits, pas seulement le plus cher.
 */
export const LIVRETS_VEDETTE = LIVRETS_DEMO.filter((l) => l.vedette);

/**
 * Une vitrine garnie du contenu réel de son livret.
 *
 * La photo et le nom viennent de la base ; la couleur, l'icône et les repères
 * restent curatés ici. Déclaré avec les données et non avec la lecture
 * serveur : les composants d'affichage en ont besoin, et ils sont clients.
 */
export interface VitrineGarnie extends LivretDemo {
  /**
   * Mot d'accueil, affiché sur les vignettes Essentielles.
   *
   * Sans photo, la carte était trop nue pour donner envie. Le mot d'accueil
   * est ce que le voyageur lira en ouvrant le livret : la vignette annonce
   * donc exactement ce qu'il trouvera.
   */
  accueil?: string;
}
