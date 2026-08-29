import EssentialTemplate from "@/components/templates/EssentialTemplate";
import { demoEssentielle } from "@/lib/demoData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue à La Petite Boire — Démo Essentiel",
  description: "Guide d'accueil numérique essentiel pour La Petite Boire"
};

export default function DemoEssentiellePage() {
  return <EssentialTemplate data={demoEssentielle} />;
}
