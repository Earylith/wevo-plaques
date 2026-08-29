import { Metadata } from "next";
import { resolveAccommodation } from "@/lib/firebase/admin-firestore";
import { demoConfortMarseille } from "@/lib/demoData";
import DemoEditorClient from "./DemoEditorClient";

/*
 * Vitrine de l'éditeur : la page d'accueil l'affiche dans un mockup
 * d'ordinateur portable. On repart du livret « demo-confort2 » — le même que
 * la démo publique — pour que l'aperçu de droite montre exactement le livret
 * que le visiteur peut ouvrir en grand.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Démo de l'éditeur — Guidz",
  description:
    "Modifiez un livret d'accueil et voyez le résultat en direct. Démo libre, rien n'est enregistré.",
  // La démo ne doit pas concurrencer les vraies pages dans les résultats de
  // recherche : c'est une vitrine, pas un contenu.
  robots: { index: false, follow: false },
};

export default async function DemoEditeurPage() {
  const data = (await resolveAccommodation("demo-confort2")) || demoConfortMarseille;
  return <DemoEditorClient data={data} />;
}
