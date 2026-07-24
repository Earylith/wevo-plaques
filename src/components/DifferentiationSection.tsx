"use client";

import {
  TreePine, Layers, Paintbrush, Award,
  Globe, QrCode, Server, Wrench, Zap,
  Wifi, Clock, ClipboardList, MapPin, AlertTriangle, Phone,
} from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const creart = [
  { icon: TreePine, text: "Fabrication française" },
  { icon: Paintbrush, text: "Gravure et découpe laser" },
  { icon: TreePine, text: "Finition soignée" },
  { icon: QrCode, text: "QR code unique" },
  { icon: Award, text: "Personnalisation selon la formule" },
];

const wevo = [
  { icon: Globe, text: "Page dédiée à chaque logement" },
  { icon: QrCode, text: "QR code relié à une URL stable" },
  { icon: Wrench, text: "Informations modifiables selon la formule" },
  { icon: Zap, text: "Compatible mobile" },
  { icon: Server, text: "Hébergement et maintenance inclus" },
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
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F5E6C8 0%, #FBF5EC 60%)" }}
      id="concept"
    >
      <div className="absolute -right-32 top-1/4 w-[800px] h-[800px] rounded-full bg-[#5A7A4E]/5 pointer-events-none blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* STICKY LEFT COLUMN */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 mb-16 lg:mb-0">
            <AnimateOnScroll>
              <span className="section-label mb-5 inline-flex">
                Le meilleur des deux mondes
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-5xl lg:text-[4rem] font-bold text-[#2A2016] leading-[1.05] mt-5 mb-8 tracking-tight">
                Le charme du bois,{" "}
                <em className="not-italic text-gradient-terra">la flexibilité du digital</em>
              </h2>
              <p className="text-lg text-[#6B5D4E] leading-relaxed max-w-md">
                Associez l'authenticité d'un bel objet physique fabriqué en France à la puissance d'une application web toujours à jour, sans rien avoir à télécharger.
              </p>
            </AnimateOnScroll>
          </div>

          {/* SCROLLING RIGHT COLUMN */}
          <div className="lg:col-span-7 space-y-12 lg:space-y-16">
            
            {/* Créart */}
            <AnimateOnScroll>
              <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-[#EDD9A3]/50 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C4714A] to-[#A35A38] flex items-center justify-center shadow-md">
                    <TreePine size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[#C4714A] tracking-widest uppercase font-bold mb-1">Le support</p>
                    <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
                      Guidz Physique
                    </h3>
                  </div>
                </div>
                <p className="text-base text-[#6B5D4E] mb-8 leading-relaxed">
                  Un support en bois gravé, pensé pour s&apos;intégrer naturellement dans votre hébergement et guider vos locataires dès leur arrivée.
                </p>
                <ul className="space-y-4 mb-10">
                  {creart.map((item) => (
                    <li key={item.text} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F7EBE4] flex items-center justify-center shrink-0">
                        <item.icon size={18} className="text-[#C4714A]" />
                      </div>
                      <span className="text-base font-medium text-[#2A2016]">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-3xl overflow-hidden shadow-inner bg-gray-100">
                  <img src="/images/mockup/guidz_mockup.png" alt="Support Guidz" className="w-full h-auto object-cover" />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Wevo */}
            <AnimateOnScroll>
              <div
                className="rounded-[40px] p-8 lg:p-12 shadow-[0_20px_40px_rgba(45,74,34,0.15)] relative overflow-hidden"
                style={{ background: "linear-gradient(145deg, #3F5836, #2D4A22)" }}
              >
                {/* Decorative warm light */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#D4A34A]/20 pointer-events-none blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#C4714A]/15 pointer-events-none blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <Globe size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#E8BE72] tracking-widest uppercase font-bold mb-1">La page</p>
                      <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
                        Guidz Digitale
                      </h3>
                    </div>
                  </div>
                  <p className="text-base text-white/80 mb-8 leading-relaxed">
                    Une page mobile claire, accessible en un scan, qui regroupe toutes les informations utiles du séjour sans application à installer.
                  </p>
                  <ul className="space-y-4 mb-10">
                    {wevo.map((item) => (
                      <li key={item.text} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/5">
                          <item.icon size={18} className="text-[#E8BE72]" />
                        </div>
                        <span className="text-base font-medium text-white/90">{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Phone Mockup */}
                  <div className="flex justify-center mt-6">
                    <div className="relative w-[240px]">
                      <div className="bg-[#111] rounded-[2.5rem] p-3 shadow-2xl border border-white/10 relative transition-transform duration-500 hover:-translate-y-2">
                        {/* Notch */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#111] rounded-b-xl z-20" />
                        {/* Screen */}
                        <div className="bg-[#FDFBF7] rounded-[1.8rem] overflow-hidden h-[460px] relative">
                          <img 
                            src="/images/mockup/mockup_confort.png" 
                            alt="Guidz Digitale - Démo Confort" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </div>
    </section>
  );
}
