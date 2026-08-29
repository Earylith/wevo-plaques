"use client";

import React, { useState } from "react";
import { PlaqueWood } from "@/lib/types/accommodation";
import PlaquePreview from "@/components/admin/editor/PlaquePreview";

/**
 * Mises en situation de la plaque.
 *
 * Remplace l'aperçu du téléphone tant qu'on travaille sur la plaque : le
 * livret n'apprend rien ici, alors qu'un hôte veut voir l'objet posé chez lui.
 *
 * Les décors sont de VRAIES photographies d'intérieur (licence Unsplash, voir
 * `public/images/scenes/CREDITS.md`), et la plaque est le vrai aperçu — même
 * phrase, même QR, même essence. Rien n'est illustré.
 *
 * Déclaré au niveau du module : dans le corps de l'éditeur, React le
 * remonterait à chaque frappe et rechargerait le gabarit.
 */

/* ══════════════════════════════════════════════════════════════════════════
   ÉCHELLE
   La plaque doit occuper dans la photo la place qu'elle occuperait dans la
   pièce. On part donc d'un objet de dimension connue visible sur le cliché.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Largeur réelle de la plaque, en centimètres.
 *
 * Déduite du gabarit : son QR de calage occupe 17,49 % de la largeur, et il
 * mesure 6 cm. D'où 6 / 0,1749 ≈ 34,3 cm de large, et 36,8 cm de haut avec le
 * rapport du gabarit. À confirmer auprès de l'atelier.
 */
const PLAQUE_LARGEUR_CM = 34.3;
const PLAQUE_HAUTEUR_CM = PLAQUE_LARGEUR_CM * (525.37183 / 489.84466);

interface SceneDefinition {
  id: string;
  label: string;
  /** Ce que la scène permet de juger. */
  hint: string;
  image: string;
  /** Portion de la photo amenée au centre du cadre. */
  cadrage: string;
  /** Grossissement appliqué au recadrage. 1 = photo entière. */
  zoom: number;
  /**
   * Largeur de la plaque, en pourcentage de la largeur du CADRE.
   * Calculée à partir d'un repère de dimension connue dans la photo — la
   * valeur est donc une mesure, pas un réglage à l'œil.
   */
  largeur: number;
  /** Position du coin haut-gauche de la plaque, en % du cadre. */
  gauche: number;
  haut: number;
  /** Repère qui a servi à l'échelle, pour pouvoir la refaire plus tard. */
  repere: string;
}

const SCENES: SceneDefinition[] = [
  {
    id: "salon",
    label: "Salon",
    hint: "Au mur, au-dessus du canapé : là où le voyageur s’installe.",
    image: "/images/scenes/salon.jpg",
    cadrage: "50% 42%",
    zoom: 1,
    // Le canapé deux places mesure environ 180 cm et occupe 63 % de la largeur
    // du cadre : 34,3 cm y valent donc 12 %.
    largeur: 12,
    gauche: 44.2,
    haut: 17,
    repere: "canapé deux places, 180 cm",
  },
  {
    id: "entree",
    label: "Entrée",
    hint: "Près des patères, à hauteur de regard : vue dès l’arrivée.",
    image: "/images/scenes/entree.jpg",
    cadrage: "38% 62%",
    zoom: 1.18,
    // Le banc à chaussures mesure environ 90 cm et occupe 24 % de la largeur
    // du cadre recadré : 34,3 cm y valent donc 9 %.
    largeur: 9,
    gauche: 30.5,
    haut: 6,
    repere: "banc à chaussures, 90 cm",
  },
];

interface Props {
  wood: PlaqueWood;
  tagline: string;
  qrValue: string;
}

export default function PlaqueScenes({ wood, tagline, qrValue }: Props) {
  const [actif, setActif] = useState(SCENES[0].id);
  const scene = SCENES.find((s) => s.id === actif) || SCENES[0];

  return (
    <div className="w-full max-w-[660px] flex flex-col items-center gap-4">
      {/* Choix de la mise en situation */}
      <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-sm shrink-0">
        {SCENES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActif(s.id)}
            title={s.hint}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
              actif === s.id
                ? "bg-[#2A2016] text-white shadow-sm"
                : "text-[#6B5D4E] hover:text-[#2A2016]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-[#EDD9A3]/60 bg-[#EFE7DA]"
        style={{ aspectRatio: "3 / 2" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={scene.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: scene.cadrage,
            transform: `scale(${scene.zoom})`,
            transformOrigin: scene.cadrage,
          }}
        />

        {/*
          La plaque est posée par-dessus la photo : c'est le composant d'aperçu
          réel, pas une image. Son ombre reste discrète — elle doit suggérer
          l'épaisseur sans contredire l'éclairage propre à chaque cliché.
        */}
        <div
          className="absolute"
          style={{
            left: `${scene.gauche}%`,
            top: `${scene.haut}%`,
            width: `${scene.largeur}%`,
            filter:
              "drop-shadow(2px 3px 3px rgba(28,20,12,0.34)) drop-shadow(6px 11px 14px rgba(28,20,12,0.24))",
          }}
        >
          <PlaquePreview wood={wood} tagline={tagline} qrValue={qrValue} variante="nu" />
        </div>
      </div>

      <p className="text-[11px] text-[#6B5D4E] text-center leading-relaxed px-4">
        {scene.hint}
        <span className="block text-[10px] text-[#A8998A] mt-1">
          Plaque à l’échelle : {PLAQUE_LARGEUR_CM.toFixed(0)} × {PLAQUE_HAUTEUR_CM.toFixed(0)} cm,
          calée sur {scene.repere}.
        </span>
      </p>
    </div>
  );
}
