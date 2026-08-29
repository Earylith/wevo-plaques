"use client";

import React, { useState } from "react";
import { Check, BookOpen, X, Sparkle } from "@phosphor-icons/react";
import {
  EQUIPMENT_LIBRARY, EQUIPMENT_CATEGORIES, RULES_LIBRARY, DEPARTURE_LIBRARY,
  LocalizedText, LibraryEquipment,
} from "@/lib/contentLibrary";

/**
 * Sélecteur de contenus pré-rédigés.
 *
 * L'hôte coche au lieu de rédiger — et comme chaque entrée porte ses quatre
 * traductions, un livret rempli à la bibliothèque est quadrilingue d'emblée,
 * sans passer par la traduction automatique.
 *
 * Déclaré au niveau du module : dans le corps de l'éditeur, React le
 * remonterait à chaque frappe.
 */

export type LibraryKind = "equipments" | "rules" | "departure";

interface LibraryPickerProps {
  kind: LibraryKind;
  /** Textes français déjà présents, pour ne pas proposer de doublon. */
  existing: string[];
  /** Reçoit les entrées retenues, dans l'ordre d'affichage de la bibliothèque. */
  onAdd: (picked: PickedEntry[]) => void;
}

/** Une entrée retenue, avec ses traductions prêtes à être posées. */
export interface PickedEntry {
  icon?: string;
  title: LocalizedText;
  desc?: LocalizedText;
  required?: boolean;
}

const LABELS: Record<LibraryKind, { button: string; title: string; hint: string }> = {
  equipments: {
    button: "Choisir dans la bibliothèque",
    title: "Équipements pré-rédigés",
    hint: "Notices déjà écrites et traduites en 4 langues. Vous ajusterez ensuite.",
  },
  rules: {
    button: "Choisir dans la bibliothèque",
    title: "Règles courantes",
    hint: "Les règles les plus fréquentes, déjà traduites.",
  },
  departure: {
    button: "Choisir dans la bibliothèque",
    title: "Consignes de départ courantes",
    hint: "Les gestes habituels de fin de séjour, déjà traduits.",
  },
};

export default function LibraryPicker({ kind, existing, onAdd }: LibraryPickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<string>("all");

  const normalized = existing.map((e) => e.trim().toLowerCase());
  const alreadyThere = (fr: string) => normalized.includes(fr.trim().toLowerCase());

  /** Entrées proposées, sous une forme commune aux trois bibliothèques. */
  const entries: { key: string; icon?: string; title: LocalizedText; desc?: LocalizedText; required?: boolean; category?: string }[] =
    kind === "equipments"
      ? EQUIPMENT_LIBRARY.map((e: LibraryEquipment) => ({
          key: e.id, icon: e.icon, title: e.title, desc: e.desc, category: e.category,
        }))
      : kind === "rules"
        ? RULES_LIBRARY.map((r, i) => ({ key: `rule-${i}`, title: r }))
        : DEPARTURE_LIBRARY.map((d, i) => ({ key: `dep-${i}`, title: d.text, required: d.required }));

  const visible = entries
    .filter((e) => !alreadyThere(e.title.fr))
    .filter((e) => category === "all" || e.category === category);

  const toggle = (key: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const confirm = () => {
    const picked = entries
      .filter((e) => selected.has(e.key))
      .map((e) => ({ icon: e.icon, title: e.title, desc: e.desc, required: e.required }));
    if (picked.length) onAdd(picked);
    setSelected(new Set());
    setOpen(false);
  };

  const labels = LABELS[kind];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl border border-[#C4714A]/40 bg-[#C4714A]/5 hover:bg-[#C4714A]/10 text-xs font-bold text-[#A35A38] flex items-center justify-center gap-2 transition-colors"
      >
        <BookOpen size={15} weight="fill" /> {labels.button}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[#C4714A]/40 bg-white overflow-hidden">
      <div className="px-3.5 py-3 bg-[#C4714A]/5 border-b border-[#C4714A]/20 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-[#2A2016] flex items-center gap-1.5">
            <BookOpen size={14} weight="fill" className="text-[#C4714A]" />
            {labels.title}
          </h4>
          <p className="text-[11px] text-[#6B5D4E] mt-0.5 leading-snug">{labels.hint}</p>
        </div>
        <button
          type="button"
          onClick={() => { setOpen(false); setSelected(new Set()); }}
          aria-label="Fermer la bibliothèque"
          className="shrink-0 p-1 rounded-lg text-[#6B5D4E] hover:text-[#2A2016] hover:bg-white transition-colors"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      {kind === "equipments" && (
        <div className="flex gap-1.5 px-3.5 py-2.5 overflow-x-auto hide-scrollbar border-b border-[#EDD9A3]/40">
          {[{ id: "all", label: "Tout" }, ...EQUIPMENT_CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                category === c.id
                  ? "bg-[#C4714A] text-white"
                  : "bg-[#FBF5EC] text-[#6B5D4E] hover:text-[#2A2016]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-64 overflow-y-auto thin-scroll p-2 space-y-1">
        {visible.length === 0 ? (
          <p className="text-[11px] text-[#6B5D4E] text-center py-6">
            Tout est déjà dans votre livret.
          </p>
        ) : (
          visible.map((entry) => {
            const picked = selected.has(entry.key);
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => toggle(entry.key)}
                className={`w-full text-left px-2.5 py-2 rounded-xl border flex items-start gap-2.5 transition-colors ${
                  picked
                    ? "border-[#C4714A] bg-[#C4714A]/5"
                    : "border-transparent hover:bg-[#FBF5EC]"
                }`}
              >
                <span
                  className={`w-[17px] h-[17px] rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    picked ? "bg-[#C4714A] border-[#C4714A] text-white" : "border-[#C9B99F]"
                  }`}
                >
                  {picked && <Check size={11} weight="bold" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-[#2A2016]">
                    {entry.icon && <span className="mr-1.5">{entry.icon}</span>}
                    {entry.title.fr}
                    {entry.required && (
                      <span className="ml-1.5 text-[9px] font-extrabold uppercase text-[#A35A38]">
                        obligatoire
                      </span>
                    )}
                  </span>
                  {entry.desc && (
                    <span className="block text-[11px] text-[#6B5D4E] mt-0.5 leading-snug">
                      {entry.desc.fr}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="px-3.5 py-3 border-t border-[#EDD9A3]/40 flex items-center gap-2">
        <p className="flex-1 text-[10px] text-[#6B5D4E] flex items-center gap-1">
          <Sparkle size={11} weight="fill" className="text-[#C4714A]" />
          Traductions EN · ES · IT incluses
        </p>
        <button
          type="button"
          onClick={confirm}
          disabled={selected.size === 0}
          className="px-4 py-2 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold disabled:opacity-40 transition-colors"
        >
          Ajouter {selected.size > 0 && `(${selected.size})`}
        </button>
      </div>
    </div>
  );
}
