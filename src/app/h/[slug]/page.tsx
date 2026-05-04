import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAccommodationBySlug } from "@/lib/firebase/firestore";
import EssentialTemplate from "@/components/templates/EssentialTemplate";
import ComfortTemplate from "@/components/templates/ComfortTemplate";
import { Info } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAccommodationBySlug(slug);

  if (!data || !data.isActive) {
    return {
      title: "Hébergement introuvable | WEVO × CRÉART",
    };
  }

  return {
    title: `Bienvenue à ${data.property.name} | WEVO × CRÉART`,
    description: data.property.welcomeMessage,
  };
}

export default async function AccommodationPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAccommodationBySlug(slug);

  if (!data) {
    return notFound();
  }

  if (!data.isActive) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-[#C4714A]/10 rounded-full flex items-center justify-center mb-6">
          <Info size={32} className="text-[#C4714A]" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016] mb-3">
          Cette page n&apos;est pas disponible
        </h1>
        <p className="text-[#6B5D4E] max-w-md">
          Le livret d&apos;accueil numérique pour cet hébergement est temporairement désactivé par son propriétaire.
        </p>
      </div>
    );
  }

  if (data.offerType === "comfort") {
    return <ComfortTemplate data={data} />;
  }

  return <EssentialTemplate data={data} />;
}
