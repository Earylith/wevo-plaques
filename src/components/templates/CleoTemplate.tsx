"use client";

import { heureArrivee, heureDepart } from "@/lib/horaires";
import React, { useState, useEffect, useCallback, useDeferredValue, useRef, useSyncExternalStore } from "react";
import { Accommodation, ModuleId, getModuleDefinition } from "@/lib/types/accommodation";
import { getModuleStatus, visibleModulesOf, getLocalTimeInfo, resolveGallery } from "@/lib/livret";
import { fetchWeather, formatForecastDay, WeatherSnapshot } from "@/lib/weather";
import SkyBackdrop, { conditionFromCode } from "@/components/templates/SkyBackdrop";
import LanguagePicker from "@/components/templates/LanguagePicker";
import { trackLivretOpen, trackModuleOpen } from "@/app/stats-actions";
import BoutonsItineraire from "@/components/ui/BoutonsItineraire";
import SignalerLivret from "@/components/ui/SignalerLivret";
import {
  Lang, availableLangs, localizeAccommodation, moduleLabel, tr, INTL_LOCALE,
} from "@/lib/i18n";
import {
  Key, WifiHigh, Phone, HandWaving, MapPin, BookOpen, Medal, Bus, FirstAid,
  ChatCircleDots, BookBookmark, ArrowLeft, Copy, Check, CaretRight, CaretDown,
  NavigationArrow, Star, PencilSimple, DoorOpen, GridFour,
  ListChecks, ArrowSquareOut, Warning, Car, SquaresFour, List as ListIcon, Clock,
  Sun, CloudSun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

/* Horloge partagée : un tick par minute suffit à rafraîchir « 21:07 ».
   Déclarée au niveau du module pour que les callbacks restent stables. */
const subscribeToClock = (onChange: () => void) => {
  const timer = setInterval(onChange, 15_000);
  return () => clearInterval(timer);
};
const getClockSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerClockSnapshot = (): number | null => null;

/** Cible cliquable dans l’aperçu : un module, la couverture ou l’identité. */
export type PreviewTarget = ModuleId | "cover" | "identity";

interface CleoTemplateProps {
  data: Accommodation;
  /** Rend la modale à l'intérieur du conteneur plutôt qu'en plein écran. */
  inlineModal?: boolean;
  /** Mode éditeur : chaque élément devient cliquable pour être modifié. */
  editable?: boolean;
  /** Module ouvert (contrôlé par l'éditeur). */
  activeModule?: ModuleId | null;
  /** Remonte l'ouverture / la fermeture d'un module. */
  onActiveModuleChange?: (module: ModuleId | null) => void;
  /** Clic sur un élément éditable de l'aperçu. */
  onSelect?: (target: PreviewTarget) => void;
  /** Élément actuellement édité dans le panneau de gauche. */
  selected?: PreviewTarget | null;
  /**
   * Identifiant du livret. Fourni côté voyageur uniquement : on ne compte pas
   * les allers-retours de l'hôte dans son propre éditeur.
   */
  trackingId?: string;
}

const MODULE_ICONS: Record<ModuleId, React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" | "duotone"; className?: string }>> = {
  arrivee: Key,
  wifi: WifiHigh,
  contacts: Phone,
  depart: DoorOpen,
  bienvenue: HandWaving,
  reglement: BookOpen,
  equipements: Medal,
  adresses: MapPin,
  transports: Bus,
  faq: ChatCircleDots,
  livredor: BookBookmark,
};

/*
 * VUE GRILLE — disposition « bento ».
 *
 * Grille de 6 colonnes. L'ordre et les portées ci-dessous sont pensés pour
 * que chaque rangée totalise exactement 6 : c'est ce qui évite les colonnes
 * dépareillées et les vides. Les cartes ne reprennent PAS le contenu des
 * modales (conçu pour une colonne étroite qui défile) : chacune a un résumé
 * compact taillé pour sa case, avec un lien vers la fiche complète.
 *
 *   arrivée(2) wifi(2) départ(2)      → 6
 *   bienvenue(3) contacts(3)          → 6
 *   bonnes adresses(6)                → 6   ← la carte illustrée
 *   équipements(3) transports(3)      → 6
 *   règlement(2) faq(2) livre d'or(2) → 6
 */
const GRID_ORDER: ModuleId[] = [
  "arrivee", "wifi", "depart",
  "bienvenue", "contacts",
  "adresses",
  "equipements", "transports",
  "reglement", "faq", "livredor",
];

const GRID_SPAN: Record<ModuleId, string> = {
  arrivee: "col-span-2",
  wifi: "col-span-2",
  depart: "col-span-2",
  bienvenue: "col-span-3",
  contacts: "col-span-3",
  adresses: "col-span-6",
  equipements: "col-span-3",
  transports: "col-span-3",
  reglement: "col-span-2",
  faq: "col-span-2",
  livredor: "col-span-2",
};

/**
 * Coquille commune à toutes les cartes de la grille.
 *
 * voisines de contenus inégaux s'égalisent proprement.
 */
function GridCard({
  span, Icon, tint, title, titleFont, titleColor, onOpen, onSelect, extraClass, children,
}: {
  id: ModuleId;
  span: string;
  Icon: React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" | "duotone"; className?: string }>;
  tint: { bg: string; fg: string };
  title: string;
  titleFont: string;
  /** Couleur choisie par l'hôte : c'est sur les titres qu'elle se voit. */
  titleColor: string;
  onOpen: () => void;
  onSelect: () => void;
  extraClass: string;
  action?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section
      onClick={() => {
        onSelect();
        onOpen();
      }}
      className={`${span} min-h-[200px] flex flex-col justify-between bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-white transition-all duration-300 cursor-pointer overflow-hidden group ${extraClass}`}
    >
      <header className="flex items-center justify-between px-4.5 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-110 duration-300"
            style={{ backgroundColor: tint.bg, color: tint.fg }}
          >
            <Icon size={16} weight="duotone" />
          </span>
          <h3 className={`text-[12px] xl:text-[13px] font-extrabold truncate ${titleFont}`} style={{ color: titleColor }}>{title}</h3>
        </div>
        <div className="w-6 h-6 rounded-full bg-gray-100/90 group-hover:bg-[#2A2016] group-hover:text-white text-[#8A8078] flex items-center justify-center transition-all shrink-0">
          <CaretRight size={11} weight="bold" />
        </div>
      </header>

      <div className="flex-1 px-4.5 pb-3.5 min-h-0 text-[#4A3D30] flex flex-col justify-between">{children}</div>
    </section>
  );
}

/** Palette par module (fond + couleur de l'icône). */
const MODULE_TINTS: Record<ModuleId, { bg: string; fg: string }> = {
  arrivee: { bg: "#FFF4E5", fg: "#C97A17" },
  wifi: { bg: "#FFF0F2", fg: "#D9455F" },
  contacts: { bg: "#EAF6EF", fg: "#1F8A54" },
  depart: { bg: "#F1F0FB", fg: "#5B54C4" },
  bienvenue: { bg: "#FFF6E9", fg: "#C98A17" },
  reglement: { bg: "#FFF1E8", fg: "#C4714A" },
  equipements: { bg: "#FFF2E8", fg: "#D98324" },
  adresses: { bg: "#FFEFF3", fg: "#D9455F" },
  transports: { bg: "#E9F3FF", fg: "#1D64B4" },
  faq: { bg: "#EFF2FF", fg: "#4356C0" },
  livredor: { bg: "#F5EFFF", fg: "#7048B6" },
};

