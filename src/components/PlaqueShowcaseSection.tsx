"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useId,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import AnimateOnScroll from "./AnimateOnScroll";
import {
  Sparkle,
  ArrowsClockwise,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  HandPointing,
  Check,
  ArrowRight,
  Eye,
  X,
  CaretRight,
} from "@phosphor-icons/react";

/* ── Gabarit et textures ── */
const GABARIT_URL = "/images/plaques/baseplaquesfinale.svg";
const TEXTURE_NOYER = "/images/plaques/bois-noyer.png";
const BRUN_GRAVE = "#2e150b";
const COULEUR_NON_GRAVE = /#ff7f2a/gi;
const CORPS = "path6";
const QR_GABARIT = ["g39"];
const TEXTE = "text4";

/* Emplacements mesurés sur le gabarit vectoriel */
const QR_POS = { gauche: 30.6, haut: 59.6, largeur: 17 };
const PHRASE_POS = { centreY: 89.9, taille: 5.48 };
const RATIO = 525.37183 / 489.84466;

/* Points d'intérêt sur la plaque (indicateurs visuels réactifs) */
interface Hotspot {
  id: string;
  num: number;
  shortLabel: string;
  title: string;
  badge: string;
  desc: string;
  x: number; // en %
  y: number; // en %
  yOffset?: number; // décalage fin en px
  targetRotX: number;
  targetRotY: number;
  targetZoom: number;
  targetPanX: number;
  targetPanY: number;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "qr",
    num: 1,
    shortLabel: "QR Code gravé",
    title: "QR Code Haute Définition",
    badge: "Inaltérable",
    desc: "Pyrogravé directement au micron dans le bois. Résistant aux UV, à l'humidité et au temps, il se scanne instantanément sans aucune application.",
    x: 48,
    y: 63,
    targetRotX: 6,
    targetRotY: -10,
    targetZoom: 1.8,
    targetPanX: 30,
    targetPanY: -50,
  },
  {
    id: "wood",
    num: 2,
    shortLabel: "Bois de noyer",
    title: "Bois de Noyer Véritable",
    badge: "FSC & Durable",
    desc: "Essence noble sélectionnée pour la finesse de son veinage et son contraste chaleureux. Chaque plaque possède des motifs naturels uniques.",
    x: 76,
    y: 22,
    targetRotX: 12,
    targetRotY: 15,
    targetZoom: 1.5,
    targetPanX: -55,
    targetPanY: 45,
  },
  {
    id: "laser",
    num: 3,
    shortLabel: "Découpe 3 mm",
    title: "Découpe & Finition 3 mm",
    badge: "Fabrication Française",
    desc: "Épaisseur soignée de 3 mm en bois de noyer. Biseau net et tranches délicatement brunies par le faisceau laser pour un toucher velouté.",
    x: 12,
    y: 46,
    targetRotX: -4,
    targetRotY: -25,
    targetZoom: 1.65,
    targetPanX: 65,
    targetPanY: 10,
  },
  {
    id: "signature",
    num: 4,
    shortLabel: "Votre signature",
    title: "Votre Signature Personnalisée",
    badge: "Sur mesure",
    desc: "Votre nom d'hébergement ou votre mot d'accueil gravé avec élégance au bas de la plaque (inclus dans la formule Confort).",
    x: 50,
    y: 87.5,
    yOffset: 2, // Descendu encore de 2px
    targetRotX: 8,
    targetRotY: 0,
    targetZoom: 1.8,
    targetPanX: 0,
    targetPanY: -95,
  },
];

const PRESETS = [
  { label: "Vue de face", rotX: 0, rotY: 0, zoom: 1, panX: 0, panY: 0 },
  { label: "Perspective 3D", rotX: 12, rotY: -20, zoom: 1.1, panX: 0, panY: 0 },
];

const SUGGESTIONS = [
  "Bienvenue chez vous",
  "Le Mas des Oliviers",
  "Villa Bella Vista",
  "Chalet du Bonheur",
];

