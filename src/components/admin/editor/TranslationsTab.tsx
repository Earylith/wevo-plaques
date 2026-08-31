"use client";

import React, { useState } from "react";
import { Check, Translate, Warning, Sparkle, Spinner } from "@phosphor-icons/react";
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
  /** Applique une modification au calque d'une langue donnée. */
  onLayerChange: (
    lang: TranslatableLang,
    mutate: (layer: TranslationLayer) => TranslationLayer
  ) => void;
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
  onLayerChange,
  enabled,
  onEnabledChange,
  contactEmail,
}: TranslationsTabProps) {
  const [enCours, setEnCours] = useState<TranslatableLang | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  /** Retraduire ce qui est déjà traduit, ou ne remplir que les vides. */
  const [ecraser, setEcraser] = useState(false);

  const layers = ((data.translations as Translations | undefined) || {}) as Translations;
  const traduisibles = LANGS.filter((l) => l.code !== "fr");
  const choisies = traduisibles.filter((l) => enabled.includes(l.code));

  /** Nombre de champs déjà traduits dans une langue. */
  const avancement = (code: TranslatableLang) => {
    const groupes = buildGroups(data, (layers[code] || {}) as TranslationLayer, () => {});
    const champs = groupes.flatMap((g) => g.fields);
    return { total: champs.length, faits: champs.filter((f) => has(f.value)).length };
  };

  /**
   * Traduit tout le livret dans les langues choisies.
   *
   * Langue par langue, et non tout d'un bloc : le service impose un quota
   * journalier, et s'arrêter proprement après l'anglais vaut mieux que
   * d'échouer partout à la fois.
   */
  const traduire = async () => {
    if (choisies.length === 0 || enCours) return;
    setMessage(null);

    const { auth } = await import("@/lib/firebase/config");
    const jeton = await auth.currentUser?.getIdToken();

    let totalApplique = 0;
    let alerte: string | null = null;

    for (const langue of choisies) {
      const code = langue.code as TranslatableLang;
      setEnCours(code);
      try {
        // Les champs sont reconstruits POUR cette langue : leurs `onChange`
        // écrivent dans le bon calque, sans changer d'onglet.
        const groupes = buildGroups(
          data,
          (layers[code] || {}) as TranslationLayer,
          (apply) => onLayerChange(code, apply)
        );
        const aFaire = groupes
          .flatMap((g) => g.fields)
          .filter((f) => ecraser || !has(f.value));
        if (aFaire.length === 0) continue;

        const resultat = await translateTexts(
          aFaire.map((f) => f.source),
          code as TargetLang,
          contactEmail,
          jeton
        );
        resultat.translations.forEach((valeur, index) => {
          if (valeur && valeur.trim()) {
            aFaire[index].onChange(valeur.trim());
            totalApplique++;
          }
        });
        if (resultat.warning) alerte = resultat.warning;
      } catch (error) {
        alerte = error instanceof Error ? error.message : "La traduction a échoué.";
        break;
      }
    }

    setEnCours(null);
    setMessage(
      alerte
        ? { tone: "warn", text: alerte }
        : {
            tone: "ok",
            text: `${totalApplique} champ${totalApplique > 1 ? "s traduits" : " traduit"}. Vos voyageurs peuvent lire le livret dans leur langue.`,
          }
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#7A5544]">
          Langues proposées
        </h3>
        <p className="text-[11px] text-[#6B5D4E] leading-relaxed">
          Le français est toujours proposé. Choisissez les langues à ajouter,
          puis lancez la traduction : tout le livret est traduit d’un coup.
        </p>
        <div className="flex flex-wrap gap-2">
          {traduisibles.map((l) => {
            const active = enabled.includes(l.code);
            const { total, faits } = avancement(l.code as TranslatableLang);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() =>
                  onEnabledChange(
                    active
                      ? enabled.filter((c) => c !== l.code)
                      : [...new Set([...enabled, "fr", l.code])]
                  )
                }
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  active
                    ? "border-[#C4714A] bg-[#C4714A]/5 text-[#C4714A]"
                    : "border-gray-200 text-[#6B5D4E] hover:border-gray-300"
                }`}
              >
                <span>{l.flag}</span>
                {l.label}
                {active && total > 0 && (
                  <span className="text-[10px] font-extrabold opacity-70">
                    {faits}/{total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#EDD9A3] bg-[#FDF9F2] p-4 space-y-3">
        <p className="text-[11px] text-[#5C3D2E] leading-relaxed flex items-start gap-1.5">
          <Sparkle size={13} weight="fill" className="shrink-0 mt-0.5 text-[#C4714A]" />
          La traduction est automatique. Elle rend le livret compréhensible
          dans chaque langue ; ce n’est pas une traduction d’auteur.
        </p>

        <label className="flex items-center gap-2 text-[11px] text-[#5C3D2E] cursor-pointer">
          <input
            type="checkbox"
            checked={ecraser}
            onChange={(e) => setEcraser(e.target.checked)}
            className="accent-[#C4714A]"
          />
          Retraduire aussi ce qui est déjà traduit
        </label>

        <button
          type="button"
          onClick={() => void traduire()}
          disabled={choisies.length === 0 || enCours !== null}
          className="w-full py-2.5 rounded-xl bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {enCours ? (
            <>
              <Spinner size={14} className="animate-spin" />
              Traduction en {LANGS.find((l) => l.code === enCours)?.label}…
            </>
          ) : (
            <>
              <Translate size={14} weight="bold" />
              {choisies.length === 0
                ? "Choisissez au moins une langue"
                : `Traduire mon livret (${choisies.length} langue${choisies.length > 1 ? "s" : ""})`}
            </>
          )}
        </button>

        {message && (
          <p
            className={`text-[11px] leading-relaxed flex items-start gap-1.5 rounded-xl px-3 py-2.5 border ${
              message.tone === "ok"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {message.tone === "ok" ? (
              <Check size={13} weight="bold" className="shrink-0 mt-0.5" />
            ) : (
              <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />
            )}
            {message.text}
          </p>
        )}
      </div>

      <p className="text-[10px] text-[#A8998A] leading-relaxed">
        Un champ non traduit s’affiche en français côté voyageur : un livret
        partiellement traduit reste lisible.
      </p>
    </div>
  );
}
