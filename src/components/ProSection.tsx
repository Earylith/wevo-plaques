"use client";

import { Check, ArrowRight, Leaf, Building2, Hotel } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

const plans = [
  {
    name: "Multi-biens",
    icon: Building2,
    price: "Sur devis",
    badge: "Conciergeries & propriétaires multi-logements",
    features: [
      "Toutes les fonctionnalités Confort",
      "Pages harmonisées",
      "Gestion centralisée",
      "Duplication de pages",
      "Mise à jour groupée",
      "Tarifs dégressifs",
      "Statistiques d'utilisation",
      "Assistance prioritaire"
    ],
    cta: "Demander un devis",
  },
  {
    name: "Signature",
    icon: Hotel,
    price: "Sur devis",
    badge: "Hôtels, résidences & groupes",
    features: [
      "Expérience 100% sur mesure",
      "Branding complet",
      "Plusieurs établissements",
      "Room service / Click & collect",
      "Réservation d'activités",
      "Notifications clients",
      "Assistance dédiée",
      "Intégrations (PMS, etc.)"
    ],
    cta: "Demander un devis",
  }
];

export default function ProSection() {
  return (
    <section
      className="py-20 lg:py-24 relative overflow-hidden bg-[#FBF5EC]"
      id="pro"
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C4714A]/5 blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#5A7A4E]/5 blur-[100px] pointer-events-none translate-y-1/3 translate-x-1/3" />

      {/* Leaf decorations */}
      <svg viewBox="0 0 200 300" className="absolute right-10 top-10 w-32 h-48 text-[#C4714A]/10 pointer-events-none" fill="currentColor">
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>
      <svg viewBox="0 0 200 300" className="absolute left-10 bottom-10 w-24 h-36 text-[#5A7A4E]/10 pointer-events-none rotate-180" fill="currentColor">
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <AnimateOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-label mb-5 inline-flex">
              Solutions professionnelles
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A2016] leading-[1.05] mt-5 mb-6 tracking-tight">
              Du multi-logement à{" "}
              <em className="not-italic text-gradient-terra">l&apos;expérience sur mesure</em>
            </h2>
            <p className="text-lg text-[#6B5D4E] leading-relaxed max-w-2xl mx-auto">
              Que vous gériez plusieurs hébergements ou un établissement avec des services dédiés, Guidz s&apos;adapte à votre organisation.
            </p>
          </div>
        </AnimateOnScroll>

        {/* Horizontal Cards */}
        <div className="space-y-6">
          {plans.map((plan, i) => (
            <AnimateOnScroll key={plan.name} delay={i * 0.1}>
              <div className="bg-white rounded-[32px] p-6 lg:p-10 border border-[#EDD9A3]/40 shadow-sm hover:shadow-md transition-shadow group flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
                
                {/* Left Side: Title & CTA */}
                <div className="w-full lg:w-1/3 text-center lg:text-left flex flex-col items-center lg:items-start shrink-0">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7EBE4] flex items-center justify-center">
                      <plan.icon size={20} className="text-[#C4714A]" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#C4714A]">
                      {plan.badge}
                    </span>
                  </div>
                  
                  <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016] mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-8">
                    <span className="text-xl font-semibold text-[#6B5D4E]">{plan.price}</span>
                  </div>

                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#2A2016] text-white font-semibold text-sm hover:bg-[#C4714A] transition-all btn-press shadow-md hover:shadow-lg"
                  >
                    {plan.cta}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </div>

                {/* Vertical Divider (Desktop) */}
                <div className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-[#EDD9A3]/50 to-transparent" />

                {/* Horizontal Divider (Mobile) */}
                <div className="block lg:hidden w-full h-px bg-gradient-to-r from-transparent via-[#EDD9A3]/50 to-transparent" />

                {/* Right Side: Features Grid */}
                <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#EBF0E6] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#5A7A4E] transition-colors">
                        <Check size={11} className="text-[#5A7A4E] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-[#2A2016]/80 leading-snug">{f}</span>
                    </div>
                  ))}
                </div>

              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
