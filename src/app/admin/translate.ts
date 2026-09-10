"use server";

import { after } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { hasValidAdminSession } from "@/lib/server/admin-auth";
import { Accommodation, TranslationJob } from "@/lib/types/accommodation";
import { TranslationLayer, Translations } from "@/lib/i18n";

/**
 * Traduction automatique via MyMemory.
 *
 * Gratuit et sans clé d'API — le seul service de traduction sérieux qui le
 * reste (LibreTranslate exige désormais une clé sur son instance publique).
 * En contrepartie la qualité est correcte mais pas éditoriale : c'est un
 * point de départ que l'hôte relit, pas une traduction finale.
 *
 * Deux limites imposées par le service, gérées ici :
 *  - 500 octets par requête → les textes longs sont découpés par phrases ;
 *  - 5 000 caractères par jour et par IP, 50 000 si l'on transmet une adresse
 *    e-mail de contact → on transmet celle de l'hôte quand elle existe.
 *
 * https://mymemory.translated.net/doc/spec.php
 */

const ENDPOINT = "https://api.mymemory.translated.net/get";
/** Marge sous la limite de 500 octets, les accents comptant double en UTF-8. */
const MAX_CHUNK = 420;
const REQUEST_TIMEOUT_MS = 12000;
/** Politesse envers un service gratuit. */
const DELAY_BETWEEN_CALLS_MS = 180;

export type TargetLang = "en" | "es" | "it" | "de";

export interface TranslateResult {
  /** Traductions dans l'ordre des textes fournis ; null si échec. */
  translations: (string | null)[];
  /** Le quota journalier est atteint : les entrées suivantes sont nulles. */
  quotaExceeded: boolean;
  /** Message à afficher à l'hôte, le cas échéant. */
  warning?: string;
}

/**
 * Autorise l'appelant : l'administration par son cookie, ou un hôte connecté
 * par son jeton Firebase.
 *
 * La version précédente n'acceptait que le cookie d'administration. Résultat :
 * la traduction marchait depuis l'admin et échouait silencieusement depuis
 * l'espace hôte — c'était le « ça ne marche pas des fois » constaté en
 * production, et non un caprice du service de traduction.
 */
