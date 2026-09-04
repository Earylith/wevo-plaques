import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

import { CALQUES, Point, Trace, ecrireDxf, ecrireSvg, rectangle } from "./dxf";
import { appliquer, lireTrace, parcourirSvg, SousTrace } from "./svg";
import { contoursTexte } from "./police";
import { GABARIT_SEGMENTS } from "@/lib/plaqueGabarit";

/**
 * Fabrication du fichier de gravure.
 *
 * Le gabarit vectoriel porte tout le dessin fixe. Deux choses seulement
 * varient d'une plaque à l'autre : le QR code, qui pointe vers l'adresse
 * PERMANENTE du livret, et la phrase de l'hôte. Le reste est repris tel quel,
 * aplati en polylignes millimétriques.
 *
 * On ne reconstruit jamais le dessin : ce qui part à la gravure est
 * exactement ce que le gabarit contient, aux deux substitutions près.
 */

const GABARIT = path.join(process.cwd(), ...GABARIT_SEGMENTS);

/** Largeur réelle de la plaque, en millimètres. La hauteur en découle. */
const LARGEUR_PLAQUE_MM = 220;

/**
 * Ce que le gabarit désigne lui-même comme non gravé.
 *
 * Cette teinte orange sert de marqueur dans le fichier source : elle repère
 * les zones réservées, jamais brûlées. L'aperçu à l'écran la rend
 * transparente ; ici, on écarte purement et simplement les tracés concernés.
 */
const COULEUR_NON_GRAVEE = "#ff7f2a";

/** Identifiants remplacés par du contenu propre à chaque commande. */
const SUBSTITUES = {
  /** Emplacement réservé au QR : sa position et sa taille servent de repère. */
  qr: "path39",
  /** Groupe entier du QR de démonstration, écarté avec ses enfants. */
  groupeQr: "g39",
  /** Phrase d'exemple du gabarit. */
  texte: "text4",
  /** Silhouette de la plaque : c'est elle qu'on découpe. */
  silhouette: "path6",
};

/**
 * Position de la phrase, en fraction du gabarit.
 *
 * Ces valeurs viennent du calage de l'aperçu, mesuré sur le gabarit rendu.
 * Les garder en fractions plutôt qu'en millimètres permet au calage de suivre
 * si le gabarit est redessiné à une autre échelle.
 */
const PHRASE = {
  centreY: 0.899,
  hauteurEm: 0.0548,
  largeurMax: 0.72,
};

interface Element {
  cadre: { x0: number; y0: number; x1: number; y1: number } | null;
  sousTraces: SousTrace[];
  id: string;
  calque: string;
}

/** Le style annonce-t-il un tracé qui ne sera pas gravé ? */
function nonGrave(style: string, fill: string): boolean {
  const s = (style || "").toLowerCase();
  if (s.includes(COULEUR_NON_GRAVEE) || (fill || "").toLowerCase() === COULEUR_NON_GRAVEE) {
    return true;
  }
  // Ni remplissage ni contour : l'élément ne laisse aucune trace.
  const invisible = /fill-opacity\s*:\s*0(?![.\d])/.test(s) && /stroke\s*:\s*none/.test(s);
  return invisible;
}

