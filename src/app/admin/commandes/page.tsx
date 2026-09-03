"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Package, Warning, ArrowSquareOut, Copy, Check, PencilSimple, Download,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { getPlaqueOrders, updateOrderStatus } from "../orders";
import PanneauExpedition, { Champ, dateCourte } from "@/components/admin/PanneauExpedition";
import AdresseLivraison from "@/components/admin/AdresseLivraison";
import { Indicateur, Filtre, depuis, euros } from "@/components/admin/pilotage";
import { adresseExpediable } from "@/lib/adressePostale";
import { PlaqueOrder, OrderStatus, ORDER_STATUS_LABELS } from "@/lib/types/accommodation";

/**
 * Suivi de production des plaques.
 *
 * Pour chaque commande, l'équipe retrouve le client, le logement, la formule,
 * la configuration figée, l'URL gravée, l'adresse d'expédition et l'état
 * d'avancement.
 *
 * L'écran est organisé autour de la seule question qui compte le matin :
 * qu'est-ce qui doit sortir aujourd'hui, et qu'est-ce qui est bloqué ? D'où
 * l'ancienneté affichée en clair et la file de production triée du plus
 * ancien au plus récent — une commande de six jours doit remonter, pas se
 * perdre sous celles d'hier.
 */

const STATUS_ORDER: OrderStatus[] = [
  "en_attente_paiement",
  "payee",
  "fichier_genere",
  "en_gravure",
  "expediee",
  "annulee",
];

const STATUS_TONE: Record<OrderStatus, string> = {
  en_attente_paiement: "bg-[#FDF3DC] text-[#A35A38] border-[#EDD9A3]",
  payee: "bg-[#E4EEF3] text-[#1A3F52] border-[#4A849E]/30",
  fichier_genere: "bg-[#EBF0E6] text-[#3F5836] border-[#5A7A4E]/30",
  en_gravure: "bg-[#F7EBE4] text-[#A35A38] border-[#C4714A]/30",
  expediee: "bg-[#EBF0E6] text-[#3F5836] border-[#5A7A4E]/40",
  annulee: "bg-gray-100 text-gray-500 border-gray-200",
};

const WOOD_LABEL: Record<string, string> = { clair: "Bois clair", noyer: "Noyer" };

/** Ce que rapporte une commande, selon la formule choisie. */
const PRIX_MISE_EN_SERVICE: Record<string, number> = { comfort: 69, essential: 49 };

/** Les états qui demandent encore un geste de l'atelier. */
const A_PRODUIRE: OrderStatus[] = ["payee", "fichier_genere", "en_gravure"];

type Filtrage = "produire" | "bloquees" | "expediees" | "attente" | "annulees" | "toutes";

/**
 * Une commande payée depuis plus d'une semaine et toujours pas expédiée.
 *
 * Le seuil est volontairement bas : c'est un objet fabriqué à la main, pas
 * un envoi le jour même — mais au-delà, le client commence à écrire.
 */
const RETARD_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * La commande traîne-t-elle ?
 *
 * Sortie du rendu : l'heure courante ne se dérive pas de l'état, et
 * l'interroger pendant le rendu rendrait le résultat instable.
 */
