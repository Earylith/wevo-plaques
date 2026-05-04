"use client";

import {
  Wifi, Clock, ClipboardList, MapPin, AlertTriangle, Phone,
} from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const sections = [
  { icon: Wifi, label: "Réseau Wifi", value: "MasOliviers_5G", color: "bg-[#E4EEF3] text-[#2B5F75]" },
  { icon: Clock, label: "Arrivée", value: "16h00 – 20h00", color: "bg-[#FDF3DC] text-[#D4A34A]" },
  { icon: Clock, label: "Départ", value: "Avant 11h00", color: "bg-[#FDF3DC] text-[#D4A34A]" },
  { icon: ClipboardList, label: "Consignes de départ", value: "Voir les détails →", color: "bg-[#EBF0E6] text-[#5A7A4E]" },
  { icon: MapPin, label: "Bonnes adresses", value: "12 adresses recommandées", color: "bg-[#F7EBE4] text-[#C4714A]" },
  { icon: AlertTriangle, label: "Urgences", value: "SAMU : 15 — Pompiers : 18", color: "bg-red-50 text-red-500" },
  { icon: Phone, label: "Contact propriétaire", value: "Marie D. — Appeler", color: "bg-[#EBF0E6] text-[#5A7A4E]" },
];

export default function DemoPreviewSection() {
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
                Aperçu
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-[#2A2016] leading-tight mb-5 mt-5">
                Ce que vos voyageurs{" "}
                <em className="not-italic text-gradient-terra">verront</em>
              </h2>
              <p className="text-lg text-[#6B5D4E] leading-relaxed mb-8">
                Une page claire, intuitive et complète accessible en un scan.
                Le voyageur retrouve tout en quelques secondes — sans vous déranger.
              </p>
              <ul className="space-y-3.5">
                {[
                  { emoji: "📱", text: "Accessible sans application" },
                  { emoji: "✅", text: "Fonctionne sur tous les smartphones" },
                  { emoji: "✏️", text: "Modifiable à tout moment" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-[#2A2016]">
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base shadow-sm shrink-0">
                      {item.emoji}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>

          {/* Phone Mockup */}
          <AnimateOnScroll direction="right">
            <div className="flex justify-center">
              {/* Glow behind phone */}
              <div className="relative">
                <div className="absolute inset-0 scale-90 translate-y-8 rounded-[3rem] bg-[#C4714A]/20 blur-2xl" />
                <div className="relative w-[280px] sm:w-[300px]">
                  {/* Phone frame */}
                  <div className="bg-[#111] rounded-[2.5rem] p-3 shadow-2xl border border-white/5">
                    {/* Notch */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#111] rounded-b-2xl z-20" />
                    {/* Screen */}
                    <div className="bg-[#FBF5EC] rounded-[2rem] overflow-hidden">
                      {/* Status bar */}
                      <div className="h-10 bg-gradient-to-b from-[#EDD9A3]/30 to-transparent" />
                      {/* Content */}
                      <div className="px-5 pb-6">
                        <div className="text-center mb-5">
                          <p className="text-[10px] text-[#6B5D4E]/60 tracking-widest uppercase">Bienvenue à</p>
                          <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2A2016]">
                            Domaine des Cépages
                          </h3>
                          <div className="w-8 h-0.5 bg-[#C4714A] mx-auto mt-1.5" />
                        </div>

                        <div className="space-y-2">
                          {sections.map((s) => (
                            <div
                              key={s.label + s.value}
                              className="flex items-center gap-3 bg-white rounded-2xl px-3.5 py-2.5 shadow-sm"
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

                        <div className="mt-4 text-center">
                          <p className="text-[8px] text-[#6B5D4E]/50">Propulsé par WEVO × CRÉART</p>
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
