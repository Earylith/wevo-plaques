"use client";

import type { Article } from "@/lib/blog";
import CarteArticle from "./CarteArticle";
import { useFiltreJournal, ANCRE_GRILLE } from "./FiltreJournal";

/**
 * La grille complète des articles, filtrée par le sujet choisi en haut.
 *
 * Elle porte l'ancre vers laquelle le lecteur est emmené quand il clique un
 * sujet, et annonce elle-même le filtre actif : arriver sur une grille
 * amputée sans savoir pourquoi donnerait l'impression que des articles ont
 * disparu.
 */
export default function GrilleArticles({ articles }: { articles: Article[] }) {
  const { sujet, effacer } = useFiltreJournal();

  const visibles = sujet ? articles.filter((a) => a.categorie === sujet) : articles;

  return (
    <section id={ANCRE_GRILLE} className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:px-8">
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em] text-[#2A2016]">
          {sujet ? sujet : "Tous les articles"}
        </h2>

        {sujet && (
          <button
            type="button"
            onClick={effacer}
            className="text-[13px] font-semibold text-[#A35A38] underline decoration-[#EDD9A3] underline-offset-4 transition-colors hover:text-[#C4714A]"
          >
            {visibles.length} article{visibles.length > 1 ? "s" : ""} · tout afficher
          </button>
        )}
      </div>

      {visibles.length === 0 ? (
        <p className="text-[14px] text-[#6B5D4E]">
          Rien encore sur ce sujet. Revenez bientôt.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((article) => (
            <CarteArticle key={article.slug} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
