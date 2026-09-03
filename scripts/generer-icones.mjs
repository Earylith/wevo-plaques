/**
 * Génère les icônes du site à partir d'une seule définition.
 *
 * Pourquoi un script plutôt qu'un fichier dessiné à la main : il existe
 * quatre tailles d'icône et deux formats, et les tenir synchronisés à la
 * main garantit qu'un jour l'une d'elles montrera un ancien logo. Ici la
 * forme est décrite une fois, en fonctions mathématiques, et toutes les
 * tailles en découlent.
 *
 * Lancement :  node scripts/generer-icones.mjs
 * Aperçu seul : node scripts/generer-icones.mjs --apercu
 *
 * Sortie :
 *   src/app/favicon.ico    16, 32 et 48 px — navigateurs et moteurs
 *   src/app/icon.png       512 px — Google demande un multiple de 48
 *   src/app/apple-icon.png 180 px — écran d'accueil iOS
 *
 * Aucune dépendance : l'encodeur PNG tient en trente lignes grâce à zlib,
 * qui est dans Node, et un fichier ICO n'est qu'un entête suivi de PNG.
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* ── La marque ──────────────────────────────────────────────────────── */

const TERRA_CLAIR = [212, 134, 106]; // #D4866A
const TERRA_SOMBRE = [163, 90, 56]; // #A35A38
const CREME = [255, 253, 248]; // #FFFDF8

/** Coin arrondi : distance signée à un carré aux angles adoucis. */
function distanceCarreArrondi(x, y, demiCote, rayon) {
  const dx = Math.abs(x) - (demiCote - rayon);
  const dy = Math.abs(y) - (demiCote - rayon);
  const ax = Math.max(dx, 0);
  const ay = Math.max(dy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(dx, dy), 0) - rayon;
}

/**
 * Le G, en coordonnées normalisées (centre en 0, bord à 1).
 *
 * C'est un anneau ouvert en haut à droite, prolongé par une barre
 * horizontale qui rejoint le trait descendant — le dessin d'un G de
 * grotesque, réduit à ce qui reste lisible à seize pixels.
 */
function dansLeG(x, y) {
  const rayon = Math.hypot(x, y);
  const RAYON_INT = 0.4;
  const RAYON_EXT = 0.66;
  if (rayon >= RAYON_INT && rayon <= RAYON_EXT) {
    // L'ouverture, en haut à droite. L'axe des ordonnées descend.
    const angle = (Math.atan2(y, x) * 180) / Math.PI;
    const dansOuverture = angle > -62 && angle < -4;
    if (!dansOuverture) return true;
  }
  // La barre horizontale, qui part du centre vers la droite.
  if (x >= 0.04 && x <= RAYON_EXT && y >= -0.1 && y <= 0.1) return true;
  return false;
}

/** Une image RGBA de `taille` pixels de côté, lissée par sur-échantillonnage. */
function dessiner(taille) {
  const SOUS = 4; // 16 échantillons par pixel : suffisant, même à 16 px
  const pixels = Buffer.alloc(taille * taille * 4);

  for (let py = 0; py < taille; py++) {
    for (let px = 0; px < taille; px++) {
      let r = 0;
      let v = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < SOUS; sy++) {
        for (let sx = 0; sx < SOUS; sx++) {
          // Coordonnées normalisées : centre (0,0), bord ±1.
          const x = ((px + (sx + 0.5) / SOUS) / taille) * 2 - 1;
          const y = ((py + (sy + 0.5) / SOUS) / taille) * 2 - 1;

          const dansFond = distanceCarreArrondi(x, y, 0.98, 0.46) <= 0;
          if (!dansFond) continue;

          if (dansLeG(x, y)) {
            r += CREME[0];
            v += CREME[1];
            b += CREME[2];
          } else {
            // Dégradé diagonal, clair en haut à gauche.
            const t = Math.min(Math.max((x + y + 2) / 4, 0), 1);
            r += TERRA_CLAIR[0] + (TERRA_SOMBRE[0] - TERRA_CLAIR[0]) * t;
            v += TERRA_CLAIR[1] + (TERRA_SOMBRE[1] - TERRA_CLAIR[1]) * t;
            b += TERRA_CLAIR[2] + (TERRA_SOMBRE[2] - TERRA_CLAIR[2]) * t;
          }
          a += 255;
        }
      }

      const total = SOUS * SOUS;
      const couverture = a / total;
      const i = (py * taille + px) * 4;
      // Les composantes sont moyennées sur les seuls échantillons opaques,
      // sinon les bords tireraient vers le noir.
      const opaques = a / 255 || 1;
      pixels[i] = Math.round(r / opaques);
      pixels[i + 1] = Math.round(v / opaques);
      pixels[i + 2] = Math.round(b / opaques);
      pixels[i + 3] = Math.round(couverture);
    }
  }

  return pixels;
}

