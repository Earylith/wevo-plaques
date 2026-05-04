"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";

const faqs = [
  {
    q: "Suis-je obligé de prendre un abonnement ?",
    a: "Non. Deux options sont possibles : une formule avec suivi, qui inclut les petites modifications selon l'offre, ou un paiement unique sans abonnement. En paiement unique, la page reste accessible et les modifications sont facturées uniquement si besoin.",
  },
  {
    q: "Que se passe-t-il après les 6 mois inclus ?",
    a: "Si vous avez choisi la formule avec suivi, vous pouvez continuer avec un renouvellement annuel ou mensuel. Si vous préférez éviter les frais récurrents, vous pouvez choisir dès le départ le paiement unique.",
  },
  {
    q: "Que se passe-t-il si mon wifi ou mes consignes changent ?",
    a: "Avec la formule avec suivi, les petites modifications sont incluses selon votre offre. En paiement unique, les modifications sont facturées à la demande. Dans les deux cas, le QR code reste le même.",
  },
  {
    q: "Le QR code change-t-il si je modifie les informations ?",
    a: "Non. Le QR code reste identique. Les informations de la page peuvent être modifiées sans refaire le support.",
  },
  {
    q: "Le voyageur doit-il installer une application ?",
    a: "Non. Le voyageur scanne simplement le QR code avec son téléphone et accède à la page depuis son navigateur.",
  },
  {
    q: "Le support est-il personnalisable ?",
    a: "Oui, à partir de l'offre Confort : nom ou logo de l'hébergement, ainsi qu'une phrase personnalisée gravée.",
  },
  {
    q: "Est-ce adapté à plusieurs logements ?",
    a: "Oui. L'offre Pro est pensée pour les conciergeries, gestionnaires et propriétaires de plusieurs biens. Elle permet de créer une page dédiée par hébergement et des supports harmonisés.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-[#FBF5EC] relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#EDD9A3]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-[#EBF0E6]/60 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center mb-16">
            <span className="section-label mb-5 inline-flex">
              FAQ
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-[#2A2016] leading-tight mt-5">
              Questions fréquentes
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimateOnScroll key={i} delay={i * 0.05}>
              <div className={`rounded-3xl overflow-hidden border transition-all duration-300 ${
                openIndex === i
                  ? "border-[#C4714A]/30 bg-white shadow-md"
                  : "border-[#EDD9A3]/60 bg-white/60 hover:bg-white hover:shadow-sm"
              }`}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left group"
                >
                  <span className={`font-medium pr-4 transition-colors ${
                    openIndex === i ? "text-[#C4714A]" : "text-[#2A2016] group-hover:text-[#C4714A]"
                  }`}>
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    openIndex === i ? "bg-[#C4714A] text-white rotate-180" : "bg-[#F5E6C8] text-[#C4714A]"
                  }`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-sm text-[#6B5D4E] leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
