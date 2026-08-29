"use server";

import { cookies } from "next/headers";

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

export type TargetLang = "en" | "es" | "it";

export interface TranslateResult {
  /** Traductions dans l'ordre des textes fournis ; null si échec. */
  translations: (string | null)[];
  /** Le quota journalier est atteint : les entrées suivantes sont nulles. */
  quotaExceeded: boolean;
  /** Message à afficher à l'hôte, le cas échéant. */
  warning?: string;
}

async function requireAdminAuth() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
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
  contactEmail?: string
): Promise<TranslateResult> {
  await requireAdminAuth();

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
