"use client";

import React, { useState } from "react";
import { CaretDown, CaretUp, Check, Translate, Warning, Sparkle, Spinner } from "@phosphor-icons/react";
import { translateTexts, TargetLang } from "@/app/admin/translate";
import { Accommodation } from "@/lib/types/accommodation";
import { LANGS, TranslatableLang, TranslationLayer, Translations } from "@/lib/i18n";

/**
 * Onglet « Langues » de l'éditeur.
 *
 * Chaque champ est présenté avec sa version française à gauche et sa
 * traduction à droite : l'hôte n'a jamais à chercher ce qu'il est en train de
 * traduire, et un champ laissé vide retombe sur le français côté voyageur —
 * un livret à moitié traduit reste donc lisible.
 *
 * Déclaré au niveau du module : à l'intérieur de l'éditeur, React remonterait
 * le composant à chaque frappe et le curseur sauterait hors du champ.
 */

interface FieldSpec {
  label: string;
  /** Texte français de référence. */
  source: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}

interface GroupSpec {
  key: string;
  title: string;
  fields: FieldSpec[];
}

interface TranslationsTabProps {
  data: Accommodation;
  lang: TranslatableLang;
  onLangChange: (lang: TranslatableLang) => void;
  /** Applique une modification au calque de la langue courante. */
  onLayerChange: (mutate: (layer: TranslationLayer) => TranslationLayer) => void;
  /** Langues proposées au voyageur. */
  enabled: string[];
  onEnabledChange: (langs: string[]) => void;
  /**
   * Adresse transmise au service de traduction : elle fait passer le quota
   * gratuit de 5 000 à 50 000 caractères par jour.
   */
  contactEmail?: string;
}

const has = (v?: string) => Boolean(v && v.trim());

