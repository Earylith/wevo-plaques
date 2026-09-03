import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CarteArticle from "@/components/blog/CarteArticle";
import { ARTICLES } from "@/lib/blog";

/**
 * Le journal, sur la page d'accueil.
 *
 * Trois articles, pas davantage : la section doit donner envie de lire, pas
 * remplacer l'index. Elle est aussi le chemin le plus court entre la page
 * la plus visitée du site et des contenus qui, eux, répondent à des
 * questions posées dans un moteur de recherche.
 *
 * L'ordre suivi est celui du sommaire, et non la date : un visiteur de la
 * page d'accueil hésite encore, et ce sont le guide, le comparatif et le
 * prix qu'il doit voir — pas le dernier article publié, quel qu'il soit.
 */
export default function BlogSection() {
  const articles = ARTICLES.slice(0, 3);

  return (
    <section className="bg-[#FBF5EC] py-20 lg:py-24" id="journal">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="section-label section-label-ocean">Le journal</span>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl leading-[1.08] font-bold tracking-tight text-[#2A2016] sm:text-5xl">
              Ce qu’on a appris{" "}
              <em className="text-gradient-terra not-italic">sur l’accueil</em>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[#6B5D4E]">
              Des guides écrits pour être appliqués : ce qu’il faut mettre dans un
              livret, où poser un QR code, comment couper les messages inutiles,
              comment tenir un parc de logements.
            </p>
          </div>

          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-[#EDD9A3] bg-white px-6 py-3.5 text-[13.5px] font-semibold text-[#2A2016] transition-all hover:border-[#C4714A] hover:text-[#C4714A] lg:self-auto"
          >
            Tous les articles
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <CarteArticle key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
