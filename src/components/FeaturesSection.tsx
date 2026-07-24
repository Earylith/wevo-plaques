"use client";

import {
  WifiHigh,
  Clock,
  ClipboardText,
  BookOpen,
  Phone,
  MapPin,
  Warning,
  Bus,
  Question,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import AnimateOnScroll from "./AnimateOnScroll";

const features = [
  { Icon: WifiHigh,       title: "Wi‑Fi",                 desc: "Réseau et mot de passe accessibles en un scan.",           accent: { bg: "bg-[#E4EEF3]", color: "#2B5F75" }, span: "md:col-span-2 md:row-span-2" },
  { Icon: Clock,          title: "Arrivée / départ",      desc: "Horaires, accès au logement et consignes de sortie.",      accent: { bg: "bg-[#FDF3DC]", color: "#D4A34A" }, span: "md:col-span-2 md:row-span-1" },
  { Icon: ClipboardText,  title: "Consignes du logement", desc: "Équipements, poubelles, chauffage, jacuzzi, parking…",     accent: { bg: "bg-[#F7EBE4]", color: "#C4714A" }, span: "md:col-span-1 md:row-span-1" },
  { Icon: BookOpen,       title: "Règles du logement",    desc: "Les règles importantes présentées clairement.",            accent: { bg: "bg-[#EBF0E6]", color: "#5A7A4E" }, span: "md:col-span-1 md:row-span-1" },
  { Icon: Phone,          title: "Contacts & Urgences",   desc: "Propriétaires, prestataires et numéros d'urgence en cas de problème.", accent: { bg: "bg-red-50", color: "#EF4444" }, span: "md:col-span-2 md:row-span-1" },
  { Icon: MapPin,         title: "Bonnes adresses",       desc: "Restaurants, activités, commerces.",                       accent: { bg: "bg-[#EBF0E6]", color: "#5A7A4E" }, span: "md:col-span-1 md:row-span-1" },
  { Icon: Bus,            title: "Accès / Transports",    desc: "Parking, gare, accès, transports et itinéraires.",         accent: { bg: "bg-[#FDF3DC]", color: "#D4A34A" }, span: "md:col-span-1 md:row-span-1" },
  { Icon: Question,       title: "FAQ",                   desc: "Réponses aux questions fréquentes pour vos voyageurs.",    accent: { bg: "bg-[#E4EEF3]", color: "#2B5F75" }, span: "md:col-span-2 md:row-span-1" },
  { Icon: ArrowSquareOut, title: "Liens utiles",          desc: "Maps, réservations, sites utiles et services locaux.",     accent: { bg: "bg-[#F7EBE4]", color: "#C4714A" }, span: "md:col-span-2 md:row-span-1" },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden" id="fonctionnalites">
      {/* Decorative blurry blobs */}
      <div className="absolute top-0 right-1/3 w-[800px] h-[800px] bg-[#E4EEF3]/40 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[#FDF3DC]/30 blur-[100px] rounded-full pointer-events-none translate-y-1/2" />

      {/* Leaf decorations */}
      <svg
        viewBox="0 0 200 300"
        className="absolute left-0 top-1/4 w-32 h-48 text-[#5A7A4E]/6 pointer-events-none"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>
      <svg
        viewBox="0 0 200 300"
        className="absolute right-0 bottom-1/4 w-32 h-48 text-[#C4714A]/6 pointer-events-none rotate-180"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="section-label section-label-ocean mb-5 inline-flex">
              Fonctionnalités
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-5xl lg:text-[4rem] font-bold text-[#2A2016] leading-[1.05] mt-5 mb-6 tracking-tight">
              Toutes les infos utiles,{" "}
              <em className="not-italic text-gradient-ocean">au même endroit</em>
            </h2>
            <p className="text-lg text-[#6B5D4E] leading-relaxed max-w-2xl mx-auto">
              Votre Guidz regroupe les informations dont vos locataires ont besoin, de l&apos;arrivée au départ.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-4 lg:gap-6">
          {features.map((f, i) => {
            const isLarge = f.span.includes("col-span-2 md:row-span-2");
            const isWide = f.span.includes("col-span-2 md:row-span-1");
            const isTall = f.span.includes("md:row-span-2") && !isLarge;

            return (
              <AnimateOnScroll key={f.title} delay={i * 0.05} className={`${f.span} flex`}>
                <div
                  className={`group rounded-[32px] p-8 border border-transparent w-full flex transition-all duration-500 bg-[#FBF5EC]/60 backdrop-blur-sm hover:bg-white hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:border-[#EDD9A3]/80 ${
                    isLarge ? "flex-col justify-center items-center text-center p-12" : 
                    isWide ? "flex-col sm:flex-row items-start sm:items-center text-left gap-6" : 
                    isTall ? "flex-col items-start text-left" : 
                    "flex-col items-start text-left"
                  }`}
                >
                  <div
                    className={`rounded-2xl ${f.accent.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 ${
                      isLarge ? "w-24 h-24 mb-8" : 
                      isWide ? "w-16 h-16" : 
                      isTall ? "w-16 h-16 mb-6" : 
                      "w-14 h-14 mb-5"
                    }`}
                  >
                    <f.Icon size={isLarge ? 48 : isWide || isTall ? 32 : 28} weight="duotone" color={f.accent.color} />
                  </div>
                  
                  <div className={`${isWide ? "flex-1" : ""}`}>
                    <h3 className={`font-semibold text-[#2A2016] leading-tight ${isLarge ? "text-3xl mb-4 font-[family-name:var(--font-display)]" : "text-lg mb-2"}`}>
                      {f.title}
                    </h3>
                    <p className={`text-[#6B5D4E] leading-relaxed ${isLarge ? "text-lg max-w-sm mx-auto" : "text-sm"}`}>
                      {f.desc}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
