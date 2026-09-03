"use client";

import { ArrowRight } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";
import CarteLivretDemo from "./CarteLivretDemo";
import { VitrineGarnie } from "@/lib/livretsDemo";

/**
 * Les livrets de démonstration, sur la page d'accueil.
 *
 * Quatre seulement — une rangée pleine sur ordinateur, deux sur téléphone.
 * Six laissaient une carte seule sur une deuxième rangée et faisaient défiler
 * longtemps sur mobile. Deux de chaque formule : le visiteur doit voir les
 * deux produits, pas seulement le plus cher.
 *
 * Les autres restent accessibles depuis la page qui les rassemble tous, et
 * le lien le dit plutôt que de les cacher.
 */

/** Le nombre en toutes lettres, tant qu'il se dit d'un mot. */
const NOMBRES: Record<number, string> = {
  2: "deux", 3: "trois", 4: "quatre", 5: "cinq", 6: "six",
  7: "sept", 8: "huit", 9: "neuf", 10: "dix",
};

export default function LivretsDemoSection({ vitrines }: { vitrines: VitrineGarnie[] }) {
  /*
   * Les vitrines arrivent garnies du contenu réel des livrets : la photo et le
   * nom viennent de la base, et non d'une copie écrite à côté qui finissait
   * par montrer autre chose que ce qu'on trouve derrière le lien.
   */
  const vedettes = vitrines.filter((v) => v.vedette);
  const restants = vitrines.length - vedettes.length;

  return (
    <section
      id="livrets"
      className="relative overflow-hidden py-20 lg:py-28"
      style={{ background: "linear-gradient(180deg, #FBF5EC 0%, #FFFFFF 100%)" }}
    >
      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-[520px] w-[520px] rounded-full bg-[#E4EEF3]/50 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[#F7EBE4]/60 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-label section-label-ocean mb-5 inline-flex">
              Côté voyageurs
            </span>
            <h2 className="mb-5 mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[#2A2016] sm:text-5xl">
              Ouvrez un <em className="not-italic text-gradient-terra">vrai livret</em>
            </h2>
            <p className="text-lg leading-relaxed text-[#6B5D4E]">
              {/*
                Le nombre se compte, il ne s'écrit pas : la page annonçait
                « quatre » alors qu'il y en avait six. Une phrase qui contredit
                ce qu'on a sous les yeux coûte plus cher que pas de phrase.
              */}
              Parcourez {NOMBRES[vedettes.length] ?? vedettes.length} livrets de
              présentation, dans les deux formules. Ce sont des pages en ligne, pas des maquettes :
              exactement ce que vos voyageurs découvrent après avoir scanné la plaque.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 lg:mt-16 lg:gap-6">
          {vedettes.map((livret, index) => (
            <AnimateOnScroll key={livret.slug} delay={0.1 + index * 0.08} className="h-full">
              <CarteLivretDemo livret={livret} />
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={0.4}>
          <div className="mt-10 text-center">
            {restants > 0 && (
              <a
                href="/livrets-demo"
                className="inline-flex items-center gap-2 rounded-full border border-[#2A2016]/10 bg-white px-6 py-3 text-[14px] font-semibold text-[#2A2016] transition-all hover:border-[#C4714A] hover:text-[#C4714A]"
              >
                Voir tous les livrets de démonstration
                <ArrowRight size={16} />
              </a>
            )}
            <p className="mt-6 text-sm text-[#6B5D4E]">
              À regarder de préférence sur votre téléphone — chaque livret reste modifiable depuis
              l&apos;éditeur, sans toucher à la plaque ni au QR code.
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
