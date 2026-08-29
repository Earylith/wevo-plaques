"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, Warning, ArrowSquareOut, Copy, Check, PencilSimple,
} from "@phosphor-icons/react";
import { getPlaqueOrders, updateOrderStatus } from "../orders";
import { PlaqueOrder, OrderStatus, ORDER_STATUS_LABELS } from "@/lib/types/accommodation";

/**
 * Suivi de production des plaques.
 *
 * Pour chaque commande, l'équipe retrouve le client, le logement, la formule,
 * la configuration figée, l'URL gravée et l'état d'avancement.
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<PlaqueOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Commandes de plaques
        </h1>
        <p className="text-sm text-[#6B5D4E] mt-1">
          Suivi de production, de la commande à l’expédition.
        </p>
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

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EDD9A3]/40 py-16 text-center">
          <Package size={32} className="mx-auto text-[#C9B99F] mb-3" />
          <p className="text-sm font-semibold text-[#2A2016]">Aucune commande pour le moment</p>
          <p className="text-xs text-[#6B5D4E] mt-1">
            Les commandes passées depuis l’éditeur apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
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

              <div className="px-6 py-3 bg-[#FBF5EC] border-t border-[#EDD9A3]/40 flex flex-wrap items-center gap-x-6 gap-y-1">
                <span className="text-[11px] text-[#6B5D4E]">
                  <span className="font-semibold text-[#5C3D2E]">URL gravée :</span>{" "}
                  <span className="font-mono">{order.permanentUrl}</span>
                </span>
                <span className="text-[11px] text-[#6B5D4E]">
                  <span className="font-semibold text-[#5C3D2E]">Fichier de gravure :</span>{" "}
                  {order.engravingFile ? (
                    <a href={order.engravingFile} className="underline hover:text-[#C4714A]">
                      télécharger
                    </a>
                  ) : (
                    <span className="text-[#A8998A]">en attente du gabarit vectoriel</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
