"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminModernTileEditor from "@/components/admin/AdminModernTileEditor";
import { createAdminAccommodation, updateAdminAccommodation } from "../../actions";
import { Accommodation } from "@/lib/types/accommodation";
import { createEmptyAccommodation } from "@/lib/livret";

export default function NewAccommodationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Identifiant du document créé au premier enregistrement. */
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Le slug est tiré une seule fois : le recalculer à chaque rendu changerait
  // l'URL publique du livret entre deux frappes.
  const [initialNewData] = useState<Accommodation>(() =>
    createEmptyAccommodation(`livret-${Date.now().toString(36)}`)
  );

  /**
   * Premier enregistrement : création. Les suivants : mise à jour du même
   * document — sans cela, chaque clic sur « Enregistrer » créerait un doublon.
   * L'identifiant réel est renvoyé à l'éditeur pour que « Publier » vise le
   * bon document.
   */
  const handleSubmit = async (data: Accommodation): Promise<string> => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Accommodation> = { ...data };
      delete payload.id;

      if (createdId) {
        await updateAdminAccommodation(createdId, payload);
        return createdId;
      }

      const newId = await createAdminAccommodation(
        payload as Omit<Accommodation, "id" | "createdAt" | "updatedAt">
      );
      setCreatedId(newId);
      // On reflète l'identifiant dans l'URL sans remonter l'éditeur : un
      // router.push() détruirait l'état en cours d'édition.
      window.history.replaceState(null, "", `/admin/hebergements/${newId}`);
      router.refresh();
      return newId;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminModernTileEditor
      initialData={initialNewData}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
}
