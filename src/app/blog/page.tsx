import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calculator,
  Clock,
  Compass,
  Scale,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CouvertureArticle from "@/components/blog/CouvertureArticle";
import {
  ARTICLES,
  ARTICLES_PAR_DATE,
  categoriesDisponibles,
  formaterDate,
  trouverArticle,
} from "@/lib/blog";
import { urlAbsolue } from "@/lib/site";
import { FiltreJournal } from "@/components/blog/FiltreJournal";
import SujetsBlog from "@/components/blog/SujetsBlog";
import GrilleArticles from "@/components/blog/GrilleArticles";

/**
 * L'index du blog.
 *
 * Il a deux publics qui ne se ressemblent pas : celui qui arrive par la
 * page d'accueil et veut se faire une idée, et celui qui tombe ici depuis
 * un moteur de recherche avec une question précise. D'où l'article pilier
 * en pleine largeur, puis les entrées « par où commencer » qui
 * orientent selon le profil, avant la grille complète.
 */

export const metadata: Metadata = {
  title: "Le journal de l’accueil voyageur — conseils location saisonnière",
  description:
    "Livret d’accueil, prix et comparatifs, plaque avec QR code, avis voyageurs, organisation d’une conciergerie : nos guides pour un accueil qui ne vous coûte plus de messages.",
  keywords: [
    "blog location saisonnière",
    "conseils accueil voyageur",
    "livret d'accueil",
    "gestion location courte durée",
    "conciergerie airbnb",
    "prix livret d'accueil",
    "plaque accueil qr code",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: urlAbsolue("/blog"),
    title: "Le journal de l’accueil voyageur — Guidz",
    description:
      "Nos guides pour un accueil qui répond avant qu’on ait à demander : livret d’accueil, QR code, arrivée autonome, avis voyageurs.",
  },
};

const PARCOURS = [
  {
    slug: "livret-accueil-numerique-location-saisonniere",
    Icone: BookOpen,
    pour: "Je démarre",
    texte: "Ce qu’un livret doit contenir, et dans quel ordre l’écrire.",
  },
  {
    slug: "comparatif-livret-accueil-numerique",
    Icone: Scale,
    pour: "Je compare",
    texte: "Les cinq familles de solutions, leurs limites, et la nôtre.",
  },
  {
    slug: "prix-livret-accueil-numerique",
    Icone: Calculator,
    pour: "Je regarde le budget",
    texte: "Les quatre postes de coût, et le calcul sur trois ans.",
  },
  {
    slug: "conciergerie-accueil-plusieurs-logements",
    Icone: Building2,
    pour: "Je gère un parc",
    texte: "Standardiser sans rendre l’accueil impersonnel.",
  },
];

