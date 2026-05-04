"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAccommodationByOwnerEmail } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import Link from "next/link";
import { House, Star, ArrowSquareOut, PencilSimple, CheckCircle, XCircle } from "@phosphor-icons/react";

export default function ProprietaireDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loadingAcc, setLoadingAcc] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/proprietaire/login");
    }
    if (user?.email) {
      getAccommodationByOwnerEmail(user.email)
        .then((acc) => {
          if (acc?.mustChangePassword) {
            router.replace("/proprietaire/change-password");
          } else {
            setAccommodation(acc);
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

  if (!accommodation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[#6B5D4E] text-lg">Aucun hébergement trouvé pour ce compte.</p>
          <p className="text-sm text-[#B0A090] mt-2">Contactez WEVO si vous pensez qu&apos;il y a une erreur.</p>
        </div>
      </div>
    );
  }

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/h/${accommodation.slug}`
    : `/h/${accommodation.slug}`;

  const isComfort = accommodation.offerType === "comfort";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            {accommodation.property.name}
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-1">{accommodation.property.city}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EDD9A3] text-[#6B5D4E] hover:border-[#C4714A] hover:text-[#C4714A] transition-colors text-sm font-medium"
          >
            <ArrowSquareOut size={16} />
            Voir ma page
          </a>
          <Link
            href="/proprietaire/dashboard/edit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm text-sm"
          >
            <PencilSimple size={16} />
            Modifier mon livret
          </Link>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Statut */}
        <div className="bg-white rounded-2xl p-6 border border-[#EDD9A3]/40 shadow-sm">
          <p className="text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-3">Statut</p>
          <div className="flex items-center gap-2">
            {accommodation.isActive ? (
              <>
                <CheckCircle size={22} className="text-green-500" weight="fill" />
                <span className="font-semibold text-green-700">En ligne</span>
              </>
            ) : (
              <>
                <XCircle size={22} className="text-gray-400" weight="fill" />
                <span className="font-semibold text-gray-500">Désactivé</span>
              </>
            )}
          </div>
        </div>

        {/* Offre */}
        <div className="bg-white rounded-2xl p-6 border border-[#EDD9A3]/40 shadow-sm">
          <p className="text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-3">Pack</p>
          <div className="flex items-center gap-2">
            {isComfort ? (
              <>
                <Star size={22} className="text-[#D4A34A]" weight="fill" />
                <span className="font-semibold text-[#D4A34A]">Confort</span>
              </>
            ) : (
              <>
                <House size={22} className="text-[#5A7A4E]" weight="fill" />
                <span className="font-semibold text-[#5A7A4E]">Essentiel</span>
              </>
            )}
          </div>
        </div>

        {/* Lien public */}
        <div className="bg-white rounded-2xl p-6 border border-[#EDD9A3]/40 shadow-sm">
          <p className="text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-3">Lien QR Code</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
            }}
            className="text-sm text-[#C4714A] hover:underline font-medium truncate max-w-full block text-left"
            title="Cliquer pour copier"
          >
            {publicUrl}
          </button>
        </div>
      </div>

      {/* Informations clés */}
      <div className="bg-white rounded-3xl border border-[#EDD9A3]/40 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EDD9A3]/30 bg-[#FBF5EC]">
          <h2 className="font-semibold text-[#2A2016]">Informations de votre livret</h2>
        </div>
        <div className="divide-y divide-[#EDD9A3]/20">
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-[#6B5D4E]">WiFi</span>
            <span className="text-sm font-medium text-[#2A2016]">{accommodation.wifi.ssid || "—"}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-[#6B5D4E]">Check-in</span>
            <span className="text-sm font-medium text-[#2A2016]">{accommodation.practicalInfo.checkin || "—"}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-[#6B5D4E]">Check-out</span>
            <span className="text-sm font-medium text-[#2A2016]">{accommodation.practicalInfo.checkout || "—"}</span>
          </div>
          <div className="px-6 py-4 flex justify-between">
            <span className="text-sm text-[#6B5D4E]">Recommandations</span>
            <span className="text-sm font-medium text-[#2A2016]">{accommodation.recommendations?.length || 0}</span>
          </div>
          {isComfort && (
            <div className="px-6 py-4 flex justify-between">
              <span className="text-sm text-[#6B5D4E]">FAQ</span>
              <span className="text-sm font-medium text-[#2A2016]">{accommodation.comfortOptions?.faq?.length || 0} question(s)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
