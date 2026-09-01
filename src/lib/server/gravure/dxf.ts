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

/**
 * Les mêmes tracés, en SVG.
 *
 * Certains ateliers travaillent en SVG plutôt qu'en DXF, et un aperçu se
 * regarde plus vite qu'il ne s'ouvre dans un logiciel de découpe. Le fichier
 * est produit à partir des MÊMES polylignes que le DXF : les deux ne peuvent
 * donc pas diverger, ce qui arriverait fatalement avec deux chaînes séparées.
 *
 * Les unités sont des millimètres, déclarés comme tels sur la racine : sans
 * cela, un logiciel de dessin suppose des pixels et la plaque arrive au tiers
 * de sa taille.
 */
export function ecrireSvg(traces: Trace[], largeurMm: number, hauteurMm: number): string {
  const utiles = traces.filter((t) => t.points.length >= 2);

  /* Couleurs d'écran, choisies pour distinguer les calques d'un coup d'œil. */
  const TEINTES: Record<string, string> = {
    [CALQUES.DECOUPE.nom]: "#c0392b",
    [CALQUES.GRAVURE.nom]: "#2A2016",
    [CALQUES.QR.nom]: "#111111",
    [CALQUES.PHRASE.nom]: "#2A2016",
  };

  const groupes = Object.values(CALQUES)
    .map((calque) => {
      const duCalque = utiles.filter((t) => t.calque === calque.nom);
      if (duCalque.length === 0) return "";

      // Le QR se grave plein : il est rempli, jamais détouré. Le reste est en
      // trait, comme le lira une machine.
      const plein = calque.nom === CALQUES.QR.nom;
      const chemins = duCalque
        .map((t) => {
          const d =
            t.points
              .map(
                (p, i) =>
                  `${i === 0 ? "M" : "L"}${mm(p.x)},${mm(hauteurMm - p.y)}`
              )
              .join(" ") + (t.ferme ? " Z" : "");
          return `    <path d="${d}"/>`;
        })
        .join("\n");

      return [
        `  <g id="${calque.nom}" inkscape:groupmode="layer" inkscape:label="${calque.nom}"`,
        `     fill="${plein ? TEINTES[calque.nom] : "none"}"`,
        `     stroke="${plein ? "none" : TEINTES[calque.nom]}" stroke-width="0.2">`,
        chemins,
        `  </g>`,
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    `     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"`,
    `     width="${mm(largeurMm)}mm" height="${mm(hauteurMm)}mm"`,
    `     viewBox="0 0 ${mm(largeurMm)} ${mm(hauteurMm)}">`,
    groupes,
    `</svg>`,
  ].join("\n");
}