function traineTrop(order: PlaqueOrder): boolean {
  return A_PRODUIRE.includes(order.status) && Date.now() - order.createdAt > RETARD_MS;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PlaqueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Filtrage>("produire");

  const fetchOrders = useCallback(async () => {
    try {
      const list = await getPlaqueOrders();
      setOrders(list);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial : le seul setState vient d'une réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchOrders();
  }, [fetchOrders]);

  const changeStatus = async (order: PlaqueOrder, status: OrderStatus) => {
    setBusyId(order.id!);
    try {
      await updateOrderStatus(order.id!, status);
      setOrders((current) =>
        current.map((o) => (o.id === order.id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    } finally {
      setBusyId(null);
    }
  };

  const copyUrl = (order: PlaqueOrder) => {
    navigator.clipboard?.writeText(order.permanentUrl);
    setCopied(order.id!);
    setTimeout(() => setCopied((c) => (c === order.id ? null : c)), 2000);
  };

  /* ─── L'atelier en cinq chiffres ────────────────────────────────────── */

  const bilan = useMemo(() => {
    const vivantes = orders.filter((o) => o.status !== "annulee");
    const aProduire = vivantes.filter((o) => A_PRODUIRE.includes(o.status));
    const expediees = orders.filter((o) => o.status === "expediee");

    // Bloquées : payées, à produire, mais sans adresse où les envoyer.
    const bloquees = aProduire.filter((o) => !adresseExpediable(o.shippingAddress));

    const enRetard = aProduire.filter(traineTrop);

    const encaisse = vivantes
      .filter((o) => o.status !== "en_attente_paiement")
      .reduce((total, o) => total + (PRIX_MISE_EN_SERVICE[o.offerType] || 0), 0);

    /*
     * Délai réel entre la commande et l'expédition, sur ce qui est parti.
     * C'est le seul chiffre qui permette d'annoncer un délai honnête sur le
     * site — le reste n'est qu'une intention.
     */
    const delais = expediees
      .filter((o) => o.shippedAt)
      .map((o) => (o.shippedAt! - o.createdAt) / 86400000);
    const delaiMoyen = delais.length
      ? Math.round((delais.reduce((a, b) => a + b, 0) / delais.length) * 10) / 10
      : null;

    return {
      aProduire: aProduire.length,
      bloquees: bloquees.length,
      enRetard: enRetard.length,
      expediees: expediees.length,
      attente: orders.filter((o) => o.status === "en_attente_paiement").length,
      annulees: orders.filter((o) => o.status === "annulee").length,
      encaisse,
      delaiMoyen,
    };
  }, [orders]);

  /* ─── Filtres et recherche ──────────────────────────────────────────── */

  const passe = useCallback((o: PlaqueOrder, f: Filtrage) => {
    switch (f) {
      case "produire": return A_PRODUIRE.includes(o.status);
      case "bloquees":
        return A_PRODUIRE.includes(o.status) && !adresseExpediable(o.shippingAddress);
      case "expediees": return o.status === "expediee";
      case "attente": return o.status === "en_attente_paiement";
      case "annulees": return o.status === "annulee";
      default: return true;
    }
  }, []);

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();

    const retenues = orders
      .filter((o) => passe(o, filtre))
      .filter((o) => {
        if (!q) return true;
        return [
          o.reference, o.accommodationName, o.ownerName, o.ownerEmail,
          o.accommodationSlug, o.trackingNumber, o.carrier,
          o.shippingAddress?.city, o.shippingAddress?.postalCode,
        ]
          .filter(Boolean)
          .some((champ) => String(champ).toLowerCase().includes(q));
      });

    /*
     * La file de production se lit du plus ancien au plus récent : c'est
     * l'ordre dans lequel on grave. Partout ailleurs, la plus récente
     * d'abord, comme on consulte un historique.
     */
    const ancienDabord = filtre === "produire" || filtre === "bloquees";
    return retenues.sort((a, b) =>
      ancienDabord ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
    );
  }, [orders, filtre, recherche, passe]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Chargement des commandes…</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Commandes de plaques
        </h1>
        <p className="text-sm text-[#6B5D4E] mt-1">
          Suivi de production, de la commande à l’expédition.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Indicateur
          intitule="À produire"
          valeur={bilan.aProduire}
          detail={
            bilan.enRetard > 0
              ? `dont ${bilan.enRetard} de plus de 7 jours`
              : "Aucune ne traîne"
          }
          ton={bilan.enRetard > 0 ? "alerte" : "neutre"}
        />
        <Indicateur
          intitule="Bloquées"
          valeur={bilan.bloquees}
          detail={
            bilan.bloquees > 0
              ? "Sans adresse de livraison"
              : "Toutes ont une adresse"
          }
          ton={bilan.bloquees > 0 ? "alerte" : "bien"}
        />
        <Indicateur
          intitule="Expédiées"
          valeur={bilan.expediees}
          detail={
            bilan.delaiMoyen !== null
              ? `Délai moyen : ${bilan.delaiMoyen} j`
              : "Aucun délai mesuré"
          }
          ton="bien"
        />
        <Indicateur
          intitule="Encaissé"
          valeur={euros(bilan.encaisse)}
          detail="Mises en service, hors abonnements"
        />
        <Indicateur
          intitule="En attente de paiement"
          valeur={bilan.attente}
          detail="Commandes ouvertes, non réglées"
        />
      </div>

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 px-5 py-4 rounded-2xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 flex items-start gap-2">
            <Warning size={16} weight="fill" className="shrink-0 mt-0.5" />
            {error}
          </p>
          <button
            onClick={fetchOrders}
            className="shrink-0 px-4 py-1.5 rounded-full bg-white border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
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
            placeholder="Référence, logement, client, suivi, ville…"
            className="w-64 rounded-full border border-[#EDD9A3] bg-white py-2 pl-8 pr-3 text-[12px] outline-none focus:border-[#C4714A]"
          />
        </div>
        <Filtre libelle="À produire" nombre={bilan.aProduire} actif={filtre === "produire"} onClick={() => setFiltre("produire")} />
        <Filtre libelle="Bloquées" nombre={bilan.bloquees} actif={filtre === "bloquees"} onClick={() => setFiltre("bloquees")} />
        <Filtre libelle="Expédiées" nombre={bilan.expediees} actif={filtre === "expediees"} onClick={() => setFiltre("expediees")} />
        <Filtre libelle="En attente" nombre={bilan.attente} actif={filtre === "attente"} onClick={() => setFiltre("attente")} />
        <Filtre libelle="Annulées" nombre={bilan.annulees} actif={filtre === "annulees"} onClick={() => setFiltre("annulees")} />
        <Filtre libelle="Toutes" nombre={orders.length} actif={filtre === "toutes"} onClick={() => setFiltre("toutes")} />
      </div>

      {visibles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EDD9A3]/40 py-16 text-center">
          <Package size={32} className="mx-auto text-[#C9B99F] mb-3" />
          <p className="text-sm font-semibold text-[#2A2016]">
            {orders.length === 0
              ? "Aucune commande pour le moment"
              : "Aucune commande dans cette vue"}
          </p>
          <p className="text-xs text-[#6B5D4E] mt-1">
            {orders.length === 0
              ? "Les commandes passées depuis l’éditeur apparaîtront ici."
              : "Changez de filtre ou effacez la recherche."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-[#EDD9A3]/40 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[#2A2016]">
                      {order.reference}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_TONE[order.status]}`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FBF5EC] text-[#6B5D4E] border border-[#EDD9A3]/60">
                      {order.offerType === "comfort" ? "Confort" : "Essentielle"}
                    </span>
                    {order.version > 1 && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F7EBE4] text-[#A35A38]">
                        Plaque n° {order.version}
                      </span>
                    )}
                    {/*
                      L'ancienneté en clair, à côté du numéro : c'est elle
                      qui dit si la commande doit passer devant, pas la date.
                    */}
                    <span className="text-[11px] text-[#A8998A]">
                      Commandée {depuis(order.createdAt)}
                    </span>
                    {traineTrop(order) && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                        Plus de 7 jours
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-[#2A2016] mt-1.5">
                    {order.accommodationName}
                  </p>
                  <p className="text-xs text-[#6B5D4E]">
                    {order.ownerName || "—"}
                    {order.ownerEmail && ` · ${order.ownerEmail}`}
                  </p>
                  <p className="text-[11px] text-[#A8998A] mt-0.5">
                    {WOOD_LABEL[order.plaque?.wood] || "—"} · commandé le{" "}
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <select
                    value={order.status}
                    disabled={busyId === order.id}
                    onChange={(e) => void changeStatus(order, e.target.value as OrderStatus)}
                    className="px-3 py-2 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] text-xs font-semibold text-[#2A2016] outline-none focus:border-[#C4714A] disabled:opacity-50"
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyUrl(order)}
                      title="Copier l’URL gravée"
                      className="p-2 rounded-lg text-[#6B5D4E] hover:text-[#C4714A] hover:bg-[#FBF5EC] transition-colors"
                    >
                      {copied === order.id ? (
                        <Check size={16} weight="bold" className="text-[#3F5836]" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <a
                      href={order.permanentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Tester le QR gravé"
                      className="p-2 rounded-lg text-[#6B5D4E] hover:text-[#C4714A] hover:bg-[#FBF5EC] transition-colors"
                    >
                      <ArrowSquareOut size={16} />
                    </a>
                    <Link
                      href={`/admin/hebergements/${order.accommodationId}`}
                      title="Ouvrir le livret"
                      className="p-2 rounded-lg text-[#6B5D4E] hover:text-[#2B5F75] hover:bg-[#E4EEF3] transition-colors"
                    >
                      <PencilSimple size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              {/*
                Ce que l'équipe doit avoir sous les yeux pour traiter une
                commande sans ouvrir trois autres écrans : ce qui part en
                gravure, où le client sera livré, et où en est le paiement.
              */}
              <div className="grid gap-x-8 gap-y-2 px-6 py-4 border-t border-[#EDD9A3]/40 sm:grid-cols-2 lg:grid-cols-3">
                <Champ intitule="Phrase gravée">
                  {order.plaque?.engravedTagline || <span className="text-[#A8998A]">—</span>}
                </Champ>
                <Champ intitule="Essence">{WOOD_LABEL[order.plaque?.wood] || "—"}</Champ>
                <Champ intitule="Adresse publique">
                  <a
                    href={`/h/${order.accommodationSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                  >
                    /h/{order.accommodationSlug}
                  </a>
                </Champ>
                <Champ intitule="Contact">
                  {order.ownerEmail ? (
                    <a href={`mailto:${order.ownerEmail}`} className="underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]">
                      {order.ownerEmail}
                    </a>
                  ) : (
                    "—"
                  )}
                </Champ>
                <Champ intitule="Paiement">
                  {order.stripeSessionId ? (
                    <span className="font-mono text-[10px]">{order.stripeSessionId.slice(0, 24)}…</span>
                  ) : (
                    <span className="text-[#A8998A]">aucune session</span>
                  )}
                </Champ>
                <Champ intitule="Dernière mise à jour">{dateCourte(order.updatedAt)}</Champ>
              </div>

              <AdresseLivraison
                order={order}
                onEnregistre={(maj) =>
                  setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, ...maj } : o)))
                }
              />

              <PanneauExpedition
                order={order}
                onEnregistre={(maj) =>
                  setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, ...maj } : o)))
                }
              />

              <div className="px-6 py-3 bg-[#FBF5EC] border-t border-[#EDD9A3]/40 flex flex-wrap items-center gap-x-6 gap-y-1">
                <span className="text-[11px] text-[#6B5D4E]">
                  <span className="font-semibold text-[#5C3D2E]">URL gravée :</span>{" "}
                  <span className="font-mono">{order.permanentUrl}</span>
                </span>
                {/*
                  Le fichier est fabriqué à la demande, à partir de la
                  configuration figée dans la commande : il n'y a rien à
                  stocker, et une plaque déjà produite ne peut pas changer
                  parce que l'hôte a modifié sa phrase entre-temps.
                */}
                <a
                  href={`/api/admin/gravure/${order.id}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#A35A38] underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                >
                  <Download size={12} weight="bold" />
                  Gravure DXF
                </a>
                <a
                  href={`/api/admin/gravure/${order.id}?format=svg`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#A35A38] underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
                >
                  <Download size={12} weight="bold" />
                  Gravure SVG
                </a>
                {/*
                  Le QR seul, pour tout ce qui n'est pas la plaque : une
                  étiquette, un visuel dans un e-mail. Il encode la même
                  adresse permanente, avec le même encodeur.
                */}
                <a
                  href={`/api/admin/gravure/${order.id}?format=qr`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2B5F75] underline decoration-[#D6E3E8] underline-offset-2 hover:text-[#C4714A]"
                >
                  <Download size={12} weight="bold" />
                  QR seul (PNG)
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
