"use client";

import { useFiltreJournal } from "./FiltreJournal";

/**
 * Les sujets du journal, en haut de page.
 *
 * De vrais boutons, désormais : ils filtrent la grille d'articles et y
 * emmènent le lecteur. Le sujet actif est visiblement actif, et se
 * re-clique pour tout réafficher.
 */
export default function SujetsBlog({ sujets }: { sujets: string[] }) {
  const { sujet, choisir } = useFiltreJournal();

  return (
    <div className="mt-8 flex flex-wrap items-center gap-2.5">
      {sujets.map((nom) => {
        const actif = sujet === nom;
        return (
          <button
            key={nom}
            type="button"
            onClick={() => choisir(nom)}
            aria-pressed={actif}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              actif
                ? "border-[#C4714A] bg-[#C4714A] text-white"
                : "border-[#EDD9A3] bg-white/70 text-[#6B5D4E] hover:border-[#C4714A] hover:text-[#C4714A]"
            }`}
          >
            {nom}
          </button>
        );
      })}
    </div>
  );
}
