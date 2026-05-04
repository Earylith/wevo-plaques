"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import AdminAccommodationForm from "@/components/admin/AdminAccommodationForm";
import { getAccommodationById, updateAccommodation } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditAccommodationPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const acc = await getAccommodationById(id);
        if (acc) {
          setData(acc);
        } else {
          router.push("/admin/hebergements");
        }
      } catch (error) {
        console.error("Error fetching accommodation:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccommodation();
  }, [id, router]);

  const handleSubmit = async (updatedData: Omit<Accommodation, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    try {
      await updateAccommodation(id, updatedData);
      router.push("/admin/hebergements");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue lors de la mise à jour.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]"></div></div>;
  }

  if (!data) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Modifier le logement
        </h1>
        <p className="text-sm text-[#6B5D4E] mt-1">Édition de {data.property.name}</p>
      </div>

      <AdminAccommodationForm initialData={data} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
