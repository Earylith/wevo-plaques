import CleoTemplate from "@/components/templates/CleoTemplate";
import { resolveAccommodation } from "@/lib/firebase/admin-firestore";
import { demoChamonix } from "@/lib/demoData";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = (await resolveAccommodation("demo-chamonix")) || demoChamonix;
  return {
    title: `Bienvenue à ${data.property.name}`,
    description: data.property.welcomeMessage,
    // Vitrine publique : indexable, contrairement aux livrets des clients.
    alternates: { canonical: "/demo-chamonix" },
  };
}

export default async function ChamonixDemoPage() {
  const data = (await resolveAccommodation("demo-chamonix")) || demoChamonix;
  return <CleoTemplate data={data} trackingId={data.id} />;
}
