"use client";

import { useState } from "react";
import {
  Wifi, Clock, ClipboardList, MapPin, AlertTriangle, Phone, Info, Bus, ExternalLink
} from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const sectionsEssentiel = [
  { icon: Wifi, label: "Réseau Wifi", value: "MasOliviers_5G", color: "bg-[#E4EEF3] text-[#2B5F75]" },
  { icon: Clock, label: "Arrivée / Départ", value: "16h00 – Avant 11h00", color: "bg-[#FDF3DC] text-[#D4A34A]" },
  { icon: ClipboardList, label: "Règles du logement", value: "Voir les détails →", color: "bg-[#EBF0E6] text-[#5A7A4E]" },
  { icon: AlertTriangle, label: "Contacts & urgences", value: "Numéros et assistance", color: "bg-red-50 text-red-500" },
];

const sectionsConfort = [
  { icon: Wifi, label: "Réseau Wifi", value: "MasOliviers_5G", color: "bg-[#E4EEF3] text-[#2B5F75]" },
  { icon: ClipboardList, label: "Règles de la maison", value: "Voir les détails →", color: "bg-[#EBF0E6] text-[#5A7A4E]" },
  { icon: MapPin, label: "Bonnes adresses", value: "12 adresses (avec photos)", color: "bg-[#F7EBE4] text-[#C4714A]" },
  { icon: Info, label: "FAQ", value: "Comment utiliser le jacuzzi ?", color: "bg-[#E4EEF3] text-[#2B5F75]" },
  { icon: Bus, label: "Transports", value: "Gare à 10 min", color: "bg-[#FDF3DC] text-[#D4A34A]" },
  { icon: Phone, label: "Contact propriétaire", value: "Marie D. — Appeler", color: "bg-[#EBF0E6] text-[#5A7A4E]" },
];

export default function DemoPreviewSection() {
  const [activeDemo, setActiveDemo] = useState<"confort" | "essentielle">("confort");

  const currentSections = activeDemo === "confort" ? sectionsConfort : sectionsEssentiel;
  const demoUrl = activeDemo === "confort" ? "/h/demo-confort" : "/h/demo-essentielle";
  const primaryColor = activeDemo === "confort" ? "#C4714A" : "#2B5F75";

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #EBF0E6 0%, #FBF5EC 100%)" }} id="demo">
      {/* Decorative shapes */}
      <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-[#C4714A]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-48 h-48 rounded-full bg-[#2B5F75]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <AnimateOnScroll direction="left">
            <div>
              <span className="section-label section-label-ocean mb-5 inline-flex">
                Côté locataires
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-[#2A2016] leading-tight mb-5 mt-5">
                Ce que vos locataires{" "}
                <em className="not-italic text-gradient-terra">verront</em>
              </h2>
              <p className="text-lg text-[#6B5D4E] leading-relaxed mb-8">
                Une page web claire et simple, pensée pour être consultée dès l&apos;arrivée dans le logement.
              </p>
              
              {/* Toggle Switch */}
              <div className="flex bg-white rounded-full p-1.5 shadow-sm border border-[#EDD9A3]/50 w-fit mb-8 relative z-20">
                <button
                  onClick={() => setActiveDemo("confort")}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeDemo === "confort"
                      ? "bg-[#C4714A] text-white shadow-md"
                      : "text-[#6B5D4E] hover:text-[#C4714A]"
                  }`}
                >
                  Formule Confort
                </button>
                <button
                  onClick={() => setActiveDemo("essentielle")}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeDemo === "essentielle"
                      ? "bg-[#5A7A4E] text-white shadow-md"
                      : "text-[#6B5D4E] hover:text-[#5A7A4E]"
                  }`}
                >
                  Formule Essentiel
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-[#2A2016]">
                  {activeDemo === "confort" 
                    ? "✨ Le Pack Confort inclut la personnalisation des couleurs, les images, la FAQ et les transports." 
                    : "🎯 Le Pack Essentiel va droit au but avec un design standard et les informations vitales."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/h/demo-confort" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-[#C4714A] text-white rounded-xl font-bold hover:bg-[#a65d3a] transition-colors shadow-sm"
                  >
                    Voir la démo Confort <ExternalLink size={18} />
                  </a>
                  <a 
                    href="/h/demo-essentielle" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-white border-2 border-[#5A7A4E] text-[#5A7A4E] rounded-xl font-bold hover:bg-[#EBF0E6] transition-colors shadow-sm"
                  >
                    Voir la démo Essentiel <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Static Phone Mockup */}
          <AnimateOnScroll direction="right">
            <div className="flex justify-center">
              {/* Glow behind phone */}
              <div className="relative">
                <div className={`absolute inset-0 scale-90 translate-y-8 rounded-[3rem] blur-2xl transition-colors duration-500 ${activeDemo === "confort" ? "bg-[#C4714A]/30" : "bg-[#5A7A4E]/30"}`} />
                <div className="relative w-[280px] sm:w-[320px]">
                  {/* Phone frame */}
                  <div className="bg-[#111] rounded-[2.5rem] p-3 shadow-2xl border border-white/10 relative transition-transform duration-500 hover:-translate-y-2">
                    {/* Screen */}
                    <div className="bg-[#FDFBF7] rounded-[2rem] overflow-hidden relative">
                      {/* Notch */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#111] rounded-b-2xl z-20" />
                      
                      {/* Fake Header/Hero */}
                      <div className="h-36 relative transition-all duration-500 overflow-hidden">
                        {activeDemo === "confort" ? (
                          <div className="w-full h-full bg-[#E8BE72] opacity-80" /> // Fake image
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#E4EEF3] to-[#F5E6C8]" />
                        )}
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-center mt-4">
                          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2A2016]">
                            {activeDemo === "confort" ? "Domaine des Cépages" : "Bienvenue"}
                          </h3>
                          {activeDemo === "confort" && (
                            <div className="w-8 h-0.5 mt-1.5 transition-all duration-500" style={{ backgroundColor: primaryColor }} />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-5 pb-6 -mt-4 relative z-10 min-h-[300px]">
                        {activeDemo === "confort" && (
                          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white mb-4">
                            <p className="text-[10px] text-[#6B5D4E] text-center leading-relaxed">
                              Nous sommes ravis de vous accueillir. Retrouvez ici toutes les informations utiles pour votre séjour.
                            </p>
                          </div>
                        )}

                        <div className={`space-y-2 ${activeDemo === "essentielle" ? "mt-8" : ""}`}>
                          {currentSections.map((s, idx) => (
                            <div
                              key={`${activeDemo}-${idx}`}
                              className="flex items-center gap-3 bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border border-gray-50"
                            >
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                                <s.icon size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-[#6B5D4E]">{s.label}</p>
                                <p className="text-xs font-semibold text-[#2A2016] truncate">{s.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
