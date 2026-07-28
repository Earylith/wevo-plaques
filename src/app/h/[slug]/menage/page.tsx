"use client";

import { useEffect, useState, use } from "react";
import { fetchPublicAccommodation, startCleaningLogAction, endCleaningLogAction } from "@/app/public-actions";
import { Accommodation, CleaningLog } from "@/lib/types/accommodation";
import { Broom, CheckCircle, Clock, PlayCircle, StopCircle, User, Calendar } from "@phosphor-icons/react";

export default function MenagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  
  // States for form and active log
  const [agentName, setAgentName] = useState("");
  const [activeLog, setActiveLog] = useState<CleaningLog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Completion summary after check-out
  const [completedInfo, setCompletedInfo] = useState<{ startTime: number; endTime: number; durationMinutes: number } | null>(null);

  // Real-time clock and timer
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Rehydrate saved agent name from localStorage if available
    const savedName = localStorage.getItem("wevo_cleaning_agent_name");
    if (savedName) setAgentName(savedName);

    fetchPublicAccommodation(slug)
      .then((acc) => {
        setAccommodation(acc);
        if (acc && acc.cleaningLogs) {
          const savedLogId = localStorage.getItem(`active_cleaning_${slug}`);
          // Look for an in-progress session in the last 24h
          const inProgress = acc.cleaningLogs.find(
            (l) => l.status === "in_progress" && (Date.now() - (l.startTime || l.date) < 24 * 3600 * 1000)
          );
          if (inProgress) {
            setActiveLog(inProgress);
            if (inProgress.agentName && inProgress.agentName !== "Agent d'entretien / Société") {
              setAgentName(inProgress.agentName);
            }
          } else if (savedLogId) {
            // Cleanup stale localStorage ID
            localStorage.removeItem(`active_cleaning_${slug}`);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  // Check offer and if owner explicitly disabled cleaning module
  if (!accommodation || !accommodation.isActive || accommodation.offerType !== "comfort" || accommodation.features?.cleaning === false) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-500">
          <Clock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#2A2016] mb-2 font-[family-name:var(--font-display)]">Module Inactif</h1>
        <p className="text-sm text-[#6B5D4E] max-w-xs">
          Le suivi du ménage en ligne a été désactivé par le propriétaire ou n&apos;est pas disponible pour cet hébergement.
        </p>
      </div>
    );
  }

  // Helper to format timestamps
  const formatTime = (ms: number) => {
    return new Date(ms).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (ms: number) => {
    return new Date(ms).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  };

  const computeElapsed = (startMs: number) => {
    const diffSeconds = Math.floor((now - startMs) / 1000);
    if (diffSeconds < 60) return `${diffSeconds}s`;
    const mins = Math.floor(diffSeconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins.toString().padStart(2, "0")}min`;
    return `${mins} min`;
  };

  // Check-in (Arrivée)
  const handleStartCleaning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accommodation) return;
    
    setSubmitting(true);
    if (agentName.trim()) {
      localStorage.setItem("wevo_cleaning_agent_name", agentName.trim());
    }

    try {
      const res = await startCleaningLogAction(slug, agentName);
      if (res.success && res.logId) {
        const newActiveLog: CleaningLog = {
          id: res.logId,
          date: Date.now(),
          startTime: Date.now(),
          agentName: agentName.trim() || "Agent d'entretien / Société",
          status: "in_progress",
        };
        setActiveLog(newActiveLog);
        localStorage.setItem(`active_cleaning_${slug}`, res.logId);
      } else {
        alert(res.error || "Une erreur est survenue lors de l'enregistrement d'arrivée.");
      }
    } catch (error) {
      console.error("Erreur lors de l'arrivée:", error);
      alert("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  // Check-out (Départ)
  const handleEndCleaning = async () => {
    if (!activeLog) return;
    
    setSubmitting(true);
    try {
      const res = await endCleaningLogAction(slug, activeLog.id || "");
      if (res.success) {
        localStorage.removeItem(`active_cleaning_${slug}`);
        const start = activeLog.startTime || activeLog.date;
        const end = Date.now();
        setCompletedInfo({
          startTime: start,
          endTime: end,
          durationMinutes: res.durationMinutes || Math.round((end - start) / 60000),
        });
        setActiveLog(null);
      } else {
        alert(res.error || "Une erreur est survenue lors de l'enregistrement de départ.");
      }
    } catch (error) {
      console.error("Erreur lors du départ:", error);
      alert("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  // View 1: Completed screen
  if (completedInfo) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-[#EDD9A3]/40 space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={44} className="text-green-600" weight="fill" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2A2016] mb-1 font-[family-name:var(--font-display)]">
              Ménage Terminé !
            </h1>
            <p className="text-sm text-[#6B5D4E]">
              Le propriétaire a été automatiquement notifié avec vos horaires de passage.
            </p>
          </div>

          <div className="bg-[#FBF5EC] rounded-2xl p-5 border border-[#EDD9A3]/50 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B5D4E] flex items-center gap-2">
                <Calendar size={18} className="text-[#C4714A]" /> Date :
              </span>
              <span className="font-semibold text-[#2A2016] capitalize">{formatDate(completedInfo.endTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B5D4E] flex items-center gap-2">
                <Clock size={18} className="text-blue-500" /> Heure d&apos;arrivée :
              </span>
              <span className="font-semibold text-[#2A2016]">{formatTime(completedInfo.startTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B5D4E] flex items-center gap-2">
                <Clock size={18} className="text-green-600" /> Heure de départ :
              </span>
              <span className="font-semibold text-[#2A2016]">{formatTime(completedInfo.endTime)}</span>
            </div>
            <div className="pt-2 border-t border-[#EDD9A3]/40 flex justify-between text-base font-bold text-[#2A2016]">
              <span>Durée totale :</span>
              <span className="text-[#C4714A]">
                {completedInfo.durationMinutes} {completedInfo.durationMinutes > 1 ? "minutes" : "minute"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCompletedInfo(null)}
            className="w-full py-3.5 rounded-xl bg-[#FBF5EC] text-[#C4714A] border border-[#EDD9A3] font-bold hover:bg-[#EDD9A3]/30 transition-colors text-sm"
          >
            Nouveau pointage
          </button>
        </div>
      </div>
    );
  }

  // View 2: Active cleaning in progress (Check-out)
  if (activeLog) {
    const startTime = activeLog.startTime || activeLog.date;
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex flex-col p-6 items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-[#EDD9A3]/40 text-center space-y-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto">
            <Broom size={38} weight="fill" className="animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-xs uppercase tracking-wider mb-2">
              ⏳ Nettoyage En Cours
            </span>
            <h1 className="text-2xl font-bold text-[#2A2016] font-[family-name:var(--font-display)]">
              {accommodation.property.name}
            </h1>
            <p className="text-sm text-[#6B5D4E] mt-1 font-medium">
              Intervenant : <span className="text-[#2A2016] font-semibold">{activeLog.agentName || agentName || "Société de ménage"}</span>
            </p>
          </div>

          <div className="bg-[#FBF5EC] rounded-2xl p-6 border border-[#EDD9A3] space-y-2">
            <p className="text-xs text-[#6B5D4E] uppercase font-bold tracking-wider">Chronomètre en direct</p>
            <p className="text-4xl font-extrabold text-[#C4714A] tracking-tight font-[family-name:var(--font-display)]">
              {computeElapsed(startTime)}
            </p>
            <p className="text-xs text-[#6B5D4E] pt-1">
              Arrivé à <span className="font-semibold text-[#2A2016]">{formatTime(startTime)}</span>
            </p>
          </div>

          <button
            onClick={handleEndCleaning}
            disabled={submitting}
            className="w-full py-5 rounded-2xl bg-green-600 text-white font-extrabold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <StopCircle size={28} weight="fill" />
            {submitting ? "Clôture en cours..." : "TERMINER LE MÉNAGE"}
          </button>

          <p className="text-xs text-[#6B5D4E]/80 italic">
            Appuyez sur &quot;Terminer le ménage&quot; une fois l&apos;intervention achevée pour enregistrer l&apos;heure de départ.
          </p>
        </div>
      </div>
    );
  }

  // View 3: Initial Check-in (Arrivée)
  return (
    <div className="min-h-screen bg-[#FBF5EC] flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-[#EDD9A3]/40 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FBF5EC] mb-6 border border-[#EDD9A3] text-[#C4714A]">
          <Broom size={34} weight="fill" />
        </div>
        
        <h1 className="text-2xl font-bold text-[#2A2016] mb-1 font-[family-name:var(--font-display)]">
          Pointage Ménage
        </h1>
        <p className="text-sm text-[#6B5D4E] font-medium mb-6">
          {accommodation.property.name}
        </p>

        {/* Current live Date and Time banner */}
        <div className="bg-[#FBF5EC] rounded-2xl p-4 border border-[#EDD9A3]/60 mb-6 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-[#6B5D4E] flex items-center gap-1.5 uppercase tracking-wide">
            <Calendar size={16} className="text-[#C4714A]" /> {formatDate(now)}
          </span>
          <span className="text-3xl font-extrabold text-[#2A2016] mt-1 tracking-tight font-[family-name:var(--font-display)] flex items-center gap-2">
            <Clock size={28} className="text-[#C4714A]" weight="bold" /> {formatTime(now)}
          </span>
        </div>

        <form onSubmit={handleStartCleaning} className="space-y-6">
          <div className="text-left">
            <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User size={16} className="text-[#C4714A]" /> Société ou Prénom
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Ex: Nettoyage Express / Sophie"
              className="w-full px-4 py-3.5 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC]/50 focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 text-[#2A2016] font-medium text-base"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-[#C4714A] text-white font-extrabold text-lg hover:bg-[#A35A38] active:scale-95 transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <PlayCircle size={26} weight="fill" />
            {submitting ? "Validation..." : "COMMENCER LE MÉNAGE"}
          </button>
        </form>

        <p className="text-xs text-[#6B5D4E]/80 italic mt-6">
          Un clic sur &quot;Commencer&quot; enregistre automatiquement votre heure d&apos;arrivée de manière horodatée.
        </p>
      </div>
    </div>
  );
}
