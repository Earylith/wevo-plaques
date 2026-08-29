"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PlaqueWood } from "@/lib/types/accommodation";

/**
 * Aperçu de la plaque, construit à partir du gabarit vectoriel réel.
 *
 * On n'affiche pas une photo : on charge le SVG de gravure lui-même et on le
 * réhabille. Ce qui est montré à l'hôte est donc bien la plaque qui sera
 * produite, et non une illustration qui pourrait s'en écarter.
 *
 * Trois transformations, toutes réversibles côté fichier de gravure :
 *  1. le corps de la plaque (aplat orange du gabarit) reçoit la texture du
 *     bois choisi ;
 *  2. les tracés gravés passent au brun brûlé ;
 *  3. la phrase du bas prend le texte de l'hôte, et le QR de calage cède la
 *     place au vrai QR du livret.
 *
 * Déclaré au niveau du module : dans le corps de l'éditeur, React le
 * remonterait à chaque frappe et rechargerait le gabarit.
 */

const GABARIT = "/images/plaques/plaque-base.svg";

/**
 * Couleur du NON-GRAVÉ dans le gabarit.
 *
 * Elle ne désigne pas seulement le corps de la plaque : le gabarit s'en sert
 * partout où le bois doit rester nu, y compris pour les modules clairs du QR.
 * On la rend donc transparente, et c'est la silhouette de la plaque, seule,
 * qui porte la texture du bois — sinon le motif se redessine dans le repère
 * de chaque élément et le veinage part en morceaux.
 */
const COULEUR_NON_GRAVE = /#ff7f2a/gi;

/** Silhouette de la plaque : le seul tracé qui reçoit la texture du bois. */
const CORPS = "path6";

/**
 * QR de calage du gabarit, remplacé par le vrai code du livret.
 *
 * Seuls ses modules disparaissent : le cadre qui les entoure et les mentions
 * « SCANNEZ-MOI » sont gravés, ils restent.
 */
const QR_GABARIT = ["g39"];

/** Bloc de texte du gabarit, remplacé par la surcouche de la phrase. */
const TEXTE = "text4";

/** Teinte des tracés gravés. */
const BRUN_GRAVE = "#2e150b";

/**
 * Texture de chaque essence proposée.
 *
 * Volontairement PARTIEL : seul le noyer est proposé pour l'instant. Un livret
 * enregistré avec une essence retirée retombe sur `TEXTURE_PAR_DEFAUT`, sinon
 * l'aperçu s'afficherait sans bois.
 */
const TEXTURES: Partial<Record<PlaqueWood, string>> = {
  noyer: "/images/plaques/bois-noyer.png",
};

const TEXTURE_PAR_DEFAUT = TEXTURES.noyer as string;

/**
 * Emplacement du QR dans le gabarit, mesuré sur `path39` (le QR de calage).
 * En pourcentages du cadre : l'aperçu reste juste à n'importe quelle taille.
 */
const QR = { gauche: 30.6, haut: 59.6, largeur: 17 };

/** Rapport hauteur/largeur du gabarit (viewBox 489.84 × 525.37). */
const RATIO = 525.37183 / 489.84466;

/**
 * Position de la phrase gravée : hauteur du centre de son bloc dans le
 * gabarit. En pourcentage du cadre, donc juste à n'importe quelle taille.
 */
const PHRASE = { centreY: 89.9 };

/**
 * Taille de la phrase, en pourcentage de la LARGEUR du cadre (unité `cqw`).
 *
 * Relevée sur le gabarit lui-même, rendu avec BELLABOO : sa phrase d'origine
 * y occupe 56,9 % de la largeur de la plaque. L'aperçu reproduit donc la
 * taille de gravure voulue par le graphiste, au lieu d'une valeur choisie à
 * l'œil. Exprimée en unité de conteneur, elle suit le cadre sans calcul.
 */
const TAILLE_PHRASE = 5.48;

