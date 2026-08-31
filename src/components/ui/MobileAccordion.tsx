"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

/**
 * Bloc repliable sur petit écran, déplié sur grand.
 *
 * La bascule se fait en CSS, sur la largeur du CONTENEUR — pas en JavaScript
 * sur celle de la fenêtre. La version précédente lisait `window.innerWidth` :
 * dans l'aperçu de l'éditeur, le cadre fait 350 px mais la fenêtre 1500, si
 * bien que le bloc se croyait sur un grand écran et perdait son cartouche.
 * Le contenu se retrouvait nu, collé au bloc suivant.
 *
 * Au-delà de `@5xl` (1024 px de conteneur), le bouton disparaît et le contenu
 * reste ouvert : c'est la mise en page de bureau, sans dépendre d'un état.
 */

interface MobileAccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function MobileAccordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: MobileAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/30 mb-6 @5xl:mb-0 @5xl:p-0 @5xl:bg-transparent @5xl:border-0 @5xl:shadow-none @5xl:rounded-none">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between text-left @5xl:hidden"
      >
        <span className="flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-[#FDF5E6] flex items-center justify-center shrink-0 text-[#C4714A]">
            {icon}
          </span>
          <span className="font-semibold text-[#2A2016] text-lg">{title}</span>
        </span>
        <CaretDown
          size={20}
          className={`text-[#6B5D4E] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/*
        Masqué par une classe et non retiré du DOM : au-delà de `@5xl`, le
        contenu doit réapparaître sans dépendre de l'état du bouton, que le
        visiteur n'a jamais vu sur grand écran.
      */}
      <div
        className={`mt-6 pt-6 border-t border-[#EDD9A3]/30 @5xl:mt-0 @5xl:pt-0 @5xl:border-0 @5xl:block ${
          isOpen ? "block" : "hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