function WeatherIcon({ code, emoji, className = "w-5 h-5" }: { code?: number; emoji?: string; className?: string }) {
  if (typeof code === "number") {
    if (code === 0) {
      return <Sun size={20} weight="duotone" className={`text-amber-500 shrink-0 ${className}`} />;
    }
    if (code === 1 || code === 2) {
      return <CloudSun size={20} weight="duotone" className={`text-amber-400 shrink-0 ${className}`} />;
    }
    if (code === 3) {
      return <Cloud size={20} weight="duotone" className={`text-slate-400 shrink-0 ${className}`} />;
    }
    if (code === 45 || code === 48) {
      return <CloudFog size={20} weight="duotone" className={`text-slate-400 shrink-0 ${className}`} />;
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return <CloudRain size={20} weight="duotone" className={`text-sky-500 shrink-0 ${className}`} />;
    }
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return <Snowflake size={20} weight="duotone" className={`text-blue-400 shrink-0 ${className}`} />;
    }
    if (code >= 95) {
      return <CloudLightning size={20} weight="duotone" className={`text-amber-500 shrink-0 ${className}`} />;
    }
  }

  if (emoji?.includes("🌧") || emoji?.includes("☔")) return <CloudRain size={20} weight="duotone" className={`text-sky-500 shrink-0 ${className}`} />;
  if (emoji?.includes("☀️")) return <Sun size={20} weight="duotone" className={`text-amber-500 shrink-0 ${className}`} />;
  if (emoji?.includes("🌤") || emoji?.includes("⛅")) return <CloudSun size={20} weight="duotone" className={`text-amber-400 shrink-0 ${className}`} />;
  if (emoji?.includes("☁")) return <Cloud size={20} weight="duotone" className={`text-slate-400 shrink-0 ${className}`} />;
  if (emoji?.includes("❄")) return <Snowflake size={20} weight="duotone" className={`text-blue-400 shrink-0 ${className}`} />;
  if (emoji?.includes("⚡") || emoji?.includes("🌩")) return <CloudLightning size={20} weight="duotone" className={`text-amber-500 shrink-0 ${className}`} />;

  return <CloudSun size={20} weight="duotone" className={`text-amber-400 shrink-0 ${className}`} />;
}

