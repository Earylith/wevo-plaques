"use client";

import { ShoppingBag, PencilLine, QrCode } from "@phosphor-icons/react";
import AnimateOnScroll from "./AnimateOnScroll";

const steps = [
  {
    Icon: ShoppingBag,
    step: "01",
    title: "Choisissez votre formule",
    description:
      "Essentielle, Confort ou Pro : sélectionnez l'offre adaptée à vos besoins et au nombre de logements.",
    accent: { bg: "bg-[#F7EBE4]", icon: "#C4714A" },
  },
  {
    Icon: PencilLine,
    step: "02",
    title: "Nous créons le support et la page",
    description:
      "Créart fabrique votre support d'accueil en bois. Wevo configure votre livret d'accueil digital avec toutes vos informations utiles.",
    accent: { bg: "bg-[#EBF0E6]", icon: "#5A7A4E" },
  },
  {
    Icon: QrCode,
    step: "03",
    title: "Vos voyageurs scannent",
    description:
      "Placez le support dans votre logement. En scannant le QR code, vos voyageurs accèdent à toutes les informations du séjour.",
    accent: { bg: "bg-[#FDF3DC]", icon: "#D4A34A" },
  },
];

export default function SolutionSection() {
  return (
    <section
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F0E8D6 0%, #FBF5EC 50%, #EBF0E6 100%)" }}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#5A7A4E]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-6">
            <span className="section-label section-label-terra mb-5 inline-flex">
              Comment ça marche
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A2016] leading-tight mt-5 mb-5">
              Votre accueil digital{" "}
              <em className="not-italic text-gradient-terra">en 3 étapes</em>
            </h2>
            <p className="text-lg text-[#6B5D4E] leading-relaxed">
              Vous nous transmettez vos informations, nous créons le support et la page, vos voyageurs scannent à leur arrivée.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-16 grid md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((item, index) => (
            <AnimateOnScroll key={item.step} delay={index * 0.15}>
              <div className="relative text-center group">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-14 left-[55%] w-[90%] h-px bg-gradient-to-r from-[#C4714A]/30 to-transparent" />
                )}

                {/* Icon block */}
                <div className="relative z-10 w-28 h-28 rounded-3xl bg-white mx-auto mb-7 flex items-center justify-center border border-[#EDD9A3]/60 group-hover:border-[#C4714A]/40 transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:-translate-y-2">
                  <div className={`w-14 h-14 rounded-2xl ${item.accent.bg} flex items-center justify-center`}>
                    <item.Icon size={30} weight="duotone" color={item.accent.icon} />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#C4714A] text-white text-xs font-bold flex items-center justify-center shadow-sm">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-[#2A2016] mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-[#6B5D4E] leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full h-auto fill-white" preserveAspectRatio="none">
          <path d="M0,20 C360,60 720,0 1080,40 C1260,60 1380,20 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
