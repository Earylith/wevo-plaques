/**
 * L'adresse publique du site.
 *
 * Elle sert aux adresses canoniques, au plan du site et aux données
 * structurées : toutes doivent être absolues, sans quoi les moteurs de
 * recherche indexent des adresses relatives — c'est-à-dire rien.
 *
 * La variable d'environnement fait foi quand elle est renseignée ; le repli
 * évite qu'une compilation locale, où elle est vide, ne parte publier des
 * liens `localhost` dans un plan de site.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.guidzme.fr"
).replace(/\/$/, "");

export function urlAbsolue(chemin: string): string {
  return `${SITE_URL}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;
}
