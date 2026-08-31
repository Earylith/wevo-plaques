"use client";

import { useEffect } from "react";
import { X } from "@phosphor-icons/react";

/**
 * L'aperçu, en vrai.
 *
 * Un cadre de 320 px posé dans une page d'édition ne dit pas ce que verra le
 * voyageur : les gabarits se mettent en page d'après la largeur de leur
 * CONTENEUR, et ce conteneur-là n'est pas un téléphone. En occupant tout
 * l'écran, l'aperçu retrouve la largeur réelle de l'appareil — sur un
 * téléphone, ce qui s'affiche est alors exactement la page publiée, et elle
 * se parcourt au doigt comme le fera le voyageur.
 *
 * L'aperçu y est volontairement NON éditable : on vient regarder, pas
 * corriger. Une zone qui ouvrirait un formulaire d'édition empêcherait de
 * naviguer, et c'est justement la navigation qu'on veut éprouver.
 */
export default function ApercuPleinEcran({
  ouvert,
  onFermer,
  children,
}: {
  ouvert: boolean;
  onFermer: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!ouvert) return;

    // Le corps de page ne doit pas défiler derrière l'aperçu : sur téléphone,
    // les deux défilements se disputeraient le geste.
    const defilementInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    document.addEventListener("keydown", surTouche);

    return () => {
      document.body.style.overflow = defilementInitial;
      document.removeEventListener("keydown", surTouche);
    };
  }, [ouvert, onFermer]);

  if (!ouvert) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu plein écran de votre livret"
      className="fixed inset-0 z-[120] bg-[#FBF5EC]"
    >
      {/* Le gabarit occupe tout l'écran et défile seul. */}
      <div className="h-full w-full overflow-y-auto overscroll-contain">{children}</div>

      {/*
       * Le bouton de sortie flotte au-dessus du contenu, décalé sous
       * l'encoche : sans cette marge, il passerait sous la barre d'état des
       * téléphones récents et deviendrait inatteignable.
       *
       * Son empilement doit dépasser celui des gabarits, dont l'en-tête est
       * collant et monte jusqu'à `z-50` : en dessous, le bouton existe mais
       * disparaît derrière lui — et on ne sait plus comment ressortir.
       */}
      <button
        type="button"
        onClick={onFermer}
        aria-label="Quitter l’aperçu"
        className="fixed right-4 z-[200] flex items-center gap-1.5 rounded-full bg-[#2A2016]/92 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)] ring-1 ring-white/20 backdrop-blur-sm transition-transform active:scale-95"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
      >
        <X size={14} weight="bold" />
        Quitter l’aperçu
      </button>
    </div>
  );
}
