"use client";

import { RythmeAbonnement } from "@/lib/stripe";

/**
 * Rythme de facturation de l'abonnement Confort, choisi avant le paiement.
 *
 * Il ne se demandait nulle part : un premier client Confort partait au mois
 * sans qu'on lui ait posé la question, alors que l'annuel lui revient moins
 * cher. Le découvrir après coup, sur sa facture, n'est pas une découverte
 * agréable.
 *
 * Le mensuel reste présélectionné parce qu'il engage le moins — pas parce
 * qu'il nous rapporte plus. Présélectionner l'annuel serait pousser le
 * paiement le plus lourd sur qui ne lit pas.
 *
 * N'apparaît qu'en formule Confort : l'Essentielle n'a pas d'abonnement.
 */

const CHOIX: { cle: RythmeAbonnement; titre: string; detail: string }[] = [
  {
    cle: "mensuel",
    titre: "1,99 €/mois",
    detail: "Sans engagement, arrêtable à tout moment",
  },
  {
    cle: "annuel",
    titre: "19 €/an",
    detail: "Deux mois offerts par rapport au mensuel",
  },
];

export default function ChoixRythme({
  rythme,
  onChange,
}: {
  rythme: RythmeAbonnement;
  onChange: (r: RythmeAbonnement) => void;
}) {
  return (
    <div className="space-y-2.5 pt-4 border-t border-[#EDD9A3]/60">
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-[15px] font-bold text-[#5C3D2E]">
          Votre abonnement
        </h3>
        <p className="text-[11px] text-[#6B5D4E] mt-0.5 leading-relaxed">
          Il maintient votre livret en ligne et vos modifications ouvertes.
          Réglé après les 69 € de mise en service.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {CHOIX.map((c) => {
          const actif = rythme === c.cle;
          return (
            <button
              key={c.cle}
              type="button"
              onClick={() => onChange(c.cle)}
              className={`p-3 rounded-2xl border text-left transition-colors ${
                actif
                  ? "border-[#C4714A] bg-[#C4714A]/5"
                  : "border-[#EDD9A3]/60 hover:border-[#EDD9A3]"
              }`}
            >
              <span
                className={`block text-[13px] font-bold ${
                  actif ? "text-[#C4714A]" : "text-[#2A2016]"
                }`}
              >
                {c.titre}
              </span>
              <span className="block text-[10px] text-[#6B5D4E] mt-1 leading-snug">
                {c.detail}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
