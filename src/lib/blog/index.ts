import type { Article } from "./types";
import { livretAccueilNumerique } from "./articles/livret-accueil-numerique";
import { comparatifConcurrents } from "./articles/comparatif-concurrents";
import { qrCodeLocation } from "./articles/qr-code-location";
import { reduireMessages } from "./articles/reduire-messages";
import { avisCinqEtoiles } from "./articles/avis-cinq-etoiles";
import { conciergerie } from "./articles/conciergerie";
import { arriveeAutonome } from "./articles/arrivee-autonome";
import { plaqueAccueilMateriaux } from "./articles/plaque-accueil-materiaux";
import { prixLivretAccueil } from "./articles/prix-livret-accueil";
import { accueilMultiCanaux } from "./articles/accueil-multi-canaux";

export type { Article, Bloc, QuestionReponse } from "./types";

/**
 * Le sommaire du blog.
 *
 * L'ordre de ce tableau est l'ordre de lecture recommandé, pas l'ordre
 * d'affichage : la page d'index trie par date. Il fait aussi office de
 * source unique pour le plan du site — un article ajouté ici apparaît
 * partout, y compris dans `sitemap.xml`, sans autre intervention.
 */
export const ARTICLES: Article[] = [
  livretAccueilNumerique,
  comparatifConcurrents,
  prixLivretAccueil,
  plaqueAccueilMateriaux,
  reduireMessages,
  qrCodeLocation,
  accueilMultiCanaux,
  avisCinqEtoiles,
  arriveeAutonome,
  conciergerie,
];

/** Du plus récent au plus ancien — l'ordre de la page d'index. */
export const ARTICLES_PAR_DATE = [...ARTICLES].sort((a, b) =>
  b.datePublication.localeCompare(a.datePublication),
);

export function trouverArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/**
 * Les articles suggérés en fin de lecture.
 *
 * On respecte les choix éditoriaux de l'article, puis on complète avec les
 * plus récents s'il en manque : une fin d'article sans suite proposée est
 * une sortie du site.
 */
export function articlesConnexes(article: Article, combien = 3): Article[] {
  const choisis = article.connexes
    .map((slug) => trouverArticle(slug))
    .filter((a): a is Article => Boolean(a) && a!.slug !== article.slug);

  for (const candidat of ARTICLES_PAR_DATE) {
    if (choisis.length >= combien) break;
    if (candidat.slug === article.slug) continue;
    if (choisis.some((a) => a.slug === candidat.slug)) continue;
    choisis.push(candidat);
  }

  return choisis.slice(0, combien);
}

/**
 * Les titres de niveau 2, pour le sommaire latéral.
 *
 * Lus depuis les blocs plutôt que déclarés à part : deux listes finiraient
 * par diverger, et un sommaire qui pointe vers une ancre disparue est pire
 * que pas de sommaire.
 */
export function sommaireDe(article: Article): { id: string; texte: string }[] {
  return article.blocs
    .filter((b): b is Extract<typeof b, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: b.id, texte: b.texte }));
}

/** Les catégories présentes, dans l'ordre d'apparition. */
export function categoriesDisponibles(): string[] {
  return [...new Set(ARTICLES_PAR_DATE.map((a) => a.categorie))];
}

/** « 14 janvier 2026 ». */
export function formaterDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
