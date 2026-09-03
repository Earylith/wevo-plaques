import CleoTemplate from "@/components/templates/CleoTemplate";
import { resolveAccommodation } from "@/lib/firebase/admin-firestore";
import { demoParis } from "@/lib/demoData";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const data = (await resolveAccommodation("demo-paris")) || demoParis;
  return {
    title: `Bienvenue à ${data.property.name}`,
    description: data.property.welcomeMessage,
    // Vitrine publique : indexable, contrairement aux livrets des clients.
    alternates: { canonical: "/demo-paris" },
  };
}

export default async function ParisDemoPage() {
  const data = (await resolveAccommodation("demo-paris")) || demoParis;
  return <CleoTemplate data={data} trackingId={data.id} />;
}
