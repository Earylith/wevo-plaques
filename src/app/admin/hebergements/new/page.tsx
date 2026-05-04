"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminAccommodationForm from "@/components/admin/AdminAccommodationForm";
import { createAccommodation } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";

export default function NewAccommodationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: Omit<Accommodation, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    try {
      await createAccommodation(data);
      router.push("/admin/hebergements");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      alert("Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Nouveau logement
        </h1>
        <p className="text-sm text-[#6B5D4E] mt-1">Créez un nouveau livret d&apos;accueil</p>
      </div>

      <AdminAccommodationForm onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
