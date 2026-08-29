import { ModuleId } from "@/lib/types/accommodation";

/** Compteurs bruts, tels qu'ils sont stockés. */
export interface LivretStats {
  opens?: number;
  qrScans?: number;
  lastOpenAt?: number;
  byDay?: Record<string, number>;
  byHour?: Record<string, number>;
  modules?: Partial<Record<ModuleId, number>>;
}

export const HOUR_LABELS: Record<string, string> = {
  matin: "Matin",
  apresmidi: "Après-midi",
  soir: "Soirée",
  nuit: "Nuit",
};

/**
 * Conseils tirés des chiffres.
 *
 * L'intérêt n'est pas d'afficher des courbes, c'est de dire à l'hôte quoi
 * faire. Chaque conseil ne se déclenche qu'au-delà d'un seuil : en dessous,
 * les chiffres ne veulent rien dire et un conseil serait du bruit.
 */
export interface StatInsight {
  tone: "info" | "action";
  text: string;
}

const MODULE_NAMES: Partial<Record<ModuleId, string>> = {
  arrivee: "Arrivée",
  wifi: "Codes & Wi-Fi",
  contacts: "Contacts",
  depart: "Départ",
  bienvenue: "Bienvenue",
  reglement: "Règlement",
  equipements: "Équipements",
  adresses: "Bonnes adresses",
  transports: "Transports",
  faq: "Questions fréquentes",
  livredor: "Livre d’or",
};

/** Rubriques classées par nombre d'ouvertures, la plus consultée d'abord. */
export function rankedModules(stats: LivretStats): { id: ModuleId; name: string; count: number }[] {
  return Object.entries(stats.modules || {})
    .map(([id, count]) => ({
      id: id as ModuleId,
      name: MODULE_NAMES[id as ModuleId] || id,
      count: count || 0,
    }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function buildInsights(stats: LivretStats): StatInsight[] {
  const insights: StatInsight[] = [];
  const opens = stats.opens || 0;

  // En dessous de 10 ouvertures, tout classement relève du hasard.
  if (opens < 10) {
    insights.push({
      tone: "info",
      text: `${opens} ouverture${opens > 1 ? "s" : ""} pour l’instant. Les conseils apparaîtront à partir d’une dizaine de consultations.`,
    });
    return insights;
  }

  const ranked = rankedModules(stats);
  const top = ranked[0];
  if (top && top.count >= opens * 0.4) {
    insights.push({
      tone: "action",
      text: `« ${top.name} » est de loin la rubrique la plus consultée (${top.count} ouvertures). Placez-la en tête de votre livret.`,
    });
  }

  // Une rubrique visible que personne n'ouvre encombre le livret.
  const ignored = ranked.filter((m) => m.count <= Math.max(1, opens * 0.03));
  if (ignored.length > 0) {
    insights.push({
      tone: "action",
      text: `${ignored.map((m) => `« ${m.name} »`).join(", ")} n’${ignored.length > 1 ? "attirent" : "attire"} presque aucune consultation. À masquer, ou à enrichir.`,
    });
  }

  const hours = stats.byHour || {};
  const busiest = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
  if (busiest && busiest[1] >= opens * 0.4) {
    const moment = HOUR_LABELS[busiest[0]] || busiest[0];
    insights.push({
      tone: "info",
      text: `Vos voyageurs consultent surtout le livret en ${moment.toLowerCase()}.`,
    });
  }

  const scans = stats.qrScans || 0;
  if (scans > 0) {
    const share = Math.round((scans / opens) * 100);
    insights.push({
      tone: "info",
      text: `${share} % des ouvertures viennent du QR code de la plaque.`,
    });
  }

  return insights;
}

/** Ouvertures des 14 derniers jours, trous compris. */
export function last14Days(stats: LivretStats): { date: string; count: number }[] {
  const byDay = stats.byDay || {};
  const out: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: byDay[key] || 0 });
  }
  return out;
}
