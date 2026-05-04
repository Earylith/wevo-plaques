"use client";

import { Star, Quotes } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import AnimateOnScroll from "./AnimateOnScroll";

const featured = {
  quote:
    "Mes voyageurs me remercient dès l'arrivée. Zéro message pour le wifi depuis l'installation — et mes avis Airbnb ont franchement progressé. La plaque est un vrai objet de décoration en plus.",
  name: "Marie Dumont",
  role: "Hôte Airbnb Superhost",
  location: "Villa en Provence · 3 logements",
  initials: "MD",
  gradient: "from-[#C4714A] to-[#A35A38]",
  rating: 5,
};

const testimonials = [
  {
    quote:
      "J'avais peur que ce soit compliqué à mettre en place. Tout était prêt à l'emploi, j'ai juste posé la plaque. Vraiment bluffant.",
    name: "Thomas R.",
    role: "Propriétaire",
    location: "Appartement à Bordeaux",
    initials: "TR",
    gradient: "from-[#5A7A4E] to-[#3F5836]",
    rating: 5,
  },
  {
    quote:
      "On gère 4 gîtes, l'offre Pro nous a sauvé la vie. Une page par hébergement, un design cohérent, et tout se modifie en 2 minutes depuis le téléphone.",
    name: "Sophie & Marc",
    role: "Propriétaires",
    location: "Gîtes en Ardèche",
    initials: "SM",
    gradient: "from-[#D4A34A] to-[#A37830]",
    rating: 5,
  },
  {
    quote:
      "En tant que conciergerie, on voulait quelque chose de scalable et professionnel. La plaque en bois, c'est le petit détail qui fait toute la différence aux yeux des voyageurs.",
    name: "Julien Karimi",
    role: "Conciergerie",
    location: "12 logements — Île-de-France",
    initials: "JK",
    gradient: "from-[#2B5F75] to-[#1A3F52]",
    rating: 5,
  },
];

function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} weight="fill" color="#D4A34A" />
      ))}
    </div>
  );
}

function Avatar({
  initials,
  gradient,
  size = "lg",
}: {
  initials: string;
  gradient: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "w-14 h-14 text-base" : "w-11 h-11 text-sm";
  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-md`}
    >
      <span className="font-[family-name:var(--font-display)] font-bold text-white tracking-wide">
        {initials}
      </span>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      className="py-20 lg:py-32 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #FBF5EC 0%, #F0E8D6 50%, #FBF5EC 100%)",
      }}
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C4714A]/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#5A7A4E]/6 blur-3xl pointer-events-none" />
      <svg
        viewBox="0 0 200 300"
        className="absolute left-8 top-1/3 w-28 h-44 text-[#5A7A4E]/8 pointer-events-none"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>
      <svg
        viewBox="0 0 200 300"
        className="absolute right-8 bottom-1/3 w-20 h-32 text-[#C4714A]/8 pointer-events-none rotate-180"
        fill="currentColor"
      >
        <path d="M180,10 C80,20 20,120 100,290 C120,230 200,150 180,10Z" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-label section-label-terra mb-5 inline-flex">
              Ils nous font confiance
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A2016] leading-tight mt-5">
              Ce qu&apos;en disent{" "}
              <em className="not-italic text-gradient-terra">nos hôtes</em>
            </h2>
          </div>
        </AnimateOnScroll>

        {/* ── Featured testimonial ── */}
        <AnimateOnScroll delay={0.1}>
          <div className="relative bg-white rounded-[2rem] p-8 lg:p-12 shadow-xl border border-[#EDD9A3]/40 mb-6 overflow-hidden max-w-4xl mx-auto">
            {/* Giant decorative quote */}
            <div
              className="absolute -top-4 -left-2 font-[family-name:var(--font-display)] text-[14rem] leading-none text-[#C4714A]/8 select-none pointer-events-none"
              aria-hidden
            >
              "
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[2rem] bg-gradient-to-r from-[#C4714A] via-[#D4A34A] to-[#5A7A4E]" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Quote */}
              <div className="flex-1">
                <div className="mb-5">
                  <StarRating count={featured.rating} />
                </div>
                <blockquote className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-medium text-[#2A2016] leading-snug italic">
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
              </div>

              {/* Author */}
              <div className="lg:w-52 flex lg:flex-col items-center lg:items-center gap-4 lg:gap-3 lg:text-center shrink-0">
                <Avatar initials={featured.initials} gradient={featured.gradient} size="lg" />
                <div>
                  <p className="font-semibold text-[#2A2016] text-sm">{featured.name}</p>
                  <p className="text-xs text-[#C4714A] font-medium mt-0.5">{featured.role}</p>
                  <p className="text-xs text-[#6B5D4E] mt-1">{featured.location}</p>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* ── 3 cards ── */}
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <AnimateOnScroll key={t.name} delay={0.1 + i * 0.12}>
              <div className="relative bg-white rounded-3xl p-6 shadow-md border border-[#EDD9A3]/40 h-full flex flex-col card-hover overflow-hidden group">
                {/* Left accent bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-3xl bg-gradient-to-b ${t.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
                />

                <div className="pl-2">
                  {/* Stars */}
                  <div className="mb-4">
                    <StarRating count={t.rating} />
                  </div>

                  {/* Decorative small quote icon */}
                  <Quotes
                    size={22}
                    weight="fill"
                    className="text-[#EDD9A3] mb-3"
                  />

                  {/* Quote */}
                  <blockquote className="text-sm text-[#2A2016] leading-relaxed flex-1 mb-5 font-[family-name:var(--font-serif)] italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-[#EDD9A3]/40 mt-auto">
                    <Avatar initials={t.initials} gradient={t.gradient} size="sm" />
                    <div>
                      <p className="font-semibold text-xs text-[#2A2016]">{t.name}</p>
                      <p className="text-[10px] text-[#6B5D4E] mt-0.5">{t.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Bottom social proof bar */}
        <AnimateOnScroll delay={0.4}>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            {[
              { value: "200+", label: "hôtes satisfaits" },
              { value: "4.9/5", label: "note moyenne" },
              { value: "98%", label: "recommandent" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#C4714A]">
                  {stat.value}
                </span>
                <span className="text-xs text-[#6B5D4E] tracking-wide uppercase font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
