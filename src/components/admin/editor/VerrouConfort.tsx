"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight } from "@phosphor-icons/react";

/**
 * Voile posé sur une option réservée à la formule Confort.
 *
 * On MONTRE l'option au lieu de la cacher : un hôte en Essentielle doit
 * pouvoir constater ce qu'il gagnerait à changer de formule. La masquer
 * ferait de l'éditeur un outil plus pauvre ; la griser en fait un argument.
 *
 * L'option reste inerte : `pointer-events-none` et `aria-hidden` empêchent
 * aussi bien le clic que la navigation au clavier. Sans quoi un hôte
 * pourrait saisir une valeur qui ne serait jamais publiée.
 *
 * Déclaré au niveau du module : dans le corps de l'éditeur, React le
 * remonterait à chaque frappe.
 */

interface Props {
  /** L'option est-elle verrouillée ? */
  verrouille: boolean;
  /** Ce que l'hôte gagnerait, formulé côté bénéfice. */
  argument?: string;
  children: React.ReactNode;
}

export default function VerrouConfort({ verrouille, argument, children }: Props) {
  if (!verrouille) return <>{children}</>;

  return (
    <div className="relative">
      <div
        className="opacity-40 grayscale pointer-events-none select-none"
        aria-hidden="true"
        // L'attribut « inert » retire aussi le contenu de l'ordre de
        // tabulation, là où « pointer-events-none » ne bloque que la souris.
        inert
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-sm rounded-2xl border border-[#EDD9A3] bg-white/95 backdrop-blur-sm shadow-sm p-4 text-center space-y-2.5">
          <span className="w-9 h-9 rounded-full bg-[#F7EBE4] text-[#C4714A] flex items-center justify-center mx-auto">
            <Lock size={16} weight="fill" />
          </span>
          <p className="text-xs font-bold text-[#2A2016]">
            Passer à la formule Confort pour ajouter cette option
          </p>
          {argument && (
            <p className="text-[11px] text-[#6B5D4E] leading-relaxed">{argument}</p>
          )}
          <Link
            href="/#offres"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-[11px] font-bold transition-colors"
          >
            Voir la formule Confort
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}
