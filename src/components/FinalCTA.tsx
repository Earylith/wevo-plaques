"use client";

import { ArrowRight, PhoneCall } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

export default function FinalCTA() {
  return (
    <section className="py-24 lg:py-36 relative overflow-hidden bg-[#FBF5EC]" id="contact">
      {/* Soft warm blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#C4714A]/8 blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#5A7A4E]/8 blur-3xl pointer-events-none translate-y-1/2" />
      <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full bg-[#D4A34A]/6 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* Leaf decorations */}
      <svg
        viewBox="0 0 200 300"
        className="absolute left-12 top-8 w-36 h-52 text-[#5A7A4E]/10 pointer-events-none"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>
      <svg
        viewBox="0 0 200 300"
        className="absolute right-12 bottom-8 w-28 h-44 text-[#C4714A]/10 pointer-events-none rotate-180"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <AnimateOnScroll>
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#C4714A]/40" />
            <span className="text-[#C4714A] text-xl">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#C4714A]/40" />
          </div>

          <span className="inline-block text-xs font-semibold tracking-[0.22em] uppercase text-[#5A7A4E] mb-5">
            Passez à l&apos;action
          </span>

          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#2A2016] leading-tight mb-6">
            Prêt à simplifier l&apos;accueil de vos{" "}
            <em
              className="not-italic"
              style={{
                fontStyle: "italic",
                background: "linear-gradient(135deg, #C4714A, #D4A34A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              voyageurs&nbsp;?
            </em>
          </h2>

          <p className="text-lg text-[#6B5D4E] leading-relaxed max-w-2xl mx-auto mb-12">
            Un support en bois, un QR code, et toutes les informations utiles disponibles dès l&apos;arrivée. Simple, élégant, sans application.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#C4714A] text-white font-semibold text-base hover:bg-[#A35A38] transition-all btn-press shadow-lg hover:shadow-xl group"
            >
              Demander un aperçu personnalisé
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-[#2A2016]/15 text-[#2A2016] font-medium text-base hover:border-[#C4714A] hover:text-[#C4714A] transition-all btn-press"
            >
              <PhoneCall size={18} />
              Être rappelé
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-10 text-sm text-[#6B5D4E]/60">
            Artisanat français · Livraison rapide · Sans engagement
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
