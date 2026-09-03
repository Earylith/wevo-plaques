import { SITE_URL } from "@/lib/site";

/**
 * L'enveloppe commune aux e-mails Guidz.
 *
 * Un e-mail n'est pas une page web : les clients de messagerie ignorent les
 * feuilles de style externes, les classes, la moitié du CSS moderne, et
 * Outlook rend encore le HTML avec le moteur de Word. D'où des tableaux, des
 * styles en ligne, une largeur fixe de 600 pixels, et rien d'autre.
 *
 * Aucune image distante non plus. La plupart des boîtes les bloquent par
 * défaut : un message dont l'identité repose sur un logo arrive nu chez la
 * moitié des destinataires. Ce qui tient lieu d'identité ici — le filet
 * ocre, la serif du titre, le fond sable — est peint par le HTML lui-même et
 * s'affiche toujours.
 *
 * Trois détails qui ne se voient pas mais qui comptent :
 *
 *  - le PRÉ-EN-TÊTE, ce texte masqué que les boîtes affichent en aperçu à
 *    côté de l'objet. Sans lui, elles y mettent le premier texte trouvé ;
 *  - le contenu du client est ÉCHAPPÉ. Un logement nommé « Chez A&M <Sud> »
 *    casserait la mise en page, et un nom hostile pourrait pire ;
 *  - les couleurs sont posées explicitement, fond compris : sans cela, les
 *    clients en thème sombre inversent au hasard et rendent le texte
 *    illisible.
 */

const OCRE = "#C4714A";
const BRIQUE = "#A35A38";
const ENCRE = "#2A2016";
const PLUME = "#6B5D4E";
const SABLE = "#FBF5EC";
const TRAIT = "#EDD9A3";
const FOND = "#F4F1EA";

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

