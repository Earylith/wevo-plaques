"use client";

import { useEffect, useState } from "react";

/**
 * Le sommaire latéral, avec suivi de la lecture.
 *
 * Deux choses s'y jouent. Le repérage d'abord : un article long sans plan
 * visible se referme. La reprise ensuite — beaucoup de lecteurs arrivent
 * par un moteur de recherche sur une question précise et veulent sauter
 * directement à la section qui les concerne.
 *
 * La section active est déterminée à la main plutôt que par un
 * `IntersectionObserver` : avec un en-tête fixe et des sections de tailles
 * très inégales, l'observateur désigne régulièrement une section déjà
 * dépassée. Un simple relevé de position, limité à une image par cadre,
 * donne un résultat plus juste pour un coût comparable.
 */
export default function SommaireArticle({
  sections,
  accent,
}: {
  sections: { id: string; texte: string }[];
  accent: string;
}) {
  const [actif, setActif] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) return;
    let enAttente = false;

    const relever = () => {
      if (enAttente) return;
      enAttente = true;

      requestAnimationFrame(() => {
        enAttente = false;
        // La ligne de lecture est placée au tiers supérieur de l'écran :
        // c'est là que se trouve le texte qu'on est en train de lire, pas
        // tout en haut de la fenêtre.
        const ligne = window.innerHeight * 0.3;
        let courant = sections[0].id;

        for (const section of sections) {
          const element = document.getElementById(section.id);
          if (!element) continue;
          if (element.getBoundingClientRect().top <= ligne) courant = section.id;
        }

        setActif(courant);
      });
    };

    relever();
    window.addEventListener("scroll", relever, { passive: true });
    window.addEventListener("resize", relever);
    return () => {
      window.removeEventListener("scroll", relever);
      window.removeEventListener("resize", relever);
    };
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav aria-label="Sommaire de l’article" className="text-[13.5px]">
      <p className="mb-4 text-[11px] font-bold tracking-[0.18em] text-[#6B5D4E]/70 uppercase">
        Dans cet article
      </p>
      <ul className="space-y-0.5 border-l border-[#EDD9A3]">
        {sections.map((section) => {
          const estActif = section.id === actif;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="-ml-px block border-l-2 py-1.5 pl-4 leading-[1.45] transition-colors"
                style={{
                  borderColor: estActif ? accent : "transparent",
                  color: estActif ? accent : "#6B5D4E",
                  fontWeight: estActif ? 600 : 400,
                }}
              >
                {section.texte}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
