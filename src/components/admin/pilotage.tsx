"use client";

import { ReactNode } from "react";

/**
 * Les briques d'affichage communes aux écrans de pilotage.
 *
 * Hébergements et commandes posent les mêmes questions — combien, dans quel
 * état, depuis quand — et méritaient de les poser de la même façon. Deux
 * séries de pastilles dessinées séparément finissent toujours par diverger,
 * et on ne sait plus si un vert ici veut dire la même chose que là.
 */

/** Un chiffre-clé, en haut d'écran. */
export function Indicateur({
  intitule,
  valeur,
  detail,
  ton = "neutre",
}: {
  intitule: string;
  valeur: ReactNode;
  detail?: ReactNode;
  /** `alerte` pour ce qui demande une action, `bien` pour ce qui va. */
  ton?: "neutre" | "bien" | "alerte";
}) {
  const teinte =
    ton === "alerte"
      ? "border-[#C4714A]/40 bg-[#FDF3DC]"
      : ton === "bien"
        ? "border-[#5A7A4E]/30 bg-[#EBF0E6]"
        : "border-[#EDD9A3]/50 bg-white";

  const chiffre =
    ton === "alerte" ? "text-[#A35A38]" : ton === "bien" ? "text-[#3F5836]" : "text-[#2A2016]";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${teinte}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A8998A]">
        {intitule}
      </p>
      <p
        className={`font-[family-name:var(--font-display)] text-2xl font-bold leading-tight ${chiffre}`}
      >
        {valeur}
      </p>
      {detail && <p className="mt-0.5 text-[10px] leading-snug text-[#6B5D4E]">{detail}</p>}
    </div>
  );
}

/** Un filtre, avec le nombre de lignes qu'il laisserait passer. */
export function Filtre({
  libelle,
  nombre,
  actif,
  onClick,
}: {
  libelle: string;
  nombre: number;
  actif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
        actif
          ? "border-[#C4714A] bg-[#C4714A] text-white"
          : "border-[#EDD9A3] bg-white text-[#6B5D4E] hover:border-[#C4714A]/50"
      }`}
    >
      {libelle}
      <span className={actif ? "text-white/70" : "text-[#A8998A]"}>{nombre}</span>
    </button>
  );
}

/** Une pastille d'état. */
export function Pastille({
  children,
  ton,
  titre,
}: {
  children: ReactNode;
  ton: "vert" | "ambre" | "rouge" | "bleu" | "gris";
  titre?: string;
}) {
  const teintes = {
    vert: "bg-[#EBF0E6] text-[#3F5836] border-[#5A7A4E]/30",
    ambre: "bg-[#FDF3DC] text-[#A35A38] border-[#EDD9A3]",
    rouge: "bg-red-50 text-red-700 border-red-200",
    bleu: "bg-[#E4EEF3] text-[#1A3F52] border-[#4A849E]/30",
    gris: "bg-gray-100 text-gray-600 border-gray-200",
  } as const;

  return (
    <span
      title={titre}
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${teintes[ton]}`}
    >
      {children}
    </span>
  );
}

/** Date courte, ou un tiret. */
export function jour(ms?: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

/**
 * Ancienneté en clair : « il y a 3 j ».
 *
 * Une date brute oblige à compter de tête pour savoir si une commande
 * traîne. Le nombre de jours, lui, saute aux yeux.
 */
export function depuis(ms?: number | null): string {
  if (!ms) return "—";
  const jours = Math.floor((Date.now() - ms) / 86400000);
  if (jours <= 0) return "aujourd’hui";
  if (jours === 1) return "hier";
  if (jours < 31) return `il y a ${jours} j`;
  const mois = Math.floor(jours / 30);
  return mois < 12 ? `il y a ${mois} mois` : `il y a ${Math.floor(mois / 12)} an(s)`;
}

/** Montant en euros, sans décimale inutile. */
export function euros(montant: number): string {
  return montant
    .toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    .concat(" €");
}
