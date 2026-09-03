"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminAccommodations, toggleAccommodationStatus, deleteAdminAccommodation,
  duplicateAdminAccommodation, getIndicateursLivrets,
} from "../actions";
import { Accommodation } from "@/lib/types/accommodation";
import { IndicateurLivret } from "@/lib/types/pilotage";
import { sessionModificationActive } from "@/lib/livret";
import { ORDER_STATUS_LABELS } from "@/lib/types/accommodation";
import Link from "next/link";
import {
  Plus, PencilSimple, Trash, Link as LinkIcon, Copy, Warning,
  MagnifyingGlass, ArrowSquareOut,
} from "@phosphor-icons/react";
import { Indicateur, Filtre, Pastille, jour, depuis, euros } from "@/components/admin/pilotage";

/**
 * Le parc de livrets, vu comme une activité et non comme une table.
 *
 * Chaque ligne répond aux questions qu'on se pose vraiment : ce livret
 * a-t-il été payé, sa plaque est-elle partie, quelqu'un l'ouvre-t-il encore ?
 * Le nom et la ville ne disent rien de tout cela, et c'est pourtant tout ce
 * que cet écran montrait — il fallait ouvrir Stripe, les commandes et les
 * statistiques pour reconstituer la réponse, logement par logement.
 */

/** Tarifs de mise en service, pour chiffrer le parc. */
const PRIX_MISE_EN_SERVICE = { comfort: 69, essential: 49 } as const;
const ABONNEMENT_MENSUEL = 1.99;
const ABONNEMENT_ANNUEL = 19;

type Filtrage =
  | "tous"
  | "enligne"
  | "brouillons"
  | "confort"
  | "essentielle"
  | "sanspaiement"
  | "demos";

/** Un livret de démonstration ne compte pas dans le chiffre d'affaires. */
function estDemo(acc: Accommodation): boolean {
  return (acc.id || acc.slug || "").startsWith("demo");
}

/**
 * Un livret publié qui n'a jamais été payé.
 *
 * C'est le cas quand Guidz met une page en ligne depuis l'admin : la page
 * existe, mais aucune plaque n'a été lancée et rien n'a été encaissé. Rien ne
 * le distinguait des autres — une page dépannée puis oubliée restait en
 * ligne indéfiniment, sans que personne ne s'en aperçoive.
 */
function publieSansPaiement(acc: Accommodation): boolean {
  return Boolean(acc.isActive) && !acc.paidAt && !estDemo(acc);
}

