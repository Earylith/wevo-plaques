"use client";

import React, { useEffect, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { Lang, LANGS } from "@/lib/i18n";

/**
 * Sélecteur de langue du livret.
 *
 * Déclaré au niveau du module — s'il vivait dans le corps de CleoTemplate,
 * React le remonterait à chaque rendu et le menu se refermerait tout seul.
 */

interface LanguagePickerProps {
  /** Langues réellement traduites pour ce livret. */
  langs: Lang[];
  active: Lang;
  onChange: (lang: Lang) => void;
  /** Variante posée sur la photo de couverture. */
  onDark?: boolean;
  /** Variante réduite, pour l'en-tête d'une fiche. */
  compact?: boolean;
}

export default function LanguagePicker({
  langs,
  active,
  onChange,
  onDark = false,
  compact = false,
}: LanguagePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Refermer au clic extérieur : sans cela le menu reste ouvert dès qu'on
  // touche ailleurs dans le livret.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  // Une seule langue : rien à choisir, on n'encombre pas l'écran.
  if (langs.length < 2) return null;

  const current = LANGS.find((l) => l.code === active) || LANGS[0];

  const trigger = onDark
    ? "bg-black/35 hover:bg-black/50 text-white border-white/25 backdrop-blur-md"
    : "bg-gray-100 hover:bg-gray-200 text-[#2A2016] border-transparent";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Langue : ${current.label}`}
        className={`flex items-center gap-1.5 rounded-full border font-bold transition-colors ${trigger} ${
          compact ? "text-[11px] px-2.5 py-1" : "text-xs px-3 py-1.5"
        }`}
      >
        <span>{current.flag}</span>
        <span>{current.short}</span>
        <CaretDown size={10} weight="bold" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1.5 z-50 min-w-[9.5rem] rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden animate-fadeIn"
        >
          {langs.map((code) => {
            const lang = LANGS.find((l) => l.code === code);
            if (!lang) return null;
            const selected = code === active;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(code);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center gap-2.5 text-left text-xs transition-colors ${
                    selected ? "bg-gray-50 font-bold text-[#2A2016]" : "text-[#4A3D30] hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="flex-1">{lang.label}</span>
                  {selected && <Check size={12} weight="bold" className="text-emerald-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
