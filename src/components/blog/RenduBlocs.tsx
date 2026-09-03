import Link from "next/link";
import {
  ArrowRight,
  Check,
  Info,
  Lightbulb,
  Quote,
  TriangleAlert,
  X,
} from "lucide-react";
import type { Bloc } from "@/lib/blog";
import TexteRiche from "./TexteRiche";

/**
 * Le rendu des blocs d'un article.
 *
 * Un seul endroit décide de l'apparence d'un paragraphe, d'un tableau ou
 * d'un encadré. Écrire un article ne demande donc aucune décision de mise
 * en forme — et corriger une respiration se fait ici, pour les sept
 * articles à la fois.
 *
 * `accent` est la couleur de l'article : elle traverse tous les blocs pour
 * que la page ait une couleur, et pas seulement une illustration colorée
 * en haut.
 */

const TONS = {
  info: {
    fond: "#E4EEF3",
    bord: "#2B5F75",
    texte: "#1A3F52",
    Icone: Info,
  },
  astuce: {
    fond: "#EBF0E6",
    bord: "#5A7A4E",
    texte: "#3F5836",
    Icone: Lightbulb,
  },
  alerte: {
    fond: "#F7EBE4",
    bord: "#C4714A",
    texte: "#A35A38",
    Icone: TriangleAlert,
  },
} as const;

function Paragraphe({ texte }: { texte: string }) {
  return (
    <p className="my-6 text-[17px] leading-[1.85] text-[#4A4036] sm:text-[17.5px]">
      <TexteRiche texte={texte} />
    </p>
  );
}

