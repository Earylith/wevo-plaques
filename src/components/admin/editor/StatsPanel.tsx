"use client";

import React, { useEffect, useState } from "react";
import { ChartLineUp, QrCode, Lightbulb, Eye, ArrowsClockwise } from "@phosphor-icons/react";
import { getLivretStats } from "@/app/admin/orders";
import { LivretStats, rankedModules, buildInsights, last14Days } from "@/lib/stats";

/**
 * Panneau « Consultations » de l'éditeur.
 *
 * Le parti pris : peu de chiffres, mais chacun débouche sur une décision.
 * Un hôte n'a que faire d'un tableau de bord — il veut savoir ce que ses
 * voyageurs cherchent, pour le mettre en avant.
 *
 * Déclaré au niveau du module : dans le corps de l'éditeur, React le
 * remonterait à chaque frappe et rejouerait le chargement.
 */

interface Props {
  /** Identifiant du livret (document Firestore). */
  accommodationId: string;
}

/** Barre horizontale d'une rubrique, proportionnelle à la plus consultée. */
function ModuleBar({ name, count, max }: { name: string; count: number; max: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-32 shrink-0 text-[11px] text-[#5C3D2E] truncate" title={name}>
        {name}
      </span>
      <span className="flex-1 h-2 rounded-full bg-[#EDD9A3]/40 overflow-hidden">
        <span
          className="block h-full rounded-full bg-[#C4714A] transition-[width] duration-500"
          style={{ width: `${Math.max(4, (count / max) * 100)}%` }}
        />
      </span>
      <span className="w-8 shrink-0 text-right text-[11px] font-bold text-[#A35A38] tabular-nums">
        {count}
      </span>
    </div>
  );
}

/** Ouvertures des 14 derniers jours. Une colonne par jour, trous compris. */
function DayChart({ days }: { days: { date: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="flex items-end gap-[3px] h-16">
      {days.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col justify-end h-full group relative">
          <span
            className="w-full rounded-t bg-[#C4714A]/80 group-hover:bg-[#C4714A] transition-colors"
            style={{ height: `${Math.max(3, (d.count / max) * 100)}%` }}
          />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded-md bg-[#2A2016] px-1.5 py-0.5 text-[9px] text-white z-10">
            {new Date(`${d.date}T00:00:00Z`).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              timeZone: "UTC",
            })}
            {" · "}
            {d.count}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPanel({ accommodationId }: Props) {
  const [stats, setStats] = useState<LivretStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getLivretStats(accommodationId)
      .then((raw) => {
        if (cancelled) return;
        setStats(raw as LivretStats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Chargement des statistiques", err);
        if (cancelled) return;
        setStats({});
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accommodationId, reloadToken]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#EDD9A3]/60 bg-white p-5 text-center">
        <p className="text-[11px] text-[#A8998A]">Chargement des consultations…</p>
      </div>
    );
  }

  const s = stats || {};
  const opens = s.opens || 0;
  const scans = s.qrScans || 0;
  const ranked = rankedModules(s);
  const insights = buildInsights(s);
  const days = last14Days(s);
  const maxModule = ranked[0]?.count || 1;

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#2A2016]">
          <ChartLineUp size={16} weight="bold" className="text-[#C4714A]" />
          Consultations
        </h3>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setReloadToken((t) => t + 1);
          }}
          className="flex items-center gap-1 text-[10px] font-bold text-[#A8998A] hover:text-[#C4714A] transition-colors"
        >
          <ArrowsClockwise size={12} weight="bold" /> Actualiser
        </button>
      </div>

      {opens === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EDD9A3] bg-[#FBF5EC] p-5 text-center">
          <Eye size={22} className="mx-auto text-[#C4714A] mb-2" />
          <p className="text-xs font-bold text-[#5C3D2E]">Aucune consultation pour l’instant</p>
          <p className="text-[11px] text-[#6B5D4E] mt-1">
            Les chiffres apparaîtront dès que vos voyageurs ouvriront le livret.
            Rien n’est mesuré depuis cet éditeur.
          </p>
        </div>
      ) : (
        <>
          {/* Les deux chiffres qui comptent */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-[#EDD9A3]/60 bg-white p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">
                <Eye size={12} weight="bold" /> Ouvertures
              </div>
              <p className="mt-1 text-2xl font-extrabold text-[#2A2016] tabular-nums">{opens}</p>
            </div>
            <div className="rounded-2xl border border-[#EDD9A3]/60 bg-white p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">
                <QrCode size={12} weight="bold" /> Via la plaque
              </div>
              <p className="mt-1 text-2xl font-extrabold text-[#2A2016] tabular-nums">{scans}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EDD9A3]/60 bg-white p-3.5 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">
              14 derniers jours
            </p>
            <DayChart days={days} />
          </div>

          {ranked.length > 0 && (
            <div className="rounded-2xl border border-[#EDD9A3]/60 bg-white p-3.5 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">
                Rubriques les plus ouvertes
              </p>
              {ranked.slice(0, 8).map((m) => (
                <ModuleBar key={m.id} name={m.name} count={m.count} max={maxModule} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Ce que les chiffres suggèrent de faire */}
      {insights.length > 0 && (
        <div className="rounded-2xl border border-[#EDD9A3] bg-[#FBF5EC] p-3.5 space-y-2">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A35A38]">
            <Lightbulb size={12} weight="fill" /> Ce que ça vous dit
          </p>
          {insights.map((insight, i) => (
            <p
              key={i}
              className={`text-[11px] leading-relaxed ${
                insight.tone === "action" ? "text-[#5C3D2E] font-medium" : "text-[#6B5D4E]"
              }`}
            >
              {insight.text}
            </p>
          ))}
        </div>
      )}

      <p className="text-[10px] text-[#B0A090] leading-relaxed">
        Mesure anonyme : on compte des ouvertures, jamais des personnes. Aucun cookie,
        aucune adresse IP, aucune donnée personnelle de vos voyageurs.
      </p>
    </div>
  );
}
