"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AdminModernTileEditor from "@/components/admin/AdminModernTileEditor";
import { Accommodation, OfferType } from "@/lib/types/accommodation";

/**
 * Éditeur de démonstration, destiné à être encadré par le mockup d'ordinateur
 * de la page d'accueil.
 *
 * `onSubmit` ne fait rien : le mode démo intercepte déjà l'enregistrement,
 * mais la prop est requise et un appel qui écrirait en base depuis une page
 * publique serait la pire des régressions possibles ici.
 */
function DemoEditorContent({ data }: { data: Accommodation }) {
  const searchParams = useSearchParams();
  const estBrouillon = searchParams.get("brouillon") === "1";
  const formule = searchParams.get("formule") as OfferType | null;

  const currentData: Accommodation = {
    ...data,
    ...(estBrouillon ? { isActive: false } : {}),
    ...(formule ? { offerType: formule, template: formule === "comfort" ? "cleo" : "essential" } : {}),
  };

  return (
    <AdminModernTileEditor
      initialData={currentData}
      onSubmit={async () => {}}
      role="proprietaire"
      demo
    />
  );
}

export default function DemoEditorClient({ data }: { data: Accommodation }) {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#FAF5EE]" />}>
      <DemoEditorContent data={data} />
    </Suspense>
  );
}
