"use client";

import { WifiX, ChatTeardropDots, ArrowsClockwise, SealWarning } from "@phosphor-icons/react";
import AnimateOnScroll from "./AnimateOnScroll";

const problems = [
  {
    Icon: WifiX,
    title: "Le code wifi toujours demandé",
    description:
      "Vos voyageurs retrouvent le réseau et le mot de passe dès leur arrivée.",
    accent: { bg: "bg-[#F7EBE4]", icon: "#C4714A", border: "border-[#C4714A]/15" },
  },
  {
    Icon: ChatTeardropDots,
    title: "Les messages répétés",
    description:
      "Centralisez les consignes une bonne fois pour toutes, au lieu de les renvoyer à chaque séjour.",
    accent: { bg: "bg-[#EBF0E6]", icon: "#5A7A4E", border: "border-[#5A7A4E]/15" },
  },
  {
    Icon: ArrowsClockwise,
    title: "Des infos qui changent",
    description:
      "Codes, horaires, contacts, bonnes adresses : mettez à jour les informations sans refaire le support.",
    accent: { bg: "bg-[#FDF3DC]", icon: "#D4A34A", border: "border-[#D4A34A]/15" },
  },
  {
    Icon: SealWarning,
    title: "Un accueil peu soigné",
    description:
      "Remplacez les feuilles volantes et classeurs vieillissants par un support élégant et une page claire.",
    accent: { bg: "bg-[#EBF0E6]", icon: "#5A7A4E", border: "border-[#5A7A4E]/15" },
  },
];

export default function ProblemSection() {
  return (
    <section
      className="py-20 lg:py-28 bg-[#FBF5EC] relative overflow-hidden"
      id="concept"
    >
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C4714A]/6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#5A7A4E]/6 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-label mb-5 inline-flex">Le constat</span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2A2016] leading-tight mt-5">
              Les mêmes questions{" "}
              <em className="not-italic text-gradient-terra">reviennent à chaque séjour</em>
            </h2>
            <p className="mt-5 text-lg text-[#6B5D4E] leading-relaxed">
              Wifi, horaires, consignes, bonnes adresses… vos voyageurs cherchent souvent les mêmes informations. Votre support d&apos;accueil connecté les regroupe en un seul scan.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {problems.map((problem, index) => (
            <AnimateOnScroll key={problem.title} delay={index * 0.1}>
              <div
                className={`group relative bg-white rounded-3xl p-7 border ${problem.accent.border} card-hover h-full shadow-sm`}
              >
                {/* Background number */}
                <span className="absolute top-4 right-5 text-6xl font-bold font-[family-name:var(--font-display)] text-[#F5E6C8] select-none leading-none pointer-events-none">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${problem.accent.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <problem.Icon
                    size={28}
                    weight="duotone"
                    color={problem.accent.icon}
                  />
                </div>

                <h3 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-[#2A2016] mb-2">
                  {problem.title}
                </h3>
                <p className="text-sm text-[#6B5D4E] leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