/* ── Encodage PNG ───────────────────────────────────────────────────── */

const TABLE_CRC = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const octet of buffer) c = TABLE_CRC[(c ^ octet) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function morceau(type, donnees) {
  const longueur = Buffer.alloc(4);
  longueur.writeUInt32BE(donnees.length);
  const corps = Buffer.concat([Buffer.from(type, "ascii"), donnees]);
  const controle = Buffer.alloc(4);
  controle.writeUInt32BE(crc32(corps));
  return Buffer.concat([longueur, corps, controle]);
}

function encoderPng(pixels, taille) {
  const entete = Buffer.alloc(13);
  entete.writeUInt32BE(taille, 0);
  entete.writeUInt32BE(taille, 4);
  entete[8] = 8; // 8 bits par composante
  entete[9] = 6; // RVBA
  entete[10] = 0;
  entete[11] = 0;
  entete[12] = 0;

  // Chaque ligne est précédée de son octet de filtre, ici « aucun ».
  const brut = Buffer.alloc(taille * (taille * 4 + 1));
  for (let y = 0; y < taille; y++) {
    brut[y * (taille * 4 + 1)] = 0;
    pixels.copy(brut, y * (taille * 4 + 1) + 1, y * taille * 4, (y + 1) * taille * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceau("IHDR", entete),
    morceau("IDAT", deflateSync(brut, { level: 9 })),
    morceau("IEND", Buffer.alloc(0)),
  ]);
}

/* ── Encodage ICO ───────────────────────────────────────────────────── */

/** Un ICO n'est qu'un répertoire d'images ; on y range des PNG. */
function encoderIco(images) {
  const entete = Buffer.alloc(6);
  entete.writeUInt16LE(0, 0);
  entete.writeUInt16LE(1, 2); // 1 = icône
  entete.writeUInt16LE(images.length, 4);

  const entrees = [];
  let decalage = 6 + images.length * 16;

  for (const { taille, png } of images) {
    const entree = Buffer.alloc(16);
    entree[0] = taille >= 256 ? 0 : taille;
    entree[1] = taille >= 256 ? 0 : taille;
    entree[2] = 0; // palette
    entree[3] = 0;
    entree.writeUInt16LE(1, 4); // plans
    entree.writeUInt16LE(32, 6); // bits par pixel
    entree.writeUInt32LE(png.length, 8);
    entree.writeUInt32LE(decalage, 12);
    entrees.push(entree);
    decalage += png.length;
  }

  return Buffer.concat([entete, ...entrees, ...images.map((i) => i.png)]);
}

/* ── Aperçu en terminal ─────────────────────────────────────────────── */

function apercu(taille = 40) {
  const pixels = dessiner(taille);
  const niveaux = " .:-=+*#%@";
  let sortie = "";
  for (let y = 0; y < taille; y++) {
    for (let x = 0; x < taille; x++) {
      const i = (y * taille + x) * 4;
      const alpha = pixels[i + 3] / 255;
      if (alpha < 0.15) {
        sortie += " ";
        continue;
      }
      // Le G est clair, le fond terracotta : on lit la luminosité.
      const lum = (pixels[i] * 0.3 + pixels[i + 1] * 0.6 + pixels[i + 2] * 0.1) / 255;
      sortie += niveaux[Math.min(niveaux.length - 1, Math.round(lum * 9))];
    }
    sortie += "\n";
  }
  return sortie;
}

/* ── Exécution ──────────────────────────────────────────────────────── */

console.log(apercu(44));

if (!process.argv.includes("--apercu")) {
  const ico = encoderIco(
    [16, 32, 48].map((taille) => ({ taille, png: encoderPng(dessiner(taille), taille) })),
  );

  const sorties = [
    ["src/app/favicon.ico", ico],
    ["src/app/icon.png", encoderPng(dessiner(512), 512)],
    ["src/app/apple-icon.png", encoderPng(dessiner(180), 180)],
  ];

  for (const [chemin, contenu] of sorties) {
    const absolu = resolve(RACINE, chemin);
    mkdirSync(dirname(absolu), { recursive: true });
    writeFileSync(absolu, contenu);
    console.log(`${chemin} — ${(contenu.length / 1024).toFixed(1)} ko`);
  }
}