async function autoriser(jetonHote?: string) {
  if (await hasValidAdminSession()) return;
  if (!jetonHote) throw new Error("Connectez-vous pour utiliser la traduction.");
  await adminAuth.verifyIdToken(jetonHote);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Découpe un texte en morceaux traduisibles, sans couper au milieu d'une
 * phrase : une phrase tronquée se traduit mal, et le recollage se verrait.
 */
function chunk(text: string): string[] {
  if (Buffer.byteLength(text, "utf8") <= MAX_CHUNK) return [text];

  const sentences = text.split(/(?<=[.!?…])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (Buffer.byteLength(candidate, "utf8") > MAX_CHUNK && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);

  // Une phrase unique dépassant la limite : découpage sec par mots.
  return chunks.flatMap((part) => {
    if (Buffer.byteLength(part, "utf8") <= MAX_CHUNK) return [part];
    const words = part.split(" ");
    const pieces: string[] = [];
    let buffer = "";
    for (const word of words) {
      const candidate = buffer ? `${buffer} ${word}` : word;
      if (Buffer.byteLength(candidate, "utf8") > MAX_CHUNK && buffer) {
        pieces.push(buffer);
        buffer = word;
      } else {
        buffer = candidate;
      }
    }
    if (buffer) pieces.push(buffer);
    return pieces;
  });
}

interface MyMemoryResponse {
  responseStatus?: number | string;
  responseData?: { translatedText?: string };
  quotaFinished?: boolean;
  matches?: unknown[];
}

async function translateChunk(
  text: string,
  target: TargetLang,
  email?: string
): Promise<{ text: string | null; quotaExceeded: boolean }> {
  const params = new URLSearchParams({ q: text, langpair: `fr|${target}` });
  if (email) params.set("de", email);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return { text: null, quotaExceeded: false };

    const json = (await response.json()) as MyMemoryResponse;
    if (json.quotaFinished) return { text: null, quotaExceeded: true };

    const translated = json.responseData?.translatedText;
    if (!translated) return { text: null, quotaExceeded: false };

    // Le service renvoie parfois son message d'erreur DANS le champ traduit.
    if (/MYMEMORY WARNING|QUOTA EXCEEDED|INVALID/i.test(translated)) {
      return { text: null, quotaExceeded: /QUOTA/i.test(translated) };
    }
    return { text: translated, quotaExceeded: false };
  } catch {
    return { text: null, quotaExceeded: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Traduit une série de textes français vers `target`.
 *
 * Les doublons ne sont traduits qu'une fois : un livret répète souvent les
 * mêmes intitulés, et le quota journalier est vite atteint.
 */
export async function translateTexts(
  texts: string[],
  target: TargetLang,
  contactEmail?: string,
  jetonHote?: string
): Promise<TranslateResult> {
  await autoriser(jetonHote);

  const email = contactEmail && /.+@.+\..+/.test(contactEmail) ? contactEmail : undefined;
  const cache = new Map<string, string | null>();
  const translations: (string | null)[] = [];
  let quotaExceeded = false;
  let failures = 0;

  for (const source of texts) {
    const trimmed = (source || "").trim();
    if (!trimmed) {
      translations.push(null);
      continue;
    }
    if (cache.has(trimmed)) {
      translations.push(cache.get(trimmed) ?? null);
      continue;
    }
    if (quotaExceeded) {
      translations.push(null);
      continue;
    }

    const pieces = chunk(trimmed);
    const out: string[] = [];
    let failed = false;

    for (const piece of pieces) {
      const result = await translateChunk(piece, target, email);
      if (result.quotaExceeded) {
        quotaExceeded = true;
        failed = true;
        break;
      }
      if (!result.text) {
        failed = true;
        break;
      }
      out.push(result.text);
      if (pieces.length > 1) await wait(DELAY_BETWEEN_CALLS_MS);
    }

    const value = failed ? null : out.join(" ");
    if (failed) failures++;
    cache.set(trimmed, value);
    translations.push(value);
    await wait(DELAY_BETWEEN_CALLS_MS);
  }

  let warning: string | undefined;
  if (quotaExceeded) {
    warning =
      "Le quota gratuit du service de traduction est atteint pour aujourd’hui. " +
      "Les champs restants sont inchangés — réessayez demain ou traduisez-les à la main.";
  } else if (failures > 0) {
    warning = `${failures} champ${failures > 1 ? "s n’ont" : " n’a"} pas pu être traduit${failures > 1 ? "s" : ""}. Les autres sont remplis.`;
  }

  return { translations, quotaExceeded, warning };
}

/**
 * Extrait tous les champs traduisibles d'un livret et prépare l'application des résultats.
 */
function extraireChampsTraduction(
  data: Accommodation,
  layer: TranslationLayer,
  ecraser = false
): { sources: string[]; appliquer: (traductions: (string | null)[]) => TranslationLayer } {
  const sources: string[] = [];
  const setters: ((valeur: string, out: TranslationLayer) => void)[] = [];

  const add = (
    source: string | undefined,
    currentValue: string | undefined,
    setter: (valeur: string, out: TranslationLayer) => void
  ) => {
    const src = (source || "").trim();
    if (!src) return;
    const cur = (currentValue || "").trim();
    if (!ecraser && cur) return;

    sources.push(src);
    setters.push(setter);
  };

  // 1. Identification
  add(data.property?.name, layer.property?.name, (v, out) => {
    out.property = { ...out.property, name: v };
  });
  add(data.property?.type, layer.property?.type, (v, out) => {
    out.property = { ...out.property, type: v };
  });
  add(data.property?.welcomeMessage, layer.property?.welcomeMessage, (v, out) => {
    out.property = { ...out.property, welcomeMessage: v };
  });

  // 2. Arrivée & départ
  add(data.practicalInfo?.arrivalNotes, layer.practicalInfo?.arrivalNotes, (v, out) => {
    out.practicalInfo = { ...out.practicalInfo, arrivalNotes: v };
  });
  add(data.practicalInfo?.departureNotes, layer.practicalInfo?.departureNotes, (v, out) => {
    out.practicalInfo = { ...out.practicalInfo, departureNotes: v };
  });
  add(data.practicalInfo?.parking, layer.practicalInfo?.parking, (v, out) => {
    out.practicalInfo = { ...out.practicalInfo, parking: v };
  });
  add(data.practicalInfo?.breakfast, layer.practicalInfo?.breakfast, (v, out) => {
    out.practicalInfo = { ...out.practicalInfo, breakfast: v };
  });

  (data.practicalInfo?.departureInstructions || []).forEach((step, i) => {
    add(step.text, layer.departureInstructions?.[i], (v, out) => {
      const list = [...(out.departureInstructions || [])];
      list[i] = v;
      out.departureInstructions = list;
    });
  });

  // 3. Règlement intérieur
  (data.rules || []).forEach((rule, i) => {
    add(rule, layer.rules?.[i], (v, out) => {
      const list = [...(out.rules || [])];
      list[i] = v;
      out.rules = list;
    });
  });

  // 4. Digicodes
  (data.codes || []).forEach((code, i) => {
    add(code.label, layer.codes?.[i], (v, out) => {
      const list = [...(out.codes || [])];
      list[i] = v;
      out.codes = list;
    });
  });

  // 5. Contacts & urgences
  (data.contacts || []).forEach((contact, i) => {
    add(contact.label, layer.contacts?.[i]?.label, (v, out) => {
      const list = [...(out.contacts || [])];
      list[i] = { ...list[i], label: v };
      out.contacts = list;
    });
    add(contact.name, layer.contacts?.[i]?.name, (v, out) => {
      const list = [...(out.contacts || [])];
      list[i] = { ...list[i], name: v };
      out.contacts = list;
    });
  });

  // 6. Équipements
  (data.equipments || []).forEach((eq, i) => {
    add(eq.title, layer.equipments?.[i]?.title, (v, out) => {
      const list = [...(out.equipments || [])];
      list[i] = { ...list[i], title: v };
      out.equipments = list;
    });
    add(eq.desc, layer.equipments?.[i]?.desc, (v, out) => {
      const list = [...(out.equipments || [])];
      list[i] = { ...list[i], desc: v };
      out.equipments = list;
    });
  });

  // 7. Bonnes adresses (recommandations)
  (data.recommendations || []).forEach((rec, i) => {
    add(rec.title, layer.recommendations?.[i]?.title, (v, out) => {
      const list = [...(out.recommendations || [])];
      list[i] = { ...list[i], title: v };
      out.recommendations = list;
    });
    add(rec.category, layer.recommendations?.[i]?.category, (v, out) => {
      const list = [...(out.recommendations || [])];
      list[i] = { ...list[i], category: v };
      out.recommendations = list;
    });
    add(rec.description, layer.recommendations?.[i]?.description, (v, out) => {
      const list = [...(out.recommendations || [])];
      list[i] = { ...list[i], description: v };
      out.recommendations = list;
    });
    add(rec.comment, layer.recommendations?.[i]?.comment, (v, out) => {
      const list = [...(out.recommendations || [])];
      list[i] = { ...list[i], comment: v };
      out.recommendations = list;
    });
  });

  // 8. Transports
  (data.transportLines || []).forEach((line, i) => {
    add(line.type, layer.transportLines?.[i]?.type, (v, out) => {
      const list = [...(out.transportLines || [])];
      list[i] = { ...list[i], type: v };
      out.transportLines = list;
    });
    add(line.station, layer.transportLines?.[i]?.station, (v, out) => {
      const list = [...(out.transportLines || [])];
      list[i] = { ...list[i], station: v };
      out.transportLines = list;
    });
  });

  // 9. Services additionnels & FAQ
  (data.comfortOptions?.upsells || []).forEach((item, i) => {
    add(item.title, layer.upsells?.[i]?.title, (v, out) => {
      const list = [...(out.upsells || [])];
      list[i] = { ...list[i], title: v };
      out.upsells = list;
    });
    add(item.description, layer.upsells?.[i]?.description, (v, out) => {
      const list = [...(out.upsells || [])];
      list[i] = { ...list[i], description: v };
      out.upsells = list;
    });
  });

  (data.comfortOptions?.faq || []).forEach((item, i) => {
    add(item.question, layer.faq?.[i]?.question, (v, out) => {
      const list = [...(out.faq || [])];
      list[i] = { ...list[i], question: v };
      out.faq = list;
    });
    add(item.answer, layer.faq?.[i]?.answer, (v, out) => {
      const list = [...(out.faq || [])];
      list[i] = { ...list[i], answer: v };
      out.faq = list;
    });
  });

  const appliquer = (traductions: (string | null)[]) => {
    const nouveauCalque: TranslationLayer = JSON.parse(JSON.stringify(layer));
    setters.forEach((setter, idx) => {
      const val = traductions[idx];
      if (val && val.trim()) {
        setter(val.trim(), nouveauCalque);
      }
    });
    return nouveauCalque;
  };

  return { sources, appliquer };
}

/**
 * Lance la traduction automatique en arrière-plan.
 *
 * La fonction enregistre immédiatement le statut dans Firestore et lance le travail
 * sans bloquer le client. L'hôte peut quitter la page ou continuer ses modifications :
 * chaque langue est enregistrée au fur et à mesure.
 */
export async function lancerTraductionEnArrierePlan(params: {
  accommodationId: string;
  targetLangs: TargetLang[];
  contactEmail?: string;
  ecraser?: boolean;
  jetonHote?: string;
}): Promise<{ ok: boolean; message: string }> {
  await autoriser(params.jetonHote);

  const { accommodationId, targetLangs, contactEmail, ecraser } = params;
  if (!accommodationId) {
    throw new Error("Identifiant de logement manquant pour lancer la traduction.");
  }
  if (!targetLangs.length) {
    return { ok: false, message: "Aucune langue sélectionnée." };
  }

  const docRef = adminDb.collection("accommodations").doc(accommodationId);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error("Logement introuvable.");
  }

  const currentAcc = doc.data() as Accommodation;
  const existingEnabled = (currentAcc.comfortOptions?.enabledLanguages || ["fr"]) as string[];
  const updatedEnabled = Array.from(new Set([...existingEnabled, "fr", ...targetLangs]));

  // 1. Marquer immédiatement le job en cours dans Firestore
  await docRef.update({
    "comfortOptions.enabledLanguages": updatedEnabled,
    "translationJob.status": "in_progress",
    "translationJob.startedAt": Date.now(),
    "translationJob.targetLangs": targetLangs,
    "translationJob.completedLangs": [],
    "translationJob.totalTranslated": 0,
    "translationJob.warning": null,
    "translationJob.error": null,
    updatedAt: Date.now(),
  });

  // 2. Définition de la tâche de fond
  const tacheFond = async () => {
    let totalTraduit = 0;
    let dernierWarning: string | null = null;
    const completedLangs: TargetLang[] = [];

    for (const code of targetLangs) {
      try {
        const snap = await docRef.get();
        if (!snap.exists) break;
        const freshData = snap.data() as Accommodation;
        const layers = (freshData.translations || {}) as Record<string, TranslationLayer>;
        const existingLayer = layers[code] || {};

        const { sources, appliquer } = extraireChampsTraduction(freshData, existingLayer, ecraser);
        if (sources.length === 0) {
          if (!completedLangs.includes(code)) completedLangs.push(code);
          await docRef.update({
            "translationJob.completedLangs": completedLangs,
            updatedAt: Date.now(),
          });
          continue;
        }

        const res = await translateTexts(sources, code, contactEmail, params.jetonHote);
        if (res.warning) dernierWarning = res.warning;

        const nouveauCalque = appliquer(res.translations);
        const count = res.translations.filter((t) => t && t.trim()).length;
        totalTraduit += count;
        if (!completedLangs.includes(code)) completedLangs.push(code);

        await docRef.update({
          [`translations.${code}`]: nouveauCalque,
          "translationJob.completedLangs": completedLangs,
          "translationJob.totalTranslated": totalTraduit,
          updatedAt: Date.now(),
        });

        if (res.quotaExceeded) {
          break;
        }
      } catch (err) {
        console.error(`[traduction-fond] Erreur pour la langue ${code}:`, err);
        dernierWarning = err instanceof Error ? err.message : "Erreur pendant la traduction.";
        break;
      }
    }

    // Mise à jour finale du job
    await docRef.update({
      "translationJob.status": dernierWarning ? "warning" : "completed",
      "translationJob.completedAt": Date.now(),
      "translationJob.totalTranslated": totalTraduit,
      "translationJob.warning": dernierWarning || null,
      updatedAt: Date.now(),
    }).catch((err) => console.error("[traduction-fond] Erreur finalisation job:", err));
  };

  // Exécution asynchrone non-bloquante avec after() ou exécution d'arrière-plan
  try {
    after(tacheFond);
  } catch {
    void tacheFond();
  }

  return {
    ok: true,
    message:
      "Vos traductions sont en cours en arrière-plan. Vous pouvez continuer à modifier votre livret ou revenir plus tard !",
  };
}

/**
 * Récupère l'état d'avancement de la traduction et les calques à jour.
 */
export async function obtenirStatutTraduction(
  accommodationId: string,
  jetonHote?: string
): Promise<{
  job: TranslationJob | null;
  translations: Translations;
}> {
  await autoriser(jetonHote);
  const snap = await adminDb.collection("accommodations").doc(accommodationId).get();
  if (!snap.exists) return { job: null, translations: {} };
  const data = snap.data() as Accommodation;
  return {
    job: (data.translationJob as TranslationJob | undefined) || null,
    translations: (data.translations as Translations | undefined) || {},
  };
}