export default function BlogPage() {
  const aLaUne = ARTICLES[0];
  const suite = ARTICLES_PAR_DATE.filter((a) => a.slug !== aLaUne.slug);
  const categories = categoriesDisponibles();

  const donneesStructurees = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": urlAbsolue("/blog"),
        name: "Le journal Guidz",
        description:
          "Guides et méthodes sur l’accueil en location saisonnière : livret d’accueil, QR code, arrivée autonome, avis voyageurs, organisation d’une conciergerie.",
        url: urlAbsolue("/blog"),
        inLanguage: "fr-FR",
        publisher: {
          "@type": "Organization",
          name: "Guidz",
          url: urlAbsolue("/"),
        },
        blogPost: ARTICLES_PAR_DATE.map((article) => ({
          "@type": "BlogPosting",
          headline: article.titre,
          description: article.description,
          url: urlAbsolue(`/blog/${article.slug}`),
          datePublished: article.datePublication,
          dateModified: article.dateMaj ?? article.datePublication,
          author: { "@type": "Organization", name: article.auteur.nom },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: urlAbsolue("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: urlAbsolue("/blog"),
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees) }}
      />
      <Header />

      {/*
        Le fournisseur enveloppe la page : les pastilles de sujets sont en
        haut, la grille tout en bas, et elles doivent partager le même
        filtre. La page elle-même reste un composant serveur — ses enfants
        sont passés déjà rendus — donc l’index du journal reste statique.
      */}
      <FiltreJournal>
      <main className="flex-1 bg-[#FBF5EC]">
        {/* ── Entête ─────────────────────────────────────────── */}
        <section
          className="bg-grain relative overflow-hidden pt-36 pb-16 lg:pt-44 lg:pb-20"
          style={{ background: "linear-gradient(165deg, #F5E6C8 0%, #FBF5EC 65%)" }}
        >
          <div className="pointer-events-none absolute top-0 -right-40 h-[600px] w-[600px] rounded-full bg-[#C4714A]/8 blur-[110px]" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
            <nav aria-label="Fil d’Ariane" className="mb-7 text-[13px] text-[#6B5D4E]">
              <Link href="/" className="transition-colors hover:text-[#C4714A]">
                Accueil
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <span className="font-medium text-[#2A2016]">Blog</span>
            </nav>

            <span className="section-label">Le journal</span>

            <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[42px] leading-[1.05] font-bold tracking-[-0.03em] text-[#2A2016] sm:text-[58px] lg:text-[68px]">
              L’accueil voyageur,{" "}
              <em className="text-gradient-terra not-italic">sans y passer ses soirées</em>
            </h1>

            <p className="mt-6 max-w-2xl text-[17px] leading-[1.75] text-[#6B5D4E]">
              Des méthodes concrètes, écrites à partir de ce que vivent les hôtes et
              les conciergeries : ce qu’il faut écrire, où le placer, et ce que ça
              évite. Pas de recettes miracles — des choses qui tiennent une saison.
            </p>

            <SujetsBlog sujets={categories} />
          </div>
        </section>

        {/* ── L'article pilier ───────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 pt-4 lg:px-8">
          <Link
            href={`/blog/${aLaUne.slug}`}
            className="card-hover group grid grid-cols-1 overflow-hidden rounded-[34px] border border-[#EDD9A3]/70 bg-white lg:grid-cols-[minmax(0,1fr)_44%]"
          >
            <div className="order-2 flex flex-col justify-center p-8 sm:p-11 lg:order-1 lg:p-14">
              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-[#2A2016] px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase">
                  À lire en premier
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase"
                  style={{ background: aLaUne.accentPale, color: aLaUne.accentSombre }}
                >
                  {aLaUne.categorie}
                </span>
              </div>

              <h2 className="font-[family-name:var(--font-display)] text-[30px] leading-[1.12] font-bold tracking-[-0.025em] text-[#2A2016] transition-colors group-hover:text-[#C4714A] sm:text-[38px]">
                {aLaUne.titre}
              </h2>

              <p className="mt-4 max-w-xl text-[16px] leading-[1.75] text-[#6B5D4E]">
                {aLaUne.chapo}
              </p>

              <div className="mt-7 flex items-center gap-5 text-[12.5px] text-[#6B5D4E]/70">
                <time dateTime={aLaUne.datePublication}>
                  {formaterDate(aLaUne.datePublication)}
                </time>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {aLaUne.tempsLecture} min de lecture
                </span>
              </div>

              <span className="mt-7 inline-flex items-center gap-2 self-start rounded-full bg-[#2A2016] px-6 py-3 text-[13.5px] font-semibold text-white transition-colors group-hover:bg-[#C4714A]">
                Lire le guide complet
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </div>

            <CouvertureArticle
              article={aLaUne}
              taille="vedette"
              className="order-1 h-52 lg:order-2 lg:h-auto"
            />
          </Link>
        </section>

        {/* ── Par où commencer ───────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 pt-16 lg:px-8">
          <div className="mb-7 flex items-center gap-3">
            <Compass size={18} className="text-[#C4714A]" />
            <h2 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em] text-[#2A2016]">
              Par où commencer, selon votre situation
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PARCOURS.map((entree) => {
              const article = trouverArticle(entree.slug);
              if (!article) return null;
              return (
                <Link
                  key={entree.slug}
                  href={`/blog/${article.slug}`}
                  className="group rounded-[24px] border border-[#EDD9A3]/70 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#C4714A]/40 hover:shadow-[0_20px_40px_rgba(90,61,46,0.07)]"
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ background: article.accentPale }}
                  >
                    <entree.Icone size={20} style={{ color: article.accent }} />
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.14em] text-[#6B5D4E]/70 uppercase">
                    {entree.pour}
                  </p>
                  <p className="mt-2 text-[16.5px] leading-[1.35] font-bold text-[#2A2016] transition-colors group-hover:text-[#C4714A]">
                    {article.titre}
                  </p>
                  <p className="mt-2 text-[14px] leading-[1.6] text-[#6B5D4E]">
                    {entree.texte}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Tous les articles, filtrables par sujet ────────── */}
        <GrilleArticles articles={suite} />

        {/* ── Sortie ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
          <div className="relative overflow-hidden rounded-[34px] bg-[#2A2016] px-8 py-12 sm:px-12 lg:px-16 lg:py-16">
            <div className="pointer-events-none absolute -top-32 -right-20 h-96 w-96 rounded-full bg-[#C4714A]/25 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#5A7A4E]/20 blur-[100px]" />

            <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="font-[family-name:var(--font-display)] text-[30px] leading-[1.12] font-bold tracking-[-0.025em] text-white sm:text-[38px]">
                  Assez lu. Voyez ce que ça donne.
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-[#FBF5EC]/70">
                  Nos livrets de démonstration sont de vraies pages publiées, à ouvrir
                  de préférence sur votre téléphone. Les formules et leurs tarifs sont
                  détaillés ligne à ligne.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Link
                  href="/livrets-demo"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#FFFDF8] px-7 py-3.5 text-[14px] font-semibold text-[#2A2016] transition-transform hover:-translate-y-0.5"
                >
                  Voir les livrets
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/#offres"
                  className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-[14px] font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white"
                >
                  Formules et tarifs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      </FiltreJournal>

      <Footer />
    </>
  );
}
