"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Gift, Lock, UsersThree } from "@phosphor-icons/react";
import { chargerParrainage } from "@/app/parrainage-actions";
import type { ReferralDashboard } from "@/lib/server/referrals";
import { useAuth } from "@/lib/hooks/useAuth";

function euros(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function ParrainageCard() {
  const { user } = useAuth();
  const [data, setData] = useState<ReferralDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user.getIdToken()
      .then((value) => chargerParrainage(value))
      .then((result) => { if (!cancelled) setData(result); })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Chargement impossible."); });
    return () => { cancelled = true; };
  }, [user]);

  const link = useMemo(() => {
    if (!data?.eligible || !data.code || typeof window === "undefined") return "";
    return `${window.location.origin}/p/${data.code}`;
  }, [data]);

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="mb-4 overflow-hidden rounded-[26px] border border-[#C4714A]/20 bg-gradient-to-br from-white via-[#FFFBF7] to-[#F7EBDD] shadow-[0_1px_2px_rgba(42,32,22,0.04),0_12px_32px_-16px_rgba(42,32,22,0.14)]">
      <div className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#A8998A]">
              <Gift size={14} weight="duotone" /> Parrainage
            </p>
            <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.015em] text-[#2A2016]">
              Faites découvrir Guidz
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#6B5D4E]">
              Votre filleul profite de son offre de bienvenue. Vous recevez 5 € pour chacun de vos quatre premiers filleuls, puis un mois Confort par an pour chaque filleul Confort actif.
            </p>
          </div>

          {data?.eligible && (
            <div className="grid min-w-[280px] grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/[0.05]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A8998A]">Filleuls actifs</p>
                <p className="mt-1 text-[27px] font-bold text-[#2A2016]">{data.activeComfortCount}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/[0.05]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A8998A]">Crédit disponible</p>
                <p className="mt-1 text-[27px] font-bold text-[#2A2016]">{euros(data.welcomeCreditAvailableCents)}</p>
              </div>
            </div>
          )}
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>}
        {!data && !error && <p className="mt-4 text-[13px] text-[#A8998A]">Préparation de votre lien de parrainage…</p>}

        {data && !data.eligible && (
          <div className="mt-5 flex items-start gap-3.5 rounded-2xl border border-[#EDD9A3]/70 bg-white/75 p-4 sm:p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7EBE4] text-[#C4714A]">
              <Lock size={19} weight="duotone" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#2A2016]">
                Le programme commence après votre première commande
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#6B5D4E]">
                Une fois votre premier paiement confirmé, votre lien personnel apparaîtra automatiquement ici. Vous pourrez alors le partager et commencer à gagner vos récompenses.
              </p>
            </div>
          </div>
        )}

        {data?.eligible && (
          <>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/[0.055]">
                <span className="truncate font-mono text-[13px] text-[#5C3D2E]">{link}</span>
                <button type="button" onClick={() => void copy()} className="ml-auto text-[#C4714A]" aria-label="Copier le lien de parrainage">
                  {copied ? <Check size={17} weight="bold" /> : <Copy size={17} weight="bold" />}
                </button>
              </div>
              <button type="button" onClick={() => void copy()} className="rounded-full bg-[#2A2016] px-5 py-3 text-[13.5px] font-semibold text-white hover:bg-[#C4714A]">
                {copied ? "Lien copié" : "Copier mon lien"}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-[#6B5D4E]">
              <span className="inline-flex items-center gap-1.5">
                <UsersThree size={16} weight="duotone" /> {data.referralCount} filleul{data.referralCount > 1 ? "s" : ""} au total
              </span>
              {data.welcomeCreditPendingCents > 0 && <span>{euros(data.welcomeCreditPendingCents)} disponibles sous 7 jours</span>}
              <span>{data.comfortRightsUsedCurrentCycle}/{data.comfortRightsCurrentCycle} mois Confort utilisés ce cycle</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
