"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getAccommodationById } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import Link from "next/link";
import { House, Star, ArrowSquareOut, PencilSimple, CheckCircle, XCircle, ArrowLeft, Broom, Camera, Image as ImageIcon, Clock, Calendar } from "@phosphor-icons/react";
import { toggleAccommodationModuleAction } from "@/app/public-actions";

export default function ProprietaireDashboardDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loadingAcc, setLoadingAcc] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/proprietaire/login");
    }
    if (user?.email) {
      getAccommodationById(id)
        .then((acc) => {
          if (!acc || acc.owner.email !== user.email) {
            router.replace("/proprietaire/dashboard");
            return;
          }
          if (acc.mustChangePassword) {
            router.replace("/proprietaire/change-password");
          } else {
            setAccommodation(acc);
          }
        })
        .finally(() => setLoadingAcc(false));
    }
  }, [user, loading, router, id]);

  const handleToggleModule = async (feature: "inventory" | "cleaning", currentStatus: boolean) => {
    if (!accommodation || !accommodation.id) return;
    const newStatus = !currentStatus;
    setAccommodation({
      ...accommodation,
      features: {
        ...(accommodation.features || {}),
        [feature]: newStatus,
      },
    });
    const res = await toggleAccommodationModuleAction(accommodation.id, feature, newStatus);
    if (!res.success) {
      alert("Erreur lors de la modification : " + res.error);
      setAccommodation({
        ...accommodation,
        features: {
          ...(accommodation.features || {}),
          [feature]: currentStatus,
        },
      });
    }
  };

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
        <div className="flex items-center gap-4">
          <Link
            href="/proprietaire/dashboard"
            className="p-2 rounded-xl text-[#6B5D4E] hover:bg-[#EDD9A3]/30 hover:text-[#2A2016] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            {accommodation.property.name}
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-1">{accommodation.property.city}</p>
        </div>
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
            href={`/proprietaire/dashboard/${id}/edit`}
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

      {/* Logistique : Ménage & État des lieux */}
      {isComfort && (
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          
          {/* Ménage */}
          <div className="bg-white rounded-3xl border border-[#EDD9A3]/40 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EDD9A3]/30 bg-[#FBF5EC] flex justify-between items-center">
              <h2 className="font-semibold text-[#2A2016] flex items-center gap-2">
                <Broom size={20} className="text-[#C4714A]" weight="fill" />
                Suivi du ménage
              </h2>
              <button
                onClick={() => handleToggleModule("cleaning", accommodation.features?.cleaning !== false)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs flex items-center gap-1.5 ${
                  accommodation.features?.cleaning !== false
                    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                    : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${accommodation.features?.cleaning !== false ? "bg-green-600 animate-pulse" : "bg-gray-500"}`} />
                {accommodation.features?.cleaning !== false ? "Module Actif (Désactiver)" : "Module Inactif (Activer)"}
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-6">
                <p className="text-sm text-[#6B5D4E] mb-2">Lien pour le personnel d&apos;entretien :</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${publicUrl}/menage`} 
                    className="flex-1 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-gray-50 text-gray-500"
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(`${publicUrl}/menage`)}
                    className="p-2 bg-[#FBF5EC] rounded-lg text-[#C4714A] hover:bg-[#EDD9A3]/50 transition-colors"
                    title="Copier le lien"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-[#2A2016] mb-3">Historique des passages (Arrivée / Départ) :</h3>
              {accommodation.cleaningLogs && accommodation.cleaningLogs.length > 0 ? (
                <ul className="space-y-3 overflow-y-auto max-h-64 pr-2">
                  {[...accommodation.cleaningLogs].reverse().map((log, i) => {
                    const startMs = log.startTime || log.date;
                    return (
                      <li key={i} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-150 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-[#2A2016]">{log.agentName || "Agent d'entretien"}</span>
                          {log.status === "in_progress" ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1">
                              ⏳ En cours...
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex items-center gap-1">
                              ✅ Terminé ({log.durationMinutes ? `${log.durationMinutes} min` : "Validé"})
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-200 text-[#6B5D4E]">
                          <div>
                            <span className="font-semibold text-[#2A2016]">Arrivée :</span> {new Date(startMs).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} à {new Date(startMs).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div>
                            <span className="font-semibold text-[#2A2016]">Départ :</span> {log.endTime ? `${new Date(log.endTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "—"}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-6">
                  <p className="text-sm text-[#6B5D4E]">Aucun passage enregistré pour le moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* États des lieux */}
          <div className="bg-white rounded-3xl border border-[#EDD9A3]/40 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EDD9A3]/30 bg-[#FBF5EC] flex justify-between items-center">
              <h2 className="font-semibold text-[#2A2016] flex items-center gap-2">
                <Camera size={20} className="text-[#C4714A]" weight="fill" />
                États des lieux
              </h2>
              <button
                onClick={() => handleToggleModule("inventory", accommodation.features?.inventory !== false)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs flex items-center gap-1.5 ${
                  accommodation.features?.inventory !== false
                    ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                    : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${accommodation.features?.inventory !== false ? "bg-green-600 animate-pulse" : "bg-gray-500"}`} />
                {accommodation.features?.inventory !== false ? "Module Actif (Désactiver)" : "Module Inactif (Activer)"}
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-6">
                <p className="text-sm text-[#6B5D4E] mb-2">Lien direct pour les voyageurs :</p>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${publicUrl}/etat-des-lieux`} 
                    className="flex-1 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-gray-50 text-gray-500"
                  />
                  <button 
                    onClick={() => navigator.clipboard.writeText(`${publicUrl}/etat-des-lieux`)}
                    className="p-2 bg-[#FBF5EC] rounded-lg text-[#C4714A] hover:bg-[#EDD9A3]/50 transition-colors"
                    title="Copier le lien"
                  >
                    Copier
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-[#2A2016] mb-3">Rapports transmis :</h3>
              {accommodation.inventories && accommodation.inventories.length > 0 ? (
                <ul className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                  {[...accommodation.inventories].reverse().map((inv) => (
                    <li key={inv.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${inv.type === 'arrival' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {inv.type === 'arrival' ? 'Arrivée' : 'Départ'}
                          </span>
                          <p className="text-sm font-medium text-[#2A2016]">{inv.travelerName}</p>
                          <p className="text-xs text-[#6B5D4E]">{new Date(inv.date).toLocaleString('fr-FR')}</p>
                        </div>
                      </div>
                      <p className="text-sm text-[#4A3D30] bg-white p-3 rounded-lg border border-gray-100">
                        &quot;{inv.notes}&quot;
                      </p>
                      {inv.photos && inv.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {inv.photos.map((photo, i) => (
                            <a key={i} href={photo} target="_blank" rel="noopener noreferrer" className="shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo} alt="Photo état des lieux" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                            </a>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-6 text-center">
                  <Camera size={32} className="text-gray-300 mb-2" />
                  <p className="text-sm text-[#6B5D4E]">Aucun état des lieux n&apos;a encore été soumis par les voyageurs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
