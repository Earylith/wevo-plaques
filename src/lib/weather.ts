/**
 * Météo locale du logement, via Open-Meteo.
 *
 * Open-Meteo est gratuit, sans clé d'API et sans quota d'inscription, et
 * autorise les appels depuis le navigateur (CORS) — c'est ce qui permet
 * d'afficher la météo sans exposer le moindre secret côté client.
 *
 * Deux appels : géocodage de la ville, puis relevé. Les deux résultats sont
 * mis en cache au niveau du module, car l'aperçu de l'éditeur re-rend le
 * livret à chaque frappe et ne doit surtout pas re-solliciter l'API.
 */

export interface WeatherSnapshot {
  /** Température actuelle, en degrés Celsius, arrondie. */
  temperature: number;
  /** Température ressentie. */
  feelsLike: number;
  /** Code WMO brut, qui pilote le décor de la carte. */
  code: number;
  /** Libellé français de la condition (« Ciel dégagé »…). */
  label: string;
  emoji: string;
  /** Le relevé date-t-il du jour ou de la nuit ? */
  isDay: boolean;
  /** Prévisions des jours suivants. */
  daily: { date: string; min: number; max: number; emoji: string; label: string }[];
}

/** Codes météo WMO renvoyés par Open-Meteo. */
const WMO: Record<number, { label: string; emoji: string }> = {
  0: { label: "Ciel dégagé", emoji: "☀️" },
  1: { label: "Peu nuageux", emoji: "🌤️" },
  2: { label: "Partiellement nuageux", emoji: "⛅" },
  3: { label: "Couvert", emoji: "☁️" },
  45: { label: "Brouillard", emoji: "🌫️" },
  48: { label: "Brouillard givrant", emoji: "🌫️" },
  51: { label: "Bruine légère", emoji: "🌦️" },
  53: { label: "Bruine", emoji: "🌦️" },
  55: { label: "Bruine dense", emoji: "🌦️" },
  56: { label: "Bruine verglaçante", emoji: "🌧️" },
  57: { label: "Bruine verglaçante dense", emoji: "🌧️" },
  61: { label: "Pluie faible", emoji: "🌦️" },
  63: { label: "Pluie", emoji: "🌧️" },
  65: { label: "Pluie forte", emoji: "🌧️" },
  66: { label: "Pluie verglaçante", emoji: "🌧️" },
  67: { label: "Pluie verglaçante forte", emoji: "🌧️" },
  71: { label: "Neige faible", emoji: "🌨️" },
  73: { label: "Neige", emoji: "🌨️" },
  75: { label: "Neige forte", emoji: "❄️" },
  77: { label: "Grains de neige", emoji: "🌨️" },
  80: { label: "Averses faibles", emoji: "🌦️" },
  81: { label: "Averses", emoji: "🌦️" },
  82: { label: "Averses violentes", emoji: "⛈️" },
  85: { label: "Averses de neige", emoji: "🌨️" },
  86: { label: "Fortes averses de neige", emoji: "❄️" },
  95: { label: "Orage", emoji: "⛈️" },
  96: { label: "Orage et grêle", emoji: "⛈️" },
  99: { label: "Orage et forte grêle", emoji: "⛈️" },
};

const describe = (code: number) => WMO[code] ?? { label: "Conditions inconnues", emoji: "🌡️" };

/* Caches de module : une requête par ville et par session d'onglet. */
const geocodeCache = new Map<string, Promise<{ lat: number; lon: number } | null>>();
const weatherCache = new Map<string, { at: number; value: Promise<WeatherSnapshot | null> }>();

/** Un relevé reste valable un quart d'heure. */
const WEATHER_TTL_MS = 15 * 60 * 1000;

async function geocode(place: string): Promise<{ lat: number; lon: number } | null> {
  const cached = geocodeCache.get(place);
  if (cached) return cached;

  const request = (async () => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=fr&format=json`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const json = await response.json();
      const first = json?.results?.[0];
      if (!first) return null;
      return { lat: first.latitude as number, lon: first.longitude as number };
    } catch {
      return null;
    }
  })();

  geocodeCache.set(place, request);
  return request;
}

/**
 * Relevé courant + prévisions pour une ville.
 * Renvoie `null` si la ville est introuvable ou l'API indisponible : la météo
 * est un agrément, son absence ne doit jamais casser l'affichage du livret.
 */
export function fetchWeather(
  city: string,
  coords?: { lat: number; lon: number }
): Promise<WeatherSnapshot | null> {
  const key = coords ? `${coords.lat},${coords.lon}` : city;
  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.at < WEATHER_TTL_MS) return cached.value;

  const request = (async (): Promise<WeatherSnapshot | null> => {
    try {
      const point = coords ?? (await geocode(city));
      if (!point) return null;

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}` +
        `&current=temperature_2m,apparent_temperature,is_day,weather_code` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
        `&timezone=auto&forecast_days=4`;

      const response = await fetch(url);
      if (!response.ok) return null;
      const json = await response.json();
      const current = json?.current;
      if (!current) return null;

      const condition = describe(Number(current.weather_code));
      const daily = json?.daily;
      const forecast: WeatherSnapshot["daily"] = [];
      if (daily?.time) {
        // On saute le jour courant, déjà résumé par le relevé du moment.
        for (let i = 1; i < daily.time.length; i++) {
          const day = describe(Number(daily.weather_code[i]));
          forecast.push({
            date: daily.time[i],
            min: Math.round(daily.temperature_2m_min[i]),
            max: Math.round(daily.temperature_2m_max[i]),
            emoji: day.emoji,
            label: day.label,
          });
        }
      }

      return {
        code: Number(current.weather_code),
        temperature: Math.round(Number(current.temperature_2m)),
        feelsLike: Math.round(Number(current.apparent_temperature)),
        label: condition.label,
        emoji: condition.emoji,
        isDay: Number(current.is_day) === 1,
        daily: forecast,
      };
    } catch {
      return null;
    }
  })();

  weatherCache.set(key, { at: Date.now(), value: request });
  return request;
}

/** « Samedi 29 » à partir d'une date ISO renvoyée par Open-Meteo. */
export function formatForecastDay(iso: string, locale = "fr-FR"): string {
  const date = new Date(`${iso}T12:00:00`);
  const label = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
