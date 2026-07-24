"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-finalec.png"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        {/* Multi-layer overlay for readability + warmth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A2016]/95 via-[#2A2016]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2016]/80 via-[#2A2016]/30 to-transparent" />
      </div>

      {/* Floating organic shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[#C4714A]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-16 w-56 h-56 rounded-full bg-[#5A7A4E]/20 blur-3xl pointer-events-none" />

      {/* Decorative leaf SVG top-right */}
      <svg
        viewBox="0 0 200 300"
        className="absolute top-0 right-0 w-64 h-96 text-[#5A7A4E]/10 pointer-events-none"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28 w-full flex flex-col">
        <div className="max-w-2xl order-1">
          {/* Headline */}
          <AnimateOnScroll delay={0.2}>
            <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-6xl lg:text-7xl leading-[1.05] font-bold text-white mb-6">
              Guidz, le livret d'accueil&nbsp;
              <span
                style={{
                  background: "linear-gradient(135deg, #E8BE72, #C4714A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                réinventé.
              </span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.3}>
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed mb-6 lg:mb-10 max-w-2xl">
              Remplacez votre livret papier par une élégante plaque en bois personnalisée. Vos voyageurs retrouvent le Wi-Fi, les consignes, les équipements et vos recommandations en un scan.
            </p>
          </AnimateOnScroll>
        </div>

        {/* Mobile Product Showcase (Premium) */}
        <div className="order-2 w-full lg:hidden block">
          <AnimateOnScroll delay={0.4}>
            <div className="mb-10 w-full relative">
              
              {/* Glowing backdrop to make the wood pop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#C4714A]/40 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/3 w-48 h-48 bg-[#E8BE72]/30 rounded-full blur-[60px] pointer-events-none" />

              <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `}} />
              
              <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-10 pt-4 px-6 hide-scrollbar relative z-10 items-center -mx-6">
                
                {/* Item 1: Mockup sur le mur */}
                <div className="snap-center shrink-0 w-full relative flex justify-center">
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-[85%] max-w-[320px]"
                  >
                    {/* Drop shadow underneath */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/50 blur-[15px] rounded-[100%]" />
                    <img
                      src="/images/mockup/guidz_mockup.png"
                      alt="Aperçu Guidz sur le mur"
                      className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]"
                    />
                  </motion.div>
                </div>

                {/* Item 2: Chevalet */}
                <div className="snap-center shrink-0 w-full relative flex justify-center">
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="relative w-[85%] max-w-[320px]"
                  >
                    {/* Drop shadow underneath */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-black/50 blur-[15px] rounded-[100%]" />
                    <img
                      src="/images/mockup/guidz_chevalet.png"
                      alt="Guidz sur chevalet"
                      className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]"
                    />
                  </motion.div>
                </div>

              </div>
              
              {/* Scroll Indicator */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-2 text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold z-20">
                <span className="animate-pulse">Faire défiler</span>
                <ArrowRight size={12} className="animate-pulse text-[#C4714A]" />
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* CTAs */}
        <div className="max-w-2xl order-3">
          <AnimateOnScroll delay={0.5}>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#offres"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#C4714A] text-white font-semibold text-base hover:bg-[#D4866A] transition-all btn-press shadow-lg hover:shadow-xl group"
              >
                Voir les formules
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/25 text-white font-medium text-base hover:bg-white/20 transition-all btn-press"
              >
                <Eye size={18} />
                Voir une démo
              </a>
            </div>
          </AnimateOnScroll>

          {/* Trust line */}
          <AnimateOnScroll delay={0.6}>
            <p className="text-sm text-white/60 mt-8 font-medium">
              À partir de 49 € TTC · Installation simple · Sans application pour vos locataires
            </p>
          </AnimateOnScroll>
        </div>
      </div>

      {/* Bottom organic wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          className="w-full h-auto fill-[#FBF5EC]"
          preserveAspectRatio="none"
        >
          <path d="M0,60 C240,10 480,80 720,50 C960,20 1200,70 1440,45 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