/** Construit la liste des champs traduisibles à partir du livret. */
function buildGroups(
  data: Accommodation,
  layer: TranslationLayer,
  set: (mutate: (layer: TranslationLayer) => TranslationLayer) => void
): GroupSpec[] {
  /** Modifie une entrée de tableau indexée comme la version française. */
  const setAt = <T,>(key: keyof TranslationLayer, index: number, patch: T) =>
    set((current) => {
      const list = [...(((current[key] as unknown as T[]) || []) as T[])];
      list[index] = { ...(list[index] as object), ...(patch as object) } as T;
      return { ...current, [key]: list };
    });

  const setStringAt = (key: "rules" | "codes" | "departureInstructions", index: number, value: string) =>
    set((current) => {
      const list = [...((current[key] as string[]) || [])];
      list[index] = value;
      return { ...current, [key]: list };
    });

  const groups: GroupSpec[] = [];

  groups.push({
    key: "identity",
    title: "Identification",
    fields: [
      {
        label: "Titre du livret",
        source: data.property?.name || "",
        value: layer.property?.name || "",
        onChange: (v: string) => set((c) => ({ ...c, property: { ...c.property, name: v } })),
      },
      {
        label: "Type de logement",
        source: data.property?.type || "",
        value: layer.property?.type || "",
        onChange: (v: string) => set((c) => ({ ...c, property: { ...c.property, type: v } })),
      },
      {
        label: "Message d’accueil",
        source: data.property?.welcomeMessage || "",
        value: layer.property?.welcomeMessage || "",
        onChange: (v: string) => set((c) => ({ ...c, property: { ...c.property, welcomeMessage: v } })),
        multiline: true,
      },
    ].filter((f) => has(f.source)),
  });

  groups.push({
    key: "practical",
    title: "Arrivée & départ",
    fields: [
      {
        label: "Consignes d’arrivée",
        source: data.practicalInfo?.arrivalNotes || "",
        value: layer.practicalInfo?.arrivalNotes || "",
        onChange: (v: string) => set((c) => ({ ...c, practicalInfo: { ...c.practicalInfo, arrivalNotes: v } })),
        multiline: true,
      },
      {
        label: "Note de départ",
        source: data.practicalInfo?.departureNotes || "",
        value: layer.practicalInfo?.departureNotes || "",
        onChange: (v: string) => set((c) => ({ ...c, practicalInfo: { ...c.practicalInfo, departureNotes: v } })),
        multiline: true,
      },
      {
        label: "Stationnement",
        source: data.practicalInfo?.parking || "",
        value: layer.practicalInfo?.parking || "",
        onChange: (v: string) => set((c) => ({ ...c, practicalInfo: { ...c.practicalInfo, parking: v } })),
        multiline: true,
      },
      ...(data.practicalInfo?.departureInstructions || [])
        .map((step, i) => ({
          label: `Consigne de départ ${i + 1}`,
          source: step.text,
          value: layer.departureInstructions?.[i] || "",
          onChange: (v: string) => setStringAt("departureInstructions", i, v),
        }))
        .filter((f) => has(f.source)),
    ].filter((f) => has(f.source)),
  });

  groups.push({
    key: "rules",
    title: "Règlement",
    fields: (data.rules || [])
      .map((rule, i) => ({
        label: `Règle ${i + 1}`,
        source: rule,
        value: layer.rules?.[i] || "",
        onChange: (v: string) => setStringAt("rules", i, v),
      }))
      .filter((f) => has(f.source)),
  });

  groups.push({
    key: "codes",
    title: "Digicodes",
    fields: (data.codes || [])
      .map((code, i) => ({
        label: `Code ${i + 1}`,
        source: code.label,
        value: layer.codes?.[i] || "",
        onChange: (v: string) => setStringAt("codes", i, v),
      }))
      .filter((f) => has(f.source)),
  });

  groups.push({
    key: "contacts",
    title: "Contacts & urgences",
    fields: (data.contacts || []).flatMap((contact, i) =>
      [
        {
          label: `Contact ${i + 1} — intitulé`,
          source: contact.label,
          value: layer.contacts?.[i]?.label || "",
          onChange: (v: string) => setAt("contacts", i, { label: v }),
        },
        {
          label: `Contact ${i + 1} — précision`,
          source: contact.name,
          value: layer.contacts?.[i]?.name || "",
          onChange: (v: string) => setAt("contacts", i, { name: v }),
        },
      ].filter((f) => has(f.source))
    ),
  });

  groups.push({
    key: "equipments",
    title: "Équipements",
    fields: (data.equipments || []).flatMap((eq, i) =>
      [
        {
          label: `${eq.icon || ""} Équipement ${i + 1} — titre`,
          source: eq.title,
          value: layer.equipments?.[i]?.title || "",
          onChange: (v: string) => setAt("equipments", i, { title: v }),
        },
        {
          label: `Équipement ${i + 1} — notice`,
          source: eq.desc,
          value: layer.equipments?.[i]?.desc || "",
          onChange: (v: string) => setAt("equipments", i, { desc: v }),
          multiline: true,
        },
      ].filter((f) => has(f.source))
    ),
  });

  groups.push({
    key: "extras",
    title: "Les petits plus",
    fields: (data.comfortOptions?.upsells || []).flatMap((item, i) =>
      [
        {
          label: `Service ${i + 1} — titre`,
          source: item.title,
          value: layer.upsells?.[i]?.title || "",
          onChange: (v: string) => setAt("upsells", i, { title: v }),
        },
        {
          label: `Service ${i + 1} — description`,
          source: item.description,
          value: layer.upsells?.[i]?.description || "",
          onChange: (v: string) => setAt("upsells", i, { description: v }),
          multiline: true,
        },
      ].filter((f) => has(f.source))
    ),
  });

  groups.push({
    key: "addresses",
    title: "Bonnes adresses",
    fields: (data.recommendations || []).flatMap((rec, i) =>
      [
        {
          label: `Adresse ${i + 1} — nom`,
          source: rec.title,
          value: layer.recommendations?.[i]?.title || "",
          onChange: (v: string) => setAt("recommendations", i, { title: v }),
        },
        {
          label: `Adresse ${i + 1} — catégorie`,
          source: rec.category,
          value: layer.recommendations?.[i]?.category || "",
          onChange: (v: string) => setAt("recommendations", i, { category: v }),
        },
        {
          label: `Adresse ${i + 1} — description`,
          source: rec.description,
          value: layer.recommendations?.[i]?.description || "",
          onChange: (v: string) => setAt("recommendations", i, { description: v }),
          multiline: true,
        },
        {
          label: `Adresse ${i + 1} — votre mot`,
          source: rec.comment || "",
          value: layer.recommendations?.[i]?.comment || "",
          onChange: (v: string) => setAt("recommendations", i, { comment: v }),
          multiline: true,
        },
      ].filter((f) => has(f.source))
    ),
  });

  groups.push({
    key: "transports",
    title: "Transports",
    fields: (data.transportLines || []).flatMap((line, i) =>
      [
        {
          label: `Ligne ${i + 1} — mode`,
          source: line.type,
          value: layer.transportLines?.[i]?.type || "",
          onChange: (v: string) => setAt("transportLines", i, { type: v }),
        },
        {
          label: `Ligne ${i + 1} — arrêt`,
          source: line.station,
          value: layer.transportLines?.[i]?.station || "",
          onChange: (v: string) => setAt("transportLines", i, { station: v }),
        },
      ].filter((f) => has(f.source))
    ),
  });

  groups.push({
    key: "faq",
    title: "Questions fréquentes",
    fields: (data.comfortOptions?.faq || []).flatMap((item, i) =>
      [
        {
          label: `Question ${i + 1}`,
          source: item.question,
          value: layer.faq?.[i]?.question || "",
          onChange: (v: string) => setAt("faq", i, { question: v }),
        },
        {
          label: `Réponse ${i + 1}`,
          source: item.answer,
          value: layer.faq?.[i]?.answer || "",
          onChange: (v: string) => setAt("faq", i, { answer: v }),
          multiline: true,
        },
      ].filter((f) => has(f.source))
    ),
  });

  return groups.filter((g) => g.fields.length > 0);
}

