"use client";

import AdminModernTileEditor from "@/components/admin/AdminModernTileEditor";
import { Accommodation } from "@/lib/types/accommodation";

/**
 * Éditeur de démonstration, destiné à être encadré par le mockup d'ordinateur
 * de la page d'accueil.
 *
 * `onSubmit` ne fait rien : le mode démo intercepte déjà l'enregistrement,
 * mais la prop est requise et un appel qui écrirait en base depuis une page
 * publique serait la pire des régressions possibles ici.
 */
export default function DemoEditorClient({ data }: { data: Accommodation }) {
  return (
    <AdminModernTileEditor
      initialData={data}
      onSubmit={async () => {}}
      role="proprietaire"
      demo
    />
  );
}
