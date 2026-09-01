/**
 * Transforme un texte en adresse lisible.
 *
 * L'apostrophe devient un s\u00e9parateur au lieu d'\u00eatre aval\u00e9e : elle est tr\u00e8s
 * fr\u00e9quente dans les noms d'h\u00e9bergements fran\u00e7ais, et \u00ab Le Nid d'Aigle \u00bb
 * donnait \u00ab le-nid-daigle \u00bb \u2014 un mot qui n'existe pas et qui se lit mal dans
 * une adresse que les voyageurs ont sous les yeux.
 *
 * Le tiret final est retir\u00e9 : \u00ab Chez l'Habitant \u00bb se terminait autrement par
 * un s\u00e9parateur orphelin.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    // Apostrophes droites et typographiques, trait\u00e9es comme des espaces.
    .replace(/['\u2019\u2018`]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}
