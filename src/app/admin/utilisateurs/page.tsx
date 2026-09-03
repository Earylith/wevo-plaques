"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  UsersThree, Warning, MagnifyingGlass, ArrowSquareOut, EnvelopeSimple,
} from "@phosphor-icons/react";
import { listerInscrits, Inscrit } from "../utilisateurs";
import { Indicateur, Filtre, Pastille, jour, depuis } from "@/components/admin/pilotage";

/**
 * Les inscriptions, et ce qu'elles sont devenues.
 *
 * L'écran ne liste pas des comptes : il montre des parcours interrompus. Un
 * inscrit sans livret a fermé l'onglet dans la minute ; un brouillon vieux de
 * trois jours hésite ; un brouillon vieux de trois semaines a renoncé. Ce ne
 * sont pas les mêmes personnes, et on ne leur écrit pas la même chose.
 *
 * D'où deux dates distinctes, souvent confondues : la dernière VISITE de
 * l'éditeur — ouvrir, regarder, refermer — et la dernière MODIFICATION, qui
 * prouve qu'on a travaillé. L'écart entre les deux dit l'hésitation.
 */

type Filtrage = "tous" | "bloques" | "brouillons" | "clients" | "sans-livret";

/**
 * Un brouillon laissé de côté depuis plus de trois jours.
 *
 * Le seuil est court à dessein : composer un livret prend une soirée. Au-delà
 * de trois jours sans y toucher, ce n'est plus une pause, c'est un abandon —
 * et c'est précisément le moment où une relance sert encore à quelque chose.
 */
const ABANDON_MS = 3 * 86400000;

function abandonne(i: Inscrit): boolean {
  if (i.etape === "publie") return false;
  const dernier = Math.max(i.derniereVisite || 0, i.derniereModification || 0, i.inscritLe || 0);
  return Date.now() - dernier > ABANDON_MS;
}

/**
 * Inscrit depuis moins de trente jours.
 *
 * Hors du rendu, comme `abandonne` : l'heure courante ne se dérive pas de
 * l'état, et l'interroger pendant le rendu rendrait le résultat instable.
 */
function inscritRecemment(i: Inscrit): boolean {
  return Boolean(i.inscritLe && Date.now() - i.inscritLe < 30 * 86400000);
}

