import { Metadata } from "next";
import { notFound } from "next/navigation";
import { lookupAccommodation, resolveAccommodation } from "@/lib/firebase/admin-firestore";
import EssentialTemplate from "@/components/templates/EssentialTemplate";
import ComfortTemplate from "@/components/templates/ComfortTemplate";
import CleoTemplate from "@/components/templates/CleoTemplate";
import { Info } from "lucide-react";

// Le livret doit refléter immédiatement ce qui vient d'être enregistré
// dans l'admin : pas de mise en cache statique de cette route.
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await resolveAccommodation(slug);

  if (!data || !data.isActive) {
    return { title: "Hébergement introuvable" };
  }

  return {
    title: `Bienvenue à ${data.property.name}`,
    description: data.property.welcomeMessage,
    openGraph: {
      title: data.property.name,
      description: data.property.welcomeMessage,
      images: data.property.mainImageUrl ? [data.property.mainImageUrl] : undefined,
    },
  };
}

/** Écran neutre affiché quand la base est momentanément injoignable. */
function Unavailable() {
  return (
    <div className="min-h-screen bg-[#FBF5EC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-[#C4714A]/10 rounded-full flex items-center justify-center mb-6">
        <Info size={32} className="text-[#C4714A]" />
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016] mb-3">
        Livret momentanément indisponible
      </h1>
      <p className="text-[#6B5D4E] max-w-md">
        Nous n&apos;arrivons pas à joindre nos serveurs pour le moment. Réessayez dans un instant —
        vos informations d&apos;accueil ne sont pas perdues.
      </p>
    </div>
  );
}

export default async function AccommodationPage({ params }: Props) {
  const { slug } = await params;
  const result = await lookupAccommodation(slug);

  if (result.status === "unavailable") return <Unavailable />;
  if (result.status === "missing") return notFound();

  const data = result.data;

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

  // Le gabarit « Cléo » est le livret nouvelle génération : il est utilisé dès
  // qu'un livret le demande explicitement, et pour toutes les démos Cléo.
  if (data.template === "cleo" || data.slug.startsWith("demo-confort") || data.slug === "demo-paris" || data.slug === "demo-biarritz" || data.slug === "demo-chamonix") {
    return <CleoTemplate data={data} trackingId={data.id} />;
  }

  if (data.offerType === "comfort") {
    return <ComfortTemplate data={data} />;
  }

  return <EssentialTemplate data={data} />;
}
