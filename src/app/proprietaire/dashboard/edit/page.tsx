"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAccommodationByOwnerEmail, updateAccommodation } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import OwnerAccommodationForm from "@/components/proprietaire/OwnerAccommodationForm";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function EditAccommodationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loadingAcc, setLoadingAcc] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/proprietaire/login");
    }
    if (user?.email) {
      getAccommodationByOwnerEmail(user.email)
        .then(setAccommodation)
        .finally(() => setLoadingAcc(false));
    }
  }, [user, loading, router]);

  const handleSubmit = async (data: Partial<Accommodation>) => {
    if (!accommodation?.id) return;
    setIsSubmitting(true);
    try {
      await updateAccommodation(accommodation.id, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/proprietaire/dashboard"
            className="p-2 rounded-xl text-[#6B5D4E] hover:bg-[#EDD9A3]/30 hover:text-[#2A2016] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
              Mon livret d&apos;accueil
            </h1>
            <p className="text-sm text-[#6B5D4E] mt-1">
              {accommodation.property.name} — Pack{" "}
              {accommodation.offerType === "comfort" ? "Confort" : "Essentiel"}
            </p>
          </div>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200 animate-pulse">
            ✓ Modifications enregistrées
          </div>
        )}
      </div>

      <OwnerAccommodationForm
        initialData={accommodation}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}
