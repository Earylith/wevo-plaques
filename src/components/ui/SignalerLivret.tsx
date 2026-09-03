"use client";

import { useState } from "react";
import { Flag, Check, Warning } from "@phosphor-icons/react";
import { signalerLivret } from "@/app/signalement-actions";
import { MOTIFS_SIGNALEMENT, MotifSignalement } from "@/lib/signalement";

/**
 * Signalement d'un livret, à la disposition du voyageur.
 *
 * Nous hébergeons des pages écrites par des tiers. Sans moyen de nous alerter,
 * un contenu haineux, une photo déplacée ou une arnaque resterait en ligne
 * jusqu'à ce que quelqu'un pense à nous écrire — c'est-à-dire souvent jamais.
 *
 * Volontairement DISCRET : c'est un recours, pas une invitation. Un bouton
 * voyant sur la page d'un hôte honnête jetterait un doute que rien ne
 * justifie. Il vit donc en pied de page, en petit, et ne s'ouvre qu'au clic.
 *
 * Aucun compte n'est demandé : exiger une inscription pour signaler, c'est
 * garantir que personne ne signale.
 */

export default function SignalerLivret({
  livretId,
  slug,
}: {
  livretId: string;
  slug: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState<MotifSignalement>("contenu_haineux");
  const [details, setDetails] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyer = async () => {
    setEnvoi(true);
    setErreur(null);
    try {
      await signalerLivret({ livretId, slug, motif, details });
      setEnvoye(true);
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "L’envoi a échoué.");
      setEnvoi(false);
    }
  };

  if (envoye) {
    return (
      <p className="flex items-center justify-center gap-1.5 py-6 text-center text-[12px] text-[#6B5D4E]">
        <Check size={13} weight="bold" className="text-emerald-600" />
        Merci, votre signalement nous est parvenu. Nous l’examinons.
      </p>
    );
  }

  if (!ouvert) {
    return (
      <div className="py-6 text-center">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#A8998A] transition-colors hover:text-[#6B5D4E]"
        >
          <Flag size={11} />
          Signaler ce contenu
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 py-6">
      <div className="rounded-2xl border border-[#EDD9A3]/60 bg-white p-5">
        <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#2A2016]">
          <Flag size={13} weight="fill" className="text-[#C4714A]" />
          Signaler ce livret
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-[#6B5D4E]">
          Cette page est publiée par un hôte. Si son contenu vous paraît
          illicite ou déplacé, dites-le-nous : nous l’examinons.
        </p>

        <div className="mt-3.5 space-y-1.5">
          {(Object.keys(MOTIFS_SIGNALEMENT) as MotifSignalement[]).map((cle) => (
            <label
              key={cle}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-[#2A2016] transition-colors hover:bg-[#FBF5EC]"
            >
              <input
                type="radio"
                name="motif"
                checked={motif === cle}
                onChange={() => setMotif(cle)}
                className="accent-[#C4714A]"
              />
              {MOTIFS_SIGNALEMENT[cle]}
            </label>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          placeholder="Précisez si vous le souhaitez (facultatif)"
          className="mt-3 w-full resize-none rounded-xl border border-[#EDD9A3] bg-[#FDFBF7] px-3 py-2.5 text-[12.5px] outline-none focus:border-[#C4714A]"
        />

        {erreur && (
          <p className="mt-2.5 flex items-start gap-1.5 text-[12px] text-red-700">
            <Warning size={13} weight="fill" className="mt-0.5 shrink-0" />
            {erreur}
          </p>
        )}

        <div className="mt-3.5 flex gap-2.5">
          <button
            type="button"
            onClick={() => void envoyer()}
            disabled={envoi}
            className="rounded-full bg-[#2A2016] px-5 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-[#C4714A] disabled:opacity-60"
          >
            {envoi ? "Envoi…" : "Envoyer le signalement"}
          </button>
          <button
            type="button"
            onClick={() => setOuvert(false)}
            className="px-3 text-[12.5px] font-medium text-[#A8998A] transition-colors hover:text-[#2A2016]"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
