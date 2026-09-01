"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { PlaceResult, LatLon, categoryFromOsm } from "@/lib/geo";

/**
 * Recherche de lieux via Nominatim (OpenStreetMap).
 *
 * Gratuit, sans clé d'API. L'appel passe par le serveur et non par le
 * navigateur pour deux raisons : la politique d'usage de Nominatim exige un
 * `User-Agent` identifiant l'application (impossible à définir depuis un
 * `fetch` navigateur), et cela nous laisse imposer une cadence maximale d'une
 * requête par seconde, comme demandé.
 *
 * https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

/**
 * Base Adresse Nationale, interrogée AVANT Nominatim.
 *
 * Nominatim interdit l'usage depuis une ferme de serveurs et bloque en
 * pratique les adresses IP d'hébergeurs : la recherche marche en local et
 * échoue une fois déployée, sans message clair. La BAN, elle, est faite pour
 * cet usage, ne demande pas de clé, et connaît mieux les adresses françaises
 * — c'est l'essentiel de nos logements. Nominatim reste en secours, pour les
 * lieux-dits, les commerces et l'étranger.
 */
const BAN = "https://api-adresse.data.gouv.fr/search/";
const USER_AGENT = "wevo-plaques/1.0 (livret d'accueil; contact via admin)";
const MIN_INTERVAL_MS = 1100;
const TIMEOUT_MS = 8000;

/** Horodatage du dernier appel, pour tenir la cadence imposée. */
let lastCallAt = 0;

/**
 * Qui a le droit de chercher une adresse.
 *
 * Guidz par son cookie, l'hôte par son jeton Firebase. La recherche n'exigeait
 * que le cookie : un hôte qui composait son livret voyait donc l'action
 * échouer, et le message d'erreur est masqué en production — il ne restait
 * qu'un « An error occurred in the Server Components render » sans rien pour
 * comprendre. Le champ d'adresse paraissait cassé, et avec lui la carte du
 * logement, qui dépend de l'adresse.
 */
async function autoriser(jetonHote?: string) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value === "true") return;

  if (!jetonHote) {
    throw new Error("Connectez-vous pour rechercher une adresse.");
  }
  await adminAuth.verifyIdToken(jetonHote);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Abréviations postales françaises.
 *
 * C'est LE point de rupture en pratique : une adresse copiée depuis Google
 * Maps s'écrit « 71 Trav. Parangon », et Nominatim ne connaît que
 * « Traverse ». Sans cette expansion, la recherche ne renvoie rien du tout
 * alors que le lieu existe.
 */
/*
 * La limite de mot vient AVANT le point, pas après : dans « Trav. » elle se
 * situe entre le « v » et le « . ». Écrire `\.?\b` laisserait le point en
 * place et produirait « Traverse. », que Nominatim ne trouve pas davantage.
 */
const ABBREVIATIONS: [RegExp, string][] = [
  [/\btrav\b\.?/gi, "Traverse"],
  [/\bav(?:e)?\b\.?/gi, "Avenue"],
  [/\bb(?:d|ld|vd)\b\.?/gi, "Boulevard"],
  [/\bch(?:em)?\b\.?/gi, "Chemin"],
  [/\bimp\b\.?/gi, "Impasse"],
  [/\bpl\b\.?/gi, "Place"],
  [/\brte\b\.?/gi, "Route"],
  [/\ball\b\.?/gi, "Allée"],
  [/\bsq\b\.?/gi, "Square"],
  [/\bfbg\b\.?/gi, "Faubourg"],
  [/\bcrs\b\.?/gi, "Cours"],
  [/\bqu\b\.?/gi, "Quai"],
  [/\br[ée]s\b\.?/gi, "Résidence"],
  [/\bste\b\.?/gi, "Sainte"],
  [/\bst\b\.?/gi, "Saint"],
  [/\bgal\b\.?/gi, "Général"],
  [/\bmal\b\.?/gi, "Maréchal"],
  [/\bdr\b\.?/gi, "Docteur"],
  [/\bpr\b\.?/gi, "Professeur"],
];

function expandAbbreviations(query: string): string {
  let out = query;
  for (const [pattern, full] of ABBREVIATIONS) out = out.replace(pattern, full);
  return out.replace(/\s{2,}/g, " ").trim();
}

/** Retire un éventuel numéro de voie en tête : Nominatim ne l'a pas toujours. */
function dropHouseNumber(query: string): string {
  return query.replace(/^\s*\d+\s*(?:bis|ter|quater)?\s*,?\s*/i, "").trim();
}

/** Retire le code postal, qui restreint parfois trop la recherche. */
function dropPostcode(query: string): string {
  return query.replace(/\b\d{5}\b/g, "").replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ").trim();
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  category?: string;
  type?: string;
  address?: Record<string, string>;
}

/** Ville la plus pertinente parmi les champs d'adresse d'OpenStreetMap. */
function pickCity(address?: Record<string, string>): string | undefined {
  if (!address) return undefined;
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    undefined
  );
}