/**
 * Largeur que la phrase ne doit pas dépasser, en part de celle du cadre.
 *
 * La plaque se rétrécit vers le bas : au-delà, la phrase mord sur la découpe.
 * On compte volontairement moins que la largeur du bois à cette hauteur, pour
 * garder une marge de gravure.
 */
const LARGEUR_UTILE = 0.72;

interface Props {
  wood: PlaqueWood;
  /** Phrase gravée au bas de la plaque. */
  tagline: string;
  /** Adresse encodée dans le QR. */
  qrValue: string;
  /**
   * `cadre` : encadré, sur fond crème — dans le formulaire.
   * `nu` : plaque seule, fond transparent — posée dans une mise en situation,
   * où un rectangle crème derrière la découpe trahirait le montage.
   */
  variante?: "cadre" | "nu";
}

export default function PlaquePreview({ wood, tagline, qrValue, variante = "cadre" }: Props) {
  const cadreRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLDivElement>(null);
  const [gabarit, setGabarit] = useState<string | null>(null);
  const [erreur, setErreur] = useState(false);
  /** Facteur de réduction appliqué à la phrase pour qu'elle tienne. */
  const [echelle, setEchelle] = useState(1);

  useEffect(() => {
    let annule = false;
    fetch(GABARIT)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((texte) => {
        if (annule) return;
        setGabarit(texte);
      })
      .catch((e) => {
        console.error("Chargement du gabarit de plaque", e);
        if (!annule) setErreur(true);
      });
    return () => {
      annule = true;
    };
  }, []);


  const svg = useMemo(() => {
    if (!gabarit) return null;
    let s = gabarit;

    // Le gabarit sort d'Inkscape en SVG 1.1 ; `href` seul est compris partout
    // aujourd'hui et évite toute question d'espace de noms à l'insertion.
    s = s.replace(/xlink:href=/g, "href=");

    // Le corps de la plaque reçoit la texture du bois.
    s = s.replace(
      "<defs",
      `<defs id="guidz-defs"><pattern id="guidz-bois" patternUnits="userSpaceOnUse" x="0" y="0" width="489.84466" height="525.37183"><image href="${TEXTURES[wood] || TEXTURE_PAR_DEFAUT}" x="0" y="0" width="489.84466" height="525.37183" preserveAspectRatio="xMidYMid slice"/></pattern></defs><defs`
    );
    s = s.replace(COULEUR_NON_GRAVE, "transparent");

    // Les marques noires du gabarit deviennent des marques de brûlure.
    s = s.replace(/#000000/gi, BRUN_GRAVE);

    /*
     * Feuille de style injectée.
     *
     *  - la silhouette reçoit la texture du bois ;
     *  - le QR de calage s'efface au profit du vrai code, superposé ;
     *  - le bloc de texte du gabarit s'efface au profit de la surcouche, qui
     *    se centre et se dimensionne sans qu'on ait à toucher au SVG.
     */
    s = s.replace(
      "<defs",
      `<style>
        /* Le gabarit porte ses réglages dans des attributs style :
           sans !important, aucune de ces règles ne s'appliquerait. */
        #${CORPS} { fill: url(#guidz-bois) !important; }
        ${QR_GABARIT.map((id) => "#" + id).join(", ")}, #${TEXTE} { display: none !important; }
      </style><defs`
    );

    // Le gabarit se dimensionne en millimètres : on le laisse remplir le cadre.
    s = s.replace(/<svg\b/, '<svg preserveAspectRatio="xMidYMid meet"');
    s = s.replace(/\swidth="489\.84467mm"/, ' width="100%"');
    s = s.replace(/\sheight="525\.37183mm"/, ' height="100%"');

    return s;
  }, [gabarit, wood]);

  /*
   * Réduction de la phrase pour qu'elle tienne dans la plaque.
   *
   * On MESURE la largeur rendue au lieu de la déduire du nombre de
   * caractères : BELLABOO a des glyphes de largeurs très inégales, et une
   * phrase courte en capitales peut dépasser une phrase longue en bas de
   * casse. Seul le rendu réel fait foi.
   *
   * La mesure se prend sur `offsetWidth`, qui ignore les transformations :
   * réduire la phrase ne change donc pas ce qu'on mesure, et le calcul ne
   * peut pas s'emballer. Elle n'a lieu que dans les rappels de
   * l'observateur et du chargement des polices, jamais pendant le rendu.
   */
  useEffect(() => {
    const phrase = phraseRef.current;
    const cadre = cadreRef.current;
    if (!phrase || !cadre) return;

    const mesurer = () => {
      const largeurCadre = cadre.getBoundingClientRect().width;
      const largeurPhrase = phrase.offsetWidth;
      if (!largeurCadre || !largeurPhrase) return;
      const voulue = Math.min(1, (largeurCadre * LARGEUR_UTILE) / largeurPhrase);
      setEchelle((actuelle) => (Math.abs(actuelle - voulue) < 0.002 ? actuelle : voulue));
    };

    // L'observateur rend son premier compte-rendu dès l'observation : il
    // couvre donc aussi bien la mesure initiale que les redimensionnements
    // du panneau d'édition.
    const observateur = new ResizeObserver(mesurer);
    observateur.observe(cadre);
    observateur.observe(phrase);

    // Les largeurs changent quand BELLABOO finit de charger.
    let annule = false;
    document.fonts?.ready.then(() => { if (!annule) mesurer(); }).catch(() => {});

    return () => {
      annule = true;
      observateur.disconnect();
    };
  }, [tagline, svg]);

  if (erreur) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[11px] text-amber-800">
        Le gabarit de plaque n’a pas pu être chargé. L’aperçu est momentanément
        indisponible ; votre configuration reste enregistrée.
      </div>
    );
  }

  return (
    <div
      ref={cadreRef}
      className={`relative w-full ${
        variante === "cadre"
          ? "rounded-2xl overflow-hidden border border-[#EDD9A3]/60 bg-[#FBF5EC]"
          : ""
      }`}
      style={{ aspectRatio: `${1 / RATIO}`, containerType: "inline-size" }}
    >
      {svg ? (
        <>
          <div
            className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full"
            // Le gabarit vient de nos propres fichiers, jamais d'une saisie.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div
            className="absolute"
            style={{ left: `${QR.gauche}%`, top: `${QR.haut}%`, width: `${QR.largeur}%` }}
          >
            <QRCodeSVG
              value={qrValue}
              size={512}
              level="H"
              marginSize={0}
              // Gravé dans le bois : ni fond blanc, ni cadre.
              fgColor={BRUN_GRAVE}
              bgColor="transparent"
              className="w-full h-auto"
            />
          </div>
          {/*
            La phrase est posée par-dessus, comme le QR, plutôt que réécrite
            dans le SVG : le gabarit enfouit son bloc de texte sous plusieurs
            groupes transformés, et toute retouche du DOM y est effacée dès que
            React réinjecte le gabarit. Une surcouche se centre en CSS, se
            mesure en unités de conteneur, et reste juste à toute taille.
          */}
          <div
            ref={phraseRef}
            className="absolute whitespace-nowrap"
            style={{
              left: "50%",
              top: `${PHRASE.centreY}%`,
              // La réduction s'ajoute au centrage : la phrase reste centrée
              // quelle que soit l'échelle appliquée.
              transform: `translate(-50%, -50%) scale(${echelle})`,
              color: BRUN_GRAVE,
              fontFamily: 'BELLABOO, "Segoe Script", "Brush Script MT", cursive',
              fontSize: `${TAILLE_PHRASE}cqw`,
              lineHeight: 1,
            }}
          >
            {tagline}
          </div>
        </>
      ) : (
        variante === "cadre" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[11px] text-[#A8998A]">Chargement de l’aperçu…</p>
          </div>
        )
      )}
    </div>
  );
}
