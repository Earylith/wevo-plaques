import CleoTemplate from "@/components/templates/CleoTemplate";
import { resolveAccommodation } from "@/lib/firebase/admin-firestore";
import { demoConfortMarseille } from "@/lib/demoData";
import { Metadata } from "next";

// Aperçu public de la démo : toujours l'état le plus récent enregistré.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = (await resolveAccommodation("demo-confort2")) || demoConfortMarseille;
  return {
    title: `Bienvenue à ${data.property.name}`,
    description: data.property.welcomeMessage,
  };
}

export default async function MarseillePenthouseDemoPage() {
  const data = (await resolveAccommodation("demo-confort2")) || demoConfortMarseille;
  return <CleoTemplate data={data} trackingId={data.id} />;
}