/** Le message de relance, prérempli selon là où la personne s'est arrêtée. */
function lienRelance(i: Inscrit): string {
  const objet =
    i.etape === "sans-livret"
      ? "Votre livret d’accueil Guidz vous attend"
      : "Un coup de main pour finir votre livret ?";

  const corps =
    i.etape === "sans-livret"
      ? `Bonjour${i.nom ? ` ${i.nom.split(" ")[0]}` : ""},\n\nVous avez créé un compte sur Guidz il y a quelques jours, sans commencer votre livret. Est-ce qu’il vous manque quelque chose ? Répondez-moi, je vous aide volontiers.\n\n`
      : `Bonjour${i.nom ? ` ${i.nom.split(" ")[0]}` : ""},\n\nVotre livret « ${i.livretNom || "en cours"} » est resté en brouillon. Si quelque chose vous bloque, dites-le moi : je peux le regarder avec vous, ou le compléter pour vous.\n\n`;

  return `mailto:${i.email}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
}

export default function UtilisateursPage() {
  const [inscrits, setInscrits] = useState<Inscrit[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<Filtrage>("tous");
  const [recherche, setRecherche] = useState("");

  const charger = useCallback(async () => {
    try {
      setInscrits(await listerInscrits());
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

  const bilan = useMemo(
    () => ({
      total: inscrits.length,
      clients: inscrits.filter((i) => i.paye).length,
      brouillons: inscrits.filter((i) => i.etape === "brouillon").length,
      sansLivret: inscrits.filter((i) => i.etape === "sans-livret").length,
      bloques: inscrits.filter(abandonne).length,
      trente: inscrits.filter(inscritRecemment).length,
    }),
    [inscrits]
  );

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return inscrits
      .filter((i) => {
        if (filtre === "bloques") return abandonne(i);
        if (filtre === "brouillons") return i.etape === "brouillon";
        if (filtre === "clients") return i.paye;
        if (filtre === "sans-livret") return i.etape === "sans-livret";
        return true;
      })
      .filter((i) => {
        if (!q) return true;
        return [i.email, i.nom, i.livretNom, i.slug]
          .filter(Boolean)
          .some((c) => String(c).toLowerCase().includes(q));
      });
  }, [inscrits, filtre, recherche]);

  if (chargement) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Lecture des comptes et des livrets…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Utilisateurs
        </h1>
        <p className="mt-1 text-sm text-[#6B5D4E]">
          Les inscriptions, où chacun s’est arrêté, et depuis quand.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Indicateur
          intitule="Inscrits"
          valeur={bilan.total}
          detail={`${bilan.trente} sur les 30 derniers jours`}
        />
        <Indicateur
          intitule="Clients"
          valeur={bilan.clients}
          detail={
            bilan.total > 0
              ? `${Math.round((bilan.clients / bilan.total) * 100)} % des inscrits`
              : "Aucun encore"
          }
          ton="bien"
        />
        <Indicateur
          intitule="Brouillons"
          valeur={bilan.brouillons}
          detail="Livret commencé, pas publié"
        />
        <Indicateur
          intitule="Sans livret"
          valeur={bilan.sansLivret}
          detail="Compte créé, rien entamé"
        />
        <Indicateur
          intitule="À relancer"
          valeur={bilan.bloques}
          detail={
            bilan.bloques > 0
              ? "Sans activité depuis 3 jours"
              : "Personne ne traîne"
          }
          ton={bilan.bloques > 0 ? "alerte" : "bien"}
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
            placeholder="E-mail, nom, logement…"
            className="w-64 rounded-full border border-[#EDD9A3] bg-white py-2 pl-8 pr-3 text-[12px] outline-none focus:border-[#C4714A]"
          />
        </div>
        <Filtre libelle="Tous" nombre={bilan.total} actif={filtre === "tous"} onClick={() => setFiltre("tous")} />
        <Filtre libelle="À relancer" nombre={bilan.bloques} actif={filtre === "bloques"} onClick={() => setFiltre("bloques")} />
        <Filtre libelle="Brouillons" nombre={bilan.brouillons} actif={filtre === "brouillons"} onClick={() => setFiltre("brouillons")} />
        <Filtre libelle="Sans livret" nombre={bilan.sansLivret} actif={filtre === "sans-livret"} onClick={() => setFiltre("sans-livret")} />
        <Filtre libelle="Clients" nombre={bilan.clients} actif={filtre === "clients"} onClick={() => setFiltre("clients")} />
      </div>

      {visibles.length === 0 ? (
        <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white py-16 text-center">
          <UsersThree size={32} className="mx-auto mb-3 text-[#C9B99F]" />
          <p className="text-sm font-semibold text-[#2A2016]">
            {inscrits.length === 0 ? "Aucune inscription" : "Rien dans cette vue"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-[#EDD9A3]/40 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#EDD9A3]/40 bg-[#FBF5EC]">
                <tr>
                  {["Personne", "Inscription", "Livret", "Dernière activité", ""].map((t, i) => (
                    <th
                      key={t || i}
                      className={`px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#6B5D4E] ${
                        i === 4 ? "text-right" : ""
                      }`}
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDD9A3]/20">
                {visibles.map((i) => (
                  <tr key={i.uid} className="align-top transition-colors hover:bg-gray-50/50">
                    {/* Personne */}
                    <td className="px-5 py-3.5">
                      <div className="text-[13px] font-semibold text-[#2A2016]">
                        {i.nom || "—"}
                      </div>
                      <a
                        href={`mailto:${i.email}`}
                        className="text-[11px] text-[#6B5D4E] underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                      >
                        {i.email}
                      </a>
                      <div className="mt-1 text-[10px] text-[#A8998A]">{i.fournisseur}</div>
                    </td>

                    {/* Inscription */}
                    <td className="px-5 py-3.5">
                      <div className="text-[12px] text-[#2A2016]">{jour(i.inscritLe)}</div>
                      <div className="text-[10px] text-[#A8998A]">{depuis(i.inscritLe)}</div>
                      <div className="mt-1 text-[10px] text-[#6B5D4E]">
                        Connecté {depuis(i.derniereConnexion)}
                      </div>
                    </td>

                    {/* Livret */}
                    <td className="px-5 py-3.5">
                      {i.livretId ? (
                        <>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[12px] font-semibold text-[#2A2016]">
                              {i.livretNom || i.slug}
                            </span>
                            <Pastille ton={i.formule === "comfort" ? "ambre" : "vert"}>
                              {i.formule === "comfort" ? "Confort" : "Essentielle"}
                            </Pastille>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {i.paye ? (
                              <Pastille ton="vert" titre={`Payé le ${jour(i.payeLe)}`}>
                                Payé
                              </Pastille>
                            ) : (
                              <Pastille ton="gris">Brouillon</Pastille>
                            )}
                            {i.abonne && <Pastille ton="bleu">Abonné</Pastille>}
                            {i.enLigne && (
                              <a
                                href={`/h/${i.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2B5F75] hover:text-[#C4714A]"
                              >
                                voir <ArrowSquareOut size={9} />
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-[11px] text-[#A8998A]">
                          Aucun livret entamé
                        </span>
                      )}
                    </td>

                    {/* Dernière activité */}
                    <td className="px-5 py-3.5">
                      {i.livretId ? (
                        <>
                          <div className="text-[12px] text-[#2A2016]">
                            Éditeur ouvert{" "}
                            {i.derniereVisite ? depuis(i.derniereVisite) : "— jamais mesuré"}
                          </div>
                          <div className="text-[10px] text-[#6B5D4E]">
                            Modifié {depuis(i.derniereModification)}
                          </div>
                          {abandonne(i) && (
                            <div className="mt-1">
                              <Pastille ton="rouge">Sans activité</Pastille>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-[#A8998A]">—</span>
                      )}
                    </td>

                    {/* Relance */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {i.etape !== "publie" && (
                          <a
                            href={lienRelance(i)}
                            title="Écrire un message de relance"
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#EDD9A3] bg-white px-3 py-1.5 text-[11px] font-bold text-[#6B5D4E] transition-colors hover:border-[#C4714A] hover:text-[#C4714A]"
                          >
                            <EnvelopeSimple size={12} weight="fill" />
                            Relancer
                          </a>
                        )}
                        {i.livretId && (
                          <Link
                            href={`/admin/hebergements/${i.livretId}`}
                            title="Ouvrir son livret"
                            className="rounded-lg p-2 text-[#6B5D4E] transition-colors hover:bg-[#E4EEF3] hover:text-[#2B5F75]"
                          >
                            <ArrowSquareOut size={15} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
