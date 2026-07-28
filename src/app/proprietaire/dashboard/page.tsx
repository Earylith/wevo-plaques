"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAccommodationsByOwnerEmail, duplicateAccommodation } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import Link from "next/link";
import { House, Star, CheckCircle, XCircle, ArrowRight, Copy, Link as LinkIcon } from "@phosphor-icons/react";

export default function ProprietaireDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loadingAcc, setLoadingAcc] = useState(true);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/proprietaire/login");
    }
    if (user?.email) {
      getAccommodationsByOwnerEmail(user.email)
        .then((accs) => {
          if (accs.some((a) => a.mustChangePassword)) {
            router.replace("/proprietaire/change-password");
          } else {
            setAccommodations(accs);
          }
        })
        .finally(() => setLoadingAcc(false));
    }
  }, [user, loading, router]);

  if (loading || loadingAcc) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  if (accommodations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[#6B5D4E] text-lg">Aucun hébergement trouvé pour ce compte.</p>
          <p className="text-sm text-[#B0A090] mt-2">Contactez WEVO si vous pensez qu&apos;il y a une erreur.</p>
        </div>
      </div>
    );
  }

  const handleDuplicate = async (id: string) => {
    try {
      setDuplicating(id);
      await duplicateAccommodation(id);
      if (user?.email) {
        const accs = await getAccommodationsByOwnerEmail(user.email);
        setAccommodations(accs);
      }
    } catch (err) {
      console.error("Erreur de duplication:", err);
      alert("Erreur lors de la duplication");
    } finally {
      setDuplicating(null);
    }
  };

  const ownerSlug = accommodations[0]?.owner?.slug;
  const portfolioUrl = typeof window !== 'undefined' && ownerSlug 
    ? `${window.location.origin}/c/${ownerSlug}` 
    : '';

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            Mes Hébergements
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-1">
            Gérez les livrets d&apos;accueil de vos propriétés
          </p>
        </div>
        {portfolioUrl && (
          <div className="bg-white px-4 py-3 rounded-xl border border-[#EDD9A3] shadow-sm flex items-center gap-3">
            <div className="bg-[#FBF5EC] p-2 rounded-lg text-[#C4714A]">
              <LinkIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-0.5">Votre Vitrine Publique</p>
              <button
                onClick={() => navigator.clipboard.writeText(portfolioUrl)}
                className="text-sm font-medium text-[#2A2016] hover:text-[#C4714A] transition-colors truncate max-w-[200px] sm:max-w-[300px] block text-left"
                title="Copier le lien"
              >
                {portfolioUrl}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des hébergements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodations.map((acc) => {
          const isComfort = acc.offerType === "comfort";
          
          return (
            <div key={acc.id} className="bg-white rounded-3xl p-6 border border-[#EDD9A3]/40 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#FBF5EC] rounded-lg border border-[#EDD9A3]/50">
                    {isComfort ? (
                      <Star size={16} className="text-[#D4A34A]" weight="fill" />
                    ) : (
                      <House size={16} className="text-[#5A7A4E]" weight="fill" />
                    )}
                    <span className="text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider">
                      {isComfort ? "Confort" : "Essentiel"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {acc.isActive ? (
                      <CheckCircle size={18} className="text-green-500" weight="fill" />
                    ) : (
                      <XCircle size={18} className="text-gray-400" weight="fill" />
                    )}
                  </div>
                </div>

                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016] mb-1 line-clamp-1">
                  {acc.property.name}
                </h2>
                <p className="text-sm text-[#6B5D4E] mb-6 flex items-center gap-1">
                  {acc.property.city}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/proprietaire/dashboard/${acc.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FBF5EC] text-[#2A2016] font-semibold hover:bg-[#EDD9A3]/50 transition-colors border border-[#EDD9A3]/30 text-sm"
                >
                  Gérer
                  <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => handleDuplicate(acc.id as string)}
                  disabled={duplicating === acc.id}
                  className="px-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-[#6B5D4E] font-semibold hover:bg-gray-50 transition-colors border border-gray-200 text-sm disabled:opacity-50"
                  title="Dupliquer"
                >
                  {duplicating === acc.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#C4714A]" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
