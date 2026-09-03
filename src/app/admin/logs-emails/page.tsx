"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PaperPlaneTilt, Warning, ArrowClockwise, MagnifyingGlass,
} from "@phosphor-icons/react";
import { listerEnvois, LigneJournal, Acheminement } from "../journalEmails";
import { Indicateur, Filtre, Pastille, depuis } from "@/components/admin/pilotage";

/**
 * Le registre des e-mails partis.
 *
 * Il répond à la question la plus banale du support — « je n'ai rien reçu » —
 * qui n'avait jusqu'ici aucune réponse : l'avons-nous envoyé, quand, et
 * est-il arrivé ?
 *
 * La distinction entre « envoyé » et « remis » est le cœur de l'écran. Notre
 * serveur sait seulement que Brevo a accepté le message ; c'est Brevo qui
 * sait s'il est parvenu à destination, s'il a rebondi, ou s'il a été classé
 * indésirable. Confondre les deux, c'est jurer à un client qu'on lui a écrit
 * alors que son serveur nous a claqué la porte au nez.
 */

/** Ce que chaque étiquette désigne, en clair. */
const NOMS: Record<string, string> = {
  bienvenue: "Bienvenue",
  commande: "Commande confirmée",
  expedition: "Plaque expédiée",
  "devis-confirmation": "Accusé de devis",
  "devis-interne": "Devis — fiche interne",
  signalement: "Signalement",
  "essai-bienvenue": "Essai — Bienvenue",
  "essai-commande": "Essai — Commande",
  "essai-expedition": "Essai — Expédition",
  "essai-devis": "Essai — Devis",
};

const ACHEMINEMENT: Record<Acheminement, { texte: string; ton: "vert" | "ambre" | "rouge" | "bleu" | "gris" }> = {
  ouvert: { texte: "Ouvert", ton: "vert" },
  remis: { texte: "Remis", ton: "vert" },
  "en-route": { texte: "En route", ton: "bleu" },
  probleme: { texte: "Problème", ton: "rouge" },
  inconnu: { texte: "Sans retour", ton: "gris" },
};

type Filtrage = "tous" | "problemes" | "reels" | "essais";

/** Un envoi d'essai n'est pas une trace client : on doit pouvoir l'écarter. */
function estEssai(l: LigneJournal): boolean {
  return l.etiquette.startsWith("essai-");
}

