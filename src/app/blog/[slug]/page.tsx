import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, PenLine, RefreshCw, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BarreLecture from "@/components/blog/BarreLecture";
import CarteArticle from "@/components/blog/CarteArticle";
import CouvertureArticle from "@/components/blog/CouvertureArticle";
import RenduBlocs from "@/components/blog/RenduBlocs";
import SommaireArticle from "@/components/blog/SommaireArticle";
import TexteRiche from "@/components/blog/TexteRiche";
import {
  ARTICLES,
  articlesConnexes,
  formaterDate,
  sommaireDe,
  trouverArticle,
} from "@/lib/blog";
import { urlAbsolue } from "@/lib/site";

/**
 * Une page d'article.
 *
 * Les sept articles sont connus à la compilation : ils sont générés en
 * statique, servis en HTML complet, et ne dépendent d'aucune base. C'est ce
 * qui permet à un moteur de recherche de tout lire au premier passage.
 */

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

/*
 * Une adresse inconnue sous /blog est une vraie 404, jamais une page
 * rendue à la volée : sans cela, n'importe quelle faute de frappe
 * deviendrait une page indexable et vide.
 */
export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = trouverArticle(slug);
  if (!article) return {};

  const url = urlAbsolue(`/blog/${article.slug}`);

  return {
    title: article.titreSeo ?? article.titre,
    description: article.description,
    keywords: article.motsCles,
    authors: [{ name: article.auteur.nom }],
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      locale: "fr_FR",
      url,
      title: article.titreSeo ?? article.titre,
      description: article.description,
      publishedTime: article.datePublication,
      modifiedTime: article.dateMaj ?? article.datePublication,
      authors: [article.auteur.nom],
      tags: article.motsCles,
      siteName: "Guidz",
    },
    twitter: {
      card: "summary_large_image",
      title: article.titreSeo ?? article.titre,
      description: article.description,
    },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = trouverArticle(slug);
  if (!article) notFound();

  const sections = sommaireDe(article);
  const connexes = articlesConnexes(article);
  const url = urlAbsolue(`/blog/${article.slug}`);

  const donneesStructurees = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": url,
        headline: article.titre,
        description: article.description,
        url,
        inLanguage: "fr-FR",
        datePublished: article.datePublication,
        dateModified: article.dateMaj ?? article.datePublication,
        keywords: article.motsCles.join(", "),
        articleSection: article.categorie,
        wordCount: article.blocs.reduce((total, bloc) => {
          const texte = JSON.stringify(bloc);
          return total + texte.split(/\s+/).length;
        }, 0),
        author: { "@type": "Organization", name: article.auteur.nom },
        publisher: {
          "@type": "Organization",
          name: "Guidz",
          url: urlAbsolue("/"),
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: urlAbsolue("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: urlAbsolue("/blog") },
          { "@type": "ListItem", position: 3, name: article.titre, item: url },
        ],
      },
      /*
       * La FAQ est balisée séparément : c'est elle qui peut apparaître
       * dépliée dans les résultats de recherche, et elle doit donc
       * reprendre mot pour mot ce que la page affiche.
       */
      {
        "@type": "FAQPage",
        mainEntity: article.faq.map((qr) => ({
          "@type": "Question",
          name: qr.question,
          acceptedAnswer: { "@type": "Answer", text: qr.reponse },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />
      <BarreLecture accent={article.accent} />
      <Header />

      <main className="flex-1 bg-[#FBF5EC]">
        {/* ── Entête de l'article ────────────────────────────── */}
        <header
          className="bg-grain relative overflow-hidden pt-32 pb-14 lg:pt-40 lg:pb-16"
          style={{
            background: `linear-gradient(168deg, ${article.accentPale} 0%, #FBF5EC 70%)`,
          }}
        >
          <div
            className="pointer-events-none absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full blur-[120px]"
            style={{ background: `${article.accent}1F` }}
          />

          <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8">
            <nav aria-label="Fil d’Ariane" className="mb-7 text-[13px] text-[#6B5D4E]">
              <Link href="/" className="transition-colors hover:text-[#C4714A]">
                Accueil
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <Link href="/blog" className="transition-colors hover:text-[#C4714A]">
                Blog
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <span className="font-medium text-[#2A2016]">{article.categorie}</span>
            </nav>

            <span
              className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.16em] uppercase"
              style={{ background: article.accent, color: "#FFFDF8" }}
            >
              {article.categorie}
            </span>

            <h1 className="mt-5 font-[family-name:var(--font-display)] text-[36px] leading-[1.08] font-bold tracking-[-0.03em] text-[#2A2016] sm:text-[47px] lg:text-[54px]">
              {article.titre}
            </h1>

            <p className="mt-6 text-[18px] leading-[1.7] text-[#5C4D3E] sm:text-[19px]">
              {article.chapo}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-[#6B5D4E]">
              <span className="flex items-center gap-2">
                <PenLine size={14} style={{ color: article.accent }} />
                <span className="font-medium text-[#2A2016]">{article.auteur.nom}</span>
              </span>
              <time dateTime={article.datePublication}>
                {formaterDate(article.datePublication)}
              </time>
              {article.dateMaj && (
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={13} className="opacity-60" />
                  Mis à jour le {formaterDate(article.dateMaj)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="opacity-60" />
                {article.tempsLecture} min de lecture
              </span>
            </div>
          </div>
        </header>

        {/* ── Corps ──────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            {/*
              Le sommaire n'apparaît que sur grand écran. Sur téléphone il
              repousserait le début de l'article sous la ligne de flottaison,
              ce qui coûte plus de lecteurs qu'il n'en oriente.
            */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 pt-14">
                <SommaireArticle sections={sections} accent={article.accent} />

                <div className="mt-9 rounded-[20px] border border-[#EDD9A3]/70 bg-white p-5">
                  <p className="text-[13px] leading-[1.6] font-semibold text-[#2A2016]">
                    Votre livret, sur votre plaque
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[#6B5D4E]">
                    49 € en paiement unique, ou 69 € avec les modifications
                    illimitées.
                  </p>
                  <Link
                    href="/#offres"
                    className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#C4714A] transition-colors hover:text-[#A35A38]"
                  >
                    Voir les formules
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </aside>

            <article className="min-w-0 max-w-[720px] pt-10 lg:pt-14">
              {/* À retenir */}
              <div
                className="rounded-[26px] border p-6 sm:p-7"
                style={{
                  background: "#FFFDF8",
                  borderColor: `${article.accent}33`,
                }}
              >
                <p
                  className="mb-4 flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] uppercase"
                  style={{ color: article.accentSombre }}
                >
                  <Sparkles size={14} />
                  À retenir
                </p>
                <ul className="space-y-3">
                  {article.aRetenir.map((point, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full"
                        style={{ background: article.accent }}
                      />
                      <span className="text-[15.5px] leading-[1.65] text-[#4A4036]">
                        <TexteRiche texte={point} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <RenduBlocs
                blocs={article.blocs}
                accent={article.accent}
                accentPale={article.accentPale}
                accentSombre={article.accentSombre}
              />

              {/* ── FAQ ─────────────────────────────────────── */}
              <section className="mt-16">
                <h2
                  id="faq"
                  className="mb-7 scroll-mt-28 font-[family-name:var(--font-display)] text-[30px] leading-[1.15] font-bold tracking-[-0.02em] text-[#2A2016] sm:text-[34px]"
                >
                  <span
                    className="mb-4 block h-[3px] w-12 rounded-full"
                    style={{ background: article.accent }}
                  />
                  Questions fréquentes
                </h2>

                <div className="space-y-3">
                  {article.faq.map((qr) => (
                    <details
                      key={qr.question}
                      className="group rounded-[20px] border border-[#EDD9A3]/70 bg-white px-6 py-5 transition-colors open:border-[#EDD9A3]"
                    >
                      {/* Le triangle natif est masqué des deux façons :
                          `list-none` suffit à Firefox et Chrome, Safari
                          demande encore son pseudo-élément propriétaire. */}
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[16px] leading-[1.45] font-semibold text-[#2A2016] marker:content-none [&::-webkit-details-marker]:hidden">
                        {qr.question}
                        <span
                          className="mt-1 shrink-0 text-[20px] leading-none font-light transition-transform group-open:rotate-45"
                          style={{ color: article.accent }}
                          aria-hidden
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3.5 text-[15.5px] leading-[1.75] text-[#4A4036]">
                        {qr.reponse}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              {/* ── Signature ───────────────────────────────── */}
              <div className="mt-14 flex flex-col gap-5 rounded-[26px] border border-[#EDD9A3]/70 bg-white p-7 sm:flex-row sm:items-center">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-[family-name:var(--font-display)] text-[22px] font-bold"
                  style={{ background: article.accentPale, color: article.accentSombre }}
                >
                  G
                </div>
                <div>
                  <p className="text-[15.5px] font-bold text-[#2A2016]">
                    {article.auteur.nom}
                  </p>
                  <p className="mt-1 text-[14px] leading-[1.6] text-[#6B5D4E]">
                    {article.auteur.role}. Nous fabriquons des plaques d’accueil gravées
                    en France, reliées à une page web dédiée à chaque logement — et nous
                    écrivons ici ce que nous voyons fonctionner sur le terrain.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#6B5D4E] transition-colors hover:text-[#C4714A]"
                >
                  <ArrowLeft size={15} />
                  Tous les articles
                </Link>
              </div>
            </article>
          </div>
        </div>

        {/* ── Suite de lecture ───────────────────────────────── */}
        <section className="border-t border-[#EDD9A3]/60 bg-[#F0E8D6]/40 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="mb-8 font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em] text-[#2A2016] sm:text-[30px]">
              À lire ensuite
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {connexes.map((suggestion) => (
                <CarteArticle key={suggestion.slug} article={suggestion} compact />
              ))}
            </div>
          </div>
        </section>

        {/* ── Sortie ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="relative grid grid-cols-1 overflow-hidden rounded-[34px] border border-[#EDD9A3]/70 bg-white lg:grid-cols-[minmax(0,1fr)_38%]">
            <div className="p-8 sm:p-11 lg:p-14">
              <span className="section-label section-label-terra">Passer à la pratique</span>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-[28px] leading-[1.12] font-bold tracking-[-0.025em] text-[#2A2016] sm:text-[36px]">
                Une plaque gravée, une page qui change quand vous voulez
              </h2>
              <p className="mt-4 max-w-lg text-[16px] leading-[1.7] text-[#6B5D4E]">
                Fabriquée en France, gravée au laser, avec un QR code unique qui ne
                bouge jamais. Derrière, votre livret : Wi-Fi, accès, équipements,
                bonnes adresses, contacts.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/#offres"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#2A2016] px-7 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#C4714A]"
                >
                  Voir les formules et tarifs
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/livrets-demo"
                  className="inline-flex items-center justify-center rounded-full border border-[#EDD9A3] px-7 py-3.5 text-[14px] font-semibold text-[#2A2016] transition-colors hover:border-[#C4714A] hover:text-[#C4714A]"
                >
                  Ouvrir une démonstration
                </Link>
              </div>
              <p className="mt-6 text-[13px] text-[#6B5D4E]/75">
                Plusieurs logements ?{" "}
                <Link
                  href="/devis?offre=multibien"
                  className="font-semibold text-[#C4714A] underline decoration-[#C4714A]/30 underline-offset-2 hover:decoration-[#C4714A]"
                >
                  Demandez un devis multi-biens
                </Link>
                .
              </p>
            </div>

            <CouvertureArticle
              article={article}
              taille="entete"
              className="order-first h-44 lg:order-last lg:h-auto"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
