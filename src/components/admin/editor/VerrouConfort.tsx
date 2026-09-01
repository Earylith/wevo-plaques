"use client";

import React from "react";
import Link from "next/link";
import { Star } from "@phosphor-icons/react";

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

/**
 * Ce sur quoi on appuie pour déverrouiller.
 *
 * Même apparence, deux natures : un bouton quand le déverrouillage se joue
 * sur place — l'hôte compose, l'envoyer ailleurs lui ferait perdre son
 * travail des yeux — et un lien vers les formules quand il faut sortir. On ne
 * rend jamais un lien qui n'irait nulle part.
 *
 * Au niveau du module, et non dans le corps du composant : React le
 * remonterait sinon à chaque rendu, et le voile clignoterait.
 */
function Declencheur({
  onDebloquer,
  className,
  titre,
  children,
}: {
  onDebloquer?: () => void;
  className: string;
  titre?: string;
  children: React.ReactNode;
}) {
  if (onDebloquer) {
    return (
      <button type="button" onClick={onDebloquer} title={titre} className={className}>
        {children}
      </button>
    );
  }
  return (
    <Link href="/#offres" title={titre} className={className}>
      {children}
    </Link>
  );
}

interface Props {
  /** L'option est-elle verrouillée ? */
  verrouille: boolean;
  /**
   * Ce que fait le déverrouillage.
   *
   * Fourni, il ouvre la confirmation de changement de formule. Absent, on
   * retombe sur le lien vers les formules — seule issue sensée pour un livret
   * déjà publié, dont la bascule est devenue un achat.
   */
  onDebloquer?: () => void;
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
  onDebloquer,
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
        <Declencheur
          onDebloquer={onDebloquer}
          titre={argument}
          className="absolute inset-0 flex w-full items-center justify-end px-3 group"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-white/95 border border-[#EDD9A3] shadow-sm px-2.5 py-1.5 text-[10px] font-extrabold text-[#A35A38] group-hover:border-[#C4714A] transition-colors">
            <Star size={11} weight="fill" className="text-[#C4714A]" />
            Confort
          </span>
        </Declencheur>
      ) : (
        /*
         * Bloc : une étoile, posée dans le coin.
         *
         * C'était un bandeau qui répétait « Passer à la formule Confort » sous
         * chaque option verrouillée — quatre fois dans le même éditeur. Une
         * phrase qu'on lit une fois devient du bruit à la quatrième, et le
         * bandeau finissait par masquer ce qu'il était censé faire désirer.
         *
         * L'étoile dit la même chose en un signe. L'argument reste, en
         * infobulle : il sert à qui s'interroge, sans encombrer les autres.
         */
        <div className="absolute inset-x-0 bottom-0 flex justify-end p-2.5">
          <Declencheur
            onDebloquer={onDebloquer}
            titre={argument ? `${argument} — réservé à la formule Confort` : "Réservé à la formule Confort"}
            className="flex items-center gap-1.5 rounded-full bg-white/95 border border-[#EDD9A3] shadow-sm px-2.5 py-1.5 group hover:border-[#C4714A] transition-colors"
          >
            <Star size={12} weight="fill" className="text-[#C4714A] shrink-0" />
            <span className="text-[10px] font-extrabold text-[#A35A38] whitespace-nowrap">
              Confort
            </span>
          </Declencheur>
        </div>
      )}
    </div>
  );
}
