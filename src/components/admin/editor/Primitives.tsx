"use client";

import React from "react";
import { CaretDown, CaretUp, Plus, Trash, ArrowUp, ArrowDown } from "@phosphor-icons/react";

/*
 * Ces primitives sont volontairement déclarées AU NIVEAU DU MODULE.
 * Déclarées à l'intérieur du composant éditeur, React les considérerait comme
 * un nouveau type de composant à chaque rendu et démonterait/remonterait les
 * champs : le curseur sauterait hors de l'input à chaque frappe.
 */

const INPUT_BASE =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#2A2016] outline-none transition-colors placeholder:text-[#A8998A] focus:border-[#C4714A] focus:ring-2 focus:ring-[#C4714A]/15";

export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="block mb-1.5">
      <span className="block text-xs font-bold text-[#2A2016]">{children}</span>
      {hint && <span className="block text-[11px] text-[#6B5D4E] mt-0.5 leading-snug">{hint}</span>}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-[family-name:var(--font-display)] text-[15px] font-bold text-[#5C3D2E]">{children}</h3>
      {action}
    </div>
  );
}

interface TextFieldProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  type?: string;
  field?: string;
  highlighted?: boolean;
}

export function TextField({
  label, hint, value, onChange, placeholder, mono, type = "text", field, highlighted,
}: TextFieldProps) {
  return (
    <div data-field={field} className={highlighted ? "rounded-xl animate-pulseRing" : undefined}>
      {label && <Label hint={hint}>{label}</Label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${INPUT_BASE} ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}

interface TextAreaFieldProps {
  label?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  field?: string;
  highlighted?: boolean;
}

export function TextAreaField({
  label, hint, value, onChange, placeholder, rows = 3, field, highlighted,
}: TextAreaFieldProps) {
  return (
    <div data-field={field} className={highlighted ? "rounded-xl animate-pulseRing" : undefined}>
      {label && <Label hint={hint}>{label}</Label>}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${INPUT_BASE} resize-y leading-relaxed`}
      />
    </div>
  );
}

export function SelectField({
  label, value, onChange, options, field,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  field?: string;
}) {
  return (
    <div data-field={field}>
      {label && <Label>{label}</Label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_BASE}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/** Sélecteur d'heure « 14 h 00 » stocké au format "14h00". */
export function TimeField({
  label, value, onChange, hours, field, highlighted,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hours: string[];
  field?: string;
  highlighted?: boolean;
}) {
  // Recherche l'heure N'IMPORTE OÙ dans la valeur : les anciens livrets
  // stockent du texte libre (« À partir de 16h00 (Accueil VIP) »), qu'un
  // motif ancré ne reconnaîtrait pas — on afficherait alors une heure fausse.
  const match = /(\d{1,2})\s*h\s*(\d{2})?/i.exec(value || "");
  const parsedHour = match ? match[1].padStart(2, "0") : null;
  // L'heure lue doit exister dans la liste, sinon le <select> afficherait
  // silencieusement sa première option à la place.
  const h = parsedHour && hours.includes(parsedHour) ? parsedHour : hours[Math.floor(hours.length / 2)];
  const m = match && match[2] ? match[2] : "00";
  const hasFreeText = Boolean(value?.trim()) && value.trim() !== `${h}h${m}`;

  return (
    <div data-field={field} className={highlighted ? "rounded-xl animate-pulseRing" : undefined}>
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        <select
          value={h}
          onChange={(e) => onChange(`${e.target.value}h${m}`)}
          className="flex-1 px-2.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold outline-none focus:border-[#C4714A]"
        >
          {hours.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <span className="text-sm font-bold text-[#6B5D4E]">h</span>
        <select
          value={m}
          onChange={(e) => onChange(`${h}h${e.target.value}`)}
          className="flex-1 px-2.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold outline-none focus:border-[#C4714A]"
        >
          {["00", "15", "30", "45"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {hasFreeText && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-1.5">
          Valeur enregistrée : « {value} ». Modifier l’heure ci-dessus la remplacera par « {h}h{m} ».
        </p>
      )}
    </div>
  );
}

/** Interrupteur « VISIBLE / MASQUÉ » du gestionnaire de modules. */
export function Toggle({
  checked, onChange, label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative w-[46px] h-[26px] rounded-full transition-colors shrink-0 ${
        checked ? "bg-[#C4714A]" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${
          checked ? "left-[23px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

/** Bouton d'ajout en pointillés, réutilisé dans tous les modules. */
export function AddButton({
  children, onClick, variant = "dashed",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "dashed" | "solid";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "dashed"
          ? "w-full py-2.5 rounded-xl border border-dashed border-gray-300 hover:border-[#C4714A] hover:text-[#C4714A] bg-white text-xs font-bold text-[#2A2016] flex items-center justify-center gap-2 transition-colors"
          : "w-full py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#C4714A] text-xs font-bold text-[#C4714A] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
      }
    >
      <Plus size={15} weight="bold" /> {children}
    </button>
  );
}

/** En-tête d'un élément de liste : titre, montée/descente, suppression. */
export function ItemToolbar({
  index, total, onMove, onDelete, children,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      {children}
      <button
        type="button"
        onClick={() => onMove(index, index - 1)}
        disabled={index === 0}
        title="Monter"
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-[#6B5D4E] hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowUp size={12} weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, index + 1)}
        disabled={index === total - 1}
        title="Descendre"
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-[#6B5D4E] hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowDown size={12} weight="bold" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Supprimer"
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
      >
        <Trash size={12} weight="bold" />
      </button>
    </div>
  );
}

export function Collapsible({
  open, onToggle, title, children,
}: {
  open: boolean;
  onToggle: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
      >
        {title}
        {open ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
      </button>
      {open && <div className="px-4 pb-4 animate-fadeIn">{children}</div>}
    </div>
  );
}

/** Petit encart d'aide contextuelle. */
export function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] text-[#6B5D4E] leading-relaxed bg-[#FDF9F2] border border-[#EDD9A3] rounded-xl px-3 py-2.5">
      {children}
    </p>
  );
}
