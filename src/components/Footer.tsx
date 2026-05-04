"use client";

import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2A2016] text-white/60 py-14 relative overflow-hidden">
      {/* Warm terra glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#C4714A]/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4" />

      {/* Leaf accent */}
      <svg
        viewBox="0 0 200 300"
        className="absolute left-0 bottom-0 w-24 h-36 text-[#5A7A4E]/8 pointer-events-none"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top section */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-10 border-b border-white/8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4714A] to-[#A35A38] flex items-center justify-center">
                <Leaf size={15} className="text-white" />
              </div>
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-white tracking-tight">
                WEVO{" "}
                <span className="text-[#C4714A] font-light">×</span>{" "}
                <span className="text-[#7A9E6A]">CRÉART</span>
              </span>
            </div>
            <p className="text-sm text-white/35 max-w-[220px] leading-relaxed">
              Supports d&apos;accueil connectés pour hébergements touristiques.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-10 text-sm">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-white/30 font-semibold mb-3">Navigation</p>
              <div className="flex flex-col gap-2">
                <a href="#concept" className="hover:text-[#E8BE72] transition-colors">Concept</a>
                <a href="#fonctionnalites" className="hover:text-[#E8BE72] transition-colors">Fonctionnalités</a>
                <a href="#offres" className="hover:text-[#E8BE72] transition-colors">Offres</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-white/30 font-semibold mb-3">Contact</p>
              <div className="flex flex-col gap-2">
                <a href="#pro" className="hover:text-[#E8BE72] transition-colors">Offre Pro</a>
                <a href="#contact" className="hover:text-[#E8BE72] transition-colors">Nous contacter</a>
                <a href="#" className="hover:text-[#E8BE72] transition-colors">Mentions légales</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © 2026 WEVO × CRÉART. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-white/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A7A4E] inline-block" />
            Artisanat français
          </div>
        </div>
      </div>
    </footer>
  );
}
