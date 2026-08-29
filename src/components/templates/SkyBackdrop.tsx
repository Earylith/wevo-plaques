"use client";

import React from "react";
import type { DayPhase } from "@/lib/livret";

/**
 * Décor de la carte « Heure sur place ».
 *
 * Tout est dessiné en SVG et animé en CSS : aucune image à charger, le rendu
 * reste net à toutes les tailles et suit la couleur du ciel réel — l'hôte voit
 * la nuit quand il fait nuit chez lui, la pluie quand il pleut.
 *
 * Deux entrées seulement : la phase du jour sur place et le code WMO renvoyé
 * par Open-Meteo. Sans relevé météo, on affiche le ciel de la bonne phase.
 */

export type SkyCondition = "clear" | "clouds" | "overcast" | "fog" | "rain" | "snow" | "storm";

/** Traduit un code WMO en famille visuelle. */
export function conditionFromCode(code: number | undefined): SkyCondition {
  if (code === undefined) return "clear";
  if (code === 0) return "clear";
  if (code === 1 || code === 2) return "clouds";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "fog";
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  return "clouds";
}

/* Dégradés du ciel : la teinte vient de l'heure, jamais de la météo — un ciel
   couvert reste bleu le jour et sombre la nuit. La météo n'ajoute que du voile. */
const SKY: Record<DayPhase, string> = {
  night: "linear-gradient(165deg, #070E22 0%, #101B3C 45%, #1B2A55 100%)",
  dawn: "linear-gradient(165deg, #1B2450 0%, #6B4A78 55%, #E0885F 100%)",
  day: "linear-gradient(165deg, #1E5FA8 0%, #3E86CC 50%, #7FB6E4 100%)",
  dusk: "linear-gradient(165deg, #131C42 0%, #5B3E72 50%, #C86B4E 100%)",
};

/** Voile sombre : garantit la lisibilité du texte blanc par-dessus le décor. */
const SCRIM: Record<DayPhase, string> = {
  night: "linear-gradient(180deg, rgba(5,10,26,0.30) 0%, rgba(5,10,26,0.62) 100%)",
  dawn: "linear-gradient(180deg, rgba(10,14,34,0.42) 0%, rgba(10,14,34,0.70) 100%)",
  day: "linear-gradient(180deg, rgba(8,26,54,0.42) 0%, rgba(8,26,54,0.68) 100%)",
  dusk: "linear-gradient(180deg, rgba(8,12,32,0.40) 0%, rgba(8,12,32,0.70) 100%)",
};

/* Positions fixes : un rendu identique à chaque affichage, et surtout aucun
   Math.random() qui casserait l'hydratation entre serveur et navigateur. */
const STARS = [
  { x: 8, y: 14, r: 1.1, d: 0 }, { x: 19, y: 30, r: 0.8, d: 1.4 },
  { x: 27, y: 9, r: 1.3, d: 2.6 }, { x: 38, y: 22, r: 0.7, d: 0.7 },
  { x: 46, y: 12, r: 1.0, d: 3.2 }, { x: 57, y: 27, r: 0.9, d: 1.9 },
  { x: 64, y: 8, r: 1.2, d: 2.2 }, { x: 73, y: 20, r: 0.8, d: 0.4 },
  { x: 84, y: 12, r: 1.1, d: 2.9 }, { x: 92, y: 26, r: 0.7, d: 1.1 },
  { x: 14, y: 42, r: 0.7, d: 3.6 }, { x: 51, y: 40, r: 0.8, d: 2.0 },
];

const RAINDROPS = Array.from({ length: 16 }, (_, i) => ({
  x: 5 + i * 6,
  delay: (i % 7) * 0.17,
  duration: 0.75 + (i % 4) * 0.14,
}));

const SNOWFLAKES = Array.from({ length: 14 }, (_, i) => ({
  x: 5 + i * 7,
  delay: (i % 6) * 0.6,
  duration: 4.5 + (i % 5) * 0.9,
  r: i % 3 === 0 ? 2 : 1.5,
}));

interface SkyBackdropProps {
  phase: DayPhase;
  condition: SkyCondition;
  /** Désactive les animations (aperçu figé, préférence utilisateur). */
  still?: boolean;
}

function Cloud({ x, y, scale, opacity, drift, delay }: {
  x: number; y: number; scale: number; opacity: number; drift?: string; delay?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      opacity={opacity}
      style={drift ? { animation: `${drift} linear infinite`, animationDelay: `${delay ?? 0}s` } : undefined}
    >
      <ellipse cx="0" cy="6" rx="26" ry="9" fill="#FFFFFF" />
      <ellipse cx="-13" cy="3" rx="13" ry="10" fill="#FFFFFF" />
      <ellipse cx="6" cy="0" rx="16" ry="13" fill="#FFFFFF" />
      <ellipse cx="20" cy="4" rx="12" ry="9" fill="#FFFFFF" />
    </g>
  );
}

