import CleoTemplate from "@/components/templates/CleoTemplate";
import { resolveAccommodation } from "@/lib/firebase/admin-firestore";
import { demoBiarritz } from "@/lib/demoData";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = (await resolveAccommodation("demo-biarritz")) || demoBiarritz;
  return {
    title: `Bienvenue à ${data.property.name}`,
    description: data.property.welcomeMessage,
  };
}

export default async function BiarritzDemoPage() {
  const data = (await resolveAccommodation("demo-biarritz")) || demoBiarritz;
  return <CleoTemplate data={data} trackingId={data.id} />;
}
