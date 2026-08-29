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
        <div className="flex flex-col">
          
          {/* TOP HEADER */}
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
            <AnimateOnScroll>
              <span className="section-label mb-6 inline-flex px-4 py-2 rounded-full bg-[#EBF0E6] text-[#5A7A4E] text-sm font-semibold tracking-wide uppercase shadow-sm">
                Le meilleur des deux mondes
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-5xl lg:text-[4.5rem] font-bold text-[#2A2016] leading-[1.1] mt-4 mb-8 tracking-tight">
                Le charme du bois,{" "}
                <br className="hidden lg:block" />
                <em className="not-italic text-gradient-terra relative inline-block">
                  la flexibilité du digital
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#C4714A]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </em>
              </h2>
              <p className="text-xl text-[#6B5D4E] leading-relaxed max-w-2xl mx-auto">
                Associez l'authenticité d'un bel objet physique fabriqué en France à la puissance d'une application web toujours à jour, sans rien avoir à télécharger.
              </p>
            </AnimateOnScroll>
          </div>

          {/* HORIZONTAL CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            
            {/* Créart */}
            <AnimateOnScroll className="h-full">
              <div className="group bg-white rounded-[40px] p-8 lg:p-12 border border-[#EDD9A3]/50 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(196,113,74,0.08)] transition-all duration-500 hover:-translate-y-2 h-full flex flex-col relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F7EBE4]/40 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex items-center gap-5 mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C4714A] to-[#A35A38] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <TreePine size={28} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-[#C4714A] tracking-widest uppercase font-bold mb-1 opacity-80">Le support</p>
                    <h3 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl font-bold text-[#2A2016]">
                      Guidz Physique
                    </h3>
                  </div>
                </div>
                <p className="text-lg text-[#6B5D4E] mb-10 leading-relaxed relative z-10">
                  Un support en bois gravé, pensé pour s&apos;intégrer naturellement dans votre hébergement et guider vos locataires dès leur arrivée.
                </p>
                <ul className="space-y-5 mb-12 relative z-10">
                  {creart.map((item) => (
                    <li key={item.text} className="flex items-center gap-4 group/item">
                      <div className="w-12 h-12 rounded-2xl bg-[#F7EBE4] flex items-center justify-center shrink-0 group-hover/item:bg-[#C4714A] transition-colors duration-300">
                        <item.icon size={20} className="text-[#C4714A] group-hover/item:text-white transition-colors duration-300" />
                      </div>
                      <span className="text-lg font-medium text-[#2A2016] group-hover/item:translate-x-1 transition-transform duration-300">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-3xl overflow-hidden shadow-inner bg-gray-50 mt-auto relative border border-gray-100 group-hover:border-[#EDD9A3]/50 transition-colors duration-500">
                  <img 
                    src="/images/mockup/guidz_mockup.png" 
                    alt="Support Guidz" 
                    className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" 
                  />
                  {/* Subtle overlay gloss */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </div>
            </AnimateOnScroll>

            {/* Wevo */}
            <AnimateOnScroll className="h-full">
              <div
                className="group rounded-[40px] p-8 lg:p-12 shadow-[0_15px_35px_rgba(45,74,34,0.15)] hover:shadow-[0_30px_60px_rgba(45,74,34,0.25)] transition-all duration-500 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col"
                style={{ background: "linear-gradient(145deg, #3F5836, #2D4A22)" }}
              >
                {/* Decorative warm light */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#D4A34A]/20 pointer-events-none blur-[80px] group-hover:bg-[#D4A34A]/30 transition-colors duration-700" />
                <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#C4714A]/15 pointer-events-none blur-[100px] group-hover:bg-[#C4714A]/25 transition-colors duration-700" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <Globe size={28} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-[#E8BE72] tracking-widest uppercase font-bold mb-1 opacity-80">La page</p>
                      <h3 className="font-[family-name:var(--font-display)] text-3xl lg:text-4xl font-bold text-white">
                        Guidz Digitale
                      </h3>
                    </div>
                  </div>
                  <p className="text-lg text-white/80 mb-10 leading-relaxed">
                    Une page mobile claire, accessible en un scan, qui regroupe toutes les informations utiles du séjour sans application à installer.
                  </p>
                  <ul className="space-y-5 mb-12">
                    {wevo.map((item) => (
                      <li key={item.text} className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10 group-hover/item:bg-[#E8BE72] group-hover/item:border-transparent transition-all duration-300">
                          <item.icon size={20} className="text-[#E8BE72] group-hover/item:text-[#2D4A22] transition-colors duration-300" />
                        </div>
                        <span className="text-lg font-medium text-white/90 group-hover/item:translate-x-1 group-hover/item:text-white transition-all duration-300">{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Phone Mockup */}
                  <div className="flex justify-center mt-auto">
                    <div className="relative w-[260px]">
                      <div className="bg-[#111] rounded-[2.5rem] p-3 shadow-2xl border border-white/10 relative transition-transform duration-700 group-hover:-translate-y-4">
                        {/* Notch */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#111] rounded-b-2xl z-20" />
                        {/* Screen */}
                        <div className="bg-[#FDFBF7] rounded-[1.8rem] overflow-hidden h-[500px] relative">
                          <img 
                            src="/images/mockup/mockup_confort.png" 
                            alt="Guidz Digitale - Démo Confort" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
