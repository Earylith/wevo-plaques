import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { Point } from "./dxf";
import { SousTrace } from "./svg";

/**
 * Contours des lettres, lus directement dans la police TrueType.
 *
 * Le graveur reçoit des tracés, jamais du texte : une entité TEXTE dans un DXF
 * suppose que la police est installée sur la machine de l'atelier, ce qui
 * n'arrivera pas pour BELLABOO. La phrase doit donc partir en courbes.
 *
 * BELLABOO est une TrueType classique — table `glyf`, contours quadratiques,
 * `cmap` au format 4. C'est exactement le cas que ces quelques fonctions
 * couvrent ; une bibliothèque complète serait disproportionnée pour lire une
 * seule police connue.
 */

const CHEMIN_POLICE = path.join(process.cwd(), "public", "fonts", "bellaboo.ttf");

interface Table {
  offset: number;
  longueur: number;
}

interface Police {
  buf: Buffer;
  tables: Record<string, Table>;
  unitesParEm: number;
  locaLong: boolean;
  nbGlyphes: number;
  /** Point de code Unicode → indice de glyphe. */
  correspondance: Map<number, number>;
  /** Indice de glyphe → chasse, en unités de police. */
  chasses: number[];
}

let cache: Police | null = null;

/** Lit la table `cmap`, sous-table format 4 — celle du plan Unicode de base. */
function lireCmap(buf: Buffer, cmap: Table): Map<number, number> {
  const correspondance = new Map<number, number>();
  const nb = buf.readUInt16BE(cmap.offset + 2);

  let choisie = -1;
  for (let i = 0; i < nb; i++) {
    const o = cmap.offset + 4 + i * 8;
    const plateforme = buf.readUInt16BE(o);
    const encodage = buf.readUInt16BE(o + 2);
    const decalage = cmap.offset + buf.readUInt32BE(o + 4);
    const format = buf.readUInt16BE(decalage);
    // On préfère Windows/Unicode (3,1), puis Unicode (0,x) : ce sont les
    // seules à couvrir les accents dont le français a besoin.
    if (format === 4 && ((plateforme === 3 && encodage === 1) || plateforme === 0)) {
      choisie = decalage;
      if (plateforme === 3) break;
    }
  }
  if (choisie < 0) return correspondance;

  const segX2 = buf.readUInt16BE(choisie + 6);
  const segments = segX2 / 2;
  const finsO = choisie + 14;
  const debutsO = finsO + segX2 + 2;
  const deltasO = debutsO + segX2;
  const rangesO = deltasO + segX2;

  for (let s = 0; s < segments; s++) {
    const fin = buf.readUInt16BE(finsO + s * 2);
    const debut = buf.readUInt16BE(debutsO + s * 2);
    const delta = buf.readInt16BE(deltasO + s * 2);
    const range = buf.readUInt16BE(rangesO + s * 2);
    if (debut === 0xffff) continue;

    for (let code = debut; code <= fin && code !== 0x10000; code++) {
      let glyphe: number;
      if (range === 0) {
        glyphe = (code + delta) & 0xffff;
      } else {
        const o = rangesO + s * 2 + range + (code - debut) * 2;
        if (o + 1 >= buf.length) continue;
        const brut = buf.readUInt16BE(o);
        glyphe = brut === 0 ? 0 : (brut + delta) & 0xffff;
      }
      if (glyphe) correspondance.set(code, glyphe);
    }
  }
  return correspondance;
}

/** Chasses horizontales, table `hmtx` : la dernière vaut pour tous les suivants. */
function lireChasses(buf: Buffer, tables: Record<string, Table>, nbGlyphes: number): number[] {
  const nbChasses = buf.readUInt16BE(tables.hhea.offset + 34);
  const chasses: number[] = [];
  let derniere = 0;
  for (let i = 0; i < nbGlyphes; i++) {
    if (i < nbChasses) {
      derniere = buf.readUInt16BE(tables.hmtx.offset + i * 4);
    }
    chasses.push(derniere);
  }
  return chasses;
}

