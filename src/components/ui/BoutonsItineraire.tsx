"use client";

import { NavigationArrow } from "@phosphor-icons/react";

/**
 * Ouvrir l'itinéraire vers le logement, dans l'application du voyageur.
 *
 * Trois destinations, parce qu'un seul lien suppose que tout le monde utilise
 * la même application. Waze est très répandu en France, et Plans est
 * l'application par défaut sur iPhone : un voyageur qui n'a pas Google Maps
 * installé se retrouvait devant une page web au lieu de son GPS — au volant,
 * avec des valises, ce n'est pas un détail.
 *
 * Posés SOUS la carte, et non par-dessus. La carte affichée EST déjà Google
 * Maps : un bouton « Google Maps » posé dessus faisait doublon, et masquait
 * précisément ce qu'on venait regarder.
 *
 * Discrets à dessein : ce sont des raccourcis, pas l'objet de la section. Des
 * pastilles pleines et colorées auraient attiré l'œil plus que la carte
 * elle-même.
 *
 * Les trois services acceptent une adresse en clair : pas de géocodage
 * préalable, donc aucun risque d'envoyer quelqu'un au mauvais endroit parce
 * qu'un point aurait été mal placé.
 */

export default function BoutonsItineraire({
  adresse,
  couleur,
}: {
  adresse: string;
  /** Teinte du livret, portée par l'icône seule. */
  couleur: string;
}) {
  const propre = (adresse || "").trim();
  if (!propre) return null;

  const encodee = encodeURIComponent(propre);

  const DESTINATIONS = [
    {
      nom: "Google Maps",
      href: `https://www.google.com/maps/dir/?api=1&destination=${encodee}`,
    },
    {
      /*
       * `navigate=yes` lance la navigation plutôt que d'ouvrir une fiche : le
       * voyageur est en voiture, pas en train de consulter.
       */
      nom: "Waze",
      href: `https://waze.com/ul?q=${encodee}&navigate=yes`,
    },
    {
      /*
       * `maps.apple.com` ouvre Plans sur iPhone et Mac, et retombe sur une
       * page web ailleurs — le lien ne casse donc jamais.
       */
      nom: "Plans",
      href: `https://maps.apple.com/?daddr=${encodee}&dirflg=d`,
    },
  ];

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A8998A]">
        Itinéraire
      </span>
      {DESTINATIONS.map((d) => (
        <a
          key={d.nom}
          href={d.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.09] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2A2016] transition-colors hover:border-black/25"
        >
          <NavigationArrow size={12} weight="fill" style={{ color: couleur }} />
          {d.nom}
        </a>
      ))}
    </div>
  );
}
