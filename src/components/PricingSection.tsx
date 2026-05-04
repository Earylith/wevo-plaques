"use client";

import { useState } from "react";
import { Check, ArrowRight, Leaf } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

export default function PricingSection() {
  const [isOneTime, setIsOneTime] = useState(false);

  const plans = [
    {
      name: "Essentielle",
      price: isOneTime ? "109" : "59",
      badge: "Simple et efficace",
      popular: false,
      accent: { bg: "bg-[#EBF0E6]", border: "border-[#5A7A4E]/20", text: "text-[#5A7A4E]", check: "bg-[#5A7A4E]/15 text-[#5A7A4E]" },
      features: [
        "1 support d'accueil en bois standard",
        "1 QR code unique",
        "1 page dédiée",
        "Mise en ligne initiale",
        "Wifi, horaires, consignes",
        "Contacts, règlement, bonnes adresses",
        "Personnalisation du support non incluse",
        ...(isOneTime ? [] : ["6 mois de service inclus"]),
      ],
      after: isOneTime ? "Paiement unique et définitif" : "6 mois inclus, puis 29 €/an",
      cta: "Choisir cette offre",
    },
    {
      name: "Confort",
      price: isOneTime ? "149" : "69",
      badge: "La plus populaire",
      popular: true,
      accent: null,
      features: [
        "Tout du pack Essentiel (Wifi, contacts, règlement...)",
        "1 support d'accueil personnalisé",
        "Nom, logo et phrase gravée",
        "Page enrichie bilingue",
        "Transports, urgences, FAQ",
        "Recommandations locales",
        ...(isOneTime ? ["Modifications à la demande"] : ["6 mois de service inclus", "Petites modifs incluses"]),
      ],
      after: isOneTime ? "Paiement unique et définitif" : "6 mois inclus, puis 48 €/an",
      cta: "Choisir cette offre",
    },
    {
      name: "Pro multi-biens",
      price: "99",
      badge: "Conciergeries",
      popular: false,
      accent: { bg: "bg-[#E4EEF3]", border: "border-[#2B5F75]/20", text: "text-[#2B5F75]", check: "bg-[#2B5F75]/15 text-[#2B5F75]" },
      features: [
        "Structure multi-biens",
        "Jusqu'à 3 hébergements configurés",
        "Pages harmonisées et duplication",
        "Personnalisation par logement",
        "6 mois de service inclus",
        "Support prioritaire",
        "Supports physiques en supplément",
      ],
      after: "Mise en place, puis 59 €/an/logement",
      cta: "Demander un devis Pro",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden" id="offres">
      {/* Background deco */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#F5E6C8]/60 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#EBF0E6]/60 blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="section-label section-label-terra mb-5 inline-flex">
              Deux façons de profiter de votre support
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A2016] leading-tight mt-5 mb-5">
              Choisissez la formule{" "}
              <em className="not-italic text-gradient-terra">qui vous correspond</em>
            </h2>
            <div className="bg-[#FBF5EC] p-6 rounded-3xl border border-[#EDD9A3]/60 max-w-2xl mx-auto text-left">
              <p className="text-base font-semibold text-[#2A2016] mb-4 text-center">
                Comment souhaitez-vous fonctionner ?
              </p>
              <ul className="space-y-3 text-[#6B5D4E] text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C4714A]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-[#C4714A]" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="text-[#2A2016]">Avec abonnement :</strong> le moins cher au départ. Inclut les petites modifications de votre page web pour la garder à jour.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C4714A]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-[#C4714A]" />
                  </div>
                  <span className="leading-relaxed">
                    <strong className="text-[#2A2016]">Paiement unique :</strong> aucun frais récurrent. Votre page reste en ligne sans abonnement (modifications facturées à la demande).
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Toggle Avec Suivi / Paiement Unique */}
        <AnimateOnScroll delay={0.1}>
          <div className="flex justify-center mb-12">
            <div className="bg-[#FBF5EC] p-1.5 rounded-full inline-flex border border-[#EDD9A3]/50">
              <button
                onClick={() => setIsOneTime(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  !isOneTime ? "bg-white text-[#C4714A] shadow-sm" : "text-[#6B5D4E] hover:text-[#2A2016]"
                }`}
              >
                Avec abonnement (6 mois inclus)
              </button>
              <button
                onClick={() => setIsOneTime(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isOneTime ? "bg-white text-[#C4714A] shadow-sm" : "text-[#6B5D4E] hover:text-[#2A2016]"
                }`}
              >
                Sans abonnement (Paiement unique)
              </button>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <AnimateOnScroll key={plan.name} delay={index * 0.1}>
              {plan.popular ? (
                /* Popular card */
                <div className="relative rounded-3xl p-8 h-full flex flex-col shadow-2xl scale-[1.02] lg:scale-105"
                  style={{ background: "linear-gradient(145deg, #C4714A, #A35A38)" }}
                >
                  <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#E8BE72]/20" />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Leaf size={13} className="text-[#E8BE72]" />
                      <span className="text-xs font-semibold tracking-wide uppercase text-[#E8BE72]">
                        {plan.badge}
                      </span>
                    </div>

                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-5xl font-bold text-white">{plan.price} €</span>
                      <span className="text-sm text-white/60">TTC</span>
                    </div>
                    <p className="text-xs text-white/50 mb-6">{plan.after}</p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} className="text-white" />
                          </div>
                          <span className="text-sm text-white/85 leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#contact"
                      className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-white text-[#C4714A] font-semibold text-sm hover:bg-[#FBF5EC] transition-all btn-press group shadow-lg"
                    >
                      {plan.cta}
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Regular cards */
                <div className="relative rounded-3xl p-8 h-full flex flex-col bg-[#FBF5EC] border border-[#EDD9A3]/60 card-hover shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-semibold tracking-wide uppercase ${plan.accent!.text}`}>
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016] mb-2">
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-5xl font-bold text-[#2A2016]">{plan.price} €</span>
                    <span className="text-sm text-[#6B5D4E]">TTC</span>
                  </div>
                  <p className="text-xs text-[#6B5D4E]/70 mb-6">{plan.after}</p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.accent!.check}`}>
                          <Check size={11} />
                        </div>
                        <span className="text-sm text-[#6B5D4E] leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#2A2016] text-white font-medium text-sm hover:bg-[#5C3D2E] transition-all btn-press group"
                  >
                    {plan.cta}
                    <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