function charger(): Police {
  if (cache) return cache;

  const buf = readFileSync(CHEMIN_POLICE);
  const nbTables = buf.readUInt16BE(4);
  const tables: Record<string, Table> = {};
  for (let i = 0; i < nbTables; i++) {
    const o = 12 + i * 16;
    tables[buf.toString("ascii", o, o + 4)] = {
      offset: buf.readUInt32BE(o + 8),
      longueur: buf.readUInt32BE(o + 12),
    };
  }

  for (const requise of ["head", "cmap", "loca", "glyf", "hhea", "hmtx", "maxp"]) {
    if (!tables[requise]) {
      throw new Error(`Police incomplète : table « ${requise} » absente.`);
    }
  }

  const nbGlyphes = buf.readUInt16BE(tables.maxp.offset + 4);

  cache = {
    buf,
    tables,
    unitesParEm: buf.readUInt16BE(tables.head.offset + 18),
    locaLong: buf.readInt16BE(tables.head.offset + 50) === 1,
    nbGlyphes,
    correspondance: lireCmap(buf, tables.cmap),
    chasses: lireChasses(buf, tables, nbGlyphes),
  };
  return cache;
}

/** Position et longueur du glyphe dans la table `glyf`. */
function situerGlyphe(p: Police, indice: number): { debut: number; fin: number } {
  const { buf, tables, locaLong } = p;
  if (locaLong) {
    return {
      debut: buf.readUInt32BE(tables.loca.offset + indice * 4),
      fin: buf.readUInt32BE(tables.loca.offset + (indice + 1) * 4),
    };
  }
  return {
    debut: buf.readUInt16BE(tables.loca.offset + indice * 2) * 2,
    fin: buf.readUInt16BE(tables.loca.offset + (indice + 1) * 2) * 2,
  };
}

/**
 * Contours d'un glyphe, en unités de police.
 *
 * TrueType décrit ses courbes en quadratiques, avec des points « hors
 * courbe » qui peuvent s'enchaîner : deux points de contrôle consécutifs
 * impliquent un point sur courbe implicite, à mi-chemin. C'est la subtilité
 * qui fait rendre des lettres cabossées quand on l'ignore.
 */
function contoursGlyphe(p: Police, indice: number, profondeur = 0): Point[][] {
  if (indice < 0 || indice >= p.nbGlyphes || profondeur > 4) return [];

  const { buf, tables } = p;
  const { debut, fin } = situerGlyphe(p, indice);
  if (fin <= debut) return []; // glyphe vide, l'espace par exemple

  const o = tables.glyf.offset + debut;
  const nbContours = buf.readInt16BE(o);

  // Glyphe composite : un assemblage de glyphes simples, chacun décalé.
  if (nbContours < 0) {
    const contours: Point[][] = [];
    let curseur = o + 10;
    for (;;) {
      const drapeaux = buf.readUInt16BE(curseur);
      const indiceComposant = buf.readUInt16BE(curseur + 2);
      curseur += 4;

      let dx = 0;
      let dy = 0;
      if (drapeaux & 1) {
        dx = buf.readInt16BE(curseur);
        dy = buf.readInt16BE(curseur + 2);
        curseur += 4;
      } else {
        dx = buf.readInt8(curseur);
        dy = buf.readInt8(curseur + 1);
        curseur += 2;
      }
      // Les mises à l'échelle des composants sont ignorées : les accents de
      // cette police sont de simples décalages, et une échelle mal appliquée
      // ferait pire que son absence.
      if (drapeaux & 8) curseur += 2;
      else if (drapeaux & 0x40) curseur += 4;
      else if (drapeaux & 0x80) curseur += 8;

      for (const contour of contoursGlyphe(p, indiceComposant, profondeur + 1)) {
        contours.push(contour.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })));
      }

      if (!(drapeaux & 0x20)) break;
    }
    return contours;
  }

  // ── Glyphe simple ────────────────────────────────────────────────────
  const finsContours: number[] = [];
  for (let i = 0; i < nbContours; i++) finsContours.push(buf.readUInt16BE(o + 10 + i * 2));
  const nbPoints = (finsContours[nbContours - 1] ?? -1) + 1;
  if (nbPoints <= 0) return [];

  let curseur = o + 10 + nbContours * 2;
  curseur += 2 + buf.readUInt16BE(curseur); // instructions, ignorées

  const drapeaux: number[] = [];
  while (drapeaux.length < nbPoints) {
    const d = buf.readUInt8(curseur++);
    drapeaux.push(d);
    if (d & 8) {
      let repetitions = buf.readUInt8(curseur++);
      while (repetitions-- > 0 && drapeaux.length < nbPoints) drapeaux.push(d);
    }
  }

  const lireCoordonnees = (bitCourt: number, bitMeme: number): number[] => {
    const valeurs: number[] = [];
    let valeur = 0;
    for (const d of drapeaux) {
      if (d & bitCourt) {
        const delta = buf.readUInt8(curseur++);
        valeur += d & bitMeme ? delta : -delta;
      } else if (!(d & bitMeme)) {
        valeur += buf.readInt16BE(curseur);
        curseur += 2;
      }
      valeurs.push(valeur);
    }
    return valeurs;
  };

  const xs = lireCoordonnees(2, 16);
  const ys = lireCoordonnees(4, 32);

  const contours: Point[][] = [];
  let debutContour = 0;
  for (const finContour of finsContours) {
    const bruts: { x: number; y: number; surCourbe: boolean }[] = [];
    for (let i = debutContour; i <= finContour; i++) {
      bruts.push({ x: xs[i], y: ys[i], surCourbe: Boolean(drapeaux[i] & 1) });
    }
    debutContour = finContour + 1;
    if (bruts.length === 0) continue;

    contours.push(rendreContour(bruts));
  }
  return contours;
}