export default function PlaqueShowcaseSection() {
  const instance = useId().replace(/[^a-zA-Z0-9]/g, "");
  const motifBois = `plaque-bois-pattern-${instance}`;
  const motifBoisBack = `plaque-bois-pattern-back-${instance}`;

  /* État du SVG chargé */
  const [svgOriginal, setSvgOriginal] = useState<string | null>(null);

  /* Phrase personnalisable en direct */
  const [customTagline, setCustomTagline] = useState("Bienvenue chez vous");
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  /* Transformation 3D */
  const [rotX, setRotX] = useState(10);
  const [rotY, setRotY] = useState(-16);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  /* Détection mobile pour bloquer le zoom à 100% et fiabiliser la manipulation tactile */
  const isMobile = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    () => window.innerWidth < 768,
    () => false
  );

  /* Valeurs effectives : strictement bloquées à 100% (zoom = 1) et sans pan sur mobile */
  const currentZoom = isMobile ? 1 : zoom;
  const currentPanX = isMobile ? 0 : panX;
  const currentPanY = isMobile ? 0 : panY;

  /* Détection mathématique de l'orientation : Face avant vs Dos de la plaque dans tous les axes */
  const isFrontFacing =
    Math.cos((rotX * Math.PI) / 180) * Math.cos((rotY * Math.PI) / 180) >= 0;

  /* Référence du viewport et multi-touch mobile */
  const stageRef = useRef<HTMLDivElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);
  const velocityRef = useRef<{ vx: number; vy: number; lastTime: number }>({
    vx: 0,
    vy: 0,
    lastTime: 0,
  });
  const momentumFrameRef = useRef<number | null>(null);

  const dragRef = useRef<{
    startX: number;
    startY: number;
    prevX: number;
    prevY: number;
    initRotX: number;
    initRotY: number;
    initPanX: number;
    initPanY: number;
    isPanning: boolean;
  }>({
    startX: 0,
    startY: 0,
    prevX: 0,
    prevY: 0,
    initRotX: 0,
    initRotY: 0,
    initPanX: 0,
    initPanY: 0,
    isPanning: false,
  });

  /* Chargement fiable du gabarit vectoriel */
  useEffect(() => {
    let cancel = false;
    fetch(GABARIT_URL)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        if (!cancel) setSvgOriginal(text);
      })
      .catch((err) => console.error("Échec chargement SVG plaque:", err));
    return () => {
      cancel = true;
    };
  }, []);

  /* 
   * Préparation du SVG vectoriel habillé avec la texture bois :
   * Exactement comme PlaquePreview.tsx pour une compatibilité à 100%
   */
  const svgPlaque = useMemo(() => {
    if (!svgOriginal) return null;
    let s = svgOriginal.replace(/xlink:href=/g, "href=");

    // Injection du motif bois
    s = s.replace(
      "<defs",
      `<defs id="defs-${instance}">
        <pattern id="${motifBois}" patternUnits="userSpaceOnUse" x="0" y="0" width="489.84" height="525.37">
          <image href="${TEXTURE_NOYER}" x="0" y="0" width="489.84" height="525.37" preserveAspectRatio="xMidYMid slice" />
        </pattern>
      </defs><defs`
    );

    // Rendre les parties non gravées transparentes
    s = s.replace(COULEUR_NON_GRAVE, "transparent");

    // Les tracés noirs passent au brun brûlé laser
    s = s.replace(/#000000/gi, BRUN_GRAVE);

    // Style interne scoped : le corps prend la texture du noyer, le QR et texte de démo s'effacent
    s = s.replace(
      "<defs",
      `<style>
        #${CORPS} { fill: #4A2818 !important; fill: url(#${motifBois}) !important; }
        ${QR_GABARIT.map((id) => "#" + id).join(", ")}, #${TEXTE} { display: none !important; }
      </style><defs`
    );

    s = s.replace(/<svg\b/, '<svg preserveAspectRatio="xMidYMid meet"');
    s = s.replace(/\swidth="[^"]+"/, ' width="100%"');
    s = s.replace(/\sheight="[^"]+"/, ' height="100%"');

    return s;
  }, [svgOriginal, instance, motifBois]);

  /* Auto-rotation douce quand l'utilisateur ne manipule pas */
  useEffect(() => {
    if (!isAutoRotate || isInteracting) return;
    let frameId: number;
    const animate = () => {
      setRotY((y) => (y + 0.16) % 360);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoRotate, isInteracting]);

  /* Manipulation tactile & souris (Pointer Events) avec rotation 3D dans tous les axes */
  const handlePointerDown = (e: React.PointerEvent) => {
    // Stopper toute inertie en cours
    if (momentumFrameRef.current) {
      cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }

    setHasInteracted(true);
    setIsInteracting(true);
    setIsAutoRotate(false);

    try {
      stageRef.current?.setPointerCapture(e.pointerId);
    } catch {}

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Sur mobile : toujours rotation 3D pure et fluide (pan désactivé, zoom bloqué à 100%)
    if (isMobile) {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        prevX: e.clientX,
        prevY: e.clientY,
        initRotX: rotX,
        initRotY: rotY,
        initPanX: 0,
        initPanY: 0,
        isPanning: false,
      };
      velocityRef.current = { vx: 0, vy: 0, lastTime: performance.now() };
      return;
    }

    // Détection du pinch à deux doigts pour le zoom (sur bureau / grand écran uniquement)
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartZoomRef.current = zoom;
      return;
    }

    const isPan = e.button === 1 || e.shiftKey || zoom > 1.3;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      prevX: e.clientX,
      prevY: e.clientY,
      initRotX: rotX,
      initRotY: rotY,
      initPanX: panX,
      initPanY: panY,
      isPanning: isPan,
    };
    velocityRef.current = { vx: 0, vy: 0, lastTime: performance.now() };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteracting) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Zoom tactile fluide à deux doigts (désactivé sur mobile pour bloquer le zoom à 100%)
    if (!isMobile && pointersRef.current.size === 2 && pinchStartDistRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const currentDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = currentDist / pinchStartDistRef.current;
      const nextZoom = Math.max(0.85, Math.min(2.5, pinchStartZoomRef.current * factor));
      setZoom(parseFloat(nextZoom.toFixed(2)));
      return;
    }

    // Rotation ou déplacement à un doigt / souris
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // Mesure de la vitesse instantanée pour le lancer tactile (momentum)
    const now = performance.now();
    const dt = Math.max(1, now - velocityRef.current.lastTime);
    const stepDx = e.clientX - dragRef.current.prevX;
    const stepDy = e.clientY - (dragRef.current.prevY ?? e.clientY);
    dragRef.current.prevX = e.clientX;
    dragRef.current.prevY = e.clientY;
    velocityRef.current = { vx: stepDx / dt, vy: stepDy / dt, lastTime: now };

    if (!isMobile && dragRef.current.isPanning) {
      setPanX(dragRef.current.initPanX + dx * 0.8);
      setPanY(dragRef.current.initPanY + dy * 0.8);
    } else {
      // Rotation 3D libre et continue dans tous les axes (horizontal & vertical)
      const newRotX = dragRef.current.initRotX - dy * 0.5;
      const newRotY = dragRef.current.initRotY + dx * 0.6;
      setRotX(newRotX);
      setRotY(newRotY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }

    if (pointersRef.current.size === 0) {
      setIsInteracting(false);
      try {
        stageRef.current?.releasePointerCapture(e.pointerId);
      } catch {}

      // Lancement tactile (inertie physique dans tous les axes avec décélération progressive)
      let currentVx = velocityRef.current.vx * 13;
      let currentVy = (velocityRef.current.vy ?? 0) * 13;
      if (Math.abs(currentVx) > 0.3 || Math.abs(currentVy) > 0.3) {
        const decay = () => {
          currentVx *= 0.92;
          currentVy *= 0.92;
          const hasVx = Math.abs(currentVx) > 0.04;
          const hasVy = Math.abs(currentVy) > 0.04;
          if (hasVx || hasVy) {
            if (hasVx) setRotY((y) => (y + currentVx) % 360);
            if (hasVy) setRotX((x) => (x - currentVy) % 360);
            momentumFrameRef.current = requestAnimationFrame(decay);
          } else {
            momentumFrameRef.current = null;
          }
        };
        momentumFrameRef.current = requestAnimationFrame(decay);
      }
    }
  };



  /* Appliquer un préréglage */
  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setIsAutoRotate(false);
    setActiveHotspot(null);
    setRotX(preset.rotX);
    setRotY(preset.rotY);
    setZoom(isMobile ? 1 : preset.zoom);
    setPanX(isMobile ? 0 : preset.panX);
    setPanY(isMobile ? 0 : preset.panY);
  };

  /* Sélection d'un détail depuis la liste de droite */
  const selectHotspot = (hs: Hotspot) => {
    // Désactivé sur mobile (< 768px) pour bloquer le zoom à 100% et éviter tout déplacement imprévu
    if (isMobile || (typeof window !== "undefined" && window.innerWidth < 768)) return;
    setIsAutoRotate(false);
    if (activeHotspot?.id === hs.id) {
      // Désélection : retour à la vue globale
      setActiveHotspot(null);
      setRotX(10);
      setRotY(-16);
      setZoom(1);
      setPanX(0);
      setPanY(0);
    } else {
      setActiveHotspot(hs);
      setRotX(hs.targetRotX);
      setRotY(hs.targetRotY);
      setZoom(hs.targetZoom);
      setPanX(hs.targetPanX);
      setPanY(hs.targetPanY);
    }
  };

  return (
    <section
      id="plaque-en-bois"
      className="py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-[#FBF5EC] via-[#F8EFE2] to-[#FBF5EC] text-[#2A2016]"
    >
      {/* ── Halos chaleureux méditerranéens (lumineux & accueillants) ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#EDD9A3]/45 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#C4714A]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-16 left-8 w-[350px] h-[350px] bg-[#5A7A4E]/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* ── EN-TÊTE DE SECTION ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-14">
          <AnimateOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C4714A]/10 border border-[#C4714A]/25 text-[#C4714A] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
              <Sparkle size={14} weight="fill" className="text-[#D4A34A]" />
              L&apos;Objet Physique au Cœur de Guidz
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-[4rem] font-bold text-[#2A2016] leading-[1.08] tracking-tight">
              La plaque en bois gravée,{" "}
              <span className="text-gradient-ocean">au centre du projet</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#6B5D4E] leading-relaxed max-w-2xl mx-auto">
              Fini les feuilles volantes et les classeurs élimés. La plaque Guidz est fabriquée en France,
              découpée dans du bois de noyer de 3 mm d&apos;épaisseur et reliée instantanément à votre livret d&apos;accueil.
            </p>
          </AnimateOnScroll>
        </div>

        {/* ── CORPS PRINCIPAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ═════════════════════════════════════════════════════════════
              COLONNE GAUCHE (7 cols) : LA PLAQUE DANS TOUTE SA CLARTÉ
              ═════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-[500px] relative flex flex-col items-center">
              {/* Aide à la manipulation */}
              <div className="flex items-center justify-between w-full mb-2 px-2 text-[11px] font-medium text-[#6B5D4E]">
                <span className="flex items-center gap-1.5">
                  <HandPointing size={15} className="text-[#C4714A] animate-pulse" />
                  <span>Glissez pour orienter la plaque en 3D à 360°</span>
                </span>
                <span className="hidden md:inline-flex bg-white/80 border border-[#EDD9A3] px-2 py-0.5 rounded-full text-[10px] text-[#5C3D2E] font-mono shadow-xs">
                  Zoom: {Math.round(currentZoom * 100)}%
                </span>
              </div>

              {/* 
                ZONE DE MANIPULATION 3D :
                Un cadre carré harmonieux sur fond crème qui maintient la plaque
                parfaitement centrée quel que soit l'axe de rotation 3D.
              */}
              <div
                ref={stageRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative w-full aspect-square max-w-[460px] rounded-3xl bg-white/40 border border-[#EDD9A3]/60 shadow-[0_12px_36px_rgba(42,32,22,0.04)] flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
                style={{ perspective: "1300px", touchAction: "none" }}
              >
                {/* ── GUIDAGE TACTILE MOBILE (disparaît dès le premier contact) ── */}
                {!hasInteracted && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#EDD9A3] shadow-[0_4px_16px_rgba(74,38,23,0.12)] text-[11px] font-semibold text-[#5C3D2E] flex items-center gap-1.5 animate-bounce transition-opacity duration-300">
                    <HandPointing size={15} weight="fill" className="text-[#C4714A]" />
                    <span>Touchez & faites tourner en 3D</span>
                  </div>
                )}
                {/* ── OMBRE PORTÉE NATURELLE AU SOL (forme ovale douce, reste centrée sous la plaque) ── */}
                <div
                  className="absolute pointer-events-none transition-transform duration-75 ease-out rounded-full bg-[#4A2617]/20 blur-[28px]"
                  style={{
                    width: "66%",
                    height: "18%",
                    bottom: "5%",
                    left: "17%",
                    transform: `translate(${Math.sin((rotY * Math.PI) / 180) * 16}px, ${Math.sin((rotX * Math.PI) / 180) * 10}px) scale(${currentZoom * 0.95})`,
                    opacity: Math.max(0.18, 0.45 - Math.abs(Math.sin((rotX * Math.PI) / 180)) * 0.15),
                  }}
                />

                {/* ── OBJET 3D : LA PLAQUE DÉCOUPÉE DANS LE NOYER (DOUBLE-FACE) ── */}
                <div
                  className="relative w-[76%] sm:w-[80%] max-w-[370px] pointer-events-none"
                  style={{
                    aspectRatio: `${1 / RATIO}`,
                    transformStyle: "preserve-3d",
                    WebkitTransformStyle: "preserve-3d",
                    transform: `translate3d(${currentPanX}px, ${currentPanY}px, 0) scale(${currentZoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                    WebkitTransform: `translate3d(${currentPanX}px, ${currentPanY}px, 0) scale(${currentZoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
                    willChange: "transform",
                  }}
                >
                  {/* 
                    ── FACE ARRIÈRE (Z = -1.5px, orientée à 180°) ──
                    Bois de noyer vierge : ABSOLUMENT RIEN D'ÉCRIT, AUCUN TEXTE !
                  */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      transform: "rotateY(180deg) translateZ(1.5px)",
                      WebkitTransform: "rotateY(180deg) translateZ(1.5px)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      display: !isFrontFacing ? "block" : "none",
                    }}
                  >
                    <svg
                      viewBox="0 0 489.84466 525.37183"
                      preserveAspectRatio="xMidYMid meet"
                      className="w-full h-full"
                    >
                      <defs>
                        <pattern
                          id={motifBoisBack}
                          patternUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="489.84"
                          height="525.37"
                        >
                          <image
                            href={TEXTURE_NOYER}
                            x="0"
                            y="0"
                            width="489.84"
                            height="525.37"
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </pattern>
                      </defs>
                      <g transform="matrix(0.26458334,0,0,0.26458332,-19.66098,-4.6913401)">
                        <path
                          d="m 143.30206,195.34023 c -1.05223,-0.1218 -4.10127,-0.68842 -6.77566,-1.25918 -6.67529,-1.42457 -7.59577,-1.55206 -11.92175,-1.65107 -4.02968,-0.0922 -4.78344,-0.0362 -11.27492,0.83806 -9.98436,1.34468 -13.504176,1.15327 -23.595248,-1.28305 -7.394715,-1.78533 -11.711655,-2.13468 -19.450134,-1.57398 -5.528672,0.40057 -11.587479,0.40424 -13.471608,0.008 -4.926426,-1.03572 -8.64048,-3.68192 -11.41896,-8.13584 -2.06165,-3.30481 -2.962364,-6.0419 -5.856842,-17.79774 -3.154064,-12.81015 -3.910027,-18.41674 -3.718869,-27.58095 0.09552,-4.57929 0.330449,-7.43794 0.995751,-12.11647 0.801472,-5.6361 1.361992,-8.48255 3.280704,-16.66017 2.305973,-9.828127 2.505738,-11.078806 2.639901,-16.527704 0.170051,-6.90641 -0.416729,-11.163574 -2.754284,-19.982689 -1.539372,-5.807732 -1.728039,-7.066414 -1.732277,-11.556946 -0.0032,-3.325394 0.03765,-3.934715 0.362968,-5.420532 1.225971,-5.599583 4.133442,-10.370358 7.809319,-12.814083 2.893535,-1.923615 5.102051,-2.586704 9.356315,-2.809143 5.503125,-0.287739 6.240063,-0.403843 10.242325,-1.613686 5.478943,-1.656223 8.677788,-2.164654 12.555786,-1.995621 3.571205,0.155663 5.782608,0.545674 11.080201,1.954155 7.051597,1.874821 14.429932,2.642807 21.963152,2.286064 6.94142,-0.328716 11.37195,-1.13113 19.80681,-3.5872 3.84415,-1.119342 5.66924,-1.411937 8.7685,-1.405731 3.16627,0.0063 4.615,0.269127 9.04754,1.641197 3.89112,1.204468 5.4739,1.545792 8.56304,1.846619 3.58384,0.348995 5.1131,0.710953 7.02095,1.661755 5.22375,2.60334 8.66231,7.426906 10.03123,14.07175 0.66857,3.245239 0.83333,6.234123 0.51499,9.342339 -0.30112,2.94004 -1.11492,7.165359 -1.96216,10.18782 -1.9794,7.061211 -2.55164,11.181534 -2.39604,17.252564 0.12295,4.79718 0.6139,8.268051 2.02,14.280522 3.01666,12.89921 4.1601,19.74432 4.70047,28.13893 0.2841,4.41346 0.30115,6.65306 0.0819,10.76133 -0.26859,5.03205 -0.96566,10.54029 -1.91672,15.1456 -1.77724,8.60597 -3.06632,14.10508 -4.40998,18.81243 -1.49812,5.2485 -4.65716,10.15458 -8.41531,13.06921 -2.95557,2.29221 -5.82755,3.50871 -9.96628,4.22156 -2.59242,0.4465 -7.1181,0.56268 -9.80478,0.25169 z"
                          fill="#4A2818"
                          style={{ fill: `url(#${motifBoisBack})` }}
                          transform="matrix(11.952365,0,0,11.952861,-280.54471,-366.51779)"
                        />
                      </g>
                    </svg>
                  </div>

                  {/* 
                    ── FACE AVANT (Z = +1.5px, orientée à 0°) ──
                    Gravure laser, QR Code, Phrase personnalisée & Points d'intérêt
                  */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      transform: "translateZ(1.5px)",
                      WebkitTransform: "translateZ(1.5px)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      display: isFrontFacing ? "block" : "none",
                    }}
                  >
                    {/* Tracé vectoriel du gabarit avec texture noyer */}
                    {svgPlaque ? (
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{ __html: svgPlaque }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-[#8A7868]">Chargement de la gravure…</span>
                      </div>
                    )}

                    {/* Vrai QR Code lisible gravé */}
                    <div
                      className="absolute"
                      style={{
                        left: `${QR_POS.gauche}%`,
                        top: `${QR_POS.haut}%`,
                        width: `${QR_POS.largeur}%`,
                      }}
                    >
                      <QRCodeSVG
                        value="https://guidzme.fr"
                        size={512}
                        level="H"
                        marginSize={0}
                        fgColor={BRUN_GRAVE}
                        bgColor="transparent"
                        className="w-full h-auto drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]"
                      />
                    </div>

                    {/* Phrase personnalisée gravée (taille auto-adaptée aux phrases longues) */}
                    {(() => {
                      const text = customTagline || "Bienvenue chez vous";
                      // Si la phrase est longue, réduire proportionnellement la taille pour rester parfaitement lisible et centrée
                      const scale = text.length > 20 ? Math.max(0.64, 20 / text.length) : 1;
                      return (
                        <div
                          className="absolute whitespace-nowrap text-center pointer-events-none transition-all duration-150"
                          style={{
                            left: "50%",
                            top: `${PHRASE_POS.centreY}%`,
                            transform: "translate(-50%, -50%)",
                            color: BRUN_GRAVE,
                            fontFamily: 'BELLABOO, "Segoe Script", "Brush Script MT", cursive',
                            fontSize: `${PHRASE_POS.taille * 4.0 * scale}px`,
                            letterSpacing: "0.04em",
                            textShadow: "0 1px 1px rgba(255,255,255,0.18)",
                          }}
                        >
                          {text}
                        </div>
                      );
                    })()}

                    {/* 
                      ── POINTS D'INTÉRÊT SUR LA PLAQUE (INDICATEURS VISUELS) ── 
                      Non cliquables sur la plaque pour ne pas gêner le drag 3D.
                      Se mettent en surbrillance automatique lors du clic sur les boutons à droite.
                    */}
                    {HOTSPOTS.map((hs) => {
                      const active = activeHotspot?.id === hs.id;
                      return (
                        <div
                          key={hs.id}
                          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
                          style={{
                            left: `${hs.x}%`,
                            top: hs.yOffset ? `calc(${hs.y}% + ${hs.yOffset}px)` : `${hs.y}%`,
                            transform: "translate3d(-50%, -50%, 15px)",
                          }}
                        >
                          <div
                            className={`relative flex items-center justify-center transition-all duration-300 ${
                              active ? "scale-140" : "scale-100"
                            }`}
                          >
                            {/* Halo de surbrillance lumineux quand actif */}
                            {active && (
                              <span className="absolute inline-flex h-8 w-8 rounded-full bg-[#C4714A] opacity-75 animate-ping" />
                            )}
                            {/* Pastille numérotée : surbrillance terracotta/dorée */}
                            <span
                              className={`relative inline-flex items-center justify-center rounded-full font-black shadow-md transition-all duration-300 ${
                                active
                                  ? "h-6 w-6 bg-[#C4714A] text-white border-2 border-white ring-4 ring-[#C4714A]/40 text-[11px] shadow-lg"
                                  : "h-5 w-5 bg-[#2A2016]/85 text-[#EDD9A3] border border-white/70 text-[10px]"
                              }`}
                            >
                              {hs.num}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── CONTRÔLES ÉLÉGANTS ET OPTIMISÉS MOBILE & PC ── */}
              <div className="mt-3 flex flex-col items-center gap-2.5 w-full max-w-full">
                {/* Ligne 1 : Préréglages d'angle sans défilement */}
                <div className="w-full flex flex-wrap items-center justify-center gap-1.5 py-1 px-1">
                  {/* Bouton Recentrer */}
                  <button
                    type="button"
                    onClick={() => applyPreset(PRESETS[0])}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-[#EDD9A3] hover:border-[#C4714A] active:scale-95 text-[#5C3D2E] text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation min-h-[34px]"
                    title="Réinitialiser l'orientation"
                  >
                    <ArrowsClockwise size={13} />
                    <span>Recentrer</span>
                  </button>

                  <div className="h-4 w-px bg-[#EDD9A3]/80 shrink-0 mx-0.5" />

                  {/* Préréglages */}
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-[#EDD9A3] hover:border-[#C4714A] active:bg-[#F8EFE2] text-xs font-medium text-[#6B5D4E] hover:text-[#2A2016] shadow-xs transition-all cursor-pointer touch-manipulation min-h-[34px]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Ligne 2 : Outils tactiles rapides (Zoom bureau + 360° Auto) */}
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1 bg-white border border-[#EDD9A3] rounded-full p-0.5 shadow-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setZoom((z) => Math.max(0.85, parseFloat((z - 0.25).toFixed(2))))
                      }
                      className="p-2 rounded-full hover:bg-[#FBF5EC] active:scale-95 text-[#5C3D2E] transition-transform cursor-pointer touch-manipulation"
                      title="Dézoomer"
                    >
                      <MagnifyingGlassMinus size={15} />
                    </button>
                    <span className="text-[10px] font-mono text-[#8A7868] px-1 select-none">
                      {Math.round(currentZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setZoom((z) => Math.min(2.5, parseFloat((z + 0.25).toFixed(2))))
                      }
                      className="p-2 rounded-full hover:bg-[#FBF5EC] active:scale-95 text-[#5C3D2E] transition-transform cursor-pointer touch-manipulation"
                      title="Zoomer"
                    >
                      <MagnifyingGlassPlus size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAutoRotate(!isAutoRotate)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation shadow-xs active:scale-95 min-h-[34px] ${
                      isAutoRotate
                        ? "bg-[#C4714A] text-white border border-[#C4714A]"
                        : "bg-white text-[#6B5D4E] border border-[#EDD9A3] hover:bg-[#FBF5EC]"
                    }`}
                    title="Rotation automatique 360°"
                  >
                    <ArrowsClockwise size={13} className={isAutoRotate ? "animate-spin" : ""} />
                    <span>360° Auto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              COLONNE DROITE (5 cols) : SÉLECTION DES DÉTAILS & EXPLICATIONS
              ═════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6">
            {/* CARTE D'EXPLICATION : MISE À JOUR NETTE ET SANS SUPERPOSITION */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EDD9A3] shadow-[0_15px_35px_rgba(42,32,22,0.06)] relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EDD9A3]/30 rounded-full blur-2xl pointer-events-none" />

              {activeHotspot ? (
                <div className="animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#C4714A]/10 text-[#C4714A] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#C4714A] text-white flex items-center justify-center text-[10px]">
                        {activeHotspot.num}
                      </span>
                      {activeHotspot.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveHotspot(null)}
                      className="text-xs text-[#A8998A] hover:text-[#2A2016] flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <X size={14} /> Vue d&apos;ensemble
                    </button>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#2A2016] mb-2 font-[family-name:var(--font-display)]">
                    {activeHotspot.title}
                  </h3>
                  <p className="text-sm text-[#6B5D4E] leading-relaxed">{activeHotspot.desc}</p>
                </div>
              ) : (
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#C4714A]/10 text-[#C4714A] text-xs font-bold uppercase tracking-wider">
                    Savoir-Faire Artisanal
                  </span>
                  <h3 className="text-2xl font-bold text-[#2A2016] mt-3 mb-2 font-[family-name:var(--font-display)]">
                    Un objet noble et durable
                  </h3>
                  <p className="text-sm text-[#6B5D4E] leading-relaxed">
                    Chaque plaque est découpée et gravée dans notre atelier en France. Le bois
                    de noyer apporte une touche d&apos;authenticité chaleureuse que vos voyageurs
                    remarqueront dès leur arrivée.
                  </p>
                </div>
              )}

              {/* 
                BADGES / DÉTAILS CLÉS :
                Informatifs et non-cliquables sur mobile pour fluidifier le défilement tactile.
                Cliquables sur PC pour animer et inspecter le détail en 3D.
              */}
              <div className="mt-5 pt-5 border-t border-[#EDD9A3]/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOTSPOTS.map((hs) => {
                  const isSel = activeHotspot?.id === hs.id;
                  return (
                    <button
                      key={hs.id}
                      type="button"
                      onClick={() => selectHotspot(hs)}
                      className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center gap-2 border pointer-events-none md:pointer-events-auto cursor-default md:cursor-pointer select-none ${
                        isSel
                          ? "bg-[#C4714A] text-white border-[#C4714A] shadow-sm ring-2 ring-[#C4714A]/20"
                          : "bg-[#FBF5EC] md:hover:bg-white text-[#5C3D2E] border-[#EDD9A3]/70 md:hover:border-[#C4714A]/50"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isSel ? "bg-white text-[#C4714A]" : "bg-[#2A2016] text-[#EDD9A3]"
                        }`}
                      >
                        {hs.num}
                      </span>
                      <span className="leading-tight flex-1">{hs.shortLabel}</span>
                      {isSel && <CaretRight size={12} weight="bold" className="text-white hidden md:block" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── TESTEZ VOTRE PHRASE EN DIRECT SUR LA PLAQUE ── */}
            <div className="p-6 rounded-3xl bg-white border border-[#EDD9A3] shadow-[0_10px_30px_rgba(42,32,22,0.04)]">
              <label
                htmlFor="tagline-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#C4714A] mb-1"
              >
                Visualisez votre signature en direct :
              </label>
              <p className="text-xs text-[#6B5D4E] mb-3">
                Tapez le nom de votre hébergement ou un mot d&apos;accueil pour voir la gravure s&apos;ajuster en temps réel.
              </p>
              <div className="relative">
                <input
                  id="tagline-input"
                  type="text"
                  maxLength={40}
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  placeholder="Ex : Bienvenue au Mas des Oliviers"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FBF5EC] border border-[#EDD9A3] text-[#2A2016] placeholder-[#A8998A] text-base sm:text-sm focus:outline-none focus:border-[#C4714A] focus:bg-white transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#A8998A] font-mono">
                  {customTagline.length}/40
                </span>
              </div>

              {/* Suggestions rapides en 1 clic pour mobile */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[11px] text-[#8A7868] mr-0.5">Idées rapides :</span>
                {SUGGESTIONS.map((sugg, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCustomTagline(sugg)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer touch-manipulation ${
                      customTagline === sugg
                        ? "bg-[#C4714A] text-white border-[#C4714A] shadow-xs"
                        : "bg-[#FBF5EC] hover:bg-white text-[#6B5D4E] border-[#EDD9A3]/70 active:scale-95"
                    }`}
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>

            {/* ── CARACTÉRISTIQUES TECHNIQUES ── */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-2xl bg-white border border-[#EDD9A3] text-center shadow-xs">
                <span className="block text-base font-bold text-[#2A2016]">25 × 22 cm</span>
                <span className="text-[11px] text-[#6B5D4E]">Format généreux</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#EDD9A3] text-center shadow-xs">
                <span className="block text-base font-bold text-[#2A2016]">3 mm</span>
                <span className="text-[11px] text-[#6B5D4E]">Épaisseur bois</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#EDD9A3] text-center shadow-xs">
                <span className="block text-base font-bold text-[#2A2016]">100% France</span>
                <span className="text-[11px] text-[#6B5D4E]">Atelier artisanal</span>
              </div>
            </div>

            {/* Inclus dans chaque commande */}
            <div className="space-y-2 pt-1 text-xs text-[#5C3D2E]">
              <div className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-[#5A7A4E] shrink-0" />
                <span>Fixation murale invisible (adhésif pro 3M haute tenue ou vis) incluse</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} weight="bold" className="text-[#5A7A4E] shrink-0" />
                <span>Livraison soignée avec suivi partout en France</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href="#offres"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#C4714A] hover:bg-[#D4866A] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Commander ma plaque
                <ArrowRight size={16} weight="bold" />
              </a>
              <a
                href="/demo-editeur"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FBF5EC] border border-[#EDD9A3] text-[#5C3D2E] text-sm font-semibold transition-all shadow-xs"
              >
                <Eye size={16} />
                Tester l&apos;éditeur
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
