"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PhoneCall, Warning, ArrowClockwise } from "@phosphor-icons/react";
import { listerRappels, classerRappel, Rappel, StatutRappel } from "../rappels";
import { CRENEAUX } from "@/lib/rappel";
import { Indicateur, Filtre, Pastille, depuis } from "@/components/admin/pilotage";

/**
 * Les demandes de rappel téléphonique.
 *
 * Un rappel a une durée de vie très courte : celui qui laisse son numéro un
 * mardi soir n'attend pas le vendredi. D'où la file triée du plus ancien au
 * plus récent, l'ancienneté en clair, et une alerte au-delà de quatre heures
 * ouvrées.
 *
 * Le numéro est un lien `tel:` : sur un ordinateur relié au téléphone, un
 * clic lance l'appel — et on ne recopie pas dix chiffres à la main.
 */

/**
 * Passé ce délai, la demande a perdu l'essentiel de sa valeur.
 *
 * Quatre heures : au-delà, le visiteur a eu le temps de regarder ailleurs.
 * Le seuil est là pour faire remonter la ligne, pas pour culpabiliser.
 */
const RETARD_MS = 4 * 60 * 60 * 1000;

function traineTrop(r: Rappel): boolean {
  return r.statut === "a_rappeler" && Date.now() - r.createdAt > RETARD_MS;
}

type Filtrage = "attente" | "rappeles" | "injoignables" | "tous";