export default function CleoTemplate({
  data: sourceData,
  inlineModal = false,
  editable = false,
  activeModule,
  onActiveModuleChange,
  onSelect,
  selected = null,
  trackingId,
}: CleoTemplateProps) {
  /*
   * Langue du livret. On traduit les DONNÉES plutôt que d'injecter un t()
   * partout : le reste du composant lit `data` sans rien savoir de la langue,
   * et une rubrique ajoutée plus tard est traduite sans modification.
   */
  const offered = availableLangs(sourceData);
  const [lang, setLang] = useState<Lang>(offered[0] || "fr");
  const activeLang: Lang = offered.includes(lang) ? lang : "fr";
  const data = localizeAccommodation(sourceData, activeLang);
  const t = (key: Parameters<typeof tr>[1]) => tr(activeLang, key);
  const locale = INTL_LOCALE[activeLang];

  const isControlled = activeModule !== undefined;
  const [internalModal, setInternalModal] = useState<ModuleId | null>(null);
  const openModule = isControlled ? (activeModule as ModuleId | null) : internalModal;

  const setOpenModule = useCallback(
    (next: ModuleId | null) => {
      if (!isControlled) setInternalModal(next);
      onActiveModuleChange?.(next);
    },
    [isControlled, onActiveModuleChange]
  );

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [addressCategory, setAddressCategory] = useState("__all__");
  const [expandedEquipment, setExpandedEquipment] = useState<number | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [checkedDeparture, setCheckedDeparture] = useState<number[]>([]);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  /** Carte météo dépliée sous l'horloge. */
  const [weatherOpen, setWeatherOpen] = useState(false);
  /*
   * Disposition choisie par le voyageur, initialisée sur le réglage de l'hôte.
   * Elle n'a d'effet qu'à partir de « lg » : sur un téléphone, deux colonnes
   * de fiches dépliées seraient illisibles.
   */
  const [layout, setLayout] = useState<"list" | "grid">(data.display?.desktopLayout || "list");

  const primaryColor = data.comfortOptions?.theme?.primaryColor || "#1D64B4";
  const isSerif = (data.comfortOptions?.theme?.fontFamily || "classic") === "classic";
  const titleFont = isSerif ? "font-[family-name:var(--font-serif)]" : "font-sans";

  /* ── Horloge locale ──────────────────────────────────────────────────
     `useSyncExternalStore` plutôt qu'un `useState` + `useEffect` : l'horloge
     est une source externe, et `getServerSnapshot` renvoyant null donne
     gratuitement le drapeau « monté côté client » dont a besoin le portail,
     sans setState dans un effet ni écart d'hydratation. */
  const minuteTick = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);
  const mounted = minuteTick !== null;

  /* ── Météo locale ────────────────────────────────────────────────────
     Le résultat est mis en cache par ville dans @/lib/weather : l'aperçu de
     l'éditeur re-rend à chaque frappe sans jamais relancer d'appel réseau. */
  const weatherOff = data.display?.weather === false;
  const weatherCity = weatherOff ? "" : data.property?.city?.trim() || "";
  // Coordonnées exactes si l'adresse a été choisie dans les suggestions :
  // le relevé vient alors du quartier, pas du centre de la ville.
  const weatherLat = weatherOff ? undefined : data.property?.latitude;
  const weatherLon = weatherOff ? undefined : data.property?.longitude;

  useEffect(() => {
    const hasPoint = typeof weatherLat === "number" && typeof weatherLon === "number";
    if (!weatherCity && !hasPoint) return;
    let cancelled = false;
    fetchWeather(weatherCity, hasPoint ? { lat: weatherLat, lon: weatherLon } : undefined).then((result) => {
      if (!cancelled) setWeather(result);
    });
    return () => {
      cancelled = true;
    };
  }, [weatherCity, weatherLat, weatherLon]);

  /*
   * Mesure d'usage. Une seule remontée par visite, et jamais depuis l'éditeur
   * — l'hôte qui relit son livret n'est pas un voyageur.
   */
  const trackedRef = useRef(false);
  useEffect(() => {
    if (!trackingId || editable || trackedRef.current) return;
    trackedRef.current = true;
    const viaQr = document.referrer === "" && window.location.search.includes("qr");
    void trackLivretOpen(trackingId, viaQr);
  }, [trackingId, editable]);

  /* ── Verrouillage du scroll (plein écran uniquement) ────────────────── */
  useEffect(() => {
    if (inlineModal) return;
    document.body.style.overflow = openModule ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openModule, inlineModal]);

  /* ── Diaporama de couverture ────────────────────────────────────────── */
  const gallery = resolveGallery(data.property);
  // Index borné par calcul : retirer une photo ne doit pas laisser l'index
  // pointer dans le vide, et ce n'est pas un état à resynchroniser.
  const activeHero = gallery.length > 0 ? heroIndex % gallery.length : 0;

  useEffect(() => {
    if (gallery.length < 2) return;
    const t = setInterval(() => setHeroIndex((i) => i + 1), 5000);
    return () => clearInterval(t);
  }, [gallery.length]);

  const copy = (value: string, field: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 2000);
  };

  /* ── Interaction éditeur ────────────────────────────────────────────── */
  const activate = (target: PreviewTarget) => {
    if (editable) onSelect?.(target);
  };

  const openModuleAndEdit = (id: ModuleId) => {
    setOpenModule(id);
    activate(id);
    if (trackingId && !editable) void trackModuleOpen(trackingId, id);
  };

  const hotClass = (target: PreviewTarget) =>
    editable ? `editable-hot ${selected === target ? "is-selected" : ""}` : "";

  const tiles = visibleModulesOf(data, "tuiles", { preview: editable });

  /*
   * Rubriques réellement affichables en grille : on repart des modules
   * visibles de chaque section, filtrés par le catalogue de la vue grille.
   * L'ordre choisi par l'hôte est conservé.
   */
  const allVisible: ModuleId[] = [
    ...tiles,
    ...visibleModulesOf(data, "sejour", { preview: editable }),
    ...visibleModulesOf(data, "surplace", { preview: editable }),
    ...visibleModulesOf(data, "alentours", { preview: editable }),
  ];
  /*
   * L'ordre de la grille est celui du bento, pas celui de l'hôte : les portées
   * sont calibrées pour que chaque rangée fasse exactement 6 colonnes. Une
   * rubrique masquée disparaît simplement, et `grid-auto-flow: dense` recolle
   * les cartes suivantes plutôt que de laisser un trou.
   */
  const gridOrder = GRID_ORDER.filter((id) => allVisible.includes(id));
  // Sous trois cartes, la grille n'apporte rien : on masque la bascule.
  const gridAvailable = gridOrder.length >= 3;
  const gridActive = gridAvailable && layout === "grid";
  const groups: { key: "sejour" | "surplace" | "alentours"; label: string }[] = [
    { key: "sejour", label: t("groupSejour") },
    { key: "surplace", label: t("groupSurplace") },
    { key: "alentours", label: t("groupAlentours") },
  ];

  const emergencyContacts = (data.contacts || []).filter((c) => c.type === "emergency");
  const usefulContacts = (data.contacts || []).filter((c) => c.type !== "emergency" && c.type !== "owner");

  const equipments = data.equipments || [];
  const recommendations = data.recommendations || [];
  const departureSteps =
    data.practicalInfo?.departureInstructions?.filter((i) => i.text?.trim()) || [];

  const categories = ["__all__", ...Array.from(new Set(recommendations.map((r) => r.category).filter(Boolean)))];

  // Si la catégorie retenue n'existe plus (adresse supprimée ou recatégorisée),
  // le filtre retombe sur « Tout » — sinon la liste resterait vide sans issue.
  const activeCategory = categories.includes(addressCategory) ? addressCategory : "__all__";
  const filteredRecs =
    activeCategory === "__all__"
      ? recommendations
      : recommendations.filter((r) => r.category === activeCategory);

  const localTime = minuteTick === null ? null : getLocalTimeInfo(data.property?.timezone, new Date(minuteTick * 60_000), locale);

  const reportAddress = data.owner?.reportEmail || data.owner?.email || "";
  // Réglages absents = activés, pour ne rien retirer aux livrets existants.
  const showWeather = data.display?.weather !== false;
  const showMap = data.display?.map !== false;
  // L'adresse alimente une iframe Google Maps : différée, sinon chaque frappe
  // dans le champ adresse de l'éditeur déclenche une navigation complète.
  const mapAddress = useDeferredValue(data.property?.address || "");

  /* ══════════════════════════════════════════════════════════════════════
     Briques réutilisables
     ══════════════════════════════════════════════════════════════════════ */

  const EmptyState = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 py-10 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#FFF0F2] text-[#FF385C] flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-[#2A2016]">{title}</h4>
      <p className="text-xs text-[#8A8078] mt-1.5 leading-relaxed max-w-[16rem] mx-auto">{text}</p>
    </div>
  );

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(30,25,20,0.05)] p-4">{children}</div>
  );

  /* ══════════════════════════════════════════════════════════════════════
     CONTENU DES MODALES
     ══════════════════════════════════════════════════════════════════════ */

  const renderModuleBody = (id: ModuleId) => {
    switch (id) {
      /* ── ARRIVÉE ──────────────────────────────────────────────────── */
      case "arrivee":
        return (
          <div className="space-y-5">
            <div className="text-white p-6 rounded-3xl relative overflow-hidden shadow-lg" style={{ backgroundColor: primaryColor }}>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 block mb-1">
                {t("essentialInfo")}
              </span>
              <h3 className="text-xs font-bold opacity-90 mb-1">{t("checkinFrom")}</h3>
              <p className={`text-4xl font-extrabold mb-3 ${titleFont}`}>
                {heureArrivee(data.practicalInfo)}
              </p>
              <p className="text-xs text-white/80">{t("checkinHint")}</p>
              <Key size={80} className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none" weight="duotone" />
            </div>

            {data.practicalInfo?.arrivalNotes ? (
              <SectionCard>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A9086] block mb-2">
                  {t("accessNotes")}
                </span>
                <p className="text-[13px] text-[#4A3D30] leading-relaxed whitespace-pre-line">
                  {data.practicalInfo.arrivalNotes}
                </p>
              </SectionCard>
            ) : (
              <EmptyState
                icon={<Key size={22} weight="duotone" />}
                title={t("emptyArrival")}
                text={t("emptyArrivalText")}
              />
            )}

            {data.practicalInfo?.parking && (
              <SectionCard>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A9086] flex items-center gap-1.5 mb-2">
                  <Car size={13} weight="fill" style={{ color: primaryColor }} /> {t("parking")}
                </span>
                <p className="text-[13px] text-[#4A3D30] leading-relaxed whitespace-pre-line">
                  {data.practicalInfo.parking}
                </p>
              </SectionCard>
            )}

            {mapAddress && (
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest block mb-2" style={{ color: primaryColor }}>
                  {t("location")}
                </span>
                <h4 className="font-bold text-sm text-[#2A2016] mb-3">{t("arrivalPoint")}</h4>
                <div className="h-52 rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100">
                  {/*
                    Hôte `www.google.com` plutôt que `maps.google.com` : le
                    second redirige, et Safari refuse la redirection dans un
                    cadre — la carte restait blanche sur Mac. Et sans adresse,
                    on n'affiche pas de carte du tout : elle montrerait le
                    monde entier, ce qui n'aide personne.
                  */}
                  {mapAddress.trim() ? (
                    <iframe
                      title="Carte d'arrivée"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&z=14&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-xs text-[#6B5D4E]">
                      L’adresse du logement n’est pas encore renseignée.
                    </div>
                  )}
                </div>
                {/*
                  L'itinéraire, dans l'application du voyageur : Maps, Waze ou
                  Plans. Sous la carte et non dessus — elle EST déjà Google
                  Maps, un bouton posé par-dessus faisait doublon et masquait
                  ce qu'on venait regarder.
                */}
                <BoutonsItineraire adresse={mapAddress} couleur={primaryColor} />
              </div>
            )}
          </div>
        );

      /* ── CODES & WI-FI ────────────────────────────────────────────── */
      case "wifi":
        return (
          <div className="space-y-5">
            {data.wifi?.ssid ? (
              <div className="text-white p-6 rounded-3xl shadow-lg relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-80 block mb-1">{t("wifiNetwork")}</span>
                <h3 className={`text-2xl font-bold mb-4 ${titleFont}`}>{data.wifi.ssid}</h3>
                {data.wifi.password ? (
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center justify-between gap-3 border border-white/20">
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/70 block uppercase font-bold">{t("password")}</span>
                      <span className="font-mono text-sm font-bold break-all">{data.wifi.password}</span>
                    </div>
                    <button
                      onClick={() => copy(data.wifi.password!, "wifi")}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-white text-[#2A2016] text-xs font-bold hover:bg-white/90 transition-colors flex items-center gap-1.5 shadow"
                    >
                      {copiedField === "wifi" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedField === "wifi" ? t("copied") : t("copy")}
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-white/70">{t("noPassword")}</p>
                )}
                <WifiHigh size={84} className="absolute -right-4 -bottom-5 opacity-15 pointer-events-none" weight="duotone" />
              </div>
            ) : (
              <EmptyState
                icon={<WifiHigh size={22} weight="duotone" />}
                title={t("emptyWifi")}
                text={t("emptyWifiText")}
              />
            )}

            <div>
              <h4 className="font-bold text-sm text-[#2A2016] mb-3">{t("accessCodes")}</h4>
              {(data.codes || []).length > 0 ? (
                <div className="space-y-2.5">
                  {(data.codes || []).map((code, idx) => (
                    <button
                      key={idx}
                      onClick={() => copy(code.value, `code-${idx}`)}
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-left hover:border-gray-200 transition-colors"
                    >
                      <span className="text-xs font-bold text-[#2A2016]">{code.label}</span>
                      <span className="font-mono text-sm font-bold px-3 py-1 rounded-xl bg-white border border-gray-100 flex items-center gap-2" style={{ color: primaryColor }}>
                        {code.value}
                        {copiedField === `code-${idx}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="opacity-40" />}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8A8078] bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  {t("noCodes")}
                </p>
              )}
            </div>
          </div>
        );

      /* ── CONTACTS ─────────────────────────────────────────────────── */
      case "contacts":
        return (
          <div className="space-y-5">
            <div className="rounded-3xl p-5 text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
              <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-80 block mb-1">{t("yourHost")}</span>
              <h3 className={`text-xl font-bold ${titleFont}`}>{data.owner?.name || "Votre hôte"}</h3>
              {data.owner?.phone ? (
                <a
                  href={`tel:${data.owner.phone.replace(/\s/g, "")}`}
                  className="mt-3 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  <Phone size={16} weight="fill" /> {data.owner.phone}
                </a>
              ) : (
                <p className="text-xs text-white/75 mt-2">{t("hostPhoneMissing")}</p>
              )}
            </div>

            {usefulContacts.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-[#2A2016] mb-3">{t("usefulContacts")}</h4>
                <div className="space-y-2.5">
                  {usefulContacts.map((c, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#2A2016] block truncate">{c.label}</span>
                        <span className="text-[11px] text-[#8A8078]">{c.name}</span>
                      </div>
                      <a
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        className="shrink-0 px-3.5 py-2 rounded-xl bg-white text-[#2A2016] hover:bg-gray-100 text-xs font-bold transition-colors flex items-center gap-1.5 border border-gray-200"
                      >
                        <Phone size={13} weight="fill" /> {c.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {usefulContacts.length === 0 && emergencyContacts.length === 0 && (
              <EmptyState
                icon={<Phone size={22} weight="duotone" />}
                title={t("emptyContacts")}
                text={t("emptyContactsText")}
              />
            )}

            {/* Urgences — même fiche que les contacts : en cas de pépin, on ne
                veut pas chercher dans quelle rubrique se trouve le numéro. */}
            <div className="pt-1">
              <h4 className="font-bold text-sm text-[#2A2016] mb-2.5 flex items-center gap-2">
                <FirstAid size={17} weight="duotone" className="text-[#CE2B2B]" />
                {t("emergencies")}
              </h4>

              <div className="bg-[#FFECEC] border border-[#F5C6C6] rounded-2xl p-3.5 flex items-start gap-2.5 mb-2.5">
                <Warning size={17} weight="fill" className="text-[#CE2B2B] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#7A2020] leading-relaxed">
                  En cas d&apos;urgence vitale, composez le{" "}
                  <a href="tel:112" className="font-bold underline">112</a>{" "}
                  — numéro européen, gratuit depuis tout téléphone, même sans carte SIM.
                </p>
              </div>

              {emergencyContacts.length > 0 && (
                <div className="space-y-2.5">
                  {emergencyContacts.map((c, idx) => (
                    <a
                      key={idx}
                      href={`tel:${c.phone.replace(/s/g, "")}`}
                      className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-3 hover:border-gray-200 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#2A2016] block truncate">{c.label}</span>
                        <span className="text-[11px] text-[#8A8078]">{c.name}</span>
                      </div>
                      <span className="shrink-0 px-3.5 py-2 rounded-xl bg-[#FFECEC] text-[#CE2B2B] text-xs font-bold flex items-center gap-1.5">
                        <Phone size={13} weight="fill" /> {c.phone}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      /* ── DÉPART ───────────────────────────────────────────────────── */
      case "depart":
        return (
          <div className="space-y-5">
            <div className="bg-[#1B2233] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-70 block mb-1">{t("checkoutTime")}</span>
              <h3 className="text-xs font-bold opacity-90 mb-1">{t("checkoutBefore")}</h3>
              <p className={`text-4xl font-extrabold ${titleFont}`}>{heureDepart(data.practicalInfo)}</p>
              <DoorOpen size={80} className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none" weight="duotone" />
            </div>

            {departureSteps.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-[#2A2016] mb-3 flex items-center gap-2">
                  <ListChecks size={18} style={{ color: primaryColor }} /> {t("beforeLeaving")}
                </h4>
                <div className="space-y-2">
                  {departureSteps.map((step, idx) => {
                    const done = checkedDeparture.includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          setCheckedDeparture((prev) =>
                            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                          )
                        }
                        className={`w-full p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-colors ${
                          done ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border ${
                            done ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 text-transparent"
                          }`}
                        >
                          <Check size={12} weight="bold" />
                        </span>
                        <span className={`text-xs font-medium ${done ? "text-emerald-800 line-through" : "text-[#2A2016]"}`}>
                          {step.text}
                        </span>
                        {step.required && !done && (
                          <span className="ml-auto text-[9px] font-extrabold uppercase text-[#FF385C] bg-[#FF385C]/10 px-2 py-0.5 rounded-full shrink-0">
                            {t("required")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* La note vient EN COMPLÉMENT de la check-list : la masquer dès
                qu'une consigne existe faisait disparaître ce que l'hôte a écrit. */}
            {data.practicalInfo?.departureNotes && (
              <SectionCard>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A9086] block mb-2">
                  {departureSteps.length > 0 ? t("alsoKnow") : t("departureInstructions")}
                </span>
                <p className="text-[13px] text-[#4A3D30] leading-relaxed whitespace-pre-line">
                  {data.practicalInfo.departureNotes}
                </p>
              </SectionCard>
            )}

            {departureSteps.length === 0 && !data.practicalInfo?.departureNotes && (
              <EmptyState
                icon={<DoorOpen size={22} weight="duotone" />}
                title={t("emptyDeparture")}
                text={t("emptyDepartureText")}
              />
            )}
          </div>
        );

      /* ── BIENVENUE ────────────────────────────────────────────────── */
      case "bienvenue":
        return data.property?.welcomeMessage ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF6E9] text-[#C98A17] flex items-center justify-center mx-auto">
              <HandWaving size={28} weight="duotone" />
            </div>
            <h3 className={`text-xl font-bold ${titleFont}`} style={{ color: primaryColor }}>
              {t("welcome")} {data.owner?.name ? `— ${data.owner.name}` : ""}
            </h3>
            <p className="text-sm text-[#4A3D30] leading-relaxed whitespace-pre-line">
              {data.property.welcomeMessage}
            </p>
          </div>
        ) : (
          <EmptyState
            icon={<HandWaving size={22} weight="duotone" />}
            title={t("emptyWelcome")}
            text={t("emptyWelcomeText")}
          />
        );

      /* ── RÈGLEMENT ────────────────────────────────────────────────── */
      case "reglement":
        return (data.rules || []).length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#2A2016]">{t("houseRules")}</h4>
            <div className="space-y-2">
              {(data.rules || []).map((rule, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3 text-xs text-[#2A2016] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: primaryColor }} />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={22} weight="duotone" />}
            title={t("emptyRules")}
            text={t("emptyRulesText")}
          />
        );

      /* ── ÉQUIPEMENTS & SERVICES ───────────────────────────────────── */
      case "equipements":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border flex items-center gap-4" style={{ backgroundColor: `${primaryColor}0F`, borderColor: `${primaryColor}26` }}>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-amber-500 shrink-0">
                <Medal size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: primaryColor }}>
                  {t("howItWorks")}
                </span>
                <h3 className="text-base font-bold" style={{ color: primaryColor }}>{t("yourEquipment")}</h3>
                <p className="text-xs text-[#8A8078]">
                  {equipments.length} {equipments.length > 1 ? t("equipmentsAvailable") : t("equipmentAvailable")} · {t("openForInstructions")}
                </p>
              </div>
            </div>

            {equipments.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {equipments.map((eq, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <button
                      onClick={() => setExpandedEquipment(expandedEquipment === idx ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl shrink-0">{eq.icon || "✨"}</span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-[#2A2016] truncate">{eq.title}</span>
                          {eq.desc && (
                            <span className="block text-[10px] font-semibold" style={{ color: primaryColor }}>
                              {t("instructionsAvailable")}
                            </span>
                          )}
                        </span>
                      </span>
                      {eq.desc && (
                        <span className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                          <CaretDown size={13} weight="bold" className={`transition-transform ${expandedEquipment === idx ? "rotate-180" : ""}`} />
                        </span>
                      )}
                    </button>
                    {expandedEquipment === idx && eq.desc && (
                      <div className="pt-3 mt-3 border-t border-gray-100 text-[11px] text-[#6B5D4E] leading-relaxed animate-fadeIn whitespace-pre-line">
                        {eq.desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<GridFour size={22} weight="duotone" />}
                title={t("emptyEquipment")}
                text={t("emptyEquipmentText")}
              />
            )}

            {/*
              Les « petits plus » attendent leur retour.

              Ils ne sont plus proposés dans l'éditeur : les afficher
              imposerait à l'hôte un bloc qu'il ne peut ni écrire ni retirer —
              exactement le défaut que ce gabarit s'interdit. `UpsellCard` et
              le type restent en place pour le jour où la fonctionnalité
              reviendra.
            */}
          </div>
        );

      /* ── BONNES ADRESSES ──────────────────────────────────────────── */
      case "adresses":
        return (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl border flex items-center gap-4" style={{ backgroundColor: `${primaryColor}0F`, borderColor: `${primaryColor}26` }}>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 shrink-0">
                <MapPin size={24} weight="duotone" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: primaryColor }}>{t("localBook")}</span>
                <h3 className="text-base font-bold" style={{ color: primaryColor }}>{t("discoverAround")}</h3>
                <p className="text-xs text-[#8A8078]">{recommendations.length} {recommendations.length > 1 ? t("addressesSelected") : t("addressSelected")}</p>
              </div>
            </div>

            {recommendations.length === 0 ? (
              <EmptyState
                icon={<MapPin size={22} weight="duotone" />}
                title={t("emptyAddresses")}
                text={t("emptyAddressesText")}
              />
            ) : (
              <>
                {categories.length > 2 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setAddressCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                          activeCategory === cat ? "text-white border-transparent shadow-sm" : "bg-white text-[#6B5D4E] border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: activeCategory === cat ? primaryColor : undefined }}
                      >
                        {cat === "__all__" ? t("all") : cat}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {filteredRecs.map((rec, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                      {rec.imageUrl && (
                        <div className="relative h-36 bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover" />
                          <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            {rec.category}
                          </span>
                        </div>
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-[#2A2016]">{rec.title}</h4>
                          {typeof rec.rating === "number" && (
                            <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-[#2A2016]">
                              <Star size={12} weight="fill" className="text-amber-400" />
                              {rec.rating.toFixed(1)}
                              {rec.reviews ? <span className="text-[#B0A79E] font-medium">({rec.reviews})</span> : null}
                            </span>
                          )}
                        </div>
                        {rec.description && (
                          <p className="text-[11px] text-[#8A8078] leading-relaxed">{rec.description}</p>
                        )}
                        {rec.comment && (
                          <p className="text-[11px] italic text-[#4A3D30] bg-[#FFF8EE] border border-[#F5E6C8] rounded-xl px-3 py-2">
                            « {rec.comment} »
                          </p>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                          {rec.distance && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}>
                              {rec.distance}
                            </span>
                          )}
                          {rec.mapsUrl && (
                            <a
                              href={rec.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold hover:underline flex items-center gap-1"
                              style={{ color: primaryColor }}
                            >
                              {t("directions")} <ArrowSquareOut size={11} weight="bold" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      /* ── TRANSPORTS ───────────────────────────────────────────────── */
      case "transports":
        return (
          <div className="space-y-4">
            {(data.transportLines || []).length > 0 ? (
              <>
                <h4 className="font-bold text-sm text-[#2A2016]">{t("nearbyLines")}</h4>
                <div className="space-y-2.5">
                  {(data.transportLines || []).map((t, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}14`, color: primaryColor }}>
                          {t.type}
                        </span>
                        {(t.lines || []).map((l, lIdx) => (
                          <span key={lIdx} className="bg-[#2A2016] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{l}</span>
                        ))}
                        <span className="text-xs text-[#2A2016] font-medium">{t.station}</span>
                      </div>
                      {t.distance && <span className="text-[10px] text-[#8A8078] font-semibold shrink-0">{t.distance}</span>}
                    </div>
                  ))}
                </div>
                {data.transportLink?.url && (
                  <a
                    href={data.transportLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl border border-gray-200 py-3 text-xs font-bold text-[#2A2016] hover:bg-gray-50 transition-colors"
                  >
                    {data.transportLink.label || t("nearbyLines")} <ArrowSquareOut size={13} weight="bold" />
                  </a>
                )}
              </>
            ) : (
              <EmptyState
                icon={<Bus size={22} weight="duotone" />}
                title={t("emptyTransport")}
                text={t("emptyTransportText")}
              />
            )}
          </div>
        );

      /* ── FAQ ──────────────────────────────────────────────────────── */
      case "faq":
        return (data.comfortOptions?.faq || []).length > 0 ? (
          <div className="space-y-2.5">
            {(data.comfortOptions?.faq || []).map((item, idx) => (
              <details key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm group">
                <summary className="text-xs font-bold text-[#2A2016] cursor-pointer list-none flex items-center justify-between gap-3">
                  {item.question}
                  <CaretDown size={14} weight="bold" className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="text-[11px] text-[#6B5D4E] leading-relaxed mt-3 pt-3 border-t border-gray-100 whitespace-pre-line">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ChatCircleDots size={22} weight="duotone" />}
            title={t("emptyFaq")}
            text={t("emptyFaqText")}
          />
        );

      /* ── LIVRE D'OR ───────────────────────────────────────────────── */
      case "livredor":
        return (
          <div className="space-y-4 text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F5EFFF] text-[#7048B6] flex items-center justify-center mx-auto">
              <BookBookmark size={28} weight="duotone" />
            </div>
            <h3 className={`text-lg font-bold ${titleFont}`} style={{ color: primaryColor }}>{t("guestbookTitle")}</h3>
            <p className="text-xs text-[#8A8078] leading-relaxed max-w-xs mx-auto">
              Votre séjour touche à sa fin ? Écrivez quelques lignes à {data.owner?.name || "votre hôte"} —
              cela fait toujours plaisir.
            </p>
            {reportAddress && (
              <a
                href={`mailto:${reportAddress}?subject=${encodeURIComponent(`Merci pour le séjour — ${data.property?.name || ""}`)}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {t("writeToHost")}
              </a>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     CARTES DE LA VUE GRILLE

     Résumés compacts, taillés pour une case. On ne réutilise surtout pas
     renderModuleBody() : son contenu est dessiné pour une modale étroite qui
     défile, et produisait en grille des cartes de hauteurs incontrôlées.
     ══════════════════════════════════════════════════════════════════════ */

  /** Libellé du lien de bas de carte, ou null si la carte se suffit. */
  const gridAction = (id: ModuleId): string | null => {
    switch (id) {
      case "arrivee": return data.practicalInfo?.arrivalNotes ? t("accessNotes") : null;
      case "wifi": return (data.codes || []).length > 2 ? t("accessCodes") : null;
      case "depart": return departureSteps.length > 2 ? t("beforeLeaving") : null;
      case "bienvenue": return (data.property?.welcomeMessage || "").length > 260 ? t("welcome") : null;
      case "contacts": return (data.contacts || []).length > 3 ? t("usefulContacts") : null;
      case "equipements": return equipments.length > 8 ? t("yourEquipment") : null;
      case "adresses": return recommendations.length > 3 ? t("discoverAround") : null;
      case "transports": return (data.transportLines || []).length > 4 ? t("nearbyLines") : null;
      case "reglement": return (data.rules || []).length > 3 ? t("houseRules") : null;
      case "faq": return (data.comfortOptions?.faq || []).length > 2 ? t("emptyFaq") : null;
      default: return null;
    }
  };

  /** Grande valeur d'un coup d'œil (une heure), avec sa légende. */
  const BigValue = ({ label, value }: { label: string; value: string }) => (
    <div>
      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#9A9086]">{label}</span>
      <span className={`block text-[30px] leading-none font-extrabold mt-1 tabular-nums ${titleFont}`} style={{ color: primaryColor }}>
        {value || "—"}
      </span>
    </div>
  );

  const renderGridCard = (id: ModuleId): React.ReactNode => {
    switch (id) {
      /* ── Arrivée ── */
      case "arrivee":
        return (
          <div className="flex flex-col justify-between items-center text-center h-full space-y-2">
            <div className="flex flex-col items-center justify-center flex-1 my-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A9086]">
                {t("checkinFrom")}
              </span>
              <span className={`text-3xl font-extrabold text-[#2A2016] mt-0.5 ${titleFont}`}>
                {heureArrivee(data.practicalInfo)}
              </span>
              {data.practicalInfo?.parking && (
                <span className="text-[10px] font-semibold text-[#6B5D4E] mt-1">🚗 Parking disponible</span>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 group-hover:bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-200/60 shadow-2xs transition-colors flex items-center gap-1">
                🔑 Voir les consignes <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );

      /* ── Codes & Wi-Fi ── */
      case "wifi":
        return (
          <div className="flex flex-col justify-between items-center text-center h-full space-y-2">
            <div className="w-full rounded-2xl p-2.5 bg-rose-50/60 border border-rose-100/80 flex flex-col items-center my-auto">
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-rose-800/80">
                {t("wifiNetwork")}
              </span>
              <span className="block text-xs font-bold text-[#2A2016] truncate mt-0.5 max-w-full">
                {data.wifi?.ssid || "—"}
              </span>
              {data.wifi?.password && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    copy(data.wifi.password!, "grid-wifi");
                  }}
                  className="mt-1.5 w-full flex items-center justify-center gap-1.5 rounded-xl bg-white border border-rose-200/80 px-2 py-1 hover:border-rose-300 transition-colors shadow-2xs"
                >
                  <span className="font-mono text-[10px] font-bold text-[#2A2016] truncate">
                    {data.wifi.password}
                  </span>
                  {copiedField === "grid-wifi"
                    ? <Check size={11} weight="bold" className="text-emerald-600 shrink-0" />
                    : <Copy size={11} className="text-rose-400 shrink-0" />}
                </button>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-rose-900 bg-rose-50 group-hover:bg-rose-100/90 px-3 py-1.5 rounded-full border border-rose-200/60 shadow-2xs transition-colors flex items-center gap-1">
                📶 Réseau & codes <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );

      /* ── Départ ── */
      case "depart":
        return (
          <div className="flex flex-col justify-between items-center text-center h-full space-y-2">
            <div className="flex flex-col items-center justify-center flex-1 my-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A9086]">
                {t("checkoutBefore")}
              </span>
              <span className={`text-3xl font-extrabold text-[#2A2016] mt-0.5 ${titleFont}`}>
                {heureDepart(data.practicalInfo)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 group-hover:bg-indigo-100/90 px-3 py-1.5 rounded-full border border-indigo-200/60 shadow-2xs transition-colors flex items-center gap-1">
                🚪 Voir la check-list <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );

      /* ── Bienvenue ── */
      case "bienvenue":
        return (
          <div className="flex flex-col justify-between items-center text-center h-full space-y-2">
            <div className="flex flex-col items-center justify-center flex-1 my-auto px-2">
              <span className="text-2xl leading-none mb-1">👋</span>
              <p className="text-[11px] text-[#4A3D30] leading-relaxed line-clamp-2 italic">
                « {data.property?.welcomeMessage || t("emptyWelcome")} »
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 group-hover:bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-200/60 shadow-2xs transition-colors flex items-center gap-1">
                👋 Lire le mot complet <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );

      /* ── Contacts ── */
      case "contacts":
        return (
          <div className="flex flex-col justify-between items-center text-center h-full space-y-2">
            <div className="w-full flex flex-col items-center justify-center flex-1 my-auto">
              {data.owner?.phone && (
                <a
                  href={`tel:${data.owner.phone.replace(/\s/g, "")}`}
                  onClick={(event) => event.stopPropagation()}
                  className="w-full flex items-center justify-between gap-2 rounded-2xl px-3 py-2 text-white shadow-xs hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="text-left min-w-0">
                    <span className="block text-[9px] uppercase font-extrabold tracking-wider opacity-75">
                      {t("yourHost")}
                    </span>
                    <span className="block text-xs font-bold truncate">{data.owner.name || "—"}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold shrink-0 bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                    <Phone size={11} weight="fill" /> {data.owner.phone}
                  </span>
                </a>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-50 group-hover:bg-emerald-100/90 px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-2xs transition-colors flex items-center gap-1">
                📞 Contacts & urgences <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );

      /* ── Bonnes adresses — la carte illustrée ── */
      case "adresses": {
        const shown = recommendations.filter((r) => r.title).slice(0, 4);
        if (shown.length === 0) {
          return <p className="text-[11px] text-[#B0A79E] italic">{t("emptyAddresses")}</p>;
        }
        return (
          <div className="flex flex-col justify-between h-full space-y-2">
            <div className="grid grid-cols-4 gap-3 flex-1 items-stretch">
              {shown.map((rec, idx) => (
                <a
                  key={idx}
                  href={rec.mapsUrl || undefined}
                  target={rec.mapsUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="group/item rounded-2xl overflow-hidden border border-gray-200/70 bg-white hover:shadow-md transition-all flex flex-col justify-between text-left"
                >
                  <span className="block h-20 bg-gray-100 overflow-hidden relative">
                    {rec.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rec.imageUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center">
                        <MapPin size={20} weight="duotone" className="text-[#C9C2BA]" />
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1 bg-black/65 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                      {rec.category}
                    </span>
                  </span>
                  <span className="p-2 flex-1 flex flex-col justify-between gap-0.5">
                    <span className="text-[11px] font-bold text-[#2A2016] leading-tight line-clamp-1">
                      {rec.title}
                    </span>
                    <span className="flex items-center justify-between text-[9px] text-[#8A8078]">
                      {typeof rec.rating === "number" && (
                        <span className="flex items-center gap-0.5 font-bold text-[#2A2016]">
                          <Star size={9} weight="fill" className="text-amber-400" />
                          {rec.rating.toFixed(1)}
                        </span>
                      )}
                      {rec.distance && <span className="truncate">{rec.distance.split("·")[0].trim()}</span>}
                    </span>
                  </span>
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-rose-900 bg-rose-50 group-hover:bg-rose-100/90 px-3 py-1.5 rounded-full border border-rose-200/60 shadow-2xs transition-colors flex items-center gap-1">
                📍 Voir les {recommendations.length} adresses <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );
      }

      /* ── Équipements ── */
      case "equipements":
        return (
          <div className="flex flex-col justify-between items-center text-center h-full space-y-2">
            <div className="flex flex-wrap items-center justify-center gap-1.5 my-auto">
              {equipments.slice(0, 5).map((eq, idx) => (
                <span
                  key={idx}
                  title={eq.title}
                  className="flex items-center gap-1 rounded-full bg-gray-50 border border-gray-200/70 px-2.5 py-1 text-[10px] font-medium text-[#4A3D30]"
                >
                  <span className="shrink-0">{eq.icon || "✨"}</span>
                  <span className="truncate max-w-[85px]">{eq.title}</span>
                </span>
              ))}
              {equipments.length > 5 && (
                <span className="rounded-full bg-gray-50 border border-gray-200/70 px-2 py-1 text-[10px] font-bold text-[#8A8078]">
                  +{equipments.length - 5}
                </span>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-amber-900 bg-amber-50 group-hover:bg-amber-100/90 px-3 py-1.5 rounded-full border border-amber-200/60 shadow-2xs transition-colors flex items-center gap-1">
                ✨ Voir les {equipments.length} équipements & notices <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );

      /* ── Transports ── */
      case "transports": {
        const lines = (data.transportLines || []).filter((l) => l.station || (l.lines || []).length);
        return (
          <div className="flex flex-col justify-between items-center text-center h-full space-y-2">
            <div className="flex flex-col items-center justify-center flex-1 my-auto space-y-1 w-full">
              {lines.slice(0, 2).map((line, idx) => (
                <div key={idx} className="flex items-center justify-center gap-1 text-[10px] bg-sky-50/60 border border-sky-100 px-2.5 py-0.5 rounded-full w-fit max-w-full">
                  <span
                    className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full shrink-0 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {line.type}
                  </span>
                  <span className="text-[#2A2016] font-bold truncate max-w-[110px]">{line.station}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-bold text-sky-900 bg-sky-50 group-hover:bg-sky-100/90 px-3 py-1.5 rounded-full border border-sky-200/60 shadow-2xs transition-colors flex items-center gap-1">
                🚌 Voir les transports <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );
      }

      /* ── Règlement ── */
      case "reglement": {
        const rules = (data.rules || []).filter(Boolean);
        return (
          <div className="flex flex-col justify-between h-full space-y-2.5">
            <div className="flex flex-col justify-center flex-1 my-auto w-full space-y-2">
              {rules.slice(0, 2).map((rule, idx) => (
                <div
                  key={idx}
                  className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/30 border border-orange-100/90 shadow-2xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-orange-100/80 text-orange-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-[#2A2016] leading-relaxed line-clamp-2 min-w-0 flex-1">
                    {rule}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-extrabold text-amber-900 bg-amber-50 group-hover:bg-amber-100/90 px-3.5 py-1.5 rounded-full border border-amber-200/70 shadow-2xs transition-colors flex items-center gap-1.5">
                📜 {rules.length} consignes importantes <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );
      }

      /* ── Questions fréquentes ── */
      case "faq": {
        const faq = (data.comfortOptions?.faq || []).filter((f) => f.question);
        return (
          <div className="flex flex-col justify-between h-full space-y-2.5">
            <div className="flex flex-col justify-center flex-1 my-auto w-full space-y-2">
              {faq.slice(0, 2).map((item, idx) => (
                <div
                  key={idx}
                  className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/40 to-purple-50/30 border border-purple-100/90 shadow-2xs space-y-1"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      ?
                    </span>
                    <span className="text-xs font-bold text-[#2A2016] leading-snug line-clamp-1 min-w-0 flex-1">
                      {item.question}
                    </span>
                  </div>
                  {item.answer && (
                    <p className="text-[11px] text-[#7048B6] font-medium leading-tight line-clamp-1 pl-7">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-extrabold text-purple-900 bg-purple-50 group-hover:bg-purple-100/90 px-3.5 py-1.5 rounded-full border border-purple-200/70 shadow-2xs transition-colors flex items-center gap-1.5">
                💬 {faq.length} réponses instantanées <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );
      }

      /* ── Livre d'or ── */
      case "livredor":
        return (
          <div className="flex flex-col justify-between h-full space-y-2.5">
            <div className="flex flex-col items-center justify-center flex-1 my-auto px-2 text-center space-y-1">
              <span className="text-2xl mb-1">✍️</span>
              <p className="text-xs font-semibold text-[#5C458A] italic leading-relaxed line-clamp-2">
                « {t("guestbookText")} »
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100/80 w-full flex justify-center shrink-0">
              <span className="text-[10px] font-extrabold text-violet-900 bg-violet-50 group-hover:bg-violet-100/90 px-3.5 py-1.5 rounded-full border border-violet-200/70 shadow-2xs transition-colors flex items-center gap-1.5">
                💌 Laisser un mot d&apos;or <CaretRight size={10} weight="bold" />
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     MODALE
     ══════════════════════════════════════════════════════════════════════ */

  const renderModal = (isInline: boolean) => (
    <AnimatePresence>
      {openModule && (
        <div
          className={
            isInline
              ? "absolute inset-0 z-50 flex items-center justify-center p-2 rounded-[2rem] overflow-hidden"
              : "fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          }
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenModule(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className={`relative w-full bg-white shadow-2xl overflow-hidden flex flex-col z-10 ${
              isInline ? "h-full max-h-full rounded-[1.8rem]" : "max-w-xl max-h-[90vh] rounded-3xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0 bg-white">
              <button
                onClick={() => setOpenModule(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[#2A2016] transition-colors shrink-0"
                aria-label="Fermer"
              >
                <ArrowLeft size={17} weight="bold" />
              </button>

              <span className="font-bold text-[13px] text-[#2A2016] flex items-center gap-1.5 truncate">
                <span>{getModuleDefinition(openModule)?.emoji}</span>
                {moduleLabel(activeLang, openModule)}
              </span>

              {editable ? (
                <button
                  onClick={() => activate(openModule)}
                  className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#FF385C] hover:text-[#FF385C] text-[#2A2016] transition-colors flex items-center gap-1.5"
                >
                  <PencilSimple size={12} weight="bold" /> {t("edit")}
                </button>
              ) : (
                <LanguagePicker
                  langs={offered}
                  active={activeLang}
                  onChange={setLang}
                  compact
                />
              )}
            </div>

            <div className="p-5 overflow-y-auto flex-1">{renderModuleBody(openModule)}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  /* ══════════════════════════════════════════════════════════════════════
     RENDU PRINCIPAL
     ══════════════════════════════════════════════════════════════════════ */

  return (
    <div className="@container min-h-full bg-[#F5F3EF] text-[#2A2016] font-sans pb-10">
      {/* ── COUVERTURE ────────────────────────────────────────────────── */}
      <section
        onClick={() => activate("cover")}
        className={`relative min-h-[18rem] sm:min-h-[22rem] w-full overflow-hidden flex flex-col justify-end px-6 pt-16 pb-12 ${hotClass("cover")}`}
      >
        {offered.length > 1 && (
          <div
            className="absolute top-4 right-4 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <LanguagePicker langs={offered} active={activeLang} onChange={setLang} onDark />
          </div>
        )}

        <div className="absolute inset-0 z-0">
          {gallery.length > 0 ? (
            gallery.map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src + idx}
                src={src}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  idx === activeHero ? "opacity-100" : "opacity-0"
                }`}
              />
            ))
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2A2016] to-[#4A3D30]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/75" />
        </div>

        <div
          className={`relative z-10 text-center space-y-2 ${hotClass("identity")}`}
          onClick={(e) => {
            if (!editable) return;
            e.stopPropagation();
            activate("identity");
          }}
        >
          <h1 className={`text-[24px] sm:text-[28px] leading-tight font-extrabold text-white drop-shadow-md ${titleFont}`}>
            {data.property?.name || t("footer")}
          </h1>
          <p className="text-[12px] sm:text-[13px] text-white/90 leading-relaxed max-w-md mx-auto drop-shadow-sm">
            {data.property?.welcomeMessage || t("defaultSubtitle")}
          </p>
          {data.property?.city && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-xs">
              <MapPin size={11} weight="fill" /> {data.property.city}
            </span>
          )}
        </div>
      </section>

      {/* ── CORPS ─────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 -mt-5 relative z-20 space-y-5">
        {editable && (
          <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm text-[11px] font-semibold text-[#2A2016] flex items-center gap-2">
            <PencilSimple size={14} weight="bold" className="text-[#FF385C] shrink-0" />
            <span>Astuce : cliquez un élément (tuile, photo, couverture) pour le modifier.</span>
          </div>
        )}

        {/* Module Heure & Météo — CAPSULE APPLE SINGLE-LINE SF STYLE */}
        <div className="w-full bg-white border border-gray-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] text-[#2A2016] rounded-3xl p-2 transition-shadow">
          <button
            type="button"
            onClick={() => setWeatherOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-2 @xl:gap-3 px-3 @xl:px-4 py-2.5 rounded-2xl hover:bg-gray-50/80 transition-colors cursor-pointer group"
          >
            {/* Gauche : Horloge Apple & Ville */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex items-center gap-1.5 text-xs font-black text-[#2A2016] tabular-nums tracking-tight shrink-0">
                <Clock size={15} weight="bold" className="text-[#8A8078]" />
                {localTime ? localTime.time : "--:--"}
              </span>
              <span className="text-gray-300 font-light text-xs shrink-0">·</span>
              <span className="text-xs font-bold text-[#2A2016] truncate">
                {data.property?.city || "Destination"}
              </span>
            </div>

            {/* Droite : Météo synthétique Apple avec Icône Duotone Vectorielle */}
            {/*
              La moitié droite cédait devant l'heure au lieu de céder du
              terrain : les deux blocs étaient insécables, et sur téléphone la
              météo venait recouvrir l'horloge. Elle se réduit désormais dans
              l'ordre de son utilité — le libellé, puis le mot du bouton —
              avant que quoi que ce soit ne déborde.

              Les seuils sont ceux du CONTENEUR et non de la fenêtre : ce
              gabarit sert aussi bien une page plein écran qu'un aperçu de
              350 px, où « sm: » ne tombe jamais au bon endroit.
            */}
            {showWeather && weather && (
              <div className="flex min-w-0 items-center gap-1.5 @xl:gap-2">
                <WeatherIcon code={weather.code} emoji={weather.emoji} />
                <span className={`shrink-0 text-xs font-black text-[#2A2016] tabular-nums ${titleFont}`}>
                  {weather.temperature}°
                </span>
                <span className="hidden @2xl:inline truncate text-[10px] font-medium text-[#8A8078]">
                  {weather.label}
                </span>
                <span className="ml-1 flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 @xl:px-2.5 py-1 text-[10px] font-bold text-[#6B5D4E] transition-all group-hover:bg-[#2A2016] group-hover:text-white">
                  <span className="hidden @xl:inline">{weatherOpen ? "Fermer" : "Prévisions"}</span>
                  <CaretDown
                    size={10}
                    weight="bold"
                    className={`transition-transform duration-300 ${weatherOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </div>
            )}
          </button>

          {/* Tiroir Météo Dépliable (Animation Framer Motion Ultra-Fluide Apple) */}
          <AnimatePresence initial={false}>
            {showWeather && weather && weatherOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 pt-3 border-t border-gray-100 mt-1 space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-[#8A8078] px-1 font-semibold">
                    <span>Ressenti {weather.feelsLike}° · {weather.label}</span>
                    <span>Prévisions 4 jours</span>
                  </div>

                  {weather.daily.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5">
                      {weather.daily.slice(0, 4).map((day) => (
                        <div
                          key={day.date}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gray-50/90 border border-gray-100 text-center shadow-2xs hover:bg-gray-100/90 transition-colors"
                        >
                          <span className="text-[9px] font-bold text-[#8A8078] uppercase tracking-wider">
                            {formatForecastDay(day.date, locale)}
                          </span>
                          <div className="my-2">
                            <WeatherIcon code={day.code} emoji={day.emoji} className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-extrabold text-[#2A2016] tabular-nums">
                            {day.max}° <span className="text-[#A0958B] font-medium">{day.min}°</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bascule de disposition — ordinateur uniquement */}
        {gridAvailable && (
          <div className="hidden @4xl:flex items-center justify-end gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9086]">{t("display")}</span>
            <div className="flex bg-white p-1 rounded-full border border-gray-200 shadow-[0_1px_3px_rgba(30,25,20,0.05)]">
              {([
                { value: "list" as const, label: t("viewList"), Icon: ListIcon },
                { value: "grid" as const, label: t("viewGrid"), Icon: SquaresFour },
              ]).map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setLayout(mode.value)}
                  aria-pressed={layout === mode.value}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    layout === mode.value
                      ? "text-white shadow-sm"
                      : "text-[#6B5D4E] hover:text-[#2A2016]"
                  }`}
                  style={{ backgroundColor: layout === mode.value ? primaryColor : undefined }}
                >
                  <mode.Icon size={13} weight="bold" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VUE LISTE ── (toujours utilisée sur mobile) */}
        <div className={gridActive ? "@4xl:hidden space-y-6" : "space-y-6"}>
          {/* Tuiles d'accès rapide */}
          {tiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {tiles.map((id) => {
                const Icon = MODULE_ICONS[id];
                const tint = MODULE_TINTS[id];
                const status = getModuleStatus(data, id);
                return (
                  <button
                    key={id}
                    onClick={() => openModuleAndEdit(id)}
                    className={`relative bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(30,25,20,0.06)] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group ${hotClass(id)}`}
                  >
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-gray-200 rounded-tr-[3px]" />
                    <span
                      className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: tint.bg, color: tint.fg }}
                    >
                      <Icon size={22} weight="duotone" />
                    </span>
                    <span className="text-[13px] font-bold text-[#2A2016] leading-tight">{moduleLabel(activeLang, id)}</span>
                    {!status.complete && (
                      <span className="text-[11px] font-semibold text-[#FF385C]">{t("toComplete")}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sections de modules */}
          {groups.map((group) => {
            const ids = visibleModulesOf(data, group.key, { preview: editable });
            if (ids.length === 0) return null;
            return (
              <section key={group.key} className="space-y-2.5">
                <h2 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9A9086] px-1">
                  {group.label}
                </h2>
                <div className="space-y-2.5">
                  {ids.map((id) => {
                    const Icon = MODULE_ICONS[id];
                    const tint = MODULE_TINTS[id];
                    const status = getModuleStatus(data, id);
                    return (
                      <button
                        key={id}
                        onClick={() => openModuleAndEdit(id)}
                        className={`w-full bg-white px-4 py-3.5 rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(30,25,20,0.05)] hover:shadow-md transition-all flex items-center gap-3.5 text-left ${hotClass(id)}`}
                      >
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: tint.bg, color: tint.fg }}
                        >
                          <Icon size={20} weight="duotone" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-bold text-[#2A2016] truncate">{moduleLabel(activeLang, id)}</span>
                          <span className={`block text-[11px] truncate ${status.complete ? "text-[#9A9086]" : "text-[#FF385C] font-semibold"}`}>
                            {status.complete ? status.summary : t("toComplete")}
                          </span>
                        </span>
                        <CaretRight size={15} weight="bold" className="text-[#C9C2BA] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

        </div>

        {/* ── VUE GRILLE ──
            Grille de 6 colonnes pensée rangée par rangée : les portées
            s'additionnent à 6, donc chaque rangée est pleine. Les cartes
            s'étirent à la hauteur de leur voisine (comportement par défaut de
            la grille — surtout pas d'items-start, qui creusait des vides), et
            `auto-rows-fr` égalise les rangées entre elles. */}
        {gridActive && (
          <div className="hidden @4xl:block space-y-3">
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 shadow-2xs text-[11px] text-[#6B5D4E] font-semibold text-center">
              <span className="text-amber-500 font-bold">💡 Astuce :</span>
              <span>Cliquez sur n&apos;importe quelle carte pour l&apos;agrandir et consulter le guide complet.</span>
            </div>
            <div className="grid grid-cols-6 gap-4 auto-rows-fr [grid-auto-flow:row_dense]">
              {gridOrder.map((id) => {
                const isBottomPair =
                  gridOrder.filter((m) => ["reglement", "faq", "livredor"].includes(m)).length === 2 &&
                  (id === "reglement" || id === "faq");
                const cardSpan = isBottomPair ? "col-span-3" : GRID_SPAN[id];
                return (
                  <GridCard
                    key={id}
                    id={id}
                    span={cardSpan}
                    Icon={MODULE_ICONS[id]}
                    tint={MODULE_TINTS[id]}
                    title={moduleLabel(activeLang, id)}
                    titleFont={titleFont}
                    titleColor={primaryColor}
                    onOpen={() => openModuleAndEdit(id)}
                    onSelect={() => activate(id)}
                    extraClass={hotClass(id)}
                    action={gridAction(id)}
                  >
                    {renderGridCard(id)}
                  </GridCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Localisation — carte de fin de page */}
        {showMap && mapAddress && (
          <section className="space-y-2.5">
            <div className="px-1">
              <span
                className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
                style={{ color: primaryColor }}
              >
                {t("location")}
              </span>
              <h2 className={`text-lg font-bold text-[#2A2016] mt-0.5 ${titleFont}`}>
                {t("whereIsIt")}
              </h2>
            </div>

            <div className="relative h-64 rounded-2xl overflow-hidden border border-gray-100 shadow-[0_1px_3px_rgba(30,25,20,0.05)] bg-gray-100">
              <iframe
                title="Carte du logement"
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&z=15&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <BoutonsItineraire adresse={mapAddress} couleur={primaryColor} />

            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(mapAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-white py-3 text-xs font-bold text-[#2A2016] hover:border-gray-300 transition-colors"
            >
              <MapPin size={14} weight="fill" style={{ color: primaryColor }} />
              {data.property?.address}
            </a>
          </section>
        )}
        <p className="text-center text-[10px] text-[#B0A79E] pt-2">
          {t("footer")} · {data.property?.name}
        </p>
        {/*
          Signalement, côté voyageur uniquement. `trackingId` est absent dans
          l'éditeur, où ce lien n'aurait aucun sens — et `editable` distingue
          l'aperçu de la page publiée.
        */}
        {trackingId && !editable && (
          <SignalerLivret livretId={trackingId} slug={data.slug} />
        )}
      </main>

      {mounted && (inlineModal ? renderModal(true) : createPortal(renderModal(false), document.body))}
    </div>
  );
}
