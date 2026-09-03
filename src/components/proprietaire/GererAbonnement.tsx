"use client";

import { useState } from "react";
import { Warning, Check } from "@phosphor-icons/react";
import { resilierAbonnement, reprendreAbonnement, supprimerCompte } from "@/app/espace-actions";

/**
 * Fin d'abonnement Confort : deux issues, et elles n'ont rien à voir.
 *
 * — REVENIR À L'ESSENTIELLE. La page reste en ligne, la plaque continue de
 *   fonctionner, le contenu Confort est conservé et reviendra intact si l'hôte
 *   se réabonne. C'est ce qu'on propose en premier : couper l'abonnement ne
 *   doit pas transformer un objet en bois en morceau de bois inutile.
 *
 * — TOUT SUPPRIMER. Immédiat et sans retour : la page disparaît, le compte
 *   aussi, et le QR gravé ne mène plus nulle part. C'est une conséquence qu'il
 *   faut lire AVANT de cliquer, pas découvrir après — d'où la confirmation
 *   par saisie, qui interdit le clic machinal.
 */

export default function GererAbonnement({
  livretId,
  nom,
  aUnAbonnement,
  resiliationDemandee,
  finLe,
  jeton,
}: {
  livretId: string;
  nom: string;
  /** Un abonnement Confort court-il ? Sinon, seule la suppression a un sens. */
  aUnAbonnement: boolean;
  resiliationDemandee: boolean;
  finLe: number | null;
  jeton: () => Promise<string | undefined>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [confirmationSuppression, setConfirmationSuppression] = useState("");
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const dateLongue = (ms: number) =>
    new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const agir = async (quoi: string, action: () => Promise<void>) => {
    setEnCours(quoi);
    setErreur(null);
    setMessage(null);
    try {
      await action();
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "L’opération a échoué.");
    } finally {
      setEnCours(null);
    }
  };

  const versEssentielle = () =>
    agir("essentielle", async () => {
      const { finLe: fin } = await resilierAbonnement(livretId, await jeton());
      setMessage(
        fin
          ? `C’est noté. Votre livret repassera en Essentielle le ${dateLongue(fin)} — votre page et votre plaque continueront de fonctionner.`
          : "C’est noté. Votre livret repassera en Essentielle à la fin de la période en cours."
      );
    });

  const annuler = () =>
    agir("reprendre", async () => {
      await reprendreAbonnement(livretId, await jeton());
      setMessage("Votre abonnement Confort se poursuit normalement.");
    });

  const supprimer = () =>
    agir("suppression", async () => {
      await supprimerCompte(livretId, await jeton());
      // Le compte n'existe plus : on quitte l'espace plutôt que d'afficher
      // un écran qui interrogerait une session désormais invalide.
      window.location.assign("/?compte=supprime");
    });

  if (!ouvert) {
    return (
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="text-[12.5px] font-medium text-[#A8998A] transition-colors hover:text-[#C4714A]"
        >
          {aUnAbonnement ? "Résilier mon abonnement" : "Supprimer mon compte"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.07] bg-[#FDFBF7] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#A8998A]">
        {aUnAbonnement ? "Résilier votre abonnement" : "Supprimer votre compte"}
      </p>

      {resiliationDemandee ? (
        <>
          <p className="mt-3 text-[14px] leading-relaxed text-[#5C3D2E]">
            Votre résiliation est enregistrée. Votre livret repassera en
            Essentielle{finLe ? ` le ${dateLongue(finLe)}` : " à la fin de la période en cours"} —
            votre page restera en ligne et votre plaque continuera de fonctionner.
          </p>
          <button
            type="button"
            onClick={() => void annuler()}
            disabled={enCours !== null}
            className="mt-4 rounded-full bg-[#2A2016] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#C4714A] disabled:opacity-60"
          >
            {enCours === "reprendre" ? "…" : "Finalement, je garde le Confort"}
          </button>
        </>
      ) : (
        aUnAbonnement && (
          <div className="mt-3 rounded-2xl bg-white p-4">
            <p className="text-[14.5px] font-semibold text-[#2A2016]">
              Revenir à la formule Essentielle
            </p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-[#6B5D4E]">
              Votre abonnement s’arrête à l’échéance. Votre page reste en ligne,
              votre plaque continue de fonctionner, et tout ce que vous avez
              écrit est conservé — vous le retrouverez intact si vous revenez au
              Confort.
            </p>
            <button
              type="button"
              onClick={() => void versEssentielle()}
              disabled={enCours !== null}
              className="mt-3.5 rounded-full bg-[#2A2016] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#C4714A] disabled:opacity-60"
            >
              {enCours === "essentielle" ? "…" : "Revenir à l’Essentielle"}
            </button>
          </div>
        )
      )}

      {/*
        La suppression est irréversible : on décrit la conséquence, et on
        exige une saisie. Un bouton rouge de plus se clique par réflexe ;
        recopier le nom de son propre livret, non.
      */}
      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/60 p-4">
        <p className="flex items-start gap-2 text-[14.5px] font-semibold text-red-800">
          <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
          Supprimer définitivement mon compte
        </p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-red-800/80">
          Immédiat et sans retour. Votre page disparaît, votre compte aussi, et
          le QR code gravé sur votre plaque ne mènera plus nulle part.
        </p>
        <label className="mt-3 block">
          <span className="text-[12.5px] text-red-800/80">
            Pour confirmer, recopiez <strong>{nom}</strong>
          </span>
          <input
            value={confirmationSuppression}
            onChange={(e) => setConfirmationSuppression(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-red-400"
          />
        </label>
        <button
          type="button"
          onClick={() => void supprimer()}
          disabled={enCours !== null || confirmationSuppression.trim() !== nom.trim()}
          className="mt-3 rounded-full bg-red-700 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {enCours === "suppression" ? "Suppression…" : "Tout supprimer"}
        </button>
      </div>

      {erreur && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{erreur}</p>
      )}
      {message && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-800">
          <Check size={14} weight="bold" className="mt-0.5 shrink-0" />
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={() => setOuvert(false)}
        className="mt-4 text-[12.5px] font-medium text-[#A8998A] transition-colors hover:text-[#2A2016]"
      >
        Fermer
      </button>
    </div>
  );
}
