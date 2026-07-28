"use client";

import { useEffect, useState, use } from "react";
import { fetchPublicAccommodation, submitInventoryReportAction } from "@/app/public-actions";
import { uploadImage } from "@/lib/firebase/storage";
import { Accommodation } from "@/lib/types/accommodation";
import { Camera, CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid"; // We'll just generate an ID, or we can use crypto.randomUUID

export default function EtatDesLieuxPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [type, setType] = useState<"arrival" | "departure">("arrival");
  const [travelerName, setTravelerName] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPublicAccommodation(slug)
      .then(setAccommodation)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  if (!accommodation || !accommodation.isActive || accommodation.offerType !== "comfort" || accommodation.features?.inventory === false) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-[#2A2016] mb-2">Non disponible</h1>
        <p className="text-[#6B5D4E]">L&apos;état des lieux en ligne a été désactivé par le propriétaire ou n&apos;est pas disponible pour ce logement.</p>
        <Link href={`/h/${slug}`} className="mt-4 text-[#C4714A] hover:underline">
          Retour au livret
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (files.length + selected.length > 5) {
        alert("Vous ne pouvez télécharger que 5 photos maximum.");
        return;
      }
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accommodation) return;
    
    setSubmitting(true);
    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const file of files) {
        const url = await uploadImage(file, `inventories/${slug}`);
        photoUrls.push(url);
      }
      
      const res = await submitInventoryReportAction(slug, {
        date: Date.now(),
        type,
        travelerName: travelerName.trim() || "Voyageur",
        notes,
        photos: photoUrls
      });
      
      if (res.success) {
        setSuccess(true);
      } else {
        alert(res.error || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
      alert("Une erreur est survenue lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" weight="fill" />
        </div>
        <h1 className="text-3xl font-bold text-[#2A2016] mb-2 font-[family-name:var(--font-display)]">
          Envoyé avec succès !
        </h1>
        <p className="text-[#6B5D4E] mb-8">
          Votre état des lieux a bien été transmis au propriétaire. Merci de votre contribution !
        </p>
        <Link 
          href={`/h/${slug}`}
          className="px-6 py-3 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors"
        >
          Retour au livret
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF5EC] p-6 pb-20">
      <div className="max-w-md mx-auto relative">
        
        <Link href={`/h/${slug}`} className="absolute top-0 left-0 p-2 text-[#6B5D4E]">
          <ArrowLeft size={24} />
        </Link>

        <div className="text-center mb-8 pt-2">
          <h1 className="text-2xl font-bold text-[#2A2016] font-[family-name:var(--font-display)]">
            État des lieux
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-1">
            {accommodation.property.name}
          </p>
        </div>

        {/* Date du jour automatique */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 mb-6 text-center shadow-sm">
          <p className="text-xs text-amber-800 font-semibold uppercase tracking-wide">📅 Date et heure du constat (Automatique)</p>
          <p className="text-base font-extrabold text-[#2A2016] mt-1 capitalize">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} à {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-[11px] text-amber-700/80 mt-1">Cet horodatage est automatiquement rattaché à votre rapport.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40 space-y-6">
          
          <div>
            <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-2">
              Type d&apos;état des lieux
            </label>
            <div className="flex bg-[#FBF5EC] p-1 rounded-xl border border-[#EDD9A3]/50">
              <button
                type="button"
                onClick={() => setType("arrival")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'arrival' ? 'bg-white shadow-sm text-[#2A2016]' : 'text-[#6B5D4E]'}`}
              >
                Arrivée
              </button>
              <button
                type="button"
                onClick={() => setType("departure")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'departure' ? 'bg-white shadow-sm text-[#2A2016]' : 'text-[#6B5D4E]'}`}
              >
                Départ
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-2">
              Votre nom
            </label>
            <input
              type="text"
              required
              value={travelerName}
              onChange={(e) => setTravelerName(e.target.value)}
              placeholder="Ex: Famille Martin"
              className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 text-[#2A2016]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-2">
              Remarques
            </label>
            <textarea
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={type === 'arrival' ? "Signalez toute anomalie remarquée à votre arrivée..." : "Laissez un petit mot au propriétaire !"}
              className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 text-[#2A2016] min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-2">
              Photos (Max 5)
            </label>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              {files.map((file, index) => (
                <div key={index} className="aspect-square relative rounded-xl overflow-hidden bg-[#FBF5EC] border border-[#EDD9A3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {files.length < 5 && (
                <label className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C4714A]/40 bg-[#FBF5EC] text-[#C4714A] cursor-pointer hover:bg-[#FDF9F2] transition-colors">
                  <Camera size={24} />
                  <span className="text-[10px] font-semibold mt-1">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-[#B0A090]">Prenez des photos si quelque chose est cassé ou abîmé.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-[#C4714A] text-white font-bold text-lg hover:bg-[#A35A38] transition-colors shadow-sm disabled:opacity-50 mt-4"
          >
            {submitting ? "Envoi en cours..." : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}
