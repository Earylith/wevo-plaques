import { Metadata } from "next";
import EssentialTemplate from "@/components/templates/EssentialTemplate";
import { resolveAccommodation } from "@/lib/firebase/admin-firestore";
import { demoEssentielle } from "@/lib/demoData";

/**
 * Démonstration de la formule Essentielle.
 *
 * Elle sert de référence : toute page Essentielle créée ensuite utilise le
 * même gabarit, avec les données de son propre livret. Le contenu montré ici
 * remplit TOUS les champs que la formule permet de modifier, et aucun autre.
 *
 * Lue depuis Firestore, comme la démo Confort : la vitrine reste modifiable
 * depuis l'administration. Le jeu du code ne sert que de secours, si la base
 * est injoignable — une démonstration doit s'afficher en toutes circonstances.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = (await resolveAccommodation("demo-essentielle")) || demoEssentielle;
  return {
    title: `Bienvenue à ${data.property.name} — Démo Essentielle`,
    description: `Aperçu de la formule Essentielle Guidz, avec ${data.property.name}.`,
  };
}

export default async function DemoEssentiellePage() {
  const data = (await resolveAccommodation("demo-essentielle")) || demoEssentielle;
  return <EssentialTemplate data={data} />;
}
