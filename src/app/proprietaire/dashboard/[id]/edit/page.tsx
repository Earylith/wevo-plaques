"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAccommodationById, updateAccommodation } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import AdminModernTileEditor from "@/components/admin/AdminModernTileEditor";

export default function EditAccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loadingAcc, setLoadingAcc] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/proprietaire/login");
    }
    if (user?.email) {
      getAccommodationById(id)
        .then((acc) => {
          if (!acc || acc.owner.email !== user.email) {
            router.replace("/proprietaire/dashboard");
            return;
          }
          setAccommodation(acc);
        })
        .finally(() => setLoadingAcc(false));
    }
  }, [user, loading, router, id]);

  const handleSubmit = async (data: Partial<Accommodation>) => {
    if (!accommodation?.id) return;
    setIsSubmitting(true);
    try {
      await updateAccommodation(accommodation.id, data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || loadingAcc) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  if (!accommodation) return null;

  /*
   * Les livrets Confort passent par l'éditeur en direct — le même que celui de
   * l'administration, en mode propriétaire : ce qui relève de Guidz (commande
   * de plaque, statistiques, mise en ligne) y est masqué.
   *
   * L'ancien formulaire ne sert plus qu'à l'offre Essentielle, qui n'a pas
   * encore été reprise.
   */
  return (
    <AdminModernTileEditor
      initialData={accommodation}
      onSubmit={async (updated) => {
        await handleSubmit(updated);
      }}
      isLoading={isSubmitting}
      role="proprietaire"
    />
  );
}

