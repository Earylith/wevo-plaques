"use client";

import { useCallback, useEffect, useState } from "react";
import { Envelope, Phone, Warning, Buildings, Check } from "@phosphor-icons/react";
import { listerDemandesDevis, marquerDemandeTraitee, DemandeEnregistree } from "@/app/admin/devis";

/**
 * Demandes de devis reçues.
 *
 * Tant que l'envoi d'e-mail n'est pas branché, cet écran est le SEUL endroit
 * où une demande existe. Sans lui, un prospect écrirait dans le vide et
 * personne ne le saurait — ce qui est pire que de ne pas proposer de devis.
 */

const OFFRES: Record<string, string> = {
  multibien: "Multi-biens",
  signature: "Signature",
};

function dateLongue(ms: number): string {
  return new Date(ms).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DemandesDevisPage() {
  const [demandes, setDemandes] = useState<DemandeEnregistree[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try {
      setDemandes(await listerDemandesDevis());
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

  const traiter = async (id: string) => {
    setEnCours(id);
    try {
      await marquerDemandeTraitee(id);
      setDemandes((liste) =>
        liste.map((d) => (d.id === id ? { ...d, statut: "traitee" } : d))
      );
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "Mise à jour impossible.");
    } finally {
      setEnCours(null);
    }
  };

  if (chargement) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  const nouvelles = demandes.filter((d) => d.statut !== "traitee").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Demandes de devis
        </h1>
        <p className="mt-1 text-sm text-[#6B5D4E]">
          {nouvelles > 0
            ? `${nouvelles} demande${nouvelles > 1 ? "s" : ""} en attente de réponse.`
            : "Aucune demande en attente."}
        </p>
      </div>

      {erreur && (
        <p className="mb-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
          {erreur}
        </p>
      )}

      {demandes.length === 0 ? (
        <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white py-16 text-center">
          <Envelope size={32} className="mx-auto mb-3 text-[#C9B99F]" />
          <p className="text-sm font-semibold text-[#2A2016]">Aucune demande pour le moment</p>
          <p className="mt-1 text-xs text-[#6B5D4E]">
            Les demandes envoyées depuis la page des offres professionnelles apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandes.map((d) => (
            <div
              key={d.id}
              className={`rounded-3xl border bg-white p-6 shadow-sm ${
                d.statut === "traitee" ? "border-[#EDD9A3]/40 opacity-60" : "border-[#EDD9A3]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-[#F7EBE4] px-2.5 py-1 text-[10px] font-bold text-[#A35A38]">
                      {OFFRES[d.offre] || d.offre}
                    </span>
                    {d.statut === "traitee" ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        Traitée
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#FDF3DC] px-2.5 py-1 text-[10px] font-bold text-[#A35A38]">
                        Nouvelle
                      </span>
                    )}
                    {/*
                      L'état de la notification est dit franchement : tant que
                      l'envoi n'est pas branché, cet écran est le seul endroit
                      où la demande existe.
                    */}
                    <span className="text-[10px] font-semibold text-[#A8998A]">
                      {d.notifiedAt ? "e-mail envoyé" : "non notifiée par e-mail"}
                    </span>
                  </div>

                  <p className="mt-2 text-base font-bold text-[#2A2016]">
                    {d.nom}
                    {d.societe && (
                      <span className="ml-2 inline-flex items-center gap-1 text-sm font-medium text-[#6B5D4E]">
                        <Buildings size={13} /> {d.societe}
                      </span>
                    )}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#6B5D4E]">
                    <a
                      href={`mailto:${d.email}`}
                      className="inline-flex items-center gap-1.5 underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                    >
                      <Envelope size={13} /> {d.email}
                    </a>
                    {d.telephone && (
                      <a
                        href={`tel:${d.telephone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-1.5 underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                      >
                        <Phone size={13} /> {d.telephone}
                      </a>
                    )}
                    {d.logements && <span>{d.logements} logement(s)</span>}
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#A8998A]">Reçue le {dateLongue(d.createdAt)}</p>
                </div>

                {d.statut !== "traitee" && (
                  <button
                    type="button"
                    onClick={() => void traiter(d.id)}
                    disabled={enCours === d.id}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#2A2016] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#C4714A] disabled:opacity-60"
                  >
                    <Check size={13} weight="bold" />
                    {enCours === d.id ? "…" : "Marquer traitée"}
                  </button>
                )}
              </div>

              {d.message && (
                <p className="mt-4 whitespace-pre-line rounded-2xl bg-[#FBF5EC] px-4 py-3 text-sm leading-relaxed text-[#5C3D2E]">
                  {d.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
