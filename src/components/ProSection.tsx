"use client";

import { Monitor, MapPin, PaintBrushBroad, TrendUp } from "@phosphor-icons/react";
import AnimateOnScroll from "./AnimateOnScroll";

const features = [
  {
    Icon: Monitor,
    title: "Structure multi-biens",
    desc: "Une organisation claire pour gérer plusieurs logements avec des pages dédiées et cohérentes.",
  },
  {
    Icon: MapPin,
    title: "Supports sur mesure",
    desc: "Chaque logement reçoit son propre support en bois gravé avec un QR code unique.",
  },
  {
    Icon: PaintBrushBroad,
    title: "À vos propres couleurs",
    desc: "Personnalisez les pages d'accueil avec le logo et les couleurs de votre conciergerie.",
  },
  {
    Icon: TrendUp,
    title: "Tarifs dégressifs",
    desc: "Plus vous équipez de logements, plus le coût par support diminue.",
  },
];

export default function ProSection() {
  return (
    <section
      className="py-20 lg:py-32 relative overflow-hidden"
      id="pro"
      style={{ background: "linear-gradient(145deg, #3D1F0D 0%, #5C3320 50%, #7A4530 100%)" }}
    >
      {/* Warm glow blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#D4A34A]/10 blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C4714A]/15 blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Leaf decorations */}
      <svg viewBox="0 0 200 300" className="absolute right-10 top-10 w-32 h-48 text-white/5 pointer-events-none" fill="currentColor">
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>
      <svg viewBox="0 0 200 300" className="absolute left-10 bottom-10 w-24 h-36 text-white/5 pointer-events-none rotate-180" fill="currentColor">
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Column: Text & CTA */}
          <AnimateOnScroll direction="left">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold tracking-[0.18em] uppercase text-[#E8BE72] mb-6 backdrop-blur-sm shadow-sm">
                ✦ Conciergeries & Multi-biens
              </span>
              
              <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Gérez 5, 10 ou 50 livrets d&apos;accueil{" "}
                <em
                  className="not-italic"
                  style={{
                    background: "linear-gradient(135deg, #E8BE72, #D4A34A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  sans effort
                </em>
              </h2>
              
              <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10">
                Une solution clé en main pour les professionnels. Équipez tous vos logements d&apos;un support connecté et centralisez les informations de chaque bien dans une structure harmonisée.
              </p>

              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-[#3D1F0D] font-bold text-base hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(232,190,114,0.5)]"
                style={{ background: "linear-gradient(135deg, #E8BE72, #D4A34A)" }}
              >
                Demander un devis Pro ✦
              </a>
            </div>
          </AnimateOnScroll>

          {/* Right Column: 2x2 Grid Features */}
          <AnimateOnScroll direction="right">
            <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`bg-white/5 backdrop-blur-md rounded-3xl p-7 border border-white/10 hover:border-[#E8BE72]/40 hover:bg-white/10 transition-all duration-300 group card-hover ${
                    index === 1 || index === 3 ? "sm:translate-y-6" : ""
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8BE72]/20 to-[#D4A34A]/10 border border-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <feature.Icon size={28} weight="duotone" color="#E8BE72" />
                  </div>
                  <h3 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-white mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