export default function SkyBackdrop({ phase, condition, still = false }: SkyBackdropProps) {
  const isNight = phase === "night";
  const showStars = isNight && (condition === "clear" || condition === "clouds");
  const showSun = !isNight && (condition === "clear" || condition === "clouds");
  const showMoon = isNight && (condition === "clear" || condition === "clouds");
  const heavy = condition === "overcast" || condition === "rain" || condition === "storm" || condition === "snow";

  const anim = (name: string) => (still ? undefined : name);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Ciel */}
      <div className="absolute inset-0" style={{ background: SKY[phase] }} />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="sky-sun" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFF7D6" />
            <stop offset="55%" stopColor="#FFD264" />
            <stop offset="100%" stopColor="#FFB03A" />
          </radialGradient>
          <radialGradient id="sky-sun-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFDD85" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFDD85" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sky-moon-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#D8E4FF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#D8E4FF" stopOpacity="0" />
          </radialGradient>
          {/* La lune se creuse par soustraction plutôt que par superposition :
              le croissant reste net quel que soit le fond. */}
          <mask id="sky-moon-mask">
            <rect x="0" y="0" width="100" height="60" fill="black" />
            <circle cx="79" cy="15" r="8" fill="white" />
            <circle cx="74.5" cy="11.5" r="7" fill="black" />
          </mask>
        </defs>

        {showStars && (
          <g>
            {STARS.map((star, i) => (
              <circle
                key={i}
                cx={star.x}
                cy={star.y}
                r={star.r}
                fill="#FFFFFF"
                opacity="0.85"
                style={still ? undefined : { animation: `skyTwinkle 3.4s ease-in-out ${star.d}s infinite` }}
              />
            ))}
          </g>
        )}

        {showSun && (
          <g>
            <circle cx="79" cy="15" r="20" fill="url(#sky-sun-glow)" />
            <circle
              cx="79"
              cy="15"
              r="8.5"
              fill="url(#sky-sun)"
              style={still ? undefined : { animation: "skyPulse 5s ease-in-out infinite", transformOrigin: "79px 15px" }}
            />
          </g>
        )}

        {showMoon && (
          <g>
            <circle cx="79" cy="15" r="18" fill="url(#sky-moon-glow)" />
            <rect x="0" y="0" width="100" height="60" fill="#EEF3FF" mask="url(#sky-moon-mask)" />
          </g>
        )}

        {/* Nuages : discrets quand il fait beau, denses et bas quand ça se couvre. */}
        {condition === "clouds" && (
          <>
            <Cloud x={22} y={16} scale={0.5} opacity={0.5} drift={anim("skyDriftSlow 46s")} />
            <Cloud x={68} y={26} scale={0.34} opacity={0.35} drift={anim("skyDrift 34s")} delay={-8} />
          </>
        )}

        {heavy && (
          <>
            <Cloud x={26} y={14} scale={0.72} opacity={condition === "storm" ? 0.55 : 0.7} drift={anim("skyDriftSlow 52s")} />
            <Cloud x={70} y={20} scale={0.58} opacity={condition === "storm" ? 0.45 : 0.6} drift={anim("skyDrift 40s")} delay={-12} />
            <Cloud x={48} y={26} scale={0.46} opacity={0.4} drift={anim("skyDriftSlow 60s")} delay={-22} />
          </>
        )}

        {condition === "fog" && (
          <g opacity="0.5">
            {[18, 27, 36, 45].map((y, i) => (
              <rect
                key={y}
                x="-30"
                y={y}
                width="160"
                height="4"
                rx="2"
                fill="#FFFFFF"
                opacity={0.22 - i * 0.03}
                style={still ? undefined : { animation: `skyDrift ${28 + i * 7}s linear infinite`, animationDelay: `${-i * 5}s` }}
              />
            ))}
          </g>
        )}

        {(condition === "rain" || condition === "storm") && (
          <g>
            {RAINDROPS.map((drop, i) => (
              <line
                key={i}
                x1={drop.x}
                y1="30"
                x2={drop.x - 1.6}
                y2="36"
                stroke="#CFE2FF"
                strokeWidth="0.5"
                strokeLinecap="round"
                opacity="0.55"
                style={still ? undefined : {
                  animation: `skyRain ${drop.duration}s linear ${drop.delay}s infinite`,
                }}
              />
            ))}
          </g>
        )}

        {condition === "snow" && (
          <g>
            {SNOWFLAKES.map((flake, i) => (
              <circle
                key={i}
                cx={flake.x}
                cy="28"
                r={flake.r * 0.6}
                fill="#FFFFFF"
                opacity="0.75"
                style={still ? undefined : {
                  animation: `skySnow ${flake.duration}s linear ${flake.delay}s infinite`,
                }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* Éclair : un flash bref et espacé, jamais stroboscopique. */}
      {condition === "storm" && !still && (
        <div className="absolute inset-0 bg-white/70 opacity-0 animate-skyFlash pointer-events-none" />
      )}

      {/* Voile de lisibilité */}
      <div className="absolute inset-0" style={{ background: SCRIM[phase] }} />
    </div>
  );
}
