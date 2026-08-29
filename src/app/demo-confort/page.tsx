import ComfortTemplate from "@/components/templates/ComfortTemplate";
import { demoConfort } from "@/lib/demoData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue à la Villa L'Écrin d'Or — Démo Confort",
  description: "Guide d'accueil numérique prestige pour la Villa L'Écrin d'Or"
};

export default function DemoConfortPage() {
  return <ComfortTemplate data={demoConfort} />;
}
