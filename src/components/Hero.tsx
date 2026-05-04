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
          src="/images/hero_images.png"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Multi-layer overlay for readability + warmth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A2016]/80 via-[#2A2016]/50 to-[#2A2016]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2016]/60 via-transparent to-transparent" />
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20 lg:pt-36 lg:pb-28 w-full">
        <div className="max-w-2xl">
          {/* Pill badge */}
          <AnimateOnScroll delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-7">
              <Sparkles size={13} className="text-[#E8BE72]" />
              <span className="text-xs font-medium text-white/90 tracking-wide uppercase">
                Support d&apos;accueil connecté · artisanat français
              </span>
            </div>
          </AnimateOnScroll>

          {/* Headline */}
          <AnimateOnScroll delay={0.2}>
            <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl lg:text-7xl leading-[1.05] font-bold text-white mb-6">
              Un support d&apos;accueil{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #E8BE72, #C4714A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                élégant.
              </span>
              <br className="hidden lg:block" />
              <span className="text-4xl sm:text-5xl lg:text-6xl mt-2 block">Toutes les infos du séjour en un scan.</span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.3}>
            <p className="text-lg sm:text-xl text-white/75 leading-relaxed mb-10 max-w-2xl">
              Un support en bois gravé avec QR code, relié à un livret d&apos;accueil digital personnalisé pour votre hébergement. Wifi, consignes, arrivée, départ et bonnes adresses : tout est au même endroit.
            </p>
          </AnimateOnScroll>

          {/* CTAs */}
          <AnimateOnScroll delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#offres"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-[#C4714A] text-white font-semibold text-base hover:bg-[#D4866A] transition-all btn-press shadow-lg hover:shadow-xl group"
              >
                Découvrir les offres
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
                Voir un exemple
              </a>
            </div>
          </AnimateOnScroll>

          {/* Trust line */}
          <AnimateOnScroll delay={0.5}>
            <p className="text-sm text-white/60 mt-8 font-medium">
              À partir de 59 € TTC · 6 mois de service inclus · paiement unique disponible
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
