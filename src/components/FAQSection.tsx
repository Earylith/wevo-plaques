"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";
import { FAQ_ACCUEIL } from "@/lib/faq";

/*
 * Les questions vivent dans `@/lib/faq`.
 *
 * La page d'accueil les balise aussi en `FAQPage` pour les résultats de
 * recherche, et ce balisage doit reprendre exactement ce qui est affiché
 * ici : une seule source, donc.
 */
const faqs = FAQ_ACCUEIL;

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-[#FBF5EC] relative overflow-hidden" id="faq">
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
