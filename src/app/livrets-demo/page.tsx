import type { Metadata } from "next";
import Link from "next/link";
import CarteLivretDemo from "@/components/CarteLivretDemo";
import { LIVRETS_DEMO } from "@/lib/livretsDemo";

/**
 * Tous les livrets de démonstration, réunis.
 *
 * La page d'accueil n'en montre que quatre — une rangée pleine. Les autres
 * ne doivent pas pour autant disparaître : quelqu'un qui hésite veut voir
 * plusieurs cas, et un logement qui ressemble au sien. Cette page est leur
 * adresse, et le pied de page y mène.
 */

export const metadata: Metadata = {
  title: "Livrets de démonstration — Guidz",
  description:
    "Tous nos livrets d'accueil de démonstration, en formule Essentielle et Confort. Des pages en ligne, pas des maquettes.",
};

export default function LivretsDemoPage() {
  const confort = LIVRETS_DEMO.filter((l) => l.formule === "Confort");
  const essentielle = LIVRETS_DEMO.filter((l) => l.formule === "Essentielle");

  return (
    <main className="min-h-screen bg-[#FBF5EC]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <Link
          href="/"
          className="text-[13px] font-semibold text-[#6B5D4E] transition-colors hover:text-[#C4714A]"
        >
          ← Retour à l’accueil
        </Link>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-[40px] font-bold leading-[1.05] tracking-[-0.025em] text-[#2A2016] sm:text-[54px]">
          Les livrets de démonstration
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#6B5D4E]">
          Ce sont des pages réellement en ligne, pas des maquettes : exactement ce
          que vos voyageurs découvrent après avoir scanné la plaque. À regarder de
          préférence sur votre téléphone.
        </p>

        {/*
          Les deux formules sont séparées et nommées. Mélangées, le visiteur
          attribuait à l'Essentielle des rubriques qu'elle ne comprend pas — et
          découvrait la différence après avoir payé.
        */}
        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em] text-[#2A2016]">
            Formule Confort
          </h2>
          <p className="mt-1.5 text-[14.5px] text-[#6B5D4E]">
            Bonnes adresses, équipements, photos, page multilingue — et des
            modifications illimitées.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
            {confort.map((livret) => (
              <CarteLivretDemo key={livret.slug} livret={livret} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-[family-name:var(--font-display)] text-[26px] font-bold tracking-[-0.02em] text-[#2A2016]">
            Formule Essentielle
          </h2>
          <p className="mt-1.5 text-[14.5px] text-[#6B5D4E]">
            L’essentiel, bien rangé : arrivée, Wi-Fi, règlement, départ et
            contacts. Sans photo — c’est ce que la formule contient.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:gap-6">
            {essentielle.map((livret) => (
              <CarteLivretDemo key={livret.slug} livret={livret} />
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-[26px] border border-[#EDD9A3] bg-white p-7 text-center">
          <p className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.015em] text-[#2A2016]">
            Le vôtre peut ressembler à ça
          </p>
          <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-[#6B5D4E]">
            Choisissez votre formule, composez votre page, et publiez-la avec
            votre plaque.
          </p>
          <Link
            href="/#offres"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2A2016] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98]"
          >
            Voir les formules
          </Link>
        </div>
      </div>
    </main>
  );
}