/** Rend un texte inoffensif dans du HTML. */
export function echapper(valeur: unknown): string {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface Bouton {
  libelle: string;
  href: string;
}

export interface Fait {
  intitule: string;
  valeur: string;
  /** Mis en avant : la référence de commande, le numéro de suivi. */
  fort?: boolean;
}

export interface Enveloppe {
  /** Aperçu affiché à côté de l'objet dans la boîte de réception. */
  apercu: string;
  titre: string;
  /** Paragraphes déjà échappés. */
  corps: string[];
  bouton?: Bouton;
  /** Encadré de faits : « Commande », « Livraison »… */
  faits?: Fait[];
  /** Intitulé de l'encadré, quand il en faut un. */
  titreFaits?: string;
  /** Dernière ligne, sous le trait : ce qui se passe ensuite. */
  postScriptum?: string;
}

/**
 * L'encadré de faits, en tableau.
 *
 * Chaque ligne pose l'intitulé à gauche et la valeur à droite, comme un
 * bordereau. C'est la partie que le client relira dans six mois pour
 * retrouver sa référence : elle doit rester lisible même sans mise en forme.
 */
function encadre(faits: Fait[], titre?: string): string {
  const lignes = faits
    .map((f, i) => {
      const bordure =
        i === 0 ? "" : `border-top:1px solid ${TRAIT}66;`;
      return `
        <tr>
          <td style="${bordure}padding:9px 0;font:400 12px/1.5 ${SANS};color:${PLUME};white-space:nowrap;vertical-align:top;">${echapper(f.intitule)}</td>
          <td align="right" style="${bordure}padding:9px 0 9px 18px;font:${f.fort ? "700 14px" : "600 13px"}/1.5 ${SANS};color:${f.fort ? BRIQUE : ENCRE};vertical-align:top;">${f.valeur}</td>
        </tr>`;
    })
    .join("");

  const entete = titre
    ? `<p style="margin:0 0 10px;font:700 10px/1 ${SANS};letter-spacing:0.12em;text-transform:uppercase;color:#A8998A;">${echapper(titre)}</p>`
    : "";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:26px 0;background-color:${SABLE};border:1px solid ${TRAIT};border-radius:14px;">
      <tr><td style="padding:18px 22px;">
        ${entete}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${lignes}</table>
      </td></tr>
    </table>`;
}

export function enveloppe(e: Enveloppe): string {
  const paragraphes = e.corps
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 15px;font:400 15px/1.7 ${SANS};color:${ENCRE};">${p}</p>`
    )
    .join("");

  const bouton = e.bouton
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 6px;">
        <tr><td align="center" bgcolor="${OCRE}" style="border-radius:999px;">
          <a href="${echapper(e.bouton.href)}"
             style="display:inline-block;padding:14px 30px;font:700 15px/1 ${SANS};color:#ffffff;text-decoration:none;border-radius:999px;">${echapper(e.bouton.libelle)}</a>
        </td></tr>
      </table>`
    : "";

  const ps = e.postScriptum
    ? `<p style="margin:26px 0 0;padding-top:20px;border-top:1px solid ${TRAIT};font:400 13px/1.65 ${SANS};color:${PLUME};">${e.postScriptum}</p>`
    : "";

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${echapper(e.titre)}</title>
</head>
<body style="margin:0;padding:0;background-color:${FOND};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${echapper(e.apercu)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${FOND};">
  <tr><td align="center" style="padding:30px 12px 24px;">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid ${TRAIT};border-radius:20px;overflow:hidden;">

      <!-- Le filet ocre tient lieu d'identité : il s'affiche partout, là où
           un logo distant serait bloqué une fois sur deux. -->
      <tr><td style="height:4px;background-color:${OCRE};line-height:4px;font-size:0;">&nbsp;</td></tr>

      <tr><td style="padding:30px 34px 6px;">
        <a href="${SITE_URL}" style="font:700 21px/1 ${SERIF};color:${ENCRE};text-decoration:none;letter-spacing:-0.02em;">Guidz</a>
        <span style="font:400 12px/1 ${SANS};color:#A8998A;padding-left:10px;">Livrets d’accueil &amp; plaques gravées</span>
      </td></tr>

      <tr><td style="padding:18px 34px 34px;">
        <h1 style="margin:0 0 18px;font:700 25px/1.28 ${SERIF};color:${ENCRE};letter-spacing:-0.01em;">${echapper(e.titre)}</h1>
        ${paragraphes}
        ${e.faits?.length ? encadre(e.faits, e.titreFaits) : ""}
        ${bouton}
        ${ps}
      </td></tr>
    </table>

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
      <tr><td align="center" style="padding:20px 34px;font:400 12px/1.7 ${SANS};color:#A8998A;">
        Une question ? Répondez simplement à ce message.<br>
        <a href="${SITE_URL}" style="color:#A8998A;text-decoration:underline;">guidzme.fr</a>
      </td></tr>
    </table>

  </td></tr>
</table>
</body>
</html>`;
}

/**
 * La version texte du même message.
 *
 * Elle n'est pas un repli négligeable : elle pèse dans le classement
 * anti-indésirable, et c'est elle que lisent les montres et certains
 * lecteurs d'écran.
 */
export function versionTexte(parties: {
  titre: string;
  corps: string[];
  faits?: Fait[];
  titreFaits?: string;
  bouton?: Bouton;
  postScriptum?: string;
}): string {
  const blocs: string[] = [parties.titre, "=".repeat(Math.min(parties.titre.length, 60)), ""];
  blocs.push(...parties.corps.filter(Boolean), "");

  if (parties.faits?.length) {
    if (parties.titreFaits) blocs.push(parties.titreFaits.toUpperCase());
    for (const f of parties.faits) blocs.push(`${f.intitule} : ${f.valeur}`);
    blocs.push("");
  }
  if (parties.bouton) {
    blocs.push(`${parties.bouton.libelle} : ${parties.bouton.href}`, "");
  }
  if (parties.postScriptum) blocs.push(parties.postScriptum, "");

  blocs.push(
    "—",
    "Guidz — livrets d’accueil et plaques gravées",
    "Une question ? Répondez simplement à ce message.",
    SITE_URL
  );
  return blocs.join("\n");
}
