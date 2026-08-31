"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminModernTileEditor from "@/components/admin/AdminModernTileEditor";
import { getAdminAccommodationById, updateAdminAccommodation } from "../../actions";
import { Accommodation } from "@/lib/types/accommodation";
import { Warning } from "@phosphor-icons/react";

/**
 * Édition d'un livret depuis l'administration Guidz.
 *
 * Le panneau « Compte propriétaire » a disparu : les comptes se créent
 * désormais par le parcours client — choix de la formule, inscription,
 * édition. Le créer à la main depuis l'admin donnait un second chemin, avec
 * ses propres mots de passe temporaires, qui divergeait du vrai.
 */

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditAccommodationPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  /**
   * Canal permettant à la page d'appliquer une écriture faite HORS de
   * l'éditeur dans son état interne. L'éditeur travaille sur un instantané
   * figé au montage ; sans ce report, son prochain enregistrement écraserait
   * ces champs.
   */
  const applyToEditor = useRef<((patch: Partial<Accommodation>) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAccommodation = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const acc = await getAdminAccommodationById(id);
        if (cancelled) return;
        if (acc) {
          setData(acc);
        } else {
          router.push("/admin/hebergements");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching accommodation:", error);
        // On affiche l'erreur au lieu de rester sur un écran vide : sans le
        // livret réel, éditer reviendrait à risquer d'écraser son contenu.
        setLoadError(error instanceof Error ? error.message : "Chargement impossible.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAccommodation();
    return () => {
      cancelled = true;
    };
  }, [id, router, reloadToken]);

  /**
   * Enregistrement depuis l'éditeur : on RESTE sur la page pour continuer à
   * travailler, et on garde l'état local synchronisé. Les erreurs remontent à
   * l'éditeur, qui les affiche dans son bandeau.
   *
   * Certains champs sont volontairement RETIRÉS de la charge utile : ils sont
   * pilotés ailleurs — compte propriétaire, historiques, identité gravée.
   * L'éditeur travaille sur un instantané figé au montage ; sans ce filtre,
   * enregistrer réécrirait l'ancien état de ces champs.
   */
  const handleSubmitInPlace = async (updatedData: Accommodation) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Accommodation> = { ...updatedData };
      for (const key of [
        "ownerUid", "mustChangePassword", "cleaningLogs", "inventories",
        "features", "publishedAt", "createdAt", "permanentId", "slugLocked",
      ] as const) {
        delete payload[key];
      }
      await updateAdminAccommodation(id, payload);
      setData((prev) => (prev ? { ...prev, ...payload } : updatedData));
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Chargement du livret…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <Warning size={24} weight="fill" />
        </div>
        <h1 className="font-bold text-lg text-[#2A2016] mb-2">Impossible de charger ce livret</h1>
        <p className="text-sm text-[#6B5D4E] mb-5">{loadError}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setReloadToken((t) => t + 1)}
            className="px-5 py-2.5 rounded-xl bg-[#C4714A] text-white text-sm font-semibold hover:bg-[#A35A38] transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push("/admin/hebergements")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#6B5D4E] hover:bg-gray-50 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  /*
   * Un seul éditeur, quelle que soit la formule : ce qui relève du Confort y
   * est grisé, et l'aperçu prend le gabarit de sa formule.
   */
  return (
    <AdminModernTileEditor
      initialData={data}
      onSubmit={handleSubmitInPlace}
      isLoading={isSubmitting}
      externalPatchRef={applyToEditor}
    />
  );
}
