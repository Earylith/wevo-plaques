import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DemoPreviewSection from "@/components/DemoPreviewSection";
import LivretsDemoSection from "@/components/LivretsDemoSection";
import { chargerVitrines } from "@/lib/server/vitrines";
import FeaturesSection from "@/components/FeaturesSection";
import DifferentiationSection from "@/components/DifferentiationSection";
import PricingSection from "@/components/PricingSection";
import ProSection from "@/components/ProSection";
import BlogSection from "@/components/BlogSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { FAQ_ACCUEIL } from "@/lib/faq";
import { SITE_URL, urlAbsolue } from "@/lib/site";

/*
 * L'adresse canonique de l'accueil, déclarée ici et non dans la mise en
 * page : posée à la racine, elle serait héritée par toutes les pages qui
 * n'en déclarent pas, et le site entier se donnerait pour l'accueil.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Les données structurées de l'accueil.
 *
 * Trois blocs, pour trois usages distincts dans les résultats de recherche.
 * `Organization` et `WebSite` disent à Google quel est le nom du site : sans
 * eux, il l'invente à partir du domaine ou du titre, et affiche parfois
 * « www.guidzme.fr » là où on attend « Guidzme ». `alternateName` couvre les
 * orthographes réellement tapées par les gens.
 *
 * `FAQPage` reprend les questions affichées plus bas dans la page, mot pour
 * mot : c'est la condition pour qu'elles puissent apparaître dépliées sous
 * le résultat, et c'est pourquoi elles viennent d'un fichier partagé plutôt
 * que d'être recopiées ici.
 */
function donneesStructurees() {
  const organisation = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organisation`,
    name: "Guidzme",
    alternateName: ["Guidz", "GuidzMe", "Guidz Me"],
    url: urlAbsolue("/"),
    logo: {
      "@type": "ImageObject",
      url: urlAbsolue("/icon.png"),
      width: 512,
      height: 512,
    },
    email: "contact@guidzme.fr",
    description:
      "Plaques d’accueil en bois gravées au laser, fabriquées en France, reliées à un livret d’accueil numérique dédié à chaque logement.",
    areaServed: { "@type": "Country", name: "France" },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organisation,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: "Guidzme",
        alternateName: ["Guidz", "GuidzMe"],
        url: urlAbsolue("/"),
        inLanguage: "fr-FR",
        publisher: { "@id": `${SITE_URL}/#organisation` },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ACCUEIL.map((entree) => ({
          "@type": "Question",
          name: entree.q,
          acceptedAnswer: { "@type": "Answer", text: entree.a },
        })),
      },
    ],
  };
}

export default async function Home() {
  const vitrines = await chargerVitrines();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(donneesStructurees()) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <DifferentiationSection />
        <SolutionSection />
        <DemoPreviewSection />
        <LivretsDemoSection vitrines={vitrines} />
        <FeaturesSection />
        <PricingSection />
        <ProSection />
        <BlogSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
