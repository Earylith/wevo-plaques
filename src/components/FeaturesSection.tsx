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
  { Icon: WifiHigh,       title: "Wifi",                 desc: "Code wifi en un scan",                    accent: { bg: "bg-[#E4EEF3]", color: "#2B5F75" } },
  { Icon: Clock,          title: "Check-in / Check-out", desc: "Horaires d'arrivée et de départ",         accent: { bg: "bg-[#FDF3DC]", color: "#D4A34A" } },
  { Icon: ClipboardText,  title: "Consignes de départ",  desc: "Tout ce que le voyageur doit savoir",     accent: { bg: "bg-[#F7EBE4]", color: "#C4714A" } },
  { Icon: BookOpen,       title: "Règlement",             desc: "Règles du logement claires et lisibles",  accent: { bg: "bg-[#EBF0E6]", color: "#5A7A4E" } },
  { Icon: Phone,          title: "Contacts utiles",       desc: "Propriétaire, urgences, prestataires",    accent: { bg: "bg-[#F7EBE4]", color: "#C4714A" } },
  { Icon: MapPin,         title: "Bonnes adresses",       desc: "Restaurants, activités, commerces",       accent: { bg: "bg-[#EBF0E6]", color: "#5A7A4E" } },
  { Icon: Warning,        title: "Urgences",              desc: "Numéros et procédures d'urgence",         accent: { bg: "bg-red-50",    color: "#EF4444" } },
  { Icon: Bus,            title: "Accès / Transports",    desc: "Comment venir, parkings, transports",     accent: { bg: "bg-[#FDF3DC]", color: "#D4A34A" } },
  { Icon: Question,       title: "FAQ",                   desc: "Réponses aux questions fréquentes",       accent: { bg: "bg-[#E4EEF3]", color: "#2B5F75" } },
  { Icon: ArrowSquareOut, title: "Liens cliquables",      desc: "Maps, réservations, sites utiles",        accent: { bg: "bg-[#EBF0E6]", color: "#5A7A4E" } },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden" id="fonctionnalites">
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-label section-label-ocean mb-5 inline-flex">
              Fonctionnalités
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A2016] leading-tight mt-5 mb-5">
              Toutes les infos utiles,{" "}
              <em className="not-italic text-gradient-ocean">au même endroit</em>
            </h2>
            <p className="text-lg text-[#6B5D4E] leading-relaxed">
              Du wifi aux bonnes adresses, chaque rubrique peut être activée selon votre formule.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {features.map((f, i) => (
            <AnimateOnScroll key={f.title} delay={i * 0.05}>
              <div
                className="group rounded-3xl p-5 border border-transparent card-hover text-center h-full transition-all duration-300 bg-[#FBF5EC] hover:bg-white hover:shadow-md hover:border-[#EDD9A3]/60"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${f.accent.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <f.Icon size={24} weight="duotone" color={f.accent.color} />
                </div>
                <h3 className="font-semibold text-sm text-[#2A2016] mb-1 leading-tight">
                  {f.title}
                </h3>
                <p className="text-xs text-[#6B5D4E] leading-relaxed">{f.desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
