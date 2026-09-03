"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flag, Warning, ArrowSquareOut, PencilSimple } from "@phosphor-icons/react";
import {
  listerSignalements, classerSignalement, Signalement, StatutSignalement,
} from "../signalements";
import { MOTIFS_SIGNALEMENT } from "@/lib/signalement";
import { Indicateur, Filtre, Pastille, depuis } from "@/components/admin/pilotage";

/**
 * Les signalements de voyageurs, et ce qu'on en fait.
 *
 * Nous hébergeons des pages écrites par des tiers : ce registre est la
 * contrepartie. Il montre ce qui attend un examen, ce qui a été traité, et
 * ce qui a été écarté — avec, pour chaque décision, la trace de qui a
 * regardé et quand.
 *
 * Les motifs graves sont distingués visuellement : un propos haineux et une
 * faute d'orthographe signalée par erreur ne demandent pas la même vitesse.
 */

/** Ce qui ne peut pas attendre le lundi. */
const GRAVES: (keyof typeof MOTIFS_SIGNALEMENT)[] = [
  "contenu_haineux",
  "contenu_sexuel",
  "arnaque",
];

type Filtrage = "attente" | "traites" | "rejetes" | "tous";

export default function SignalementsPage() {
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Filtrage>("attente");
  const [occupe, setOccupe] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const charger = useCallback(async () => {
    try {
      setSignalements(await listerSignalements());
      setErreur(null);
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial : le seul setState vient d'une réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void charger();
  }, [charger]);

  const classer = async (s: Signalement, statut: StatutSignalement) => {
    setOccupe(s.id);
    try {
      await classerSignalement(s.id, statut, notes[s.id]);
      setSignalements((liste) =>
        liste.map((x) =>
          x.id === s.id
            ? { ...x, statut, traiteLe: Date.now(), note: notes[s.id] || x.note }
            : x
        )
      );
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "Mise à jour impossible.");
    } finally {
      setOccupe(null);
    }
  };

  const bilan = useMemo(() => {
    const attente = signalements.filter((s) => s.statut === "nouveau");
    return {
      attente: attente.length,
      graves: attente.filter((s) => GRAVES.includes(s.motif)).length,
      traites: signalements.filter((s) => s.statut === "traite").length,
      rejetes: signalements.filter((s) => s.statut === "rejete").length,
    };
  }, [signalements]);

  const visibles = useMemo(
    () =>
      signalements.filter((s) => {
        if (filtre === "attente") return s.statut === "nouveau";
        if (filtre === "traites") return s.statut === "traite";
        if (filtre === "rejetes") return s.statut === "rejete";
        return true;
      }),
    [signalements, filtre]
  );

  if (chargement) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Chargement des signalements…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Signalements
        </h1>
        <p className="mt-1 text-sm text-[#6B5D4E]">
          Ce que les voyageurs nous remontent sur les livrets publiés.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicateur
          intitule="En attente"
          valeur={bilan.attente}
          detail={bilan.attente > 0 ? "À examiner" : "Rien à examiner"}
          ton={bilan.attente > 0 ? "alerte" : "bien"}
        />
        <Indicateur
          intitule="Motifs graves"
          valeur={bilan.graves}
          detail="Haine, contenu choquant, fraude"
          ton={bilan.graves > 0 ? "alerte" : "neutre"}
        />
        <Indicateur intitule="Traités" valeur={bilan.traites} detail="Une action a été prise" />
        <Indicateur intitule="Écartés" valeur={bilan.rejetes} detail="Examinés, sans suite" />
      </div>

      {erreur && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="flex items-start gap-2 text-sm text-red-700">
            <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
            {erreur}
          </p>
          <button
            onClick={charger}
            className="shrink-0 rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <Filtre libelle="En attente" nombre={bilan.attente} actif={filtre === "attente"} onClick={() => setFiltre("attente")} />
        <Filtre libelle="Traités" nombre={bilan.traites} actif={filtre === "traites"} onClick={() => setFiltre("traites")} />
        <Filtre libelle="Écartés" nombre={bilan.rejetes} actif={filtre === "rejetes"} onClick={() => setFiltre("rejetes")} />
        <Filtre libelle="Tous" nombre={signalements.length} actif={filtre === "tous"} onClick={() => setFiltre("tous")} />
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white py-16 text-center">
          <Flag size={32} className="mx-auto mb-3 text-[#C9B99F]" />
          <p className="text-sm font-semibold text-[#2A2016]">
            {signalements.length === 0
              ? "Aucun signalement à ce jour"
              : "Rien dans cette vue"}
          </p>
          <p className="mt-1 text-xs text-[#6B5D4E]">
            Les voyageurs peuvent signaler un livret depuis le bas de chaque page publiée.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map((s) => {
            const grave = GRAVES.includes(s.motif);
            const ouvert = s.statut === "nouveau";

            return (
              <div
                key={s.id}
                className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
                  ouvert && grave ? "border-red-200" : "border-[#EDD9A3]/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pastille ton={grave ? "rouge" : "ambre"}>
                        {MOTIFS_SIGNALEMENT[s.motif] || s.motif}
                      </Pastille>
                      {s.statut === "traite" && <Pastille ton="vert">Traité</Pastille>}
                      {s.statut === "rejete" && <Pastille ton="gris">Écarté</Pastille>}
                      <span className="text-[11px] text-[#A8998A]">
                        Signalé {depuis(s.createdAt)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#2A2016]">
                      /h/{s.slug || "—"}
                    </p>

                    {s.details ? (
                      <p className="mt-1.5 max-w-2xl whitespace-pre-wrap text-[13px] leading-relaxed text-[#6B5D4E]">
                        {s.details}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[12px] italic text-[#A8998A]">
                        Aucun détail fourni.
                      </p>
                    )}

                    {s.note && (
                      <p className="mt-2 text-[12px] text-[#2B5F75]">
                        <span className="font-semibold">Décision :</span> {s.note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`/h/${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Voir la page signalée"
                      className="rounded-lg p-2 text-[#6B5D4E] transition-colors hover:bg-[#FBF5EC] hover:text-[#C4714A]"
                    >
                      <ArrowSquareOut size={16} />
                    </a>
                    <Link
                      href={`/admin/hebergements/${s.livretId}`}
                      title="Ouvrir le livret dans l’éditeur"
                      className="rounded-lg p-2 text-[#6B5D4E] transition-colors hover:bg-[#E4EEF3] hover:text-[#2B5F75]"
                    >
                      <PencilSimple size={16} />
                    </Link>
                  </div>
                </div>

                {ouvert && (
                  <div className="border-t border-[#EDD9A3]/40 bg-[#FBF5EC] px-6 py-4">
                    <label className="block">
                      <span className="text-[10px] font-semibold text-[#6B5D4E]">
                        Ce que vous avez fait (facultatif, gardé pour mémoire)
                      </span>
                      <input
                        value={notes[s.id] || ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                        placeholder="Photo retirée, hôte prévenu…"
                        className="mt-1 w-full rounded-lg border border-[#EDD9A3] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#C4714A]"
                      />
                    </label>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void classer(s, "traite")}
                        disabled={occupe === s.id}
                        className="rounded-full bg-[#3F5836] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#2F4228] disabled:opacity-60"
                      >
                        {occupe === s.id ? "…" : "J’ai agi — clore"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void classer(s, "rejete")}
                        disabled={occupe === s.id}
                        className="rounded-full border border-[#EDD9A3] bg-white px-4 py-2 text-[11px] font-bold text-[#6B5D4E] transition-colors hover:border-[#C4714A] hover:text-[#C4714A] disabled:opacity-60"
                      >
                        Rien à signaler — écarter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
