/**
 * Le modèle de contenu des articles.
 *
 * Les articles ne sont pas du HTML libre : ce sont des blocs typés, rendus
 * par un composant unique. Deux raisons. La première est visuelle — un
 * encadré ou un tableau se dessine partout de la même façon, et un article
 * écrit dans six mois ressemblera aux six premiers. La seconde est le
 * référencement : un titre de niveau 2 porte une ancre stable, une FAQ
 * devient un balisage `FAQPage`, et rien de tout cela ne dépend de la
 * discipline de celui qui rédige.
 *
 * Le texte accepte un balisage minimal, décrit dans `TexteRiche` :
 * `**gras**`, `*italique*` et `[libellé](/lien)`. Volontairement pauvre —
 * ce qui n'est pas exprimable ici doit devenir un bloc.
 */

export type Bloc =
  /** Paragraphe courant. */
  | { type: "p"; texte: string }
  /** Titre de section. `id` sert d'ancre : il est public et ne doit plus changer. */
  | { type: "h2"; texte: string; id: string }
  /** Sous-titre à l'intérieur d'une section. */
  | { type: "h3"; texte: string }
  /** Liste à puces, ou numérotée si `ordonnee`. */
  | { type: "liste"; items: string[]; ordonnee?: boolean }
  /** Phrase mise en exergue, éventuellement attribuée. */
  | { type: "citation"; texte: string; source?: string }
  /** Aparté encadré. Le ton choisit la couleur et l'icône. */
  | { type: "encadre"; ton: "info" | "astuce" | "alerte"; titre: string; texte: string }
  /**
   * Tableau comparatif.
   *
   * `colonneMiseEnAvant` est l'index (à partir de 0) de la colonne à teinter.
   * Sur téléphone le tableau défile horizontalement plutôt que de se tasser.
   */
  | {
      type: "tableau";
      legende?: string;
      colonnes: string[];
      lignes: string[][];
      colonneMiseEnAvant?: number;
    }
  /** Marche à suivre, numérotée automatiquement. */
  | { type: "etapes"; items: { titre: string; texte: string }[] }
  /** Bandeau de repères chiffrés. */
  | { type: "chiffres"; items: { valeur: string; libelle: string }[] }
  /** Deux colonnes opposées : ce qui marche, ce qui ne marche pas. */
  | { type: "opposition"; titreOui: string; oui: string[]; titreNon: string; non: string[] }
  /**
   * Appel à l'action au fil du texte.
   *
   * C'est le principal maillage interne de l'article : il pointe vers les
   * formules, les livrets de démonstration ou le devis, et il est écrit pour
   * l'endroit précis où il apparaît.
   */
  | {
      type: "cta";
      titre: string;
      texte: string;
      href: string;
      libelle: string;
      hrefSecondaire?: string;
      libelleSecondaire?: string;
    };

export interface QuestionReponse {
  question: string;
  reponse: string;
}

export interface Article {
  /** Segment d'URL, sous `/blog/`. Public : il ne doit plus changer. */
  slug: string;
  /** Titre affiché en haut de l'article (H1). */
  titre: string;
  /** Titre de l'onglet et du résultat de recherche, si différent du H1. */
  titreSeo?: string;
  /** Méta-description : 150 à 160 signes, écrite pour être cliquée. */
  description: string;
  /** Chapô : le paragraphe d'attaque, sous le titre. */
  chapo: string;
  categorie: string;
  motsCles: string[];
  /** Dates ISO. `dateMaj` alimente `dateModified` et la mention « mis à jour ». */
  datePublication: string;
  dateMaj?: string;
  auteur: { nom: string; role: string };
  /** Minutes de lecture, arrondies. */
  tempsLecture: number;
  /** Couleur d'accent de l'article : couverture, ancres, filets. */
  accent: string;
  accentPale: string;
  accentSombre: string;
  /** Motif de la couverture générée. Aucune photo : rien à charger, rien à casser. */
  motif:
    | "arches"
    | "vagues"
    | "grille"
    | "rayons"
    | "collines"
    | "cercles"
    | "chevrons"
    | "briques"
    | "eventail";
  /** Nom d'icône, résolu à l'affichage. */
  icone:
    | "livre"
    | "balance"
    | "qr"
    | "messages"
    | "etoile"
    | "immeubles"
    | "plaque"
    | "prix"
    | "canaux";
  /** Article épinglé en tête de la page d'index. */
  vedette?: boolean;
  /** Les points à retenir, affichés avant le corps et repris en fin d'article. */
  aRetenir: string[];
  blocs: Bloc[];
  /** Questions fréquentes, balisées en `FAQPage` pour les résultats enrichis. */
  faq: QuestionReponse[];
  /** Slugs des articles suggérés en fin de lecture. */
  connexes: string[];
}
