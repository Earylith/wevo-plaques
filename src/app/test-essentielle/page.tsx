import { Metadata } from "next";
import EssentialTemplate from "@/components/templates/EssentialTemplate";
import { seedEssentielle } from "@/lib/seedEssentielle";

/**
 * Page de référence de la formule Essentielle.
 *
 * Elle sert de standard : toute page Essentielle créée ensuite utilise le
 * même gabarit, avec les données de son propre livret. Le jeu d'essai
 * remplit TOUS les champs modifiables de la formule et aucun autre — ce qui
 * apparaît ici est donc exactement ce qu'un hôte peut composer.
 */

export const metadata: Metadata = {
  title: "Le Clos des Oliviers — Référence Essentielle",
  description:
    "Page de référence de la formule Essentielle Guidz : tous les champs modifiables, et rien d'autre.",
};

export default function TestEssentiellePage() {
  return <EssentialTemplate data={seedEssentielle} />;
}
