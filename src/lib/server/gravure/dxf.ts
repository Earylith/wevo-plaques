import "server-only";

/**
 * Écriture de fichiers DXF, au format R12 ASCII.
 *
 * R12 plutôt qu'une version récente : c'est le dialecte que TOUS les logiciels
 * de découpe savent lire, y compris les plus anciens ateliers. Un fichier plus
 * compact mais refusé par la machine du graveur ne vaut rien.
 *
 * Tout est exprimé en millimètres, dans le repère de la plaque : origine en
 * bas à gauche, Y vers le haut. C'est la convention des logiciels de découpe —
 * l'inverse de celle du SVG, dont l'axe Y descend. La conversion se fait une
 * seule fois, à l'entrée.
 */

export interface Point {
  x: number;
  y: number;
}

/** Un tracé fermé ou ouvert, sur un calque donné. */
export interface Trace {
  points: Point[];
  ferme: boolean;
  calque: string;
}

/**
 * Les calques du fichier, et leur couleur d'affichage.
 *
 * Le graveur les distingue pour régler sa machine : ce qui traverse le bois
 * n'est pas réglé comme ce qui l'effleure. Les couleurs sont celles de la
 * palette AutoCAD, seule référence commune entre logiciels.
 */
export const CALQUES = {
  DECOUPE: { nom: "DECOUPE", couleur: 1 }, // rouge — le contour à découper
  GRAVURE: { nom: "GRAVURE", couleur: 7 }, // noir — le dessin gravé
  QR: { nom: "QR", couleur: 5 }, // bleu — le code, gravé plein
  PHRASE: { nom: "PHRASE", couleur: 3 }, // vert — la signature de l'hôte
} as const;

/** Une paire code/valeur, dans la forme que le DXF impose. */
function paire(code: number, valeur: string | number): string {
  return `${code}\n${valeur}\n`;
}

/** Coordonnée arrondie au micron : au-delà, c'est du bruit pour une machine. */
function mm(valeur: number): string {
  return valeur.toFixed(4);
}

/**
 * Assemble le fichier complet.
 *
 * Les tracés vides sont écartés en amont : une polyligne sans sommet fait
 * échouer l'ouverture chez certains logiciels, sans message utile.
 */
export function ecrireDxf(traces: Trace[]): string {
  const utiles = traces.filter((t) => t.points.length >= 2);

  let sortie = "";

  // ── En-tête : unités et étendue ──────────────────────────────────────
  const xs = utiles.flatMap((t) => t.points.map((p) => p.x));
  const ys = utiles.flatMap((t) => t.points.map((p) => p.y));
  const minX = xs.length ? Math.min(...xs) : 0;
  const minY = ys.length ? Math.min(...ys) : 0;
  const maxX = xs.length ? Math.max(...xs) : 0;
  const maxY = ys.length ? Math.max(...ys) : 0;

  sortie += paire(0, "SECTION") + paire(2, "HEADER");
  // 4 = millimètres. Sans cette valeur, certains logiciels supposent le pouce
  // et la plaque arrive à l'échelle 1/25.
  sortie += paire(9, "$INSUNITS") + paire(70, 4);
  sortie += paire(9, "$MEASUREMENT") + paire(70, 1);
  sortie += paire(9, "$EXTMIN") + paire(10, mm(minX)) + paire(20, mm(minY)) + paire(30, "0.0");
  sortie += paire(9, "$EXTMAX") + paire(10, mm(maxX)) + paire(20, mm(maxY)) + paire(30, "0.0");
  sortie += paire(0, "ENDSEC");

  // ── Tables : les calques doivent être déclarés avant usage ───────────
  const calques = Object.values(CALQUES);
  sortie += paire(0, "SECTION") + paire(2, "TABLES");
  sortie += paire(0, "TABLE") + paire(2, "LAYER") + paire(70, calques.length);
  for (const c of calques) {
    sortie += paire(0, "LAYER") + paire(2, c.nom) + paire(70, 0) + paire(62, c.couleur) + paire(6, "CONTINUOUS");
  }
  sortie += paire(0, "ENDTAB") + paire(0, "ENDSEC");

  // ── Entités ──────────────────────────────────────────────────────────
  sortie += paire(0, "SECTION") + paire(2, "ENTITIES");
  for (const trace of utiles) {
    sortie += paire(0, "POLYLINE") + paire(8, trace.calque);
    sortie += paire(66, 1); // les sommets suivent
    sortie += paire(10, "0.0") + paire(20, "0.0") + paire(30, "0.0");
    sortie += paire(70, trace.ferme ? 1 : 0);
    for (const p of trace.points) {
      sortie += paire(0, "VERTEX") + paire(8, trace.calque);
      sortie += paire(10, mm(p.x)) + paire(20, mm(p.y)) + paire(30, "0.0");
    }
    sortie += paire(0, "SEQEND") + paire(8, trace.calque);
  }
  sortie += paire(0, "ENDSEC");

  sortie += paire(0, "EOF");
  return sortie;
}

/** Rectangle plein, utilisé pour les modules du QR. */
export function rectangle(x: number, y: number, largeur: number, hauteur: number, calque: string): Trace {
  return {
    calque,
    ferme: true,
    points: [
      { x, y },
      { x: x + largeur, y },
      { x: x + largeur, y: y + hauteur },
      { x, y: y + hauteur },
    ],
  };
}