/** Densité d'échantillonnage des courbes de lettres. */
const SEGMENTS = 8;

function rendreContour(bruts: { x: number; y: number; surCourbe: boolean }[]): Point[] {
  const points: Point[] = [];

  // Il faut partir d'un point SUR la courbe. S'il n'y en a aucun, on en
  // fabrique un à mi-chemin des deux premiers — cas rare mais légal.
  let depart = bruts.findIndex((p) => p.surCourbe);
  let premier: Point;
  if (depart < 0) {
    premier = { x: (bruts[0].x + bruts[1].x) / 2, y: (bruts[0].y + bruts[1].y) / 2 };
    depart = 0;
  } else {
    premier = { x: bruts[depart].x, y: bruts[depart].y };
  }

  points.push(premier);
  let position = premier;
  let controle: Point | null = null;

  const quadratique = (c: Point, fin: Point) => {
    for (let i = 1; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const u = 1 - t;
      points.push({
        x: u * u * position.x + 2 * u * t * c.x + t * t * fin.x,
        y: u * u * position.y + 2 * u * t * c.y + t * t * fin.y,
      });
    }
    position = fin;
  };

  for (let n = 1; n <= bruts.length; n++) {
    const p = bruts[(depart + n) % bruts.length];
    const courant = { x: p.x, y: p.y };

    if (p.surCourbe) {
      if (controle) {
        quadratique(controle, courant);
        controle = null;
      } else {
        points.push(courant);
        position = courant;
      }
    } else if (controle) {
      // Deux contrôles de suite : un point sur courbe est implicite entre eux.
      const implicite = { x: (controle.x + courant.x) / 2, y: (controle.y + courant.y) / 2 };
      quadratique(controle, implicite);
      controle = courant;
    } else {
      controle = courant;
    }
  }

  if (controle) quadratique(controle, premier);
  return points;
}

/**
 * Convertit une phrase en contours, mise à l'échelle et centrée.
 *
 * `hauteurEm` est la taille de la lettre en millimètres. Le résultat est
 * exprimé dans un repère où Y monte — celui du DXF — parce que TrueType
 * partage déjà cette convention. Aucun retournement n'est donc nécessaire,
 * contrairement au SVG.
 */
export function contoursTexte(
  texte: string,
  hauteurEm: number
): { traces: SousTrace[]; largeur: number } {
  const p = charger();
  const echelle = hauteurEm / p.unitesParEm;

  const traces: SousTrace[] = [];
  let curseur = 0;

  for (const caractere of texte) {
    const code = caractere.codePointAt(0) ?? 32;
    const indice = p.correspondance.get(code);

    if (indice === undefined) {
      // Caractère absent de la police : on avance d'une espace plutôt que de
      // graver un rectangle vide ou de tout décaler.
      curseur += (p.chasses[p.correspondance.get(32) ?? 0] || p.unitesParEm / 4) * echelle;
      continue;
    }

    for (const contour of contoursGlyphe(p, indice)) {
      traces.push({
        ferme: true,
        points: contour.map((pt) => ({ x: curseur + pt.x * echelle, y: pt.y * echelle })),
      });
    }
    curseur += (p.chasses[indice] || 0) * echelle;
  }

  return { traces, largeur: curseur };
}
