/**
 * Aides géographiques partagées éditeur ⇄ recherche de lieux.
 *
 * Tout est calculé localement : aucune API de distance, donc aucune clé et
 * aucun quota. La distance à vol d'oiseau est majorée d'un facteur de détour
 * pour approcher un trajet réel — l'ordre de grandeur suffit largement à un
 * voyageur qui veut savoir si c'est « à côté » ou « en voiture ».
 */

export interface LatLon {
  lat: number;
  lon: number;
}

/** Résultat normalisé d'une recherche de lieu. */
export interface PlaceResult {
  id: string;
  /** Nom court du lieu (« Pizzeria Chez Étienne »). */
  name: string;
  /** Adresse complète lisible. */
  address: string;
  /** Ville, extraite quand OpenStreetMap la fournit. */
  city?: string;
  lat: number;
  lon: number;
  /** Catégorie du livret, déduite du type OpenStreetMap. */
  category: string;
}

const EARTH_RADIUS_KM = 6371;
/** Les rues ne sont pas des lignes droites : ~30 % de marge sur le vol d'oiseau. */
const DETOUR_FACTOR = 1.3;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Distance à vol d'oiseau, en kilomètres. */
export function haversineKm(a: LatLon, b: LatLon): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Formule la distance comme un hôte la dirait : « 850 m · 11 min à pied »
 * en deçà de 2 km, « 6,4 km · 13 min en voiture » au-delà.
 */
export function describeDistance(from: LatLon, to: LatLon): string {
  const km = haversineKm(from, to) * DETOUR_FACTOR;

  if (km < 2) {
    const minutes = Math.max(1, Math.round((km / 4.8) * 60)); // 4,8 km/h à pied
    const label = km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
    return `${label} · ${minutes} min à pied`;
  }

  const minutes = Math.max(1, Math.round((km / 28) * 60)); // 28 km/h en ville
  return `${km.toFixed(1).replace(".", ",")} km · ${minutes} min en voiture`;
}

/**
 * Traduit un type OpenStreetMap en catégorie du livret.
 * Le catalogue reste volontairement court : au-delà de sept filtres, le
 * voyageur ne s'en sert plus.
 */
export function categoryFromOsm(category?: string, type?: string): string {
  const key = `${category || ""}/${type || ""}`;

  if (/restaurant|fast_food|food_court|biergarten/.test(key)) return "Restaurant";
  if (/\/(bar|pub|cafe|nightclub)/.test(key)) return "Bar";
  if (/beach|beach_resort/.test(key)) return "Plage";
  if (/museum|artwork|gallery|attraction|monument|memorial|castle|church|cathedral|historic/.test(key)) return "Culture";
  if (/park|garden|forest|nature|peak|water|wood|viewpoint/.test(key)) return "Nature";
  if (/^shop|supermarket|bakery|marketplace|pharmacy|convenience/.test(key)) return "Commerce";
  if (/leisure|sports|swimming|cinema|theatre|zoo|theme_park/.test(key)) return "Activité";

  return "Activité";
}

/** Lien Google Maps stable pour un lieu situé. */
export function mapsUrlFor(name: string, point: LatLon): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=&center=${point.lat},${point.lon}`;
}
