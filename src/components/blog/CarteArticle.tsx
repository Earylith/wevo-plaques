import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { Article } from "@/lib/blog";
import { formaterDate } from "@/lib/blog";
import CouvertureArticle from "./CouvertureArticle";

/**
 * La vignette d'un article.
 *
 * Le titre est le lien : c'est lui que les lecteurs de synthèse vocale
 * annoncent, et c'est lui qui porte le sens. Le reste de la carte est
 * cliquable par-dessus, sans dupliquer un second lien vers la même page —
 * un doublon abîme autant l'accessibilité que le maillage.
 */
export default function CarteArticle({
  article,
  compact = false,
}: {
  article: Article;
  compact?: boolean;
}) {
  return (
    <article className="card-hover group relative flex flex-col overflow-hidden rounded-[26px] border border-[#EDD9A3]/70 bg-white">
      <CouvertureArticle
        article={article}
        className={compact ? "h-32" : "h-40"}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2.5">
          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase"
            style={{ background: article.accentPale, color: article.accentSombre }}
          >
            {article.categorie}
          </span>
          <span className="flex items-center gap-1 text-[11.5px] text-[#6B5D4E]/70">
            <Clock size={12} />
            {article.tempsLecture} min
          </span>
        </div>

        <h3
          className={`font-[family-name:var(--font-display)] font-bold tracking-[-0.02em] text-[#2A2016] transition-colors group-hover:text-[#C4714A] ${
            compact ? "text-[19px] leading-[1.25]" : "text-[21px] leading-[1.2]"
          }`}
        >
          <Link href={`/blog/${article.slug}`} className="before:absolute before:inset-0">
            {article.titre}
          </Link>
        </h3>

        {!compact && (
          <p className="mt-3 line-clamp-3 text-[14.5px] leading-[1.65] text-[#6B5D4E]">
            {article.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-5">
          <time
            dateTime={article.datePublication}
            className="text-[12px] text-[#6B5D4E]/60"
          >
            {formaterDate(article.datePublication)}
          </time>
          <ArrowRight
            size={17}
            className="text-[#C4714A] transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </article>
  );
}