export default function AccommodationsList() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [indicateurs, setIndicateurs] = useState<Record<string, IndicateurLivret>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Filtrage>("tous");

  const fetchAccommodations = useCallback(async () => {
    // Aucun setState synchrone avant le premier await : appelée depuis un
    // effet, elle déclencherait sinon un rendu en cascade.
    try {
      const data = await getAdminAccommodations();
      setAccommodations(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching accommodations:", err);
      // Sans cet affichage, une panne Firestore laissait une liste vide,
      // impossible à distinguer d'un compte sans aucun hébergement.
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }

    /*
     * Les indicateurs viennent après, et séparément : ils lisent deux autres
     * collections, et leur panne ne doit jamais priver l'équipe de la liste
     * elle-même. Une mesure absente vaut mieux qu'un écran vide.
     */
    try {
      setIndicateurs(await getIndicateursLivrets());
    } catch (err) {
      console.error("Indicateurs indisponibles", err);
    }
  }, []);

  useEffect(() => {
    // Chargement initial des données : le seul setState de cet effet vient
    // d'une réponse réseau asynchrone, pas d'un calcul dérivable du rendu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAccommodations();
  }, [fetchAccommodations]);

  const handleDuplicate = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await duplicateAdminAccommodation(id);
      await fetchAccommodations();
    } catch (err) {
      console.error("Error duplicating accommodation:", err);
      setError(err instanceof Error ? err.message : "La duplication a échoué.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAccommodationStatus(id, currentStatus);
      fetchAccommodations();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet hébergement ? Cette action est irréversible.")) {
      try {
        await deleteAdminAccommodation(id);
        fetchAccommodations();
      } catch (error) {
        console.error("Error deleting accommodation:", error);
      }
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/h/${slug}`;
    navigator.clipboard.writeText(url);
    alert("URL copiée !");
  };

  /* ─── Ce que pèse le parc ───────────────────────────────────────────── */

  const bilan = useMemo(() => {
    const clients = accommodations.filter((a) => !estDemo(a));
    const payes = clients.filter((a) => a.paidAt);

    const encaisse = payes.reduce(
      (total, a) => total + (PRIX_MISE_EN_SERVICE[a.offerType] ?? 0),
      0
    );

    /*
     * Abonnements réellement en cours. Une résiliation demandée compte
     * encore — elle est payée jusqu'au bout de la période — mais on la
     * signale, car ce revenu-là s'arrête à une date connue.
     */
    const abonnes = clients.filter((a) => a.stripeSubscriptionId);
    const partants = abonnes.filter((a) => a.cancelAtPeriodEnd);
    const recurrent = abonnes.reduce(
      (total, a) =>
        total + (a.abonnementRythme === "annuel" ? ABONNEMENT_ANNUEL / 12 : ABONNEMENT_MENSUEL),
      0
    );

    const vues30j = clients.reduce(
      (total, a) => total + (indicateurs[a.id || ""]?.vues30j || 0),
      0
    );

    return {
      total: clients.length,
      enLigne: clients.filter((a) => a.isActive).length,
      brouillons: clients.filter((a) => !a.isActive).length,
      payes: payes.length,
      sansPaiement: clients.filter(publieSansPaiement).length,
      encaisse,
      abonnes: abonnes.length,
      partants: partants.length,
      recurrent,
      vues30j,
      demos: accommodations.length - clients.length,
    };
  }, [accommodations, indicateurs]);

  /* ─── Filtres et recherche ──────────────────────────────────────────── */

  const compte = useCallback(
    (f: Filtrage) => {
      const clients = accommodations.filter((a) => !estDemo(a));
      switch (f) {
        case "tous": return clients.length;
        case "enligne": return clients.filter((a) => a.isActive).length;
        case "brouillons": return clients.filter((a) => !a.isActive).length;
        case "confort": return clients.filter((a) => a.offerType === "comfort").length;
        case "essentielle": return clients.filter((a) => a.offerType === "essential").length;
        case "sanspaiement": return clients.filter(publieSansPaiement).length;
        case "demos": return accommodations.length - clients.length;
      }
    },
    [accommodations]
  );

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();

    return accommodations
      .filter((a) => {
        if (filtre === "demos") return estDemo(a);
        if (estDemo(a)) return false;
        switch (filtre) {
          case "enligne": return a.isActive;
          case "brouillons": return !a.isActive;
          case "confort": return a.offerType === "comfort";
          case "essentielle": return a.offerType === "essential";
          case "sanspaiement": return publieSansPaiement(a);
          default: return true;
        }
      })
      .filter((a) => {
        if (!q) return true;
        // On cherche là où l'équipe cherche : un nom, une ville, un client,
        // son e-mail, ou l'adresse publique reçue par courrier.
        return [
          a.property?.name, a.property?.city, a.owner?.name,
          a.owner?.email, a.slug, a.permanentId,
        ]
          .filter(Boolean)
          .some((champ) => String(champ).toLowerCase().includes(q));
      })
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [accommodations, filtre, recherche]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            Hébergements
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-1">
            {bilan.total} livret{bilan.total > 1 ? "s" : ""} client
            {bilan.total > 1 ? "s" : ""}
            {bilan.demos > 0 && ` · ${bilan.demos} démonstration${bilan.demos > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/hebergements/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nouveau logement
        </Link>
      </div>

      {/* Le parc en cinq chiffres. */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Indicateur
          intitule="En ligne"
          valeur={bilan.enLigne}
          detail={`${bilan.brouillons} brouillon${bilan.brouillons > 1 ? "s" : ""} en attente`}
        />
        <Indicateur
          intitule="Mises en service"
          valeur={euros(bilan.encaisse)}
          detail={`${bilan.payes} paiement${bilan.payes > 1 ? "s" : ""} encaissé${bilan.payes > 1 ? "s" : ""}`}
          ton="bien"
        />
        <Indicateur
          intitule="Revenu récurrent"
          valeur={`${euros(Math.round(bilan.recurrent * 100) / 100)}/mois`}
          detail={
            bilan.partants > 0
              ? `${bilan.abonnes} abonnés · ${bilan.partants} en résiliation`
              : `${bilan.abonnes} abonnement${bilan.abonnes > 1 ? "s" : ""} actif${bilan.abonnes > 1 ? "s" : ""}`
          }
          ton={bilan.partants > 0 ? "alerte" : "bien"}
        />
        <Indicateur
          intitule="Consultations 30 j"
          valeur={bilan.vues30j}
          detail="Ouvertures des livrets clients"
        />
        <Indicateur
          intitule="Publiés sans paiement"
          valeur={bilan.sansPaiement}
          detail={
            bilan.sansPaiement > 0
              ? "En ligne, mais aucune plaque lancée"
              : "Rien à régulariser"
          }
          ton={bilan.sansPaiement > 0 ? "alerte" : "neutre"}
        />
      </div>

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 px-5 py-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 flex items-start gap-2">
            <Warning size={16} weight="fill" className="shrink-0 mt-0.5" />
            {error}
          </p>
          <button
            onClick={fetchAccommodations}
            className="shrink-0 px-4 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
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
            placeholder="Nom, ville, client, e-mail, adresse…"
            className="w-64 rounded-full border border-[#EDD9A3] bg-white py-2 pl-8 pr-3 text-[12px] outline-none focus:border-[#C4714A]"
          />
        </div>
        <Filtre libelle="Tous" nombre={compte("tous")} actif={filtre === "tous"} onClick={() => setFiltre("tous")} />
        <Filtre libelle="En ligne" nombre={compte("enligne")} actif={filtre === "enligne"} onClick={() => setFiltre("enligne")} />
        <Filtre libelle="Brouillons" nombre={compte("brouillons")} actif={filtre === "brouillons"} onClick={() => setFiltre("brouillons")} />
        <Filtre libelle="Confort" nombre={compte("confort")} actif={filtre === "confort"} onClick={() => setFiltre("confort")} />
        <Filtre libelle="Essentielle" nombre={compte("essentielle")} actif={filtre === "essentielle"} onClick={() => setFiltre("essentielle")} />
        <Filtre libelle="Sans paiement" nombre={compte("sanspaiement")} actif={filtre === "sanspaiement"} onClick={() => setFiltre("sanspaiement")} />
        <Filtre libelle="Démos" nombre={compte("demos")} actif={filtre === "demos"} onClick={() => setFiltre("demos")} />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#EDD9A3]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FBF5EC] border-b border-[#EDD9A3]/40">
              <tr>
                {["Logement", "Client", "Formule", "Paiement", "Plaque", "Usage", ""].map((titre, i) => (
                  <th
                    key={titre || i}
                    className={`px-5 py-3 text-[10px] font-semibold text-[#6B5D4E] uppercase tracking-wider ${
                      i === 6 ? "text-right" : ""
                    }`}
                  >
                    {titre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDD9A3]/20">
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#6B5D4E]">
                    {accommodations.length === 0
                      ? "Aucun hébergement pour le moment."
                      : "Aucun livret ne correspond à cette recherche."}
                  </td>
                </tr>
              ) : (
                visibles.map((acc) => {
                  const ind = indicateurs[acc.id || ""];
                  const sansPaiement = publieSansPaiement(acc);

                  return (
                    <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors align-top">
                      {/* Logement */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#2A2016] text-[13px]">
                            {acc.property.name}
                          </span>
                          {estDemo(acc) && <Pastille ton="bleu">Démo</Pastille>}
                        </div>
                        <div className="text-[11px] text-[#6B5D4E] mt-0.5">
                          {acc.property.city}
                        </div>
                        <a
                          href={`/h/${acc.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-[#A8998A] hover:text-[#C4714A]"
                        >
                          /h/{acc.slug}
                          <ArrowSquareOut size={9} />
                        </a>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-3.5">
                        <div className="text-[12px] text-[#2A2016]">{acc.owner.name || "—"}</div>
                        {acc.owner.email && (
                          <a
                            href={`mailto:${acc.owner.email}`}
                            className="text-[10px] text-[#6B5D4E] underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                          >
                            {acc.owner.email}
                          </a>
                        )}
                        <div className="mt-1">
                          {acc.ownerUid ? (
                            <Pastille ton="vert" titre="L’hôte a un compte et modifie lui-même">
                              Compte client
                            </Pastille>
                          ) : (
                            <Pastille ton="gris" titre="Composé par Guidz, sans compte rattaché">
                              Composé par Guidz
                            </Pastille>
                          )}
                        </div>
                      </td>

                      {/* Formule */}
                      <td className="px-5 py-3.5">
                        <Pastille ton={acc.offerType === "comfort" ? "ambre" : "vert"}>
                          {acc.offerType === "comfort" ? "Confort" : "Essentielle"}
                        </Pastille>
                        {acc.offerType === "comfort" && (
                          <div className="mt-1 text-[10px] text-[#6B5D4E]">
                            {acc.stripeSubscriptionId ? (
                              acc.cancelAtPeriodEnd ? (
                                <span className="font-semibold text-[#A35A38]">
                                  Résiliation demandée
                                </span>
                              ) : (
                                <>Abonné · {acc.abonnementRythme === "annuel" ? "19 €/an" : "1,99 €/mois"}</>
                              )
                            ) : (
                              <span className="text-[#A8998A]">Sans abonnement</span>
                            )}
                          </div>
                        )}
                        {acc.offerType === "essential" &&
                          sessionModificationActive(acc) && (
                            <div className="mt-1 text-[10px] font-semibold text-[#2B5F75]">
                              Modification ouverte jusqu’au {jour(acc.editionUntil)}
                            </div>
                          )}
                      </td>

                      {/* Paiement */}
                      <td className="px-5 py-3.5">
                        {acc.paidAt ? (
                          <>
                            <Pastille ton="vert">Payé</Pastille>
                            <div className="mt-1 text-[10px] text-[#6B5D4E]">
                              {jour(acc.paidAt)}
                            </div>
                          </>
                        ) : sansPaiement ? (
                          <>
                            <Pastille
                              ton="rouge"
                              titre="Mis en ligne depuis l’admin : rien n’a été encaissé et aucune plaque n’a été lancée."
                            >
                              Sans paiement
                            </Pastille>
                            <div className="mt-1 text-[10px] text-[#A35A38]">
                              Publié le {jour(acc.publishedAt)}
                            </div>
                          </>
                        ) : (
                          <Pastille ton="gris">Brouillon</Pastille>
                        )}
                      </td>

                      {/* Plaque */}
                      <td className="px-5 py-3.5">
                        {ind?.commandeStatut ? (
                          <>
                            <Pastille
                              ton={
                                ind.commandeStatut === "expediee"
                                  ? "vert"
                                  : ind.commandeStatut === "annulee"
                                    ? "gris"
                                    : "ambre"
                              }
                            >
                              {ORDER_STATUS_LABELS[ind.commandeStatut]}
                            </Pastille>
                            <div className="mt-1 font-mono text-[10px] text-[#6B5D4E]">
                              {ind.commandeRef}
                            </div>
                            {!ind.adresseConnue && ind.commandeStatut !== "annulee" && (
                              <div className="mt-0.5 text-[10px] font-semibold text-[#A35A38]">
                                Adresse manquante
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-[#A8998A]">Aucune</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="px-5 py-3.5">
                        {ind && ind.vues > 0 ? (
                          <>
                            <div className="text-[13px] font-bold text-[#2A2016]">
                              {ind.vues30j}
                              <span className="ml-1 text-[10px] font-normal text-[#6B5D4E]">
                                sur 30 j
                              </span>
                            </div>
                            <div className="text-[10px] text-[#6B5D4E]">
                              {ind.vues} au total · {ind.scansQr} par QR
                            </div>
                            <div className="text-[10px] text-[#A8998A]">
                              Vu {depuis(ind.derniereVue)}
                            </div>
                          </>
                        ) : (
                          <span className="text-[11px] text-[#A8998A]">
                            {acc.isActive ? "Jamais ouvert" : "—"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(acc.id!, acc.isActive)}
                            className={`mr-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                              acc.isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            title={acc.isActive ? "Retirer du web" : "Mettre en ligne"}
                          >
                            {acc.isActive ? "En ligne" : "Hors ligne"}
                          </button>
                          <button
                            onClick={() => copyUrl(acc.slug)}
                            className="p-1.5 text-[#6B5D4E] hover:text-[#C4714A] hover:bg-[#FBF5EC] rounded-lg transition-colors"
                            title="Copier le lien"
                          >
                            <LinkIcon size={16} />
                          </button>
                          <Link
                            href={`/admin/hebergements/${acc.id || acc.slug}`}
                            className="p-1.5 text-[#6B5D4E] hover:text-[#2B5F75] hover:bg-[#E4EEF3] rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <PencilSimple size={16} />
                          </Link>
                          <button
                            onClick={() => handleDuplicate(acc.id!)}
                            disabled={busyId === acc.id}
                            className="p-1.5 text-[#6B5D4E] hover:text-[#C4714A] hover:bg-[#FBF5EC] rounded-lg transition-colors disabled:opacity-40"
                            title="Dupliquer pour un autre logement"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id!)}
                            className="p-1.5 text-[#6B5D4E] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