export default function RappelsPage() {
  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Filtrage>("attente");
  const [occupe, setOccupe] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const charger = useCallback(async () => {
    try {
      setRappels(await listerRappels());
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

  const classer = async (r: Rappel, statut: StatutRappel) => {
    setOccupe(r.id);
    try {
      await classerRappel(r.id, statut, notes[r.id]);
      setRappels((liste) =>
        liste.map((x) =>
          x.id === r.id ? { ...x, statut, traiteLe: Date.now(), note: notes[r.id] || x.note } : x
        )
      );
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "Mise à jour impossible.");
    } finally {
      setOccupe(null);
    }
  };

  const bilan = useMemo(
    () => ({
      attente: rappels.filter((r) => r.statut === "a_rappeler").length,
      retard: rappels.filter(traineTrop).length,
      rappeles: rappels.filter((r) => r.statut === "rappele").length,
      injoignables: rappels.filter((r) => r.statut === "injoignable").length,
    }),
    [rappels]
  );

  const visibles = useMemo(
    () =>
      rappels.filter((r) => {
        if (filtre === "attente") return r.statut === "a_rappeler";
        if (filtre === "rappeles") return r.statut === "rappele";
        if (filtre === "injoignables") return r.statut === "injoignable";
        return true;
      }),
    [rappels, filtre]
  );

  if (chargement) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Chargement des demandes…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            Rappels demandés
          </h1>
          <p className="mt-1 text-sm text-[#6B5D4E]">
            Ceux qui préfèrent un appel à un formulaire. Les plus anciens d’abord.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void charger()}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#EDD9A3] bg-white px-4 py-2 text-[12px] font-semibold text-[#6B5D4E] transition-colors hover:border-[#C4714A] hover:text-[#C4714A]"
        >
          <ArrowClockwise size={13} weight="bold" />
          Actualiser
        </button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Indicateur
          intitule="À rappeler"
          valeur={bilan.attente}
          detail={bilan.attente > 0 ? "En attente d’un appel" : "Personne n’attend"}
          ton={bilan.attente > 0 ? "alerte" : "bien"}
        />
        <Indicateur
          intitule="Depuis plus de 4 h"
          valeur={bilan.retard}
          detail={bilan.retard > 0 ? "À appeler en priorité" : "Rien ne traîne"}
          ton={bilan.retard > 0 ? "alerte" : "neutre"}
        />
        <Indicateur intitule="Rappelés" valeur={bilan.rappeles} detail="Conversation eue" />
        <Indicateur
          intitule="Injoignables"
          valeur={bilan.injoignables}
          detail="À retenter plus tard"
        />
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
        <Filtre libelle="À rappeler" nombre={bilan.attente} actif={filtre === "attente"} onClick={() => setFiltre("attente")} />
        <Filtre libelle="Rappelés" nombre={bilan.rappeles} actif={filtre === "rappeles"} onClick={() => setFiltre("rappeles")} />
        <Filtre libelle="Injoignables" nombre={bilan.injoignables} actif={filtre === "injoignables"} onClick={() => setFiltre("injoignables")} />
        <Filtre libelle="Tous" nombre={rappels.length} actif={filtre === "tous"} onClick={() => setFiltre("tous")} />
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white py-16 text-center">
          <PhoneCall size={32} className="mx-auto mb-3 text-[#C9B99F]" />
          <p className="text-sm font-semibold text-[#2A2016]">
            {rappels.length === 0 ? "Aucune demande de rappel" : "Rien dans cette vue"}
          </p>
          <p className="mt-1 text-xs text-[#6B5D4E]">
            Le bouton « Être rappelé » se trouve en bas de la page d’accueil.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map((r) => {
            const ouvert = r.statut === "a_rappeler";
            return (
              <div
                key={r.id}
                className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
                  traineTrop(r) ? "border-red-200" : "border-[#EDD9A3]/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-bold text-[#2A2016]">{r.nom}</span>
                      {r.statut === "rappele" && <Pastille ton="vert">Rappelé</Pastille>}
                      {r.statut === "injoignable" && <Pastille ton="gris">Injoignable</Pastille>}
                      {traineTrop(r) && <Pastille ton="rouge">Depuis plus de 4 h</Pastille>}
                      <span className="text-[11px] text-[#A8998A]">
                        Demandé {depuis(r.createdAt)}
                      </span>
                    </div>

                    {/* Le numéro cliquable : on ne recopie pas dix chiffres. */}
                    <a
                      href={`tel:${r.telephone.replace(/\s/g, "")}`}
                      className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[17px] font-bold text-[#C4714A] hover:underline"
                    >
                      <PhoneCall size={15} weight="fill" />
                      {r.telephone}
                    </a>

                    <p className="mt-1 text-[12px] text-[#6B5D4E]">
                      Souhaite être appelé : {CRENEAUX[r.creneau] || r.creneau}
                    </p>

                    {r.message && (
                      <p className="mt-2 max-w-2xl whitespace-pre-wrap rounded-xl bg-[#FBF5EC] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#2A2016]">
                        {r.message}
                      </p>
                    )}

                    {r.note && (
                      <p className="mt-2 text-[12px] text-[#2B5F75]">
                        <span className="font-semibold">Suite donnée :</span> {r.note}
                      </p>
                    )}
                  </div>
                </div>

                {ouvert && (
                  <div className="border-t border-[#EDD9A3]/40 bg-[#FBF5EC] px-6 py-4">
                    <label className="block">
                      <span className="text-[10px] font-semibold text-[#6B5D4E]">
                        Ce qui s’est dit (facultatif, gardé pour mémoire)
                      </span>
                      <input
                        value={notes[r.id] || ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                        placeholder="Veut deux plaques, rappellera après ses travaux…"
                        className="mt-1 w-full rounded-lg border border-[#EDD9A3] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#C4714A]"
                      />
                    </label>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void classer(r, "rappele")}
                        disabled={occupe === r.id}
                        className="rounded-full bg-[#3F5836] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#2F4228] disabled:opacity-60"
                      >
                        {occupe === r.id ? "…" : "Je l’ai rappelé"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void classer(r, "injoignable")}
                        disabled={occupe === r.id}
                        className="rounded-full border border-[#EDD9A3] bg-white px-4 py-2 text-[11px] font-bold text-[#6B5D4E] transition-colors hover:border-[#C4714A] hover:text-[#C4714A] disabled:opacity-60"
                      >
                        Pas décroché
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
