"use client";

import { useEffect } from "react";
import { X, Check, ArrowRight, Warning } from "@phosphor-icons/react";
import { OfferType } from "@/lib/types/accommodation";

/**
 * Confirmation d'un changement de formule, avant tout paiement.
 *
 * Changer de formule modifie ce que l'hôte verra, ce qu'il pourra saisir et
 * ce qu'il paiera en publiant : cela mérite une question, pas un basculement
 * silencieux. On y annonce donc le prix — c'est la seule information qui
 * engage — et le fait que rien n'est encore débité.
 *
 * Le contenu déjà saisi n'est jamais perdu : repasser à l'Essentielle masque
 * les rubriques qu'elle ne couvre pas, elles reviennent intactes au Confort.
 * On le dit, parce que c'est précisément ce qu'un hôte craint en cliquant.
 */

const FORMULES: Record<
  OfferType,
  { nom: string; versLa: string; garder: string; prix: string; detail: string; apports: string[] }
> = {
  comfort: {
    nom: "Confort",
    versLa: "au Confort",
    garder: "Garder l’Essentielle",
    prix: "69 € + 1,99 €/mois",
    detail: "réglés à la publication, avec votre plaque",
    apports: [
      "Plaque en bois gravée, avec votre phrase de signature",
      "Modifications illimitées, quand vous voulez",
      "Bonnes adresses, équipements, questions fréquentes",
      "Page multilingue, traduite automatiquement",
      "Vos couleurs et vos photos",
    ],
  },
  essential: {
    nom: "Essentielle",
    versLa: "à l’Essentielle",
    garder: "Garder le Confort",
    prix: "49 €",
    detail: "réglés une fois, avec votre plaque",
    apports: [
      "Plaque en bois gravée, avec la phrase standard",
      "Wi-Fi et codes d’accès",
      "Arrivée et départ",
      "Règlement de l’hébergement",
      "Contacts et urgences",
    ],
  },
};

export default function ChoixFormule({
  vers,
  enCours,
  erreur,
  onConfirmer,
  onAnnuler,
}: {
  /** Formule visée, ou `null` quand la question n'est pas posée. */
  vers: OfferType | null;
  enCours: boolean;
  erreur: string | null;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  useEffect(() => {
    if (!vers) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !enCours) onAnnuler();
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [vers, enCours, onAnnuler]);

  if (!vers) return null;

  const cible = FORMULES[vers];
  const versConfort = vers === "comfort";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Passer ${cible.versLa}`}
      className="fixed inset-0 z-[140] flex items-end justify-center bg-[#2A2016]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
    >
      <div className="w-full max-w-md overflow-hidden rounded-t-[26px] bg-white shadow-[0_24px_60px_-12px_rgba(42,32,22,0.4)] sm:rounded-[26px]">
        <div className="flex items-start justify-between gap-4 p-6 pb-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#A8998A]">
              Changer de formule
            </p>
            <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[26px] font-bold leading-tight tracking-[-0.02em] text-[#2A2016]">
              Passer {cible.versLa} ?
            </h2>
          </div>
          <button
            type="button"
            onClick={onAnnuler}
            disabled={enCours}
            aria-label="Annuler"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-2 text-[#A8998A] transition-colors hover:bg-black/[0.04] hover:text-[#2A2016] disabled:opacity-40"
          >
            <X size={17} weight="bold" />
          </button>
        </div>

        <div className="p-6 pt-4">
          <ul className="space-y-2.5">
            {cible.apports.map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-[14px] leading-snug text-[#5C3D2E]">
                <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-[#C4714A]" />
                {a}
              </li>
            ))}
          </ul>

          {/*
            Repasser à l'Essentielle est le geste qui inquiète : on répond à
            l'inquiétude à l'endroit exact où elle naît.
          */}
          {!versConfort && (
            <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[#FDF8F0] p-3.5 text-[13.5px] leading-relaxed text-[#5C3D2E]">
              <Warning size={15} weight="fill" className="mt-0.5 shrink-0 text-[#C4714A]" />
              Les rubriques que l’Essentielle ne couvre pas seront masquées.
              Rien n’est effacé : elles reviennent intactes si vous repassez au
              Confort.
            </p>
          )}

          <div className="mt-5 rounded-2xl bg-[#F6F3ED] p-4">
            <p className="text-[17px] font-semibold tracking-[-0.01em] text-[#2A2016]">
              {cible.prix}
            </p>
            <p className="mt-0.5 text-[13px] text-[#6B5D4E]">{cible.detail}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#A8998A]">
              Rien n’est débité maintenant. Vous pouvez changer d’avis autant de
              fois que vous voulez tant que votre page n’est pas publiée.
            </p>
          </div>

          {erreur && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-[13.5px] leading-relaxed text-red-700">
              {erreur}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirmer}
              disabled={enCours}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2A2016] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98] disabled:opacity-60"
            >
              {enCours ? (
                "Changement en cours…"
              ) : (
                <>
                  Passer {cible.versLa} <ArrowRight size={15} weight="bold" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onAnnuler}
              disabled={enCours}
              className="flex-1 rounded-full border border-black/[0.08] px-6 py-3.5 text-[14px] font-semibold text-[#6B5D4E] transition-all hover:border-black/20 hover:text-[#2A2016] active:scale-[0.98] disabled:opacity-40"
            >
              {cible.garder}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