function toPlace(item: NominatimItem): PlaceResult {
  const parts = item.display_name.split(",").map((p) => p.trim());
  return {
    id: String(item.place_id),
    name: item.name?.trim() || parts[0] || item.display_name,
    address: item.display_name,
    city: pickCity(item.address),
    lat: Number(item.lat),
    lon: Number(item.lon),
    category: categoryFromOsm(item.category, item.type),
  };
}

/** Une adresse renvoyée par la Base Adresse Nationale. */
interface BanFeature {
  properties: {
    id: string;
    label: string;
    name?: string;
    city?: string;
    type?: string;
  };
  geometry: { coordinates: [number, number] };
}

/** Un appel à la BAN. Pas de cadence à respecter : le service est ouvert. */
async function callBan(query: string, near?: LatLon): Promise<PlaceResult[]> {
  const params = new URLSearchParams({ q: query, limit: "8", autocomplete: "0" });
  // Le centrage n'est qu'une préférence de tri, pas un filtre.
  if (near) {
    params.set("lat", String(near.lat));
    params.set("lon", String(near.lon));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BAN}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Recherche indisponible (${response.status}).`);
    const data = (await response.json()) as { features?: BanFeature[] };
    return (data.features || []).map((f) => ({
      id: `ban-${f.properties.id}`,
      name: f.properties.name || f.properties.label,
      address: f.properties.label,
      city: f.properties.city,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      category: "autre" as PlaceResult["category"],
    }));
  } finally {
    clearTimeout(timer);
  }
}

/** Un appel Nominatim, cadencé. */
async function callNominatim(params: URLSearchParams): Promise<NominatimItem[]> {
  const sinceLast = Date.now() - lastCallAt;
  if (sinceLast < MIN_INTERVAL_MS) await wait(MIN_INTERVAL_MS - sinceLast);
  lastCallAt = Date.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${NOMINATIM}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Recherche indisponible (${response.status}).`);
    return (await response.json()) as NominatimItem[];
  } finally {
    clearTimeout(timer);
  }
}

function baseParams(query: string, near?: LatLon): URLSearchParams {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: "8",
    "accept-language": "fr",
  });
  if (near) {
    // Fenêtre d'environ 40 km autour du logement, en simple préférence.
    const d = 0.35;
    params.set("viewbox", `${near.lon - d},${near.lat + d},${near.lon + d},${near.lat - d}`);
    params.set("bounded", "0");
  }
  return params;
}

/**
 * Cherche jusqu'à 8 lieux correspondant à `query`.
 *
 * Plutôt qu'un unique appel qui échoue en silence, on tente plusieurs
 * réécritures de la requête, de la plus fidèle à la plus permissive, et on
 * s'arrête au premier essai qui donne quelque chose. En pratique c'est ce qui
 * fait la différence entre « aucun résultat » et l'adresse trouvée.
 */
export type ModeRecherche = "adresse" | "lieu";

export async function searchPlaces(
  query: string,
  near?: LatLon,
  mode: ModeRecherche = "adresse",
  jetonHote?: string
): Promise<PlaceResult[]> {
  await autoriser(jetonHote);

  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const expanded = expandAbbreviations(trimmed);
  const attempts: string[] = [];
  const push = (candidate: string) => {
    const clean = candidate.trim();
    if (clean.length >= 3 && !attempts.includes(clean)) attempts.push(clean);
  };

  push(expanded);                              // « 71 Traverse Parangon, 13008 Marseille »
  if (expanded !== trimmed) push(trimmed);     // la saisie d'origine, au cas où
  push(dropHouseNumber(expanded));             // « Traverse Parangon, 13008 Marseille »
  push(dropPostcode(dropHouseNumber(expanded))); // « Traverse Parangon, Marseille »

  let lastError: unknown = null;

  /*
   * L'ordre des sources dépend de ce qu'on cherche.
   *
   * Une ADRESSE : la Base Adresse Nationale d'abord — elle est faite pour ça,
   * et elle répond depuis un serveur là où Nominatim bloque.
   * Un LIEU : Nominatim d'abord — un restaurant n'existe pas dans un annuaire
   * de rues, seul un annuaire de points d'intérêt le connaît par son nom.
   */
  const chercherBan = async () => {
    for (const attempt of attempts) {
      try {
        const trouves = await callBan(attempt, near);
        if (trouves.length > 0) return trouves;
      } catch (error) {
        lastError = error;
        // Un essai qui échoue ne condamne pas les suivants : on continue.
      }
    }
    return [];
  };

  const chercherNominatim = async () => {
    for (const attempt of attempts) {
      try {
        const items = await callNominatim(baseParams(attempt, near));
        if (items.length > 0) return items.map(toPlace);
      } catch (error) {
        lastError = error;
      }
    }
    return [];
  };

  const sources = mode === "lieu"
    ? [chercherNominatim, chercherBan]
    : [chercherBan, chercherNominatim];

  for (const source of sources) {
    const trouves = await source();
    if (trouves.length > 0) return trouves;
  }

  if (lastError) {
    console.error("[searchPlaces] annuaires injoignables", lastError);
  }

  return [];
}
