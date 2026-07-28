"use client";

import { useEffect, useState, use } from "react";
import { getAccommodationsByOwnerSlug } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import Link from "next/link";
import { MapPin, House, Star, ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";

export default function ConciergePortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccommodationsByOwnerSlug(slug)
      .then(setAccommodations)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  if (accommodations.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-[#2A2016] mb-2 font-[family-name:var(--font-display)]">Aucun hébergement trouvé</h1>
        <p className="text-[#6B5D4E]">Cette vitrine est vide ou n&apos;existe pas.</p>
        <Link href="/" className="mt-6 px-6 py-3 bg-[#C4714A] text-white rounded-xl font-bold hover:bg-[#A35A38] transition-colors">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  const ownerName = accommodations[0].owner.name;

  return (
    <div className="min-h-screen bg-[#FBF5EC]">
      {/* Header */}
      <header className="bg-white border-b border-[#EDD9A3]/30 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#C4714A] uppercase tracking-widest mb-1">Les hébergements de</p>
            <h1 className="text-2xl font-bold text-[#2A2016] font-[family-name:var(--font-display)]">
              {ownerName}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-4xl font-bold text-[#2A2016] font-[family-name:var(--font-display)] mb-4">
            Découvrez nos propriétés
          </h2>
          <p className="text-lg text-[#6B5D4E] max-w-2xl mx-auto sm:mx-0">
            Bienvenue sur notre vitrine. Parcourez la liste de nos logements et accédez à leurs livrets d&apos;accueil respectifs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accommodations.map((acc) => (
            <Link 
              key={acc.id} 
              href={`/h/${acc.slug}`}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[#EDD9A3]/30 flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                {acc.property.mainImageUrl ? (
                  <Image
                    src={acc.property.mainImageUrl}
                    alt={acc.property.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-[#FBF5EC]">
                    <House size={48} weight="duotone" className="mb-2 opacity-50 text-[#C4714A]" />
                  </div>
                )}
                
                {/* Offer Badge */}
                <div className="absolute top-4 left-4">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md ${
                    acc.offerType === 'comfort' 
                      ? 'bg-[#2A2016]/80 text-[#EDD9A3]' 
                      : 'bg-white/80 text-[#6B5D4E]'
                  }`}>
                    {acc.offerType === 'comfort' ? (
                      <Star size={14} weight="fill" />
                    ) : (
                      <House size={14} weight="fill" />
                    )}
                    {acc.offerType === 'comfort' ? 'Confort' : 'Essentiel'}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2A2016] font-[family-name:var(--font-display)] mb-2 group-hover:text-[#C4714A] transition-colors line-clamp-2">
                    {acc.property.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#6B5D4E] text-sm mb-4">
                    <MapPin size={16} weight="fill" className="text-[#C4714A]" />
                    <span className="truncate">{acc.property.city}</span>
                    <span className="mx-2 opacity-30">•</span>
                    <span className="truncate">{acc.property.type}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#EDD9A3]/30 flex items-center justify-between text-[#C4714A] font-semibold">
                  <span className="text-sm">Voir le livret</span>
                  <div className="w-8 h-8 rounded-full bg-[#FBF5EC] flex items-center justify-center group-hover:bg-[#C4714A] group-hover:text-white transition-colors">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
