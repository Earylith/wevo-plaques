"use client";

import { useEffect, useState } from "react";
import { ArrowClockwise, Check } from "@phosphor-icons/react";
import { lireConsentement, effacerConsentement, FINALITES, Finalite } from "@/lib/consentement";

/**
 * Retirer ou revoir son consentement.
 *
 * Le RGPD exige qu'un consentement soit aussi facile à retirer qu'à donner.
 * Un bandeau qu'on ne peut plus rappeler enferme la personne dans un choix
 * fait une fois, souvent à la hâte.
 *
 * On affiche d'abord ce qui est en vigueur : quelqu'un qui vient ici veut
 * savoir où il en est avant de décider.
 */
export default function RevenirSurMonChoix() {
  const [choix, setChoix] = useState<ReturnType<typeof lireConsentement> | "inconnu">("inconnu");

  useEffect(() => {
    // Lu après le montage : le serveur ignore le choix du visiteur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoix(lireConsentement());
  }, []);

  if (choix === "inconnu") return null;

  const rouvrir = () => {
    effacerConsentement();
    // Rechargement : le bandeau lit le stockage au montage, et il est déjà
    // monté. Le recharger est plus honnête que de deviner son état interne.
    window.location.reload();
  };

  return (
    <div className="mt-4 rounded-2xl border border-[#EDD9A3] bg-white p-5">
      <p className="text-[13.5px] font-bold text-[#2A2016]">Votre choix actuel</p>

      {choix === null ? (
        <p className="mt-1.5 text-[14px] text-[#6B5D4E]">
          Vous n’avez pas encore répondu — rien n’est déposé.
        </p>
      ) : (
        <ul className="mt-2.5 space-y-1.5">
          {(Object.keys(FINALITES) as Finalite[]).map((cle) => (
            <li key={cle} className="flex items-center gap-2 text-[14px] text-[#5C3D2E]">
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-white ${
                  choix[cle] ? "bg-emerald-600" : "bg-black/[0.18]"
                }`}
              >
                {choix[cle] && <Check size={10} weight="bold" />}
              </span>
              {FINALITES[cle].titre} — {choix[cle] ? "acceptée" : "refusée"}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={rouvrir}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] px-4 py-2.5 text-[13px] font-semibold text-[#2A2016] transition-all hover:border-[#C4714A] hover:text-[#C4714A]"
      >
        <ArrowClockwise size={14} weight="bold" />
        Revoir mes choix
      </button>
    </div>
  );
}
