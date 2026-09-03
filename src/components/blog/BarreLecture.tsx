"use client";

import { useEffect, useState } from "react";

/**
 * Le filet de progression, en haut de l'écran.
 *
 * Il répond à une question que se pose tout lecteur d'un article long :
 * « combien il en reste ? ». Posé sous l'en-tête fixe, il ne prend aucune
 * place et disparaît visuellement dès qu'on ne le cherche pas.
 */
export default function BarreLecture({ accent }: { accent: string }) {
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    let enAttente = false;

    const calculer = () => {
      if (enAttente) return;
      enAttente = true;

      requestAnimationFrame(() => {
        enAttente = false;
        const hauteur =
          document.documentElement.scrollHeight - window.innerHeight;
        // Une page plus courte que l'écran n'a rien à mesurer : sans ce
        // garde-fou, la division donnerait l'infini et la barre serait
        // pleine dès l'ouverture.
        setProgression(hauteur <= 0 ? 0 : (window.scrollY / hauteur) * 100);
      });
    };

    calculer();
    window.addEventListener("scroll", calculer, { passive: true });
    window.addEventListener("resize", calculer);
    return () => {
      window.removeEventListener("scroll", calculer);
      window.removeEventListener("resize", calculer);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[3px] w-full bg-transparent"
      aria-hidden
    >
      <div
        className="h-full origin-left transition-[width] duration-150 ease-out"
        style={{ width: `${progression}%`, background: accent }}
      />
    </div>
  );
}
