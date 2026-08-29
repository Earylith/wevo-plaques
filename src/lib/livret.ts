import {
  Accommodation,
  ModuleId,
  MODULE_CATALOG,
  ModuleGroup,
  resolveModules,
} from "@/lib/types/accommodation";

/**
 * Livret vierge pour une création.
 *
 * Surtout PAS un clone d'un livret de démonstration : le nouveau livret
 * hériterait des digicodes, contacts et bonnes adresses d'un autre logement,
 * et de son `isActive: true` — il serait publié avant même d'être rempli,
 * pendant que l'interface affiche « Brouillon ».
 */
export function createEmptyAccommodation(slug: string): Accommodation {
  const now = Date.now();
  return {
    slug,
    offerType: "comfort",
    template: "cleo",
    isActive: false,
    owner: { name: "", email: "", phone: "" },
    property: {
      name: "Mon nouveau livret",
      type: "",
      address: "",
      city: "",
      welcomeMessage: "",
      gallery: [],
      timezone: "Europe/Paris",
    },
    wifi: { ssid: "", password: "" },
    codes: [],
    equipments: [],
    practicalInfo: {
      checkin: "",
      checkout: "",
      arrivalNotes: "",
      departureNotes: "",
      departureInstructions: [],
    },
    rules: [],
    contacts: [],
    recommendations: [],
    pointsOfInterest: [],
    transportLines: [],
    display: { weather: true, map: true, desktopLayout: "list" },
    modules: MODULE_CATALOG.map((definition, index) => ({
      id: definition.id,
      visible: definition.defaultVisible,
      order: index,
    })),
    comfortOptions: {
      faq: [],
      upsells: [],
      theme: { primaryColor: "#C4714A", fontFamily: "classic" },
    },
    createdAt: now,
    updatedAt: now,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   ÉTAT DE COMPLÉTION DES MODULES
   Source de vérité partagée : l'éditeur affiche « À compléter » sur la carte
   du module, le livret affiche la même pastille sur la tuile correspondante.
   ────────────────────────────────────────────────────────────────────────── */

export interface ModuleStatus {
  /** Le module contient assez d'informations pour être utile au voyageur. */
  complete: boolean;
  /** Résumé court affiché sous le titre du module dans l'éditeur. */
  summary: string;
}

const has = (v?: string | null) => Boolean(v && v.trim().length > 0);
const plural = (n: number, one: string, many = `${one}s`) => (n > 1 ? many : one);

/**
 * Un module est « complet » dès qu'il porte UNE information utile — pas quand
 * tous ses champs sont remplis. C'est une disjonction volontaire : un module
 * incomplet est masqué au voyageur, et un horaire d'arrivée sans consigne
 * reste une information qui mérite d'être affichée.
 *
 * `urgences` et `livredor` sont toujours complets : le premier a des numéros
 * français par défaut, le second n'a aucun contenu à saisir.
 */
export function isModuleComplete(data: Accommodation, id: ModuleId): boolean {
  switch (id) {
    case "arrivee":
      return has(data.practicalInfo?.checkin) || has(data.practicalInfo?.arrivalNotes);
    case "wifi":
      return (
        has(data.wifi?.ssid) ||
        has(data.wifi?.password) ||
        (data.codes || []).some((c) => has(c.label) || has(c.value))
      );
    case "contacts":
      return has(data.owner?.phone) || (data.contacts || []).some((c) => has(c.phone));
    case "depart":
      return (
        has(data.practicalInfo?.checkout) ||
        has(data.practicalInfo?.departureNotes) ||
        (data.practicalInfo?.departureInstructions || []).some((i) => has(i.text))
      );
    case "bienvenue":
      return has(data.property?.welcomeMessage);
    case "reglement":
      return (data.rules || []).some(has);
    case "equipements":
      return (
        (data.equipments || []).some((e) => has(e.title)) ||
        (data.comfortOptions?.upsells || []).some((u) => has(u.title))
      );
    case "adresses":
      return (
        (data.recommendations || []).some((r) => has(r.title)) ||
        (data.pointsOfInterest || []).some((p) => has(p.title))
      );
    case "transports":
      return (data.transportLines || []).some(
        (t) => has(t.station) || (t.lines || []).filter(has).length > 0
      );
    case "faq":
      return (data.comfortOptions?.faq || []).some((f) => has(f.question) && has(f.answer));
    case "livredor":
      return true;
    default:
      return true;
  }
}

export function getModuleStatus(data: Accommodation, id: ModuleId): ModuleStatus {
  const complete = isModuleComplete(data, id);

  switch (id) {
    case "arrivee":
      return {
        complete,
        summary: has(data.practicalInfo?.checkin)
          ? `Arrivée dès ${data.practicalInfo.checkin}`
          : "Horaire d’arrivée à renseigner",
      };
    case "wifi": {
      const n = (data.codes || []).length;
      return {
        complete,
        summary: has(data.wifi?.ssid)
          ? `${data.wifi.ssid}${n ? ` · ${n} ${plural(n, "code")}` : ""}`
          : "Réseau Wi-Fi à renseigner",
      };
    }
    case "contacts": {
      const useful = (data.contacts || []).filter((c) => c.type !== "emergency").length;
      const urgent = (data.contacts || []).filter((c) => c.type === "emergency").length;
      const extras = [
        useful ? `${useful} ${plural(useful, "contact")}` : "",
        urgent ? `${urgent} ${plural(urgent, "urgence")}` : "",
      ].filter(Boolean).join(" · ");
      return {
        complete,
        summary: has(data.owner?.phone)
          ? `${data.owner.phone}${extras ? ` · ${extras}` : ""}`
          : "Votre téléphone à renseigner",
      };
    }
    case "depart": {
      const n = (data.practicalInfo?.departureInstructions || []).filter((i) => has(i.text)).length;
      return {
        complete,
        summary: has(data.practicalInfo?.checkout)
          ? `Départ avant ${data.practicalInfo.checkout}${n ? ` · ${n} ${plural(n, "consigne")}` : ""}`
          : "Horaire de départ à renseigner",
      };
    }
    case "bienvenue":
      return {
        complete,
        summary: has(data.property?.welcomeMessage) ? "Mot de l’hôte" : "Mot d’accueil à écrire",
      };
    case "reglement": {
      const n = (data.rules || []).filter(has).length;
      return { complete, summary: n ? `${n} ${plural(n, "règle")}` : "Aucune règle" };
    }
    case "equipements": {
      const n = (data.equipments || []).filter((e) => has(e.title)).length;
      const extras = (data.comfortOptions?.upsells || []).filter((u) => has(u.title)).length;
      return {
        complete,
        summary: n
          ? `${n} ${plural(n, "équipement")}${extras ? ` · ${extras} en supplément` : ""}`
          : extras
            ? `${extras} ${plural(extras, "service")} en supplément`
            : "Aucun équipement",
      };
    }
    case "adresses": {
      const n = (data.recommendations || []).filter((r) => has(r.title)).length;
      return { complete, summary: n ? `${n} ${plural(n, "bonne adresse", "bonnes adresses")}` : "Aucune adresse" };
    }
    case "transports": {
      const n = (data.transportLines || []).filter(
        (t) => has(t.station) || (t.lines || []).filter(has).length > 0
      ).length;
      return { complete, summary: n ? `${n} ${plural(n, "ligne")}` : "Aucune ligne renseignée" };
    }
    case "faq": {
      const n = (data.comfortOptions?.faq || []).filter((f) => has(f.question) && has(f.answer)).length;
      return { complete, summary: n ? `${n} ${plural(n, "question")}` : "Aucune question" };
    }
    case "livredor":
      return { complete, summary: "Le mot des voyageurs" };
    default:
      return { complete, summary: "" };
  }
}

/**
 * Modules visibles d'une section, dans l'ordre choisi par l'hôte.
 *
 * Côté voyageur, un module activé mais vide est masqué : mieux vaut pas de
 * rubrique qu'une rubrique vide. Dans l'aperçu de l'éditeur (`preview`), il
 * reste affiché avec la pastille « À compléter », sinon l'hôte ne saurait pas
 * qu'il lui reste quelque chose à remplir.
 */
export function visibleModulesOf(
  data: Accommodation,
  group: ModuleGroup,
  opts: { preview?: boolean } = {}
): ModuleId[] {
  const byGroup = new Map(MODULE_CATALOG.map((d) => [d.id, d.group]));
  return resolveModules(data.modules)
    .filter((m) => m.visible && byGroup.get(m.id) === group)
    .filter((m) => opts.preview || isModuleComplete(data, m.id))
    .map((m) => m.id);
}

/* ──────────────────────────────────────────────────────────────────────────
   « LES ESSENTIELS » — la check-list de 11 points de l'éditeur
   Chaque entrée sait dans quel onglet et sur quel champ envoyer l'utilisateur.
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Sections de l'éditeur, rangées dans l'ordre vécu par le voyageur.
 *
 * Ce n'est pas un rangement par type de donnée (« général », « modules ») mais
 * par MOMENT du séjour : c'est le modèle mental de l'hôte, et ça garantit
 * qu'une information n'a qu'un seul endroit possible.
 */
export type EditorSection =
  | "plaque"
  | "logement"
  | "arrivee"
  | "sejour"
  | "depart"
  | "apparence"
  | "diffusion";

/** Conservé pour compatibilité : ancien nom du même concept. */
export type EditorTab = EditorSection;

export interface SectionDefinition {
  id: EditorSection;
  label: string;
  /** Libellé court, pour la barre de rubriques horizontale. */
  short: string;
  /** Phrase d'accroche affichée sous le titre de la section. */
  hint: string;
  emoji: string;
  /** Rubriques du livret éditées dans cette section. */
  modules: ModuleId[];
}

export const ADMIN_SECTIONS: SectionDefinition[] = [
  {
    id: "plaque",
    label: "Votre plaque",
    short: "Plaque",
    hint: "La teinte du bois, l’aperçu, et la commande.",
    emoji: "🪵",
    modules: [],
  },
  {
    id: "logement",
    label: "Le logement",
    short: "Logement",
    hint: "Son nom, où il se trouve, et comment vous joindre.",
    emoji: "🏠",
    modules: ["bienvenue"],
  },
  {
    id: "arrivee",
    label: "Avant l’arrivée",
    short: "Arrivée",
    hint: "Ce que le voyageur doit savoir avant de sonner.",
    emoji: "🔑",
    modules: ["arrivee"],
  },
  {
    id: "sejour",
    label: "Pendant le séjour",
    short: "Séjour",
    hint: "Tout ce qui sert une fois la porte franchie.",
    emoji: "🛋️",
    modules: ["wifi", "equipements", "reglement", "contacts", "adresses", "transports", "faq"],
  },
  {
    id: "depart",
    label: "Le départ",
    short: "Départ",
    hint: "L’heure, la check-list, et le mot de la fin.",
    emoji: "🚪",
    modules: ["depart", "livredor"],
  },
  {
    id: "apparence",
    label: "Apparence",
    short: "Apparence",
    hint: "Photos, couleurs et disposition du livret.",
    emoji: "🎨",
    modules: [],
  },
  {
    id: "diffusion",
    label: "Diffusion",
    short: "Diffusion",
    hint: "Langues, lien, QR code et mise en ligne.",
    emoji: "🌍",
    modules: [],
  },
];

export function getSectionDefinition(id: EditorSection): SectionDefinition {
  return ADMIN_SECTIONS.find((s) => s.id === id) as SectionDefinition;
}

export interface EssentialItem {
  key: string;
  label: string;
  filled: boolean;
  /** Section à ouvrir quand on clique sur la ligne. */
  tab: EditorSection;
  /** Ancre DOM (`data-field`) à faire défiler puis surligner. */
  field: string;
  /** Module à déplier si l'on atterrit dans l'onglet Modules. */
  module?: ModuleId;
}

export function getEssentials(data: Accommodation): EssentialItem[] {
  return [
    {
      key: "name",
      label: "Nommer votre livret",
      filled: has(data.property?.name),
      tab: "logement",
      field: "property.name",
    },
    {
      key: "address",
      label: "Choisir l'adresse du logement dans les suggestions",
      filled: has(data.property?.address),
      tab: "logement",
      field: "property.address",
    },
    {
      key: "cover",
      label: "Choisir une photo de couverture",
      filled: Boolean(data.property?.mainImageUrl || data.property?.gallery?.length),
      tab: "apparence",
      field: "property.gallery",
    },
    {
      key: "wifi",
      label: "Indiquer le Wi-Fi",
      filled: has(data.wifi?.ssid),
      tab: "sejour",
      field: "wifi.ssid",
      module: "wifi",
    },
    {
      key: "phone",
      label: "Ajouter votre téléphone",
      filled: has(data.owner?.phone),
      tab: "logement",
      field: "owner.phone",
    },
    {
      key: "hostname",
      label: "Votre nom d'hôte",
      filled: has(data.owner?.name),
      tab: "logement",
      field: "owner.name",
    },
    {
      key: "checkin",
      label: "Préciser l'horaire d'arrivée",
      filled: has(data.practicalInfo?.checkin),
      tab: "arrivee",
      field: "practicalInfo.checkin",
      module: "arrivee",
    },
    {
      key: "checkout",
      label: "Préciser l'horaire de départ",
      filled: has(data.practicalInfo?.checkout),
      tab: "depart",
      field: "practicalInfo.checkout",
      module: "depart",
    },
    {
      key: "arrivalNotes",
      label: "Ajouter les consignes d'arrivée",
      filled: has(data.practicalInfo?.arrivalNotes),
      tab: "arrivee",
      field: "practicalInfo.arrivalNotes",
      module: "arrivee",
    },
    {
      key: "departure",
      label: "Ajouter au moins une consigne de départ",
      filled: Boolean(
        data.practicalInfo?.departureInstructions?.some((i) => has(i.text)) ||
          has(data.practicalInfo?.departureNotes)
      ),
      tab: "depart",
      field: "module.depart",
      module: "depart",
    },
    {
      key: "reportEmail",
      label: "Choisir où recevoir les signalements",
      filled: has(data.owner?.reportEmail) || has(data.owner?.email),
      tab: "logement",
      field: "owner.reportEmail",
    },
  ];
}

/**
 * Photos de couverture effectives, dans l'ordre du diaporama.
 *
 * Définition unique et partagée : si l'éditeur et le gabarit calculaient
 * chacun la leur, la vignette étiquetée « Couverture » pourrait ne pas être
 * l'image réellement affichée en tête du livret.
 */
export function resolveGallery(property?: Accommodation["property"]): string[] {
  const list = [...(property?.gallery || [])];
  if (property?.mainImageUrl && !list.includes(property.mainImageUrl)) {
    list.unshift(property.mainImageUrl);
  }
  return list.filter(Boolean);
}

/**
 * Avancement d'une section : combien de ses points essentiels sont remplis.
 *
 * C'est ce qui remplace la carte « Les essentiels » flottante — la navigation
 * porte elle-même l'information, il n'y a plus de doublon.
 */
export function getSectionProgress(
  data: Accommodation,
  section: EditorSection
): { done: number; total: number } {
  const items = getEssentials(data).filter((item) => item.tab === section);
  return { done: items.filter((i) => i.filled).length, total: items.length };
}

/* ──────────────────────────────────────────────────────────────────────────
   CARTE « HEURE SUR PLACE »
   ────────────────────────────────────────────────────────────────────────── */

/** Moment de la journée, pour choisir le décor du ciel. */
export type DayPhase = "night" | "dawn" | "day" | "dusk";

export interface LocalTimeInfo {
  /** « 21:07 » dans le fuseau du logement. */
  time: string;
  /** « Vendredi 28 août » */
  dateLabel: string;
  /** « Soirée sur place » */
  momentLabel: string;
  /** Progression 0 → 1 de la journée, pour le curseur. */
  dayProgress: number;
  /** Le logement est-il dans un fuseau différent de celui du visiteur ? */
  isNight: boolean;
  /** Phase du jour sur place, qui pilote le décor de la carte. */
  phase: DayPhase;
  /** Clé de traduction du moment (« phaseEvening »…). */
  momentKey: "phaseNight" | "phaseEarly" | "phaseMorning" | "phaseNoon" | "phaseAfternoon" | "phaseEvening";
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function getLocalTimeInfo(
  timezone: string | undefined,
  now: Date,
  /** Locale d'affichage de la date (fr-FR par défaut). */
  locale = "fr-FR"
): LocalTimeInfo {
  const tz = timezone || "Europe/Paris";
  let hour = now.getHours();
  let minute = now.getMinutes();
  let time = "";
  let dateLabel = "";

  try {
    const parts = new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    hour = Number(parts.find((p) => p.type === "hour")?.value ?? hour);
    minute = Number(parts.find((p) => p.type === "minute")?.value ?? minute);
    time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    dateLabel = capitalize(
      new Intl.DateTimeFormat(locale, {
        timeZone: tz,
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(now)
    );
  } catch {
    time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    dateLabel = capitalize(
      new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(now)
    );
  }

  // Sept phases, comme le produit de référence. Le libellé traduit est choisi
  // par le gabarit à partir de `momentKey` ; `momentLabel` reste le français.
  const moments = [
    { until: 5, key: "phaseNight" as const, fr: "Nuit" },
    { until: 8, key: "phaseEarly" as const, fr: "Petit matin" },
    { until: 12, key: "phaseMorning" as const, fr: "Matinée" },
    { until: 14, key: "phaseNoon" as const, fr: "Midi" },
    { until: 18, key: "phaseAfternoon" as const, fr: "Après-midi" },
    { until: 22, key: "phaseEvening" as const, fr: "Soirée" },
    { until: 24, key: "phaseNight" as const, fr: "Nuit" },
  ];
  const moment = moments.find((m) => hour < m.until) ?? moments[moments.length - 1];
  const phase = moment.fr;

  const dayPhase: DayPhase =
    hour < 5 ? "night"
      : hour < 8 ? "dawn"
        : hour < 19 ? "day"
          : hour < 21 ? "dusk"
            : "night";

  return {
    time,
    dateLabel,
    momentLabel: `${phase} sur place`,
    momentKey: moment.key,
    dayProgress: (hour * 60 + minute) / (24 * 60),
    isNight: hour < 5 || hour >= 21,
    phase: dayPhase,
  };
}
