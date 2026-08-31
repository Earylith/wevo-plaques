"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "@phosphor-icons/react";

/**
 * Voile posé sur une option réservée à la formule Confort.
 *
 * Le principe : on MONTRE, on ne masque pas. Une option cachée ne donne envie
 * de rien ; une option qu'on voit sans pouvoir y toucher, si. Le contenu
 * reste donc lisible sous un voile clair, et la mention se fait discrète —
 * un cartouche opaque produirait exactement l'inverse de l'effet recherché.
 *
 * Deux allures, parce qu'une ligne de rubrique et un bloc de réglages n'ont
 * pas la même hauteur : au format `ligne`, une pastille suffit ; un cartouche
 * centré y déborderait sur les rubriques voisines.
 *
 * L'option reste inerte : `pointer-events-none` bloque la souris, `inert`
 * retire le contenu de l'ordre de tabulation. Sans quoi un hôte pourrait
 * saisir une valeur qui ne serait jamais publiée.
 *
 * Déclaré au niveau du module : dans le corps de l'éditeur, React le
 * remonterait à chaque frappe.
 */

interface Props {
  /** L'option est-elle verrouillée ? */
  verrouille: boolean;
  /** Ce que l'hôte gagnerait, formulé côté bénéfice. */
  argument?: string;
  /** `ligne` pour une rubrique, `bloc` pour un ensemble de réglages. */
  variante?: "ligne" | "bloc";
  children: React.ReactNode;
}

export default function VerrouConfort({
  verrouille,
  argument,
  variante = "bloc",
  children,
}: Props) {
  if (!verrouille) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/*
        Le contenu garde ses couleurs et sa netteté : c'est lui qu'on vend.
        Seule une transparence légère signale qu'il n'est pas actif.
      */}
      <div
        className="opacity-[0.55] pointer-events-none select-none"
        aria-hidden="true"
        inert
      >
        {children}
      </div>

      {/* Voile : dégradé clair, jamais opaque, pour laisser voir dessous. */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FBF5EC]/20 via-[#FBF5EC]/40 to-[#FBF5EC]/65"
        aria-hidden="true"
      />

      {variante === "ligne" ? (
        /* Rubrique : une pastille dans le coin, tout le bloc reste cliquable. */
        <Link
          href="/#offres"
          title={argument}
          className="absolute inset-0 flex items-center justify-end px-3 group"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 border border-[#EDD9A3] shadow-sm px-2.5 py-1.5 text-[10px] font-extrabold text-[#A35A38] group-hover:border-[#C4714A] transition-colors">
            <Lock size={11} weight="fill" />
            Formule Confort
          </span>
        </Link>
      ) : (
        /* Bloc : un bandeau bas, qui n'occulte pas ce qu'il surmonte. */
        <div className="absolute inset-x-0 bottom-0 p-3">
          <Link
            href="/#offres"
            className="block rounded-xl bg-white/90 backdrop-blur-[2px] border border-[#EDD9A3] shadow-sm px-3.5 py-2.5 group hover:border-[#C4714A] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#F7EBE4] text-[#C4714A] flex items-center justify-center shrink-0">
                <Lock size={13} weight="fill" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-[#2A2016]">
                  Passer à la formule Confort
                </span>
                {argument && (
                  <span className="block text-[10px] text-[#6B5D4E] leading-snug">
                    {argument}
                  </span>
                )}
              </span>
              <ArrowRight
                size={13}
                weight="bold"
                className="shrink-0 text-[#C4714A] group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