export default function TranslationsTab({
  data,
  lang,
  onLangChange,
  onLayerChange,
  enabled,
  onEnabledChange,
  contactEmail,
}: TranslationsTabProps) {
  const [openGroup, setOpenGroup] = useState<string | null>("identity");
  const [autoState, setAutoState] = useState<"idle" | "running">("idle");
  const [autoMessage, setAutoMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  /** Écraser les traductions déjà saisies, ou ne remplir que les vides. */
  const [overwrite, setOverwrite] = useState(false);

  const layer = ((data.translations as Translations | undefined)?.[lang] || {}) as TranslationLayer;
  const groups = buildGroups(data, layer, onLayerChange);

  const total = groups.reduce((sum, g) => sum + g.fields.length, 0);
  const done = groups.reduce((sum, g) => sum + g.fields.filter((f) => has(f.value)).length, 0);
  const translatable = LANGS.filter((l) => l.code !== "fr");

  const pending = groups.flatMap((g) => g.fields).filter((f) => overwrite || !has(f.value));

  /**
   * Traduction automatique de tous les champs concernés.
   *
   * Les champs sont renvoyés dans l'ordre : on réapplique donc chaque
   * traduction sur son propre champ. Les `onChange` s'enchaînent sur des
   * mises à jour fonctionnelles, ils se composent sans s'écraser.
   */
  const runAutoTranslate = async () => {
    if (pending.length === 0 || autoState === "running") return;
    setAutoState("running");
    setAutoMessage(null);
    try {
      const result = await translateTexts(
        pending.map((f) => f.source),
        lang as TargetLang,
        contactEmail
      );
      let applied = 0;
      result.translations.forEach((value, index) => {
        if (value && value.trim()) {
          pending[index].onChange(value.trim());
          applied++;
        }
      });
      if (result.warning) {
        setAutoMessage({ tone: "warn", text: result.warning });
      } else {
        setAutoMessage({
          tone: "ok",
          text: `${applied} champ${applied > 1 ? "s traduits" : " traduit"}. Relisez-les : la traduction automatique est un point de départ.`,
        });
      }
    } catch (error) {
      setAutoMessage({
        tone: "warn",
        text: error instanceof Error ? error.message : "La traduction automatique a échoué.",
      });
    } finally {
      setAutoState("idle");
    }
  };

  return (
    <div className="space-y-5">
      {/* Langues proposées au voyageur */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#9A9086]">
          Langues proposées
        </h3>
        <p className="text-[11px] text-[#8A8078] leading-relaxed">
          Le français est toujours proposé. Une langue n’apparaît dans le livret
          que si elle contient au moins une traduction.
        </p>
        <div className="flex flex-wrap gap-2">
          {translatable.map((l) => {
            const on = enabled.includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() =>
                  onEnabledChange(
                    on ? enabled.filter((c) => c !== l.code) : [...new Set([...enabled, "fr", l.code])]
                  )
                }
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  on ? "border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]" : "border-gray-200 text-[#6B5D4E] hover:border-gray-300"
                }`}
              >
                <span>{l.flag}</span>
                {l.label}
                {on && <Check size={12} weight="bold" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Langue en cours de traduction */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {translatable.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onLangChange(l.code as TranslatableLang)}
              className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                lang === l.code ? "border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]" : "border-gray-200 text-[#2A2016] hover:border-gray-300"
              }`}
            >
              <span>{l.flag}</span>
              {l.short}
            </button>
          ))}
        </div>

        {/* Traduction automatique */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <h4 className="text-sm font-bold text-[#2A2016] flex items-center gap-2">
              <Sparkle size={15} weight="fill" className="text-[#FF385C]" />
              Traduire automatiquement
            </h4>
            <p className="text-[11px] text-[#8A8078] mt-1 leading-relaxed">
              Remplit les champs d’un coup. La qualité est correcte sans être
              éditoriale : relisez avant de publier. Service gratuit, limité à
              quelques milliers de caractères par jour.
            </p>
          </div>

          <label className="flex items-center gap-2 text-[11px] text-[#6B5D4E] cursor-pointer">
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(e) => setOverwrite(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#FF385C]"
            />
            Réécrire aussi les champs déjà traduits
          </label>

          <button
            type="button"
            onClick={() => void runAutoTranslate()}
            disabled={autoState === "running" || pending.length === 0}
            className="w-full py-2.5 rounded-xl bg-[#FF385C] hover:bg-[#E03150] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {autoState === "running" ? (
              <>
                <Spinner size={14} className="animate-spin" />
                Traduction en cours…
              </>
            ) : pending.length === 0 ? (
              "Tout est déjà traduit"
            ) : (
              <>
                <Sparkle size={14} weight="fill" />
                Traduire {pending.length} champ{pending.length > 1 ? "s" : ""} en {LANGS.find((l) => l.code === lang)?.label}
              </>
            )}
          </button>

          {autoMessage && (
            <p
              className={`text-[11px] rounded-xl px-3 py-2.5 flex items-start gap-1.5 ${
                autoMessage.tone === "ok"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border border-amber-200 text-amber-800"
              }`}
            >
              {autoMessage.tone === "ok"
                ? <Check size={13} weight="bold" className="shrink-0 mt-0.5" />
                : <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />}
              {autoMessage.text}
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm font-bold text-[#2A2016]">
            <span className="flex items-center gap-2">
              <Translate size={16} weight="bold" className="text-[#FF385C]" />
              Progression
            </span>
            <span className="text-[#FF385C] font-extrabold">
              {done}/{total}
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FF385C] transition-[width] duration-500"
              style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
            />
          </div>
          {done < total && (
            <p className="text-[11px] text-[#8A8078] mt-2.5">
              Les champs non traduits s’afficheront en français — le livret reste lisible.
            </p>
          )}
        </div>

        {!enabled.includes(lang) && done > 0 && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-1.5">
            <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />
            Cette langue est traduite mais n’est pas proposée au voyageur.
            Activez-la dans « Langues proposées » ci-dessus.
          </p>
        )}
      </div>

      {/* Champs, section par section */}
      {groups.map((group) => {
        const groupDone = group.fields.filter((f) => has(f.value)).length;
        const isOpen = openGroup === group.key;
        return (
          <div key={group.key} className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setOpenGroup(isOpen ? null : group.key)}
              className="w-full px-4 py-3 flex items-center justify-between gap-2 text-left"
            >
              <span className="text-xs font-bold text-[#2A2016]">{group.title}</span>
              <span className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    groupDone === group.fields.length
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-[#8A8078]"
                  }`}
                >
                  {groupDone}/{group.fields.length}
                </span>
                {isOpen ? <CaretUp size={13} weight="bold" /> : <CaretDown size={13} weight="bold" />}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3.5 animate-fadeIn">
                {group.fields.map((field, i) => (
                  <div key={i}>
                    <label className="block text-[11px] font-bold text-[#2A2016] mb-1">{field.label}</label>
                    {/* Source française : visible en permanence, jamais modifiable ici. */}
                    <p className="text-[11px] text-[#8A8078] bg-[#FBF9F5] border border-[#EFE9DF] rounded-lg px-2.5 py-2 mb-1.5 whitespace-pre-line">
                      {field.source}
                    </p>
                    {field.multiline ? (
                      <textarea
                        rows={3}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Traduction…"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#FF385C] resize-y"
                      />
                    ) : (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="Traduction…"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {groups.length === 0 && (
        <p className="text-xs text-[#8A8078] text-center py-8">
          Remplissez d’abord votre livret en français : les champs à traduire
          apparaîtront ici automatiquement.
        </p>
      )}
    </div>
  );
}
