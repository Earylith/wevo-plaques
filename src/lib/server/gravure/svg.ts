import "server-only";

import { Point } from "./dxf";

/**
 * Lecture du gabarit vectoriel.
 *
 * Le gabarit est un SVG produit par Inkscape : des groupes imbriqués, chacun
 * portant sa transformation, et des tracés exprimés dans leur repère local.
 * Pour graver, il faut aplatir tout cela en polylignes dans un repère unique —
 * une machine ne sait rien des groupes ni des courbes de Bézier.
 *
 * On n'utilise pas de bibliothèque : le fichier est produit par un outil, donc
 * régulier, et une dépendance de plus pour une lecture aussi ciblée coûterait
 * plus qu'elle ne rapporte.
 */

/** Matrice affine [a b c d e f], comme SVG les note. */
export type Matrice = [number, number, number, number, number, number];

export const IDENTITE: Matrice = [1, 0, 0, 1, 0, 0];

export function composer(m: Matrice, n: Matrice): Matrice {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

export function appliquer(m: Matrice, p: Point): Point {
  return {
    x: m[0] * p.x + m[2] * p.y + m[4],
    y: m[1] * p.x + m[3] * p.y + m[5],
  };
}

/** Lit l'attribut `transform` d'un élément SVG. */
export function lireTransformation(valeur: string | undefined): Matrice {
  if (!valeur) return IDENTITE;
  let resultat: Matrice = IDENTITE;

  const operations = valeur.matchAll(/(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g);
  for (const [, nom, args] of operations) {
    const n = args.trim().split(/[\s,]+/).map(Number).filter((v) => !Number.isNaN(v));
    let m: Matrice = IDENTITE;
    switch (nom) {
      case "matrix":
        if (n.length >= 6) m = [n[0], n[1], n[2], n[3], n[4], n[5]];
        break;
      case "translate":
        m = [1, 0, 0, 1, n[0] || 0, n[1] || 0];
        break;
      case "scale":
        m = [n[0] ?? 1, 0, 0, n[1] ?? n[0] ?? 1, 0, 0];
        break;
      case "rotate": {
        const a = ((n[0] || 0) * Math.PI) / 180;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const rotation: Matrice = [cos, sin, -sin, cos, 0, 0];
        // Une rotation autour d'un point : on l'y amène, on tourne, on revient.
        if (n.length >= 3) {
          m = composer(composer([1, 0, 0, 1, n[1], n[2]], rotation), [1, 0, 0, 1, -n[1], -n[2]]);
        } else {
          m = rotation;
        }
        break;
      }
      case "skewX":
        m = [1, 0, Math.tan(((n[0] || 0) * Math.PI) / 180), 1, 0, 0];
        break;
      case "skewY":
        m = [1, Math.tan(((n[0] || 0) * Math.PI) / 180), 0, 1, 0, 0];
        break;
    }
    resultat = composer(resultat, m);
  }
  return resultat;
}

/* ────────────────────────── Tracés ────────────────────────── */

/**
 * Finesse de l'approximation des courbes.
 *
 * Une courbe devient une suite de segments. Trop peu, et un arrondi devient
 * un polygone visible dans le bois ; trop, et le fichier enfle sans que la
 * machine y gagne quoi que ce soit. Seize segments par courbe tiennent
 * largement sous la précision d'un laser à cette échelle.
 */
const SEGMENTS_PAR_COURBE = 16;

function bezierCubique(p0: Point, p1: Point, p2: Point, p3: Point): Point[] {
  const points: Point[] = [];
  for (let i = 1; i <= SEGMENTS_PAR_COURBE; i++) {
    const t = i / SEGMENTS_PAR_COURBE;
    const u = 1 - t;
    points.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return points;
}

function bezierQuadratique(p0: Point, p1: Point, p2: Point): Point[] {
  const points: Point[] = [];
  for (let i = 1; i <= SEGMENTS_PAR_COURBE; i++) {
    const t = i / SEGMENTS_PAR_COURBE;
    const u = 1 - t;
    points.push({
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    });
  }
  return points;
}

/**
 * Arc elliptique, tel que la commande A du SVG le décrit.
 *
 * La formule vient de la spécification SVG elle-même (annexe F.6) : elle
 * convertit la description « point d'arrivée » en description « centre »,
 * seule forme sur laquelle on sait échantillonner.
 */
function arc(
  depart: Point,
  rx: number,
  ry: number,
  rotationDeg: number,
  grandArc: boolean,
  sensHoraire: boolean,
  arrivee: Point
): Point[] {
  if (rx === 0 || ry === 0) return [arrivee];

  const phi = (rotationDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const dx2 = (depart.x - arrivee.x) / 2;
  const dy2 = (depart.y - arrivee.y) / 2;
  const x1 = cosPhi * dx2 + sinPhi * dy2;
  const y1 = -sinPhi * dx2 + cosPhi * dy2;

  let rxAbs = Math.abs(rx);
  let ryAbs = Math.abs(ry);
  // Des rayons trop petits pour relier les deux points sont agrandis, comme
  // la spécification l'exige — sinon la racine ci-dessous serait négative.
  const lambda = (x1 * x1) / (rxAbs * rxAbs) + (y1 * y1) / (ryAbs * ryAbs);
  if (lambda > 1) {
    const k = Math.sqrt(lambda);
    rxAbs *= k;
    ryAbs *= k;
  }

  const numerateur =
    rxAbs * rxAbs * ryAbs * ryAbs - rxAbs * rxAbs * y1 * y1 - ryAbs * ryAbs * x1 * x1;
  const denominateur = rxAbs * rxAbs * y1 * y1 + ryAbs * ryAbs * x1 * x1;
  const facteur =
    (grandArc === sensHoraire ? -1 : 1) * Math.sqrt(Math.max(0, numerateur / denominateur));

  const cx1 = (facteur * rxAbs * y1) / ryAbs;
  const cy1 = (-facteur * ryAbs * x1) / rxAbs;
  const cx = cosPhi * cx1 - sinPhi * cy1 + (depart.x + arrivee.x) / 2;
  const cy = sinPhi * cx1 + cosPhi * cy1 + (depart.y + arrivee.y) / 2;

  const angle = (ux: number, uy: number, vx: number, vy: number) => {
    const produit = ux * vx + uy * vy;
    const normes = Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy);
    const signe = ux * vy - uy * vx < 0 ? -1 : 1;
    return signe * Math.acos(Math.min(1, Math.max(-1, produit / normes)));
  };

  const theta = angle(1, 0, (x1 - cx1) / rxAbs, (y1 - cy1) / ryAbs);
  let delta = angle(
    (x1 - cx1) / rxAbs,
    (y1 - cy1) / ryAbs,
    (-x1 - cx1) / rxAbs,
    (-y1 - cy1) / ryAbs
  );
  if (!sensHoraire && delta > 0) delta -= 2 * Math.PI;
  if (sensHoraire && delta < 0) delta += 2 * Math.PI;

  const pas = Math.max(2, Math.ceil((Math.abs(delta) / Math.PI) * SEGMENTS_PAR_COURBE));
  const points: Point[] = [];
  for (let i = 1; i <= pas; i++) {
    const t = theta + (delta * i) / pas;
    const x = rxAbs * Math.cos(t);
    const y = ryAbs * Math.sin(t);
    points.push({ x: cosPhi * x - sinPhi * y + cx, y: sinPhi * x + cosPhi * y + cy });
  }
  return points;
}

/** Une suite de points, et l'information de fermeture. */
export interface SousTrace {
  points: Point[];
  ferme: boolean;
}

/**
 * Transforme l'attribut `d` d'un tracé en polylignes.
 *
 * Un même attribut peut contenir PLUSIEURS sous-tracés (une lettre creuse, un
 * anneau) : ils sont renvoyés séparément, sans quoi le remplissage serait faux
 * et la découpe relierait des contours qui n'ont rien à voir.
 */
export function lireTrace(d: string): SousTrace[] {
  /*
   * Découpage strict des nombres.
   *
   * SVG autorise la notation compressée : « 1.5.3 » vaut deux nombres, 1.5 et
   * 0.3, et Inkscape en produit abondamment dans les textes vectorisés. Une
   * lecture naïve en faisait un seul jeton, donc un NaN — et les lettres
   * partaient en filaments à travers la plaque. Le premier point décimal
   * ferme donc le nombre.
   */
  const jetons =
    d.match(/[MmZzLlHhVvCcSsQqTtAa]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) || [];
  const sousTraces: SousTrace[] = [];

  let courant: Point[] = [];
  let position: Point = { x: 0, y: 0 };
  let depart: Point = { x: 0, y: 0 };
  let commande = "";
  let dernierControle: Point | null = null;
  let i = 0;

  const nombre = () => Number(jetons[i++]);
  const fermer = (ferme: boolean) => {
    if (courant.length >= 2) sousTraces.push({ points: courant, ferme });
    courant = [];
  };

  while (i < jetons.length) {
    const jeton = jetons[i];
    if (/[MmZzLlHhVvCcSsQqTtAa]/.test(jeton)) {
      commande = jeton;
      i++;
    }
    const relatif = commande === commande.toLowerCase();
    const base = relatif ? position : { x: 0, y: 0 };

    switch (commande.toUpperCase()) {
      case "M": {
        fermer(false);
        position = { x: base.x + nombre(), y: base.y + nombre() };
        depart = position;
        courant = [position];
        // Les paires suivantes d'un M sont des L, par convention SVG.
        commande = relatif ? "l" : "L";
        break;
      }
      case "L": {
        position = { x: base.x + nombre(), y: base.y + nombre() };
        courant.push(position);
        break;
      }
      case "H": {
        position = { x: base.x + nombre(), y: position.y };
        courant.push(position);
        break;
      }
      case "V": {
        position = { x: position.x, y: base.y + nombre() };
        courant.push(position);
        break;
      }
      case "C": {
        const c1 = { x: base.x + nombre(), y: base.y + nombre() };
        const c2 = { x: base.x + nombre(), y: base.y + nombre() };
        const fin = { x: base.x + nombre(), y: base.y + nombre() };
        courant.push(...bezierCubique(position, c1, c2, fin));
        dernierControle = c2;
        position = fin;
        break;
      }
      case "S": {
        const c1: Point = dernierControle
          ? { x: 2 * position.x - dernierControle.x, y: 2 * position.y - dernierControle.y }
          : position;
        const c2 = { x: base.x + nombre(), y: base.y + nombre() };
        const fin = { x: base.x + nombre(), y: base.y + nombre() };
        courant.push(...bezierCubique(position, c1, c2, fin));
        dernierControle = c2;
        position = fin;
        break;
      }
      case "Q": {
        const c = { x: base.x + nombre(), y: base.y + nombre() };
        const fin = { x: base.x + nombre(), y: base.y + nombre() };
        courant.push(...bezierQuadratique(position, c, fin));
        dernierControle = c;
        position = fin;
        break;
      }
      case "T": {
        const c: Point = dernierControle
          ? { x: 2 * position.x - dernierControle.x, y: 2 * position.y - dernierControle.y }
          : position;
        const fin = { x: base.x + nombre(), y: base.y + nombre() };
        courant.push(...bezierQuadratique(position, c, fin));
        dernierControle = c;
        position = fin;
        break;
      }
      case "A": {
        const rx = nombre();
        const ry = nombre();
        const rot = nombre();
        const grand = nombre() !== 0;
        const sens = nombre() !== 0;
        const fin = { x: base.x + nombre(), y: base.y + nombre() };
        courant.push(...arc(position, rx, ry, rot, grand, sens, fin));
        position = fin;
        break;
      }
      case "Z": {
        /*
         * `Z` ne prend aucun argument, et la lettre a DÉJÀ été consommée en
         * tête de boucle. Avancer encore sautait le jeton suivant — presque
         * toujours le `m` du contour d'après. Les lettres se retrouvaient
         * alors reliées entre elles par de longs traits, et les textes
         * vectorisés partaient en filaments.
         */
        position = depart;
        fermer(true);
        break;
      }
      default:
        i++;
    }

    if (commande.toUpperCase() !== "C" && commande.toUpperCase() !== "S" &&
        commande.toUpperCase() !== "Q" && commande.toUpperCase() !== "T") {
      dernierControle = null;
    }
  }

  fermer(false);
  return sousTraces;
}

/* ────────────────────────── Parcours du document ────────────────────────── */

export interface ElementSvg {
  nom: string;
  attributs: Record<string, string>;
  /** Transformation cumulée depuis la racine. */
  matrice: Matrice;
  /** Identifiants des ancêtres, pour pouvoir écarter une branche entière. */
  ancetres: string[];
  /** L'élément est-il une définition (motif, masque) plutôt qu'un dessin ? */
  dansDefinitions: boolean;
}

/**
 * Parcourt le document et rend les éléments dessinables, transformation
 * cumulée comprise.
 *
 * Analyse par balises plutôt que par arbre complet : le fichier vient d'un
 * outil, sa syntaxe est régulière, et on n'a besoin que de la pile des
 * transformations — pas d'un DOM.
 */
export function parcourirSvg(source: string): ElementSvg[] {
  const elements: ElementSvg[] = [];
  const pile: { matrice: Matrice; id: string; dansDefinitions: boolean }[] = [
    { matrice: IDENTITE, id: "", dansDefinitions: false },
  ];

  const balises = source.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g);

  for (const [, fermante, nom, reste] of balises) {
    if (fermante) {
      if (pile.length > 1) pile.pop();
      continue;
    }

    /*
     * Le « / » d'une balise auto-fermante appartient à la balise, pas aux
     * attributs — mais le groupe d'attributs, gourmand, l'absorbe. Sans cette
     * séparation, chaque balise auto-fermante ouvrait un niveau que rien ne
     * refermait, et toute la pile des transformations dérivait à partir de là.
     */
    const autoFermante = reste.trimEnd().endsWith("/");
    const attributsBruts = autoFermante ? reste.trimEnd().slice(0, -1) : reste;

    const attributs: Record<string, string> = {};
    for (const [, cle, v1, v2] of attributsBruts.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attributs[cle] = v1 ?? v2 ?? "";
    }

    const parent = pile[pile.length - 1];
    const matrice = composer(parent.matrice, lireTransformation(attributs.transform));
    const ancetres = pile.slice(1).map((n) => n.id).filter(Boolean);
    // Le contenu de <defs> n'est jamais dessiné : ce sont des motifs et des
    // masques, dont les coordonnées n'ont rien à voir avec la plaque.
    const dansDefinitions = parent.dansDefinitions || nom === "defs";

    elements.push({ nom, attributs, matrice, ancetres, dansDefinitions });

    // Une balise auto-fermante n'ouvre pas de niveau.
    if (!autoFermante) {
      pile.push({ matrice, id: attributs.id || "", dansDefinitions });
    }
  }

  return elements;
}