export default function LogsEmailsPage() {
  const [lignes, setLignes] = useState<LigneJournal[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Filtrage>("reels");
  const [recherche, setRecherche] = useState("");

  const charger = useCallback(async () => {
    try {
      setLignes(await listerEnvois());
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

  const bilan = useMemo(() => {
    const reels = lignes.filter((l) => !estEssai(l));
    return {
      total: reels.length,
      remis: reels.filter((l) => l.acheminement === "remis" || l.acheminement === "ouvert").length,
      ouverts: reels.filter((l) => l.acheminement === "ouvert").length,
      problemes: lignes.filter((l) => l.acheminement === "probleme").length,
      essais: lignes.filter(estEssai).length,
    };
  }, [lignes]);

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return lignes
      .filter((l) => {
        if (filtre === "problemes") return l.acheminement === "probleme";
        if (filtre === "reels") return !estEssai(l);
        if (filtre === "essais") return estEssai(l);
        return true;
      })
      .filter((l) => {
        if (!q) return true;
        return [l.destinataire, l.sujet, l.etiquette, NOMS[l.etiquette], l.erreur]
          .filter(Boolean)
          .some((champ) => String(champ).toLowerCase().includes(q));
      });
  }, [lignes, filtre, recherche]);

  if (chargement) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Lecture du registre et des retours Brevo…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            Journal des e-mails
          </h1>
          <p className="mt-1 text-sm text-[#6B5D4E]">
            Ce que Guidz a envoyé, et ce que le message est devenu.
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
          intitule="Envoyés aux clients"
          valeur={bilan.total}
          detail="Hors envois d’essai"
        />
        <Indicateur
          intitule="Arrivés à destination"
          valeur={bilan.remis}
          detail={
            bilan.total > 0
              ? `${Math.round((bilan.remis / bilan.total) * 100)} % des envois`
              : "Rien à mesurer"
          }
          ton="bien"
        />
        <Indicateur
          intitule="Ouverts"
          valeur={bilan.ouverts}
          detail="Le client a affiché le message"
        />
        <Indicateur
          intitule="Problèmes"
          valeur={bilan.problemes}
          detail={
            bilan.problemes > 0
              ? "Refus, rebond ou indésirable"
              : "Aucun rebond signalé"
          }
          ton={bilan.problemes > 0 ? "alerte" : "bien"}
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

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8998A]"
          />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Adresse, objet, type…"
            className="w-64 rounded-full border border-[#EDD9A3] bg-white py-2 pl-8 pr-3 text-[12px] outline-none focus:border-[#C4714A]"
          />
        </div>
        <Filtre libelle="Clients" nombre={bilan.total} actif={filtre === "reels"} onClick={() => setFiltre("reels")} />
        <Filtre libelle="Problèmes" nombre={bilan.problemes} actif={filtre === "problemes"} onClick={() => setFiltre("problemes")} />
        <Filtre libelle="Essais" nombre={bilan.essais} actif={filtre === "essais"} onClick={() => setFiltre("essais")} />
        <Filtre libelle="Tous" nombre={lignes.length} actif={filtre === "tous"} onClick={() => setFiltre("tous")} />
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white py-16 text-center">
          <PaperPlaneTilt size={32} className="mx-auto mb-3 text-[#C9B99F]" />
          <p className="text-sm font-semibold text-[#2A2016]">
            {lignes.length === 0 ? "Aucun e-mail envoyé pour le moment" : "Rien dans cette vue"}
          </p>
          <p className="mt-1 text-xs text-[#6B5D4E]">
            Le registre se remplit dès le premier envoi — bienvenue, commande, expédition ou devis.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-[#EDD9A3]/40 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#EDD9A3]/40 bg-[#FBF5EC]">
                <tr>
                  {["Message", "Destinataire", "Envoyé", "Acheminement"].map((t) => (
                    <th
                      key={t}
                      className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#6B5D4E]"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDD9A3]/20">
                {visibles.map((l) => {
                  const etat = ACHEMINEMENT[l.acheminement];
                  return (
                    <tr key={l.id} className="align-top transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-semibold text-[#2A2016]">
                            {NOMS[l.etiquette] || l.etiquette}
                          </span>
                          {estEssai(l) && <Pastille ton="bleu">Essai</Pastille>}
                        </div>
                        <div className="mt-0.5 max-w-md truncate text-[11px] text-[#6B5D4E]">
                          {l.sujet}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <a
                          href={`mailto:${l.destinataire}`}
                          className="text-[12px] text-[#2A2016] underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                        >
                          {l.destinataire}
                        </a>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="text-[12px] text-[#2A2016]">
                          {new Date(l.envoyeLe).toLocaleString("fr-FR", {
                            day: "numeric", month: "short",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                        <div className="text-[10px] text-[#A8998A]">{depuis(l.envoyeLe)}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Pastille ton={etat.ton}>{etat.texte}</Pastille>
                        {l.evenement && (
                          <div className="mt-1 font-mono text-[10px] text-[#A8998A]">
                            {l.evenement}
                          </div>
                        )}
                        {l.erreur && (
                          <div className="mt-1 max-w-xs text-[10px] leading-snug text-red-700">
                            {l.erreur}
                          </div>
                        )}
                        {!l.erreur && l.acheminement === "inconnu" && (
                          <div className="mt-1 max-w-xs text-[10px] leading-snug text-[#A8998A]">
                            Brevo ne garde ses retours qu’un mois
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