function cadreDe(points: Point[]) {
  if (points.length === 0) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

/**
 * Lit le gabarit et rend ses tracés, dans le repère du document SVG.
 *
 * Les images matricielles sont écartées : elles illustrent la texture du bois
 * à l'écran et n'ont rien à faire dans un fichier de découpe.
 */
function lireGabarit(): { elements: Element[]; reperes: Record<string, NonNullable<Element["cadre"]>> } {
  const source = readFileSync(GABARIT, "utf8");
  const elements: Element[] = [];
  const reperes: Record<string, NonNullable<Element["cadre"]>> = {};

  for (const e of parcourirSvg(source)) {
    if (e.dansDefinitions) continue;
    if (e.nom !== "path" && e.nom !== "rect") continue;

    const id = e.attributs.id || "";
    const sousTracesLocales: SousTrace[] =
      e.nom === "path" && e.attributs.d
        ? lireTrace(e.attributs.d)
        : e.nom === "rect"
          ? [
              {
                ferme: true,
                points: (() => {
                  const x = Number(e.attributs.x || 0);
                  const y = Number(e.attributs.y || 0);
                  const w = Number(e.attributs.width || 0);
                  const h = Number(e.attributs.height || 0);
                  return [
                    { x, y },
                    { x: x + w, y },
                    { x: x + w, y: y + h },
                    { x, y: y + h },
                  ];
                })(),
              },
            ]
          : [];

    const sousTraces = sousTracesLocales.map((st) => ({
      ferme: st.ferme,
      points: st.points.map((p) => appliquer(e.matrice, p)),
    }));

    const cadre = cadreDe(sousTraces.flatMap((st) => st.points));
    if (cadre && id) reperes[id] = cadre;

    // Ce qui sert de repère ou de gabarit d'exemple ne se grave pas.
    const remplace =
      id === SUBSTITUES.qr ||
      id === SUBSTITUES.texte ||
      e.ancetres.includes(SUBSTITUES.groupeQr);
    if (remplace) continue;

    /*
     * La silhouette échappe au filtre des couleurs.
     *
     * Elle porte justement la teinte « non gravée » — c'est le corps de la
     * plaque, qui reçoit la texture du bois dans l'aperçu et n'est jamais
     * brûlé. Mais elle doit partir en DÉCOUPE : sans elle, le graveur reçoit
     * un dessin sans contour, et rien ne lui dit où couler la plaque.
     */
    const estSilhouette = id === SUBSTITUES.silhouette;
    if (!estSilhouette && nonGrave(e.attributs.style || "", e.attributs.fill || "")) continue;

    elements.push({
      cadre,
      sousTraces,
      id,
      calque: estSilhouette ? CALQUES.DECOUPE.nom : CALQUES.GRAVURE.nom,
    });
  }

  return { elements, reperes };
}

export interface OptionsGravure {
  /** Adresse permanente gravée dans le QR — celle qui ne changera jamais. */
  urlPermanente: string;
  /** Phrase gravée au bas de la plaque. */
  phrase: string;
  /** Référence de commande, inscrite en commentaire du fichier. */
  reference: string;
}

export interface ResultatGravure {
  dxf: string;
  /** Le même dessin en SVG, pour les ateliers qui le préfèrent. */
  svg: string;
  /** Dimensions réelles de la plaque produite, en millimètres. */
  largeurMm: number;
  hauteurMm: number;
  /** De quoi contrôler ce qui a été produit, sans ouvrir le fichier. */
  compte: { gravure: number; decoupe: number; qr: number; phrase: number };
  /** La phrase a-t-elle dû être réduite pour tenir ? */
  phraseReduite: boolean;
}

/**
 * Produit le fichier DXF d'une plaque.
 *
 * Tout est ramené dans un repère en millimètres dont l'origine est le coin
 * inférieur gauche de la silhouette, avec l'axe Y vers le haut — la
 * convention des logiciels de découpe. Le SVG, lui, compte Y vers le bas : la
 * conversion se fait ici, une fois pour toutes.
 */
export async function fabriquerGravure(options: OptionsGravure): Promise<ResultatGravure> {
  const { elements, reperes } = lireGabarit();

  const silhouette = reperes[SUBSTITUES.silhouette];
  if (!silhouette) {
    throw new Error("Silhouette introuvable dans le gabarit : le fichier a changé de structure.");
  }

  const largeurSvg = silhouette.x1 - silhouette.x0;
  const hauteurSvg = silhouette.y1 - silhouette.y0;
  const echelle = LARGEUR_PLAQUE_MM / largeurSvg;

  /** Du repère SVG (Y vers le bas) au repère machine (Y vers le haut). */
  const versPlaque = (p: Point): Point => ({
    x: (p.x - silhouette.x0) * echelle,
    y: (silhouette.y1 - p.y) * echelle,
  });

  const traces: Trace[] = [];

  // ── 1. Le dessin du gabarit ──────────────────────────────────────────
  for (const element of elements) {
    for (const st of element.sousTraces) {
      if (st.points.length < 2) continue;
      traces.push({
        calque: element.calque,
        ferme: st.ferme,
        points: st.points.map(versPlaque),
      });
    }
  }

  // ── 2. Le QR, à la place exacte du repère ────────────────────────────
  const zoneQr = reperes[SUBSTITUES.qr];
  if (!zoneQr) {
    throw new Error("Emplacement du QR introuvable dans le gabarit.");
  }

  const qr = QRCode.create(options.urlPermanente, { errorCorrectionLevel: "M" });
  const modules = qr.modules;
  const coinQr = versPlaque({ x: zoneQr.x0, y: zoneQr.y1 }); // bas-gauche après retournement
  const cotéQr = Math.min(zoneQr.x1 - zoneQr.x0, zoneQr.y1 - zoneQr.y0) * echelle;
  const pasQr = cotéQr / modules.size;

  let modulesGraves = 0;
  for (let ligne = 0; ligne < modules.size; ligne++) {
    for (let colonne = 0; colonne < modules.size; colonne++) {
      /*
       * L'ordre des arguments est (ligne, colonne), et non l'inverse.
       * Intervertis, les modules sortent transposés : le code garde l'allure
       * d'un QR, ses trois repères d'angle sont à leur place, et il ne se
       * scanne pas. Aucun comptage ne l'aurait révélé — seule une lecture
       * réelle le montre.
       */
      if (!modules.get(ligne, colonne)) continue;
      modulesGraves++;
      traces.push(
        rectangle(
          coinQr.x + colonne * pasQr,
          // La première ligne du QR est en HAUT : elle correspond au Y le plus
          // grand une fois l'axe retourné.
          coinQr.y + (modules.size - 1 - ligne) * pasQr,
          pasQr,
          pasQr,
          CALQUES.QR.nom
        )
      );
    }
  }

  // ── 3. La phrase, vectorisée ─────────────────────────────────────────
  const phrase = (options.phrase || "").trim();
  let phraseReduite = false;
  let contoursPhrase = 0;

  if (phrase) {
    const hauteurEm = PHRASE.hauteurEm * largeurSvg * echelle;
    let rendu = contoursTexte(phrase, hauteurEm);

    // Même règle que l'aperçu : la phrase se réduit pour tenir, plutôt que de
    // déborder de la plaque. C'est la largeur réelle qui décide, jamais le
    // nombre de caractères — les lettres de cette police sont très inégales.
    const largeurMax = PHRASE.largeurMax * largeurSvg * echelle;
    if (rendu.largeur > largeurMax && rendu.largeur > 0) {
      phraseReduite = true;
      rendu = contoursTexte(phrase, hauteurEm * (largeurMax / rendu.largeur));
    }

    const points = rendu.traces.flatMap((t) => t.points);
    const cadre = cadreDe(points);
    if (cadre) {
      const centreCible = versPlaque({
        x: (silhouette.x0 + silhouette.x1) / 2,
        y: silhouette.y0 + PHRASE.centreY * hauteurSvg,
      });
      const dx = centreCible.x - (cadre.x0 + cadre.x1) / 2;
      const dy = centreCible.y - (cadre.y0 + cadre.y1) / 2;

      for (const t of rendu.traces) {
        if (t.points.length < 2) continue;
        contoursPhrase++;
        traces.push({
          calque: CALQUES.PHRASE.nom,
          ferme: true,
          points: t.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
        });
      }
    }
  }

  const hauteurMm = Number((hauteurSvg * echelle).toFixed(1));

  return {
    // Les deux formats sortent des MÊMES polylignes : ils ne peuvent pas
    // diverger, ce qui arriverait fatalement avec deux chaînes séparées.
    dxf: ecrireDxf(traces),
    svg: ecrireSvg(traces, LARGEUR_PLAQUE_MM, hauteurMm),
    largeurMm: LARGEUR_PLAQUE_MM,
    hauteurMm,
    compte: {
      gravure: traces.filter((t) => t.calque === CALQUES.GRAVURE.nom).length,
      decoupe: traces.filter((t) => t.calque === CALQUES.DECOUPE.nom).length,
      qr: modulesGraves,
      phrase: contoursPhrase,
    },
    phraseReduite,
  };
}
