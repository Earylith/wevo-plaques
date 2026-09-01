"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, MousePointerClick, PencilLine } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

/*
 * Largeur du navigateur simulé à l'intérieur du mockup. L'éditeur ne bascule
 * sur sa mise en page à deux colonnes (formulaire + aperçu téléphone) qu'à
 * partir de 1024 px : en dessous, le mockup montrerait un écran d'ordinateur
 * affichant une mise en page mobile. 1440 × 900, c'est le 16/10 d'un portable.
 */
const VIEWPORT_WIDTH = 1440;
const VIEWPORT_HEIGHT = 900;

const highlights = [
  {
    icon: PencilLine,
    title: "Vous modifiez un champ",
    text: "Titre, Wi-Fi, horaires, bonnes adresses, couleurs, photos…",
  },
  {
    icon: MousePointerClick,
    title: "L'aperçu suit en direct",
    text: "Le livret se met à jour sur le téléphone, à droite de l'éditeur.",
  },
];

/** Voile d'activation posé sur l'écran tant que la démo n'est pas lancée. */
function VeilContent({ asLink, onActivate }: { asLink: boolean; onActivate: () => void }) {
  const shell =
    "absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-3 bg-[#2A2016]/25 backdrop-blur-[1px] transition-colors hover:bg-[#2A2016]/10";
  const inner = (
    <>
      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#2A2016] shadow-lg sm:px-5 sm:py-3 sm:text-sm">
        <MousePointerClick size={18} className="text-[#C4714A]" />
        Tester l&apos;éditeur
      </span>
      <span className="px-4 text-center text-[11px] font-semibold text-white drop-shadow sm:text-xs">
        Démo libre — rien n&apos;est enregistré
      </span>
    </>
  );

  return asLink ? (
    <a href="/demo-editeur" target="_blank" rel="noopener noreferrer" className={shell}>
      {inner}
    </a>
  ) : (
    <button
      type="button"
      onClick={onActivate}
      aria-label="Activer la démo interactive de l'éditeur"
      className={shell}
    >
      {inner}
    </button>
  );
}

export default function DemoPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  /* L'éditeur est lourd : on ne le charge qu'à l'approche de la section. */
  const [visible, setVisible] = useState(false);
  /*
   * Tant que la démo n'est pas « activée », l'iframe ne reçoit pas les clics :
   * sinon la molette resterait piégée dans l'éditeur alors que le visiteur ne
   * fait que faire défiler la page d'accueil.
   */
  const [active, setActive] = useState(false);

  /* Le mockup s'adapte à sa largeur : on met l'écran virtuel à l'échelle. */
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / VIEWPORT_WIDTH);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #EBF0E6 0%, #FBF5EC 100%)" }}
    >
      {/* Halos décoratifs */}
      <div className="absolute top-1/4 right-0 w-64 h-64 rounded-full bg-[#C4714A]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-48 h-48 rounded-full bg-[#2B5F75]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label section-label-terra mb-5 inline-flex">Côté hôte</span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-[#2A2016] leading-tight mb-5 mt-5">
              Un éditeur simple,{" "}
              <em className="not-italic text-gradient-terra">l&apos;aperçu en direct</em>
            </h2>
            <p className="text-lg text-[#6B5D4E] leading-relaxed">
              Modifiez un champ à gauche : à droite, le livret que verront vos locataires prend
              forme en temps réel. Démo libre — rien n&apos;est enregistré.
            </p>
          </div>
        </AnimateOnScroll>

        {/* ────────── MOCKUP ORDINATEUR PORTABLE ────────── */}
        <AnimateOnScroll delay={0.15}>
          <div className="mt-12 lg:mt-16">
            <div className="relative mx-auto w-full max-w-[1000px]">
              {/* Ombre portée sous la machine */}
              <div className="absolute -inset-x-10 -bottom-4 h-24 rounded-[50%] bg-[#2A2016]/15 blur-3xl pointer-events-none" />

              {/* Capot */}
              <div className="relative rounded-t-[16px] bg-gradient-to-b from-[#2C2C2E] to-[#141416] p-[10px] pb-0 sm:p-3 sm:pb-0 shadow-[0_30px_60px_-20px_rgba(42,32,22,0.45)]">
                <div
                  ref={screenRef}
                  className="relative w-full overflow-hidden rounded-[6px] bg-[#FBF5EC]"
                  style={{ aspectRatio: `${VIEWPORT_WIDTH} / ${VIEWPORT_HEIGHT}` }}
                >
                  {/* Encoche caméra */}
                  <div className="absolute top-0 left-1/2 z-30 h-3 w-24 -translate-x-1/2 rounded-b-[8px] bg-[#141416] sm:h-4 sm:w-32" />

                  {visible && scale > 0 && (
                    <iframe
                      src="/demo-editeur"
                      title="Démo de l'éditeur Guidz"
                      loading="lazy"
                      className="absolute left-0 top-0 origin-top-left border-0"
                      style={{
                        width: VIEWPORT_WIDTH,
                        height: VIEWPORT_HEIGHT,
                        transform: `scale(${scale})`,
                        pointerEvents: active ? "auto" : "none",
                      }}
                    />
                  )}

                  {/* Voile d'activation */}
                  {!active && (
                    <VeilContent
                      asLink
                      onActivate={() => setActive(true)}
                    />
                  )}
                </div>
              </div>

              {/* Socle */}
              <div className="relative h-[10px] rounded-b-[10px] bg-gradient-to-b from-[#B9BEC4] to-[#8B9197] sm:h-3" />
              <div className="relative mx-auto h-[6px] w-[46%] rounded-b-[10px] bg-gradient-to-b from-[#9AA0A6] to-[#7C8288] sm:h-2">
                <div className="absolute top-0 left-1/2 h-[3px] w-16 -translate-x-1/2 rounded-b-full bg-[#6E747A]" />
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* ────────── EXPLICATIONS + LIENS ────────── */}
        <AnimateOnScroll delay={0.25}>
          <div className="mt-12 grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7EBE4] text-[#C4714A]">
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#2A2016]">{title}</p>
                    <p className="text-sm leading-relaxed text-[#6B5D4E]">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
              <a
                href="/demo-confort2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C4714A] px-6 py-3 font-bold text-white shadow-sm transition-colors hover:bg-[#a65d3a]"
              >
                Voir le livret Confort <ExternalLink size={18} />
              </a>
              {/* L'Essentielle a sa propre démo : la comparer est le meilleur
                  argument pour choisir, dans un sens comme dans l'autre. */}
              <a
                href="/demo-essentielle"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#C4714A] bg-white px-6 py-3 font-bold text-[#C4714A] shadow-sm transition-colors hover:bg-[#F7EBE4]"
              >
                Voir le livret Essentiel <ExternalLink size={18} />
              </a>
              <a
                href="/demo-editeur"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#2B5F75] bg-white px-6 py-3 font-bold text-[#2B5F75] shadow-sm transition-colors hover:bg-[#E4EEF3]"
              >
                Ouvrir l&apos;éditeur en grand <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
