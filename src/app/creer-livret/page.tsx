import CreationWizard from "@/components/creation/CreationWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer votre livret d'accueil numérique — Cléo",
  description: "Créez votre livret d'accueil Airbnb ou conciergerie en 2 minutes avec prévisualisation en direct."
};

export default function CreerLivretPage() {
  return <CreationWizard />;
}
