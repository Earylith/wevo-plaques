"use client";

import { ArrowUpRight, Building2, Mountain, Sun, Waves } from "lucide-react";
import { LivretDemo } from "@/lib/livretsDemo";

/**
 * Vignette d'un livret de démonstration.
 *
 * Deux allures, décidées par la formule et non par le goût :
 *
 * — Le CONFORT montre une photo de couverture, parce que sa page en affiche
 *   une.
 * — L'ESSENTIELLE n'en a pas. Sa page n'affiche aucune photo : en poser une
 *   sur la vignette promettrait ce que la formule ne livre pas, et le
 *   visiteur découvrirait la différence après avoir payé. Elle reçoit à la
 *   place un bandeau typographique dans sa couleur.
 *
 * Déclarée au niveau du module : réutilisée par la page d'accueil et par la
 * page qui rassemble tous les livrets, elle ne peut pas diverger entre les
 * deux.
 */

const ICONES = {
  immeuble: Building2,
  montagne: Mountain,
  soleil: Sun,
  vagues: Waves,
} as const;

export default function CarteLivretDemo({ livret }: { livret: LivretDemo }) {
  const Icone = ICONES[livret.icone];
  const estConfort = livret.formule === "Confort";

  const pastilleVille = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-semibold tracking-tight text-[#2A2016] shadow-[0_2px_8px_rgba(42,32,22,0.12)] backdrop-blur-md">
      <Icone size={13} style={{ color: livret.accent }} />
      {livret.ville}
    </span>
  );

  const pastilleFormule = (
    <span
      className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold tracking-tight shadow-[0_2px_8px_rgba(42,32,22,0.12)] backdrop-blur-md"
      style={{
        backgroundColor: estConfort ? "#C4714A" : "rgba(255,255,255,0.9)",
        color: estConfort ? "#FFFFFF" : "#2A2016",
      }}
    >
      {livret.formule}
    </span>
  );

  return (
    <a
      href={livret.href ?? `/${livret.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-[30px] bg-white p-3 ring-1 ring-[#2A2016]/[0.06] shadow-[0_1px_2px_rgba(42,32,22,0.04),0_8px_24px_-12px_rgba(42,32,22,0.14)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(42,32,22,0.04),0_28px_50px_-18px_rgba(42,32,22,0.28)]"
    >
      {livret.image ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#F0E8D6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={livret.image}
            alt={`${livret.nom}, ${livret.ville}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A2016]/25 via-transparent to-transparent" />
          <span className="absolute left-3 top-3">{pastilleVille}</span>
          <span className="absolute right-3 top-3">{pastilleFormule}</span>
        </div>
      ) : (
        /*
          Sans photo, la vignette repose sur sa couleur et son initiale. Un
          cadre vide ou une image d'illustration mentiraient tous les deux —
          l'un par tristesse, l'autre par promesse.
        */
        <div
          className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[22px] p-4"
          style={{ backgroundColor: livret.accentPale }}
        >
          <div className="flex items-start justify-between gap-2">
            {pastilleVille}
            {pastilleFormule}
          </div>
          <div className="flex items-end justify-between gap-3">
            <span
              className="font-[family-name:var(--font-display)] text-[46px] font-bold leading-none tracking-[-0.03em] opacity-90"
              style={{ color: livret.accent }}
            >
              {livret.nom.replace(/^(Le|La|Les|L')\s*/i, "").charAt(0)}
            </span>
            <Icone size={34} style={{ color: livret.accent, opacity: 0.35 }} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
        <p
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: livret.accent }}
        >
          {livret.type}
        </p>
        <h3 className="mb-2.5 text-[19px] font-bold leading-snug tracking-[-0.02em] text-[#2A2016]">
          {livret.nom}
        </h3>
        <p className="text-[13.5px] leading-relaxed text-[#6B5D4E]">{livret.resume}</p>

        <p className="mb-6 mt-4 text-[11.5px] font-medium text-[#9C8F80]">{livret.reperes}</p>

        <div className="mt-auto flex items-center justify-between border-t border-[#2A2016]/[0.07] pt-5">
          <span
            className="text-[13px] font-semibold tracking-tight"
            style={{ color: livret.accent }}
          >
            Ouvrir le livret
          </span>
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: livret.accentPale, color: livret.accent }}
          >
            {/* Le fond plein n'apparaît qu'au survol. */}
            <span
              className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: livret.accent }}
            />
            <ArrowUpRight
              size={17}
              className="relative transition-colors duration-300 group-hover:text-white"
            />
          </span>
        </div>
      </div>
    </a>
  );
}