export default function RenduBlocs({
  blocs,
  accent,
  accentPale,
  accentSombre,
}: {
  blocs: Bloc[];
  accent: string;
  accentPale: string;
  accentSombre: string;
}) {
  return (
    <>
      {blocs.map((bloc, i) => {
        switch (bloc.type) {
          case "p":
            return <Paragraphe key={i} texte={bloc.texte} />;

          case "h2":
            return (
              /*
               * `scroll-mt` compense l'en-tête fixe : sans lui, un clic
               * depuis le sommaire place le titre sous la barre du haut.
               */
              <h2
                key={i}
                id={bloc.id}
                className="group mt-16 mb-6 scroll-mt-28 font-[family-name:var(--font-display)] text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-[#2A2016] sm:text-[36px]"
              >
                <span
                  className="mb-4 block h-[3px] w-12 rounded-full"
                  style={{ background: accent }}
                />
                {bloc.texte}
                <a
                  href={`#${bloc.id}`}
                  className="ml-2 align-middle text-[18px] font-normal opacity-0 transition-opacity group-hover:opacity-40"
                  aria-label={`Lien vers la section ${bloc.texte}`}
                >
                  #
                </a>
              </h2>
            );

          case "h3":
            return (
              <h3
                key={i}
                className="mt-10 mb-4 font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.01em] text-[#2A2016] sm:text-[24px]"
              >
                {bloc.texte}
              </h3>
            );

          case "liste":
            return bloc.ordonnee ? (
              <ol key={i} className="my-7 space-y-3.5">
                {bloc.items.map((item, j) => (
                  <li key={j} className="flex gap-4">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                      style={{ background: accentPale, color: accentSombre }}
                    >
                      {j + 1}
                    </span>
                    <span className="text-[16.5px] leading-[1.75] text-[#4A4036]">
                      <TexteRiche texte={item} />
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="my-7 space-y-3.5">
                {bloc.items.map((item, j) => (
                  <li key={j} className="flex gap-4">
                    <span
                      className="mt-[9px] h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ background: accent }}
                    />
                    <span className="text-[16.5px] leading-[1.75] text-[#4A4036]">
                      <TexteRiche texte={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "citation":
            return (
              <figure
                key={i}
                className="relative my-10 rounded-[24px] px-7 py-8 sm:px-10"
                style={{ background: accentPale }}
              >
                <Quote
                  size={30}
                  className="absolute top-6 right-7 opacity-25"
                  style={{ color: accent }}
                  strokeWidth={1.5}
                />
                <blockquote className="font-[family-name:var(--font-display)] text-[22px] leading-[1.45] font-medium text-[#2A2016] italic sm:text-[25px]">
                  « {bloc.texte} »
                </blockquote>
                {bloc.source && (
                  <figcaption
                    className="mt-4 text-[12px] font-semibold tracking-[0.14em] uppercase"
                    style={{ color: accentSombre }}
                  >
                    {bloc.source}
                  </figcaption>
                )}
              </figure>
            );

          case "encadre": {
            const ton = TONS[bloc.ton];
            return (
              <aside
                key={i}
                className="my-9 flex gap-4 rounded-[22px] border-l-[3px] p-6 sm:gap-5 sm:p-7"
                style={{ background: ton.fond, borderColor: ton.bord }}
              >
                <ton.Icone
                  size={22}
                  className="mt-0.5 shrink-0"
                  style={{ color: ton.bord }}
                  strokeWidth={2}
                />
                <div>
                  <p
                    className="mb-1.5 text-[15px] font-bold tracking-[-0.01em]"
                    style={{ color: ton.texte }}
                  >
                    {bloc.titre}
                  </p>
                  <p className="text-[15.5px] leading-[1.7] text-[#4A4036]">
                    <TexteRiche texte={bloc.texte} />
                  </p>
                </div>
              </aside>
            );
          }

          case "tableau":
            return (
              <figure key={i} className="my-10">
                {/*
                  Ce que le tableau mesure, AVANT les chiffres. Un tableau de
                  montants cumulés lu sans son unité de temps se lit de
                  travers, et on accuse le tableau d'être faux.
                */}
                {bloc.legende && (
                  <p className="mb-3 text-[13.5px] leading-relaxed text-[#5C3D2E]">
                    {bloc.legende}
                  </p>
                )}
                <div className="overflow-x-auto rounded-[22px] border border-[#EDD9A3] bg-white shadow-[0_10px_30px_rgba(90,61,46,0.05)]">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead>
                      <tr>
                        {bloc.colonnes.map((col, j) => (
                          <th
                            key={j}
                            scope="col"
                            className="px-5 py-4 text-[11px] font-bold tracking-[0.12em] uppercase"
                            style={
                              j === bloc.colonneMiseEnAvant
                                ? { background: accent, color: "#FFFDF8" }
                                : { background: "#F0E8D6", color: "#6B5D4E" }
                            }
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bloc.lignes.map((ligne, j) => (
                        <tr key={j} className="border-t border-[#F0E8D6]">
                          {ligne.map((cellule, k) => (
                            <td
                              key={k}
                              className={`px-5 py-4 align-top text-[14.5px] leading-[1.6] ${
                                k === 0
                                  ? "font-semibold text-[#2A2016]"
                                  : "text-[#6B5D4E]"
                              }`}
                              style={
                                k === bloc.colonneMiseEnAvant
                                  ? {
                                      background: accentPale,
                                      color: accentSombre,
                                      fontWeight: 600,
                                    }
                                  : undefined
                              }
                            >
                              {cellule}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/*
                  La légende était SOUS le tableau : le lecteur tombait donc
                  sur les chiffres avant de savoir ce qu'ils mesuraient, et
                  lisait « 180 € » pour un abonnement à 5 € par mois sans
                  comprendre qu'on cumulait trois ans. Elle passe au-dessus,
                  là où l'on énonce ce qu'on va montrer.
                */}
                <figcaption className="sr-only">{bloc.legende}</figcaption>
                {/* Le tableau déborde volontairement sur téléphone plutôt que
                    de se tasser : encore faut-il le dire au lecteur. */}
                <p className="mt-2 text-center text-[12px] text-[#6B5D4E]/60 sm:hidden">
                  Faites glisser le tableau vers la gauche pour tout voir
                </p>
              </figure>
            );

          case "etapes":
            return (
              <ol key={i} className="my-10 space-y-0">
                {bloc.items.map((etape, j) => (
                  <li key={j} className="relative flex gap-5 pb-8 last:pb-0">
                    {j < bloc.items.length - 1 && (
                      <span
                        className="absolute top-11 left-[19px] h-[calc(100%-2.75rem)] w-px"
                        style={{ background: `${accent}33` }}
                      />
                    )}
                    <span
                      className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-[17px] font-bold text-white"
                      style={{ background: accent }}
                    >
                      {j + 1}
                    </span>
                    <div className="pt-1.5">
                      <p className="mb-1.5 text-[17px] font-bold tracking-[-0.01em] text-[#2A2016]">
                        {etape.titre}
                      </p>
                      <p className="text-[16px] leading-[1.75] text-[#4A4036]">
                        <TexteRiche texte={etape.texte} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            );

          case "chiffres":
            return (
              <div
                key={i}
                className="my-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
              >
                {bloc.items.map((chiffre, j) => (
                  <div
                    key={j}
                    className="rounded-[20px] border border-[#EDD9A3]/70 bg-white px-5 py-6 text-center"
                  >
                    <p
                      className="font-[family-name:var(--font-display)] text-[38px] leading-none font-bold tracking-[-0.03em]"
                      style={{ color: accent }}
                    >
                      {chiffre.valeur}
                    </p>
                    <p className="mt-2.5 text-[13.5px] leading-[1.5] text-[#6B5D4E]">
                      {chiffre.libelle}
                    </p>
                  </div>
                ))}
              </div>
            );

          case "opposition":
            return (
              <div key={i} className="my-10 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#5A7A4E]/25 bg-[#EBF0E6]/60 p-6">
                  <p className="mb-4 flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-[#3F5836] uppercase">
                    <Check size={15} strokeWidth={3} />
                    {bloc.titreOui}
                  </p>
                  <ul className="space-y-2.5">
                    {bloc.oui.map((item, j) => (
                      <li
                        key={j}
                        className="flex gap-2.5 text-[15px] leading-[1.6] text-[#4A4036]"
                      >
                        <Check
                          size={15}
                          className="mt-1 shrink-0 text-[#5A7A4E]"
                          strokeWidth={3}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[22px] border border-[#C4714A]/25 bg-[#F7EBE4]/60 p-6">
                  <p className="mb-4 flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-[#A35A38] uppercase">
                    <X size={15} strokeWidth={3} />
                    {bloc.titreNon}
                  </p>
                  <ul className="space-y-2.5">
                    {bloc.non.map((item, j) => (
                      <li
                        key={j}
                        className="flex gap-2.5 text-[15px] leading-[1.6] text-[#4A4036]"
                      >
                        <X
                          size={15}
                          className="mt-1 shrink-0 text-[#C4714A]"
                          strokeWidth={3}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );

          case "cta":
            return (
              <div
                key={i}
                className="relative my-12 overflow-hidden rounded-[30px] bg-[#2A2016] px-7 py-9 sm:px-10 sm:py-11"
              >
                <div
                  className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full blur-[90px]"
                  style={{ background: `${accent}59` }}
                />
                <div className="relative z-10">
                  <p className="font-[family-name:var(--font-display)] text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-white sm:text-[30px]">
                    {bloc.titre}
                  </p>
                  <p className="mt-3 max-w-xl text-[15.5px] leading-[1.7] text-[#FBF5EC]/70">
                    {bloc.texte}
                  </p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href={bloc.href}
                      className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[14px] font-semibold text-[#2A2016] transition-transform hover:-translate-y-0.5"
                      style={{ background: "#FFFDF8" }}
                    >
                      {bloc.libelle}
                      <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                    {bloc.hrefSecondaire && bloc.libelleSecondaire && (
                      <Link
                        href={bloc.hrefSecondaire}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-[14px] font-semibold text-white/85 transition-colors hover:border-white/60 hover:text-white"
                      >
                        {bloc.libelleSecondaire}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
        }
      })}
    </>
  );
}
