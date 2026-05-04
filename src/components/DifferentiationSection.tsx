"use client";

import {
  TreePine, Layers, Paintbrush, Award,
  Globe, QrCode, Server, Wrench, Zap,
  Wifi, Clock, ClipboardList, MapPin, AlertTriangle, Phone,
} from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const creart = [
  { icon: TreePine, text: "Fabrication française" },
  { icon: Layers, text: "Noyer écosourcé" },
  { icon: Paintbrush, text: "Gravure et découpe laser" },
  { icon: Award, text: "Personnalisation selon la formule" },
  { icon: TreePine, text: "Finition premium" },
];

const wevo = [
  { icon: Globe, text: "Page dédiée à chaque logement" },
  { icon: QrCode, text: "QR code relié à une URL stable" },
  { icon: Server, text: "Hébergement et maintenance" },
  { icon: Wrench, text: "Informations modifiables sans refaire le support" },
  { icon: Zap, text: "Compatible mobile, sans application" },
];

const phoneSections = [
  { icon: Wifi, label: "Réseau Wifi", value: "MasOliviers_5G", color: "bg-[#EBF0E6] text-[#5A7A4E]" },
  { icon: Clock, label: "Arrivée", value: "16h00 – 20h00", color: "bg-[#FDF3DC] text-[#D4A34A]" },
  { icon: Clock, label: "Départ", value: "Avant 11h00", color: "bg-[#FDF3DC] text-[#D4A34A]" },
  { icon: ClipboardList, label: "Consignes", value: "Voir les détails →", color: "bg-[#F7EBE4] text-[#C4714A]" },
  { icon: MapPin, label: "Bonnes adresses", value: "12 adresses recommandées", color: "bg-[#F7EBE4] text-[#C4714A]" },
  { icon: AlertTriangle, label: "Urgences", value: "SAMU : 15 — Pompiers : 18", color: "bg-red-50 text-red-500" },
  { icon: Phone, label: "Contact", value: "Marie D. — Appeler", color: "bg-[#EBF0E6] text-[#5A7A4E]" },
];

export default function DifferentiationSection() {
  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F5E6C8 0%, #FBF5EC 60%)" }}
    >
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#5A7A4E]/5 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-label mb-5 inline-flex">
              Le meilleur des deux mondes
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A2016] leading-tight mt-5">
              Le charme du bois,{" "}
              <em className="not-italic text-gradient-terra">la simplicité du digital</em>
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Créart */}
          <AnimateOnScroll direction="left">
            <div className="bg-white rounded-3xl p-8 lg:p-10 border border-[#EDD9A3]/50 h-full shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4714A] to-[#A35A38] flex items-center justify-center shadow-sm">
                  <TreePine size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-[#6B5D4E] tracking-widest uppercase font-medium">L&apos;artisan</p>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016]">
                    Créart
                  </h3>
                </div>
              </div>
              <p className="text-sm text-[#6B5D4E] mb-7 leading-relaxed">
                L&apos;artisanat au service de l&apos;hospitalité. Chaque support est fabriqué avec soin en noyer écosourcé, avec une finition premium pensée pour s&apos;intégrer dans votre logement.
              </p>
              <ul className="space-y-3.5">
                {creart.map((item) => (
                  <li key={item.text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F7EBE4] flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-[#C4714A]" />
                    </div>
                    <span className="text-sm font-medium text-[#2A2016]">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-2xl overflow-hidden border-2 border-[#EDD9A3]/60 shadow-sm">
                <img src="/plaque-photo.jpg" alt="Plaque en bois Créart" className="w-full h-auto" />
              </div>
            </div>
          </AnimateOnScroll>

          {/* Wevo — warm olive forest instead of ocean blue */}
          <AnimateOnScroll direction="right">
            <div
              className="rounded-3xl p-8 lg:p-10 h-full shadow-xl relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #3F5836, #2D4A22)" }}
            >
              {/* Decorative warm light */}
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#D4A34A]/15 pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#C4714A]/10 pointer-events-none" />

              {/* Leaf SVG */}
              <svg viewBox="0 0 200 300" className="absolute right-6 bottom-6 w-20 h-30 text-white/5 pointer-events-none" fill="currentColor">
                <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
              </svg>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                    <Globe size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 tracking-widest uppercase font-medium">Le digital</p>
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                      Wevo
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-white/65 mb-7 leading-relaxed">
                  La technologie web au service de votre accueil. Simple, rapide, sans application pour vos voyageurs.
                </p>
                <ul className="space-y-3.5">
                  {wevo.map((item) => (
                    <li key={item.text} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <item.icon size={16} className="text-[#E8BE72]" />
                      </div>
                      <span className="text-sm font-medium text-white/90">{item.text}</span>
                    </li>
                  ))}
                </ul>

                {/* Phone Mockup */}
                <div className="mt-8 flex justify-center">
                  <div className="relative w-[210px]">
                    <div className="bg-[#111] rounded-[2rem] p-2 shadow-2xl border border-white/10">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-[#111] rounded-b-xl z-20" />
                      <div className="bg-[#FBF5EC] rounded-[1.5rem] overflow-hidden h-[420px] flex flex-col">
                        <div className="h-6 bg-gradient-to-b from-[#EDD9A3]/30 to-transparent shrink-0" />
                        <div className="px-4 pb-4 flex-1">
                          <div className="text-center mb-3">
                            <p className="text-[8px] text-[#6B5D4E]/60 tracking-widest uppercase">Bienvenue à</p>
                            <h3 className="font-[family-name:var(--font-display)] text-[13px] font-bold text-[#2A2016]">
                              Le Mas des Oliviers
                            </h3>
                            <div className="w-5 h-0.5 bg-[#C4714A] mx-auto mt-1" />
                          </div>
                          <div className="space-y-1.5">
                            {phoneSections.map((s) => (
                              <div key={s.label} className="flex items-center gap-2 bg-white rounded-xl px-2.5 py-1.5 shadow-sm">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${s.color}`}>
                                  <s.icon size={10} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[8px] text-[#6B5D4E]">{s.label}</p>
                                  <p className="text-[9px] font-medium text-[#2A2016] truncate">{s.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-[#2A2016]/20 rounded-full" />
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
