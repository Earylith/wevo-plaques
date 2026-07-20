"use client";

import { ArrowRight, PhoneCall } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

export default function FinalCTA() {
  return (
    <section className="py-24 lg:py-36 relative overflow-hidden bg-white" id="contact">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[#FBF5EC] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="relative rounded-[48px] overflow-hidden bg-gradient-to-br from-[#FBF5EC]/90 to-white/60 backdrop-blur-xl border border-[#EDD9A3]/60 shadow-[0_40px_80px_rgba(42,32,22,0.06)] py-20 lg:py-32 px-6 sm:px-12 text-center group">
            
            {/* Internal Soft warm blobs for Glassmorphism effect */}
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#C4714A]/10 blur-[80px] pointer-events-none -translate-y-1/2 -translate-x-1/4 group-hover:bg-[#C4714A]/15 transition-colors duration-1000" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#5A7A4E]/10 blur-[80px] pointer-events-none translate-y-1/3 translate-x-1/4 group-hover:bg-[#5A7A4E]/15 transition-colors duration-1000" />
            <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-[#D4A34A]/10 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

            {/* Internal Leaf decorations */}
            <svg
              viewBox="0 0 200 300"
              className="absolute left-6 top-6 w-32 h-48 text-[#5A7A4E]/5 pointer-events-none"
              fill="currentColor"
            >
              <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
            </svg>
            <svg
              viewBox="0 0 200 300"
              className="absolute right-6 bottom-6 w-32 h-48 text-[#C4714A]/5 pointer-events-none rotate-180"
              fill="currentColor"
            >
              <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
            </svg>

            <div className="relative z-10 max-w-4xl mx-auto">
              {/* Decorative line */}
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#C4714A]/40" />
                <span className="text-[#C4714A] text-xl">✦</span>
                <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#C4714A]/40" />
              </div>

              <span className="inline-block px-4 py-1.5 rounded-full bg-white/50 border border-white/60 text-xs font-bold tracking-[0.2em] uppercase text-[#5A7A4E] mb-6 shadow-sm">
                Passez à l&apos;action
              </span>

              <h2 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-[#2A2016] leading-[1.05] mb-8 tracking-tight">
                Offrez à vos locataires un accueil{" "}
                <em
                  className="not-italic block mt-3"
                  style={{
                    fontStyle: "italic",
                    background: "linear-gradient(135deg, #C4714A, #D4A34A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  qui marque les esprits
                </em>
              </h2>

              <p className="text-xl text-[#6B5D4E] leading-relaxed max-w-2xl mx-auto mb-14">
                Installez votre Guidz et vos locataires accèderont aux informations essentielles en un scan.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-[#C4714A] text-white font-bold text-lg hover:bg-[#A35A38] transition-all btn-press shadow-[0_10px_20px_rgba(196,113,74,0.3)] hover:shadow-[0_15px_30px_rgba(196,113,74,0.4)] hover:-translate-y-1 group"
                >
                  Commander mon Guidz
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full border-2 border-[#2A2016]/10 bg-white/50 text-[#2A2016] font-semibold text-lg hover:border-[#C4714A] hover:text-[#C4714A] hover:bg-white transition-all btn-press"
                >
                  <PhoneCall size={20} />
                  Être rappelé
                </a>
              </div>

              {/* Social proof */}
              <div className="mt-14 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-[#6B5D4E]/20" />
                <p className="text-sm font-medium text-[#6B5D4E]/80 tracking-wide">
                  Artisanat français · Livraison rapide · Sans engagement
                </p>
                <div className="h-px w-8 bg-[#6B5D4E]/20" />
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
