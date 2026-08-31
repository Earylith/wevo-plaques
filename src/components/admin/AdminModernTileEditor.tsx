"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Accommodation, AccessCodeItem, ContactInfo, Recommendation, TransportLine,
  EquipmentItem, DepartureInstruction, ModuleId, ModuleConfig,
  ModuleGroup, resolveModules, getModuleDefinition,
} from "@/lib/types/accommodation";
import {
  getEssentials, getModuleStatus, resolveGallery, getSectionProgress,
  ADMIN_SECTIONS, getSectionDefinition, EssentialItem, EditorSection,
} from "@/lib/livret";
import CleoTemplate, { PreviewTarget } from "@/components/templates/CleoTemplate";
import PhotoManager from "@/components/admin/editor/PhotoManager";
import PlaceSearch from "@/components/admin/editor/PlaceSearch";
import TranslationsTab from "@/components/admin/editor/TranslationsTab";
import PlaqueTab, { essenceCommandable, TAGLINE_PAR_DEFAUT } from "@/components/admin/editor/PlaqueTab";
import PlaquePreview from "@/components/admin/editor/PlaquePreview";
import VerrouConfort from "@/components/admin/editor/VerrouConfort";
import EssentialTemplate from "@/components/templates/EssentialTemplate";
import { ouvrirPaiementConfort } from "@/app/paiement-actions";
import StatsPanel from "@/components/admin/editor/StatsPanel";
import LibraryPicker, { PickedEntry } from "@/components/admin/editor/LibraryPicker";
import { createPlaqueOrder, getOrdersForAccommodation } from "@/app/admin/orders";
import { PlaqueConfig, PlaqueOrder } from "@/lib/types/accommodation";
import { TranslatableLang, TranslationLayer, Translations } from "@/lib/i18n";
import { PlaceResult, LatLon, describeDistance, mapsUrlFor } from "@/lib/geo";
import {
  TextField, TextAreaField, SelectField, TimeField, Toggle, AddButton,
  ItemToolbar, SectionTitle, Hint, Label,
} from "@/components/admin/editor/Primitives";
import { publishAdminAccommodation, unpublishAdminAccommodation } from "@/app/admin/actions";
import {
  Key, ArrowLeft, Desktop, DeviceMobile, CaretUp, CaretDown,
  ArrowRight, Check, PencilSimple, Plus, ArrowSquareOut, Warning, CheckCircle,
  MapPin, Star, Trash, WifiHigh, Phone, DoorOpen, HandWaving,
  ArrowCounterClockwise, ArrowClockwise, CloudCheck, CloudSlash, EyeSlash,
  BookOpen, Medal, Bus, ChatCircleDots, BookBookmark,
} from "@phosphor-icons/react";

interface Props {
  initialData: Accommodation;
  /**
   * Persiste le livret. Peut renvoyer l'identifiant réel du document : à la
   * création, il n'est connu qu'après l'écriture, et « Publier » en a besoin.
   */
  onSubmit: (updatedData: Accommodation) => Promise<string | void>;
  isLoading?: boolean;
  /** Bloc « Compte propriétaire » injecté par la page, affiché dans Partager. */
  ownerPanel?: React.ReactNode;
  /**
   * Reçoit une fonction permettant à la page d'appliquer une modification
   * faite HORS de l'éditeur (création d'un compte propriétaire, qui réécrit
   * owner.email en base). Sans cela l'éditeur, qui travaille sur un
   * instantané figé au montage, réécraserait ces champs au prochain
   * enregistrement — et le propriétaire ne pourrait plus se connecter.
   */
  externalPatchRef?: React.MutableRefObject<((patch: Partial<Accommodation>) => void) | null>;
  /**
   * Qui édite.
   *
   * `proprietaire` retire ce qui relève de Guidz et non de l'hôte : la
   * commande de plaque, le suivi des commandes, les statistiques et la mise
   * en ligne. Ces actions passent par des actions serveur réservées à
   * l'administration ; les laisser visibles côté hôte afficherait des erreurs
   * d'autorisation au lieu d'un écran cohérent.
   */
  role?: "admin" | "proprietaire";
  /**
   * Vitrine publique (page d'accueil) : l'éditeur reste pleinement
   * manipulable mais n'écrit rien. On coupe l'enregistrement automatique,
   * la mise en ligne et l'alerte de sortie, et on l'annonce dans la barre :
   * un visiteur qui croirait avoir enregistré serait trompé.
   */
  demo?: boolean;
}

const MODULE_ICONS: Record<ModuleId, React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" | "duotone"; className?: string }>> = {
  arrivee: Key, wifi: WifiHigh, contacts: Phone, depart: DoorOpen, bienvenue: HandWaving,
  reglement: BookOpen, equipements: Medal, adresses: MapPin, transports: Bus,
  faq: ChatCircleDots, livredor: BookBookmark,
};

const MODULE_TINTS: Record<ModuleId, { bg: string; fg: string }> = {
  arrivee: { bg: "#FFF4E5", fg: "#C97A17" }, wifi: { bg: "#FFF0F2", fg: "#D9455F" },
  contacts: { bg: "#EAF6EF", fg: "#1F8A54" }, depart: { bg: "#F1F0FB", fg: "#5B54C4" },
  bienvenue: { bg: "#FFF6E9", fg: "#C98A17" }, reglement: { bg: "#FFF1E8", fg: "#C4714A" },
  equipements: { bg: "#FFF2E8", fg: "#D98324" }, adresses: { bg: "#FFEFF3", fg: "#D9455F" },
  transports: { bg: "#E9F3FF", fg: "#2B5F75" },
  faq: { bg: "#EFF2FF", fg: "#4356C0" }, livredor: { bg: "#F5EFFF", fg: "#7048B6" },
};

/** Modules dont l'incomplétude bloque un point de la check-list « Les essentiels ». */
const ESSENTIAL_MODULES: ModuleId[] = ["arrivee", "wifi", "contacts", "depart"];

/** Ordre d'apparition des sections dans le livret du voyageur. */
const GROUP_ORDER: ModuleGroup[] = ["tuiles", "sejour", "surplace", "alentours"];

const COLOR_PRESETS = ["#C4714A", "#2B5F75", "#C4714A", "#0E7C86", "#5A7A4E", "#D4A34A", "#1A1510"];
const CHECKIN_HOURS = ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"];
const CHECKOUT_HOURS = ["06", "07", "08", "09", "10", "11", "12", "13", "14"];
const ADDRESS_CATEGORIES = ["Restaurant", "Bar", "Plage", "Activité", "Commerce", "Culture", "Nature"];
const TRANSPORT_TYPES = ["Métro", "Bus", "Tram", "Train", "Bateau", "Vélo"];
const TIMEZONES = [
  { value: "Europe/Paris", label: "Paris / France métropolitaine" },
  { value: "Europe/Brussels", label: "Bruxelles" },
  { value: "Europe/Lisbon", label: "Lisbonne" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Rome", label: "Rome" },
  { value: "Europe/London", label: "Londres" },
  { value: "America/Guadeloupe", label: "Guadeloupe / Martinique" },
  { value: "Indian/Reunion", label: "La Réunion" },
  { value: "America/Montreal", label: "Montréal" },
];
/** Numéros de secours français, proposés en un clic. */
const EMERGENCY_PRESETS = [
  { label: "SAMU", name: "Urgences médicales", phone: "15" },
  { label: "Pompiers", name: "Secours", phone: "18" },
  { label: "Police Secours", name: "Police", phone: "17" },
  { label: "Urgences Europe", name: "Numéro européen", phone: "112" },
];

const EMOJI_PALETTE = ["🌐", "📺", "🍳", "☕", "🍽️", "🧺", "❄️", "💻", "🚗", "🛌", "💨", "☀️", "🛁", "🔥", "🎮", "🚲"];

export default function AdminModernTileEditor({
  initialData,
  onSubmit,
  isLoading = false,
  ownerPanel,
  externalPatchRef,
  role = "admin",
  demo = false,
}: Props) {
  const estAdmin = role === "admin";
  const [data, setData] = useState<Accommodation>(initialData);
  /**
   * La formule décide de ce qui est ouvert et de l'allure de l'aperçu.
   *
   * On lit les données courantes et non l’instantané initial : l'admin peut changer la formule en
   * cours d'édition, et l'écran doit suivre immédiatement.
   */
  const estConfort = data.offerType === "comfort";
  // On ouvre sur la PREMIÈRE rubrique de la barre : sans ça, le bouton
  // « Suivant » sauterait la rubrique d'ouverture, qu'on n'atteindrait qu'en
  // revenant en arrière.
  const [editorSection, setEditorSection] = useState<EditorSection>(ADMIN_SECTIONS[0].id);
  const [viewDevice, setViewDevice] = useState<"mobile" | "desktop">("mobile");
  /*
   * « Vue voyageur » : l'aperçu se comporte exactement comme le livret publié
   * — pastilles « À compléter » retirées, rubriques encore vides masquées,
   * clics non détournés vers l'éditeur. C'est le seul moyen pour l'hôte de
   * savoir ce que son client verra vraiment.
   */
  /**
   * L'aperçu reste en mode édition.
   *
   * La bascule « Vue hôte / Vue voyageur » a été retirée : elle demandait de
   * comprendre deux modes pour un écran qui doit se lire d'un coup d'œil. La
   * constante subsiste parce que l'aperçu et les modales s'y réfèrent.
   */
  const previewAsGuest = false;
  const [openModule, setOpenModule] = useState<ModuleId | null>(null);
  const [selected, setSelected] = useState<PreviewTarget | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [orders, setOrders] = useState<PlaqueOrder[]>([]);
  const [ordering, setOrdering] = useState(false);
  /** Redirection vers Stripe en cours. */
  const [paiement, setPaiement] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [autosave, setAutosave] = useState(!demo);
  /** Pile d'annulation : instantanés successifs de `data`. */
  const [history, setHistory] = useState<{ past: Accommodation[]; future: Accommodation[] }>({
    past: [],
    future: [],
  });

  const bodyRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  // Sur un livret neuf, l'identifiant n'existe qu'après le premier
  // enregistrement : il est remonté par onSubmit.
  const [docId, setDocId] = useState<string>(initialData.id || initialData.slug);
  /*
   * Slug tel qu'il existe en base. Le QR code et le lien public s'appuient
   * dessus : imprimer une affiche pour une adresse encore non enregistrée
   * produirait un QR qui mène à une page inexistante.
   */
  const [savedSlug, setSavedSlug] = useState<string>(initialData.slug);

  /* ══════════════════════════════════════════════════════════════════
     MUTATEURS
     ══════════════════════════════════════════════════════════════════ */
  const revisionRef = useRef(0);
  const lastHistoryPushRef = useRef(0);
  const inFlightSaveRef = useRef<Promise<string | null> | null>(null);

  const mutate = useCallback((fn: (d: Accommodation) => Accommodation) => {
    revisionRef.current += 1;
    const now = Date.now();
    // On regroupe les frappes rapprochées en une seule étape d'annulation :
    // sinon Ctrl+Z reviendrait caractère par caractère.
    if (now - lastHistoryPushRef.current > 600) {
      lastHistoryPushRef.current = now;
      setHistory((h) => ({ past: [...h.past, data].slice(-60), future: [] }));
    } else {
      setHistory((h) => (h.future.length ? { ...h, future: [] } : h));
    }
    setData(fn);
    setDirty(true);
    setSaveState("idle");
    // Le bandeau porte la couleur de saveState : sans cela, un échec repeint
    // son message en vert dès la frappe suivante.
    setMessage(null);
  }, [data]);

  /*
   * Un instantané d'historique contient TOUT l'objet, y compris des champs que
   * l'éditeur n'écrit jamais : statut de publication, compte propriétaire,
   * historique de ménage. Annuler une faute de frappe ne doit pas dépublier un
   * livret ni ressusciter un compte supprimé — on réimpose donc l'état courant
   * pour ces champs.
   */
  const restoreSnapshot = (snapshot: Accommodation, current: Accommodation): Accommodation => ({
    ...snapshot,
    isActive: current.isActive,
    publishedAt: current.publishedAt,
    ownerUid: current.ownerUid,
    mustChangePassword: current.mustChangePassword,
    cleaningLogs: current.cleaningLogs,
    inventories: current.inventories,
    features: current.features,
  });

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    revisionRef.current += 1;
    lastHistoryPushRef.current = 0;
    setHistory({ past: history.past.slice(0, -1), future: [data, ...history.future].slice(0, 60) });
    setData((current) => restoreSnapshot(previous, current));
    setDirty(true);
    setSaveState("idle");
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    revisionRef.current += 1;
    lastHistoryPushRef.current = 0;
    setHistory({ past: [...history.past, data].slice(-60), future: history.future.slice(1) });
    setData((current) => restoreSnapshot(next, current));
    setDirty(true);
    setSaveState("idle");
  };

  const setProperty = (fields: Partial<Accommodation["property"]>) =>
    mutate((d) => ({ ...d, property: { ...d.property, ...fields } }));
  const setWifi = (fields: Partial<Accommodation["wifi"]>) =>
    mutate((d) => ({ ...d, wifi: { ...d.wifi, ...fields } }));
  const setPractical = (fields: Partial<Accommodation["practicalInfo"]>) =>
    mutate((d) => ({ ...d, practicalInfo: { ...d.practicalInfo, ...fields } }));
  const setOwner = (fields: Partial<Accommodation["owner"]>) =>
    mutate((d) => ({ ...d, owner: { ...d.owner, ...fields } }));
  const setTheme = (fields: Partial<NonNullable<NonNullable<Accommodation["comfortOptions"]>["theme"]>>) =>
    mutate((d) => ({
      ...d,
      comfortOptions: { ...d.comfortOptions, theme: { ...d.comfortOptions?.theme, ...fields } },
    }));

  const setPlaque = (fields: Partial<PlaqueConfig>) =>
    mutate((d) => ({ ...d, plaque: { wood: "noyer", ...d.plaque, ...fields } }));

  /**
   * Ouvre le paiement de la formule Confort.
   *
   * On enregistre d'abord : la session porte l'identifiant du livret, et le
   * webhook publiera CE qui est en base. Payer sur un brouillon non
   * enregistré mettrait en ligne une version antérieure à ce que l'hôte
   * vient d'écrire.
   */
  const handlePayer = async () => {
    setPaiement(true);
    setOrderError(null);
    try {
      if (dirty) await handleSave();
      const { auth } = await import("@/lib/firebase/config");
      const jeton = await auth.currentUser?.getIdToken();
      const { url } = await ouvrirPaiementConfort(docId, window.location.origin, jeton);
      // `assign` plutôt qu'une affectation sur `location.href` : le
      // compilateur React interdit d'écrire dans une valeur définie hors du
      // composant, et le résultat est le même.
      window.location.assign(url);
    } catch (err) {
      console.error(err);
      setOrderError(err instanceof Error ? err.message : "Le paiement n’a pas pu être ouvert.");
      setPaiement(false);
    }
  };

  /**
   * Enregistre la commande de plaque.
   *
   * On rafraîchit ensuite le livret : la commande vient de lui attribuer son
   * identifiant permanent et de verrouiller son adresse publique.
   */
  const handleOrderPlaque = async () => {
    setOrdering(true);
    setOrderError(null);
    try {
      // L'essence est normalisée : ce qui part en gravure doit être ce que
      // l'hôte a vu à l'écran, pas une teinte retirée du catalogue.
      const configuration: PlaqueConfig = {
        ...data.plaque,
        wood: essenceCommandable(data.plaque?.wood),
      };
      const order = await createPlaqueOrder(docId, configuration, window.location.origin);
      setOrders((current) => [order, ...current]);
      setData((current) => ({ ...current, slugLocked: true }));
      setMessage(`Commande ${order.reference} enregistrée. L'adresse publique est désormais verrouillée.`);
      setSaveState("saved");
    } catch (err) {
      console.error(err);
      setOrderError(err instanceof Error ? err.message : "La commande a échoué.");
    } finally {
      setOrdering(false);
    }
  };

  /**
   * Ajoute des entrées de la bibliothèque, en posant du même coup leurs
   * traductions.
   *
   * C'est tout l'intérêt de la bibliothèque : les calques EN/ES/IT sont
   * indexés comme la liste française, donc écrire à l'index de la nouvelle
   * entrée suffit à rendre le livret quadrilingue sans intervention.
   */
  const addFromLibrary = (kind: "equipments" | "rules" | "departure", picked: PickedEntry[]) => {
    mutate((current) => {
      const layers = ((current.translations as Translations | undefined) || {}) as Translations;
      const next: Accommodation = { ...current };
      const updatedLayers: Translations = { ...layers };

      /** Écrit une traduction à l'index voulu, pour les trois langues. */
      const writeTranslations = (
        startIndex: number,
        entries: PickedEntry[],
        apply: (layer: TranslationLayer, index: number, entry: PickedEntry, lang: TranslatableLang) => TranslationLayer
      ) => {
        for (const lang of ["en", "es", "it"] as TranslatableLang[]) {
          let layer: TranslationLayer = { ...(updatedLayers[lang] || {}) };
          entries.forEach((entry, offset) => {
            layer = apply(layer, startIndex + offset, entry, lang);
          });
          updatedLayers[lang] = layer;
        }
      };

      if (kind === "equipments") {
        const list = [...(current.equipments || [])];
        const start = list.length;
        picked.forEach((entry) => {
          list.push({ title: entry.title.fr, desc: entry.desc?.fr || "", icon: entry.icon || "✨" });
        });
        next.equipments = list;
        writeTranslations(start, picked, (layer, index, entry, lang) => {
          const items = [...(layer.equipments || [])];
          items[index] = { title: entry.title[lang], desc: entry.desc?.[lang] || "" };
          return { ...layer, equipments: items };
        });
      }

      if (kind === "rules") {
        const list = [...(current.rules || [])];
        const start = list.length;
        picked.forEach((entry) => list.push(entry.title.fr));
        next.rules = list;
        writeTranslations(start, picked, (layer, index, entry, lang) => {
          const items = [...(layer.rules || [])];
          items[index] = entry.title[lang];
          return { ...layer, rules: items };
        });
      }

      if (kind === "departure") {
        const list = [...(current.practicalInfo?.departureInstructions || [])];
        const start = list.length;
        picked.forEach((entry) => list.push({ text: entry.title.fr, required: entry.required || false }));
        next.practicalInfo = { ...current.practicalInfo, departureInstructions: list };
        writeTranslations(start, picked, (layer, index, entry, lang) => {
          const items = [...(layer.departureInstructions || [])];
          items[index] = entry.title[lang];
          return { ...layer, departureInstructions: items };
        });
      }

      next.translations = updatedLayers;
      return next;
    });
  };

  const setDisplay = (fields: Partial<NonNullable<Accommodation["display"]>>) =>
    mutate((d) => ({ ...d, display: { ...d.display, ...fields } }));

  /** Position du logement, dès qu'une adresse a été choisie dans les suggestions. */
  const propertyPoint: LatLon | undefined =
    typeof data.property?.latitude === "number" && typeof data.property?.longitude === "number"
      ? { lat: data.property.latitude, lon: data.property.longitude }
      : undefined;

  /** L'hôte a retenu une adresse pour SON logement. */
  const applyPropertyAddress = (place: PlaceResult) =>
    setProperty({
      address: place.address,
      city: place.city || data.property?.city || "",
      latitude: place.lat,
      longitude: place.lon,
    });

  /** L'hôte a retenu un lieu à recommander : la fiche se remplit seule. */
  const applyRecommendation = (place: PlaceResult, distance?: string) => {
    recos.add({
      title: place.name,
      category: place.category,
      description: "",
      distance: distance || (propertyPoint ? describeDistance(propertyPoint, place) : ""),
      mapsUrl: mapsUrlFor(place.name, place),
    });
    // On ouvre la fiche fraîchement ajoutée pour la compléter tout de suite.
    setHighlight("recommendation.last");
  };

  /** Écrit dans le calque de traduction de la langue en cours. */
  const updateTranslationLayer = (
    langue: TranslatableLang,
    apply: (layer: TranslationLayer) => TranslationLayer
  ) =>
    mutate((current) => {
      const all = (current.translations as Translations | undefined) || {};
      return {
        ...current,
        translations: { ...all, [langue]: apply(all[langue] || {}) },
      };
    });

  const setPhotos = (photos: string[]) =>
    mutate((d) => ({
      ...d,
      property: { ...d.property, gallery: photos, mainImageUrl: photos[0] || "" },
    }));

  /* Listes génériques ------------------------------------------------ */
  function listOps<T>(read: (d: Accommodation) => T[], write: (d: Accommodation, list: T[]) => Accommodation) {
    return {
      add: (item: T) => mutate((d) => write(d, [...read(d), item])),
      update: (index: number, patch: Partial<T>) =>
        mutate((d) => write(d, read(d).map((it, i) => (i === index ? { ...it, ...patch } : it)))),
      replace: (index: number, item: T) =>
        mutate((d) => write(d, read(d).map((it, i) => (i === index ? item : it)))),
      remove: (index: number) => mutate((d) => write(d, read(d).filter((_, i) => i !== index))),
      move: (from: number, to: number) =>
        mutate((d) => {
          const list = [...read(d)];
          if (to < 0 || to >= list.length) return d;
          const [item] = list.splice(from, 1);
          list.splice(to, 0, item);
          return write(d, list);
        }),
    };
  }

  /**
   * Déplace un élément à l'intérieur d'un sous-ensemble filtré.
   *
   * Les contacts « utiles » et les numéros d'urgence vivent dans le même
   * tableau `contacts` mais sont édités dans deux listes séparées. Réordonner
   * avec l'index du tableau complet ferait permuter un contact avec un voisin
   * invisible : on échange donc les positions des deux voisins VISIBLES.
   */
  const moveWithinSubset = <T,>(
    list: T[],
    positions: number[],
    from: number,
    to: number,
    write: (next: T[]) => void
  ) => {
    if (to < 0 || to >= positions.length) return;
    const next = [...list];
    const a = positions[from];
    const b = positions[to];
    [next[a], next[b]] = [next[b], next[a]];
    write(next);
  };

  const codes = listOps<AccessCodeItem>((d) => d.codes || [], (d, l) => ({ ...d, codes: l }));
  const equipments = listOps<EquipmentItem>((d) => d.equipments || [], (d, l) => ({ ...d, equipments: l }));
  const rules = listOps<string>((d) => d.rules || [], (d, l) => ({ ...d, rules: l }));
  const contacts = listOps<ContactInfo>((d) => d.contacts || [], (d, l) => ({ ...d, contacts: l }));
  const recos = listOps<Recommendation>((d) => d.recommendations || [], (d, l) => ({ ...d, recommendations: l }));
  const transports = listOps<TransportLine>((d) => d.transportLines || [], (d, l) => ({ ...d, transportLines: l }));
  const departures = listOps<DepartureInstruction>(
    (d) => d.practicalInfo?.departureInstructions || [],
    (d, l) => ({ ...d, practicalInfo: { ...d.practicalInfo, departureInstructions: l } })
  );
  const faq = listOps<{ question: string; answer: string }>(
    (d) => d.comfortOptions?.faq || [],
    (d, l) => ({ ...d, comfortOptions: { ...d.comfortOptions, faq: l } })
  );

  /* Modules ---------------------------------------------------------- */
  /*
   * Le livret rend chaque section indépendamment : seul l'ordre RELATIF au
   * sein d'une section est visible par le voyageur. On trie donc la liste de
   * l'éditeur par section, de sorte que deux cartes voisines appartiennent à
   * la même section et que les flèches produisent un effet réel.
   */
  const modules = useMemo(() => {
    const groupRank = new Map(GROUP_ORDER.map((g, i) => [g, i]));
    return [...resolveModules(data.modules)].sort((a, b) => {
      const ga = groupRank.get(getModuleDefinition(a.id).group) ?? 99;
      const gb = groupRank.get(getModuleDefinition(b.id).group) ?? 99;
      return ga - gb || a.order - b.order;
    });
  }, [data.modules]);

  const writeModules = (next: ModuleConfig[]) =>
    mutate((d) => ({ ...d, modules: next.map((m, i) => ({ ...m, order: i })) }));

  const toggleModuleVisible = (id: ModuleId) =>
    writeModules(modules.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));

  /** Voisin immédiat appartenant à la MÊME section, ou -1 s'il n'y en a pas. */
  const neighbourInGroup = (id: ModuleId, direction: -1 | 1) => {
    const from = modules.findIndex((m) => m.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= modules.length) return -1;
    const groupOf = (i: number) => getModuleDefinition(modules[i].id).group;
    // Un échange entre deux sections ne changerait rien pour le voyageur.
    return groupOf(from) === groupOf(to) ? to : -1;
  };

  const moveModule = (id: ModuleId, direction: -1 | 1) => {
    const from = modules.findIndex((m) => m.id === id);
    const to = neighbourInGroup(id, direction);
    if (from < 0 || to < 0) return;
    const next = [...modules];
    [next[from], next[to]] = [next[to], next[from]];
    writeModules(next);
  };

  /* ══════════════════════════════════════════════════════════════════
     NAVIGATION ÉDITEUR ⇄ APERÇU
     ══════════════════════════════════════════════════════════════════ */
  const jumpTo = (item: EssentialItem) => {
    setEditorSection(item.tab);
    if (item.module) {
      setOpenModule(item.module);
      setSelected(item.module);
    } else {
      // On quitte une rubrique : refermer la fiche restée ouverte dans l'aperçu.
      setOpenModule(null);
      setSelected(null);
    }
    setHighlight(item.field);
  };

  /** Un élément de l'aperçu a été cliqué : on ouvre son éditeur à gauche. */
  const handlePreviewSelect = (target: PreviewTarget) => {
    if (target === "cover") {
      setEditorSection("apparence");
      setSelected("cover");
      setHighlight("property.gallery");
      return;
    }
    if (target === "identity") {
      setEditorSection("logement");
      setSelected("identity");
      setHighlight("property.name");
      return;
    }
    // On ouvre la section qui contient cette rubrique.
    const host = ADMIN_SECTIONS.find((section) => section.modules.includes(target));
    if (host) {
      setEditorSection(host.id);
    }
    setOpenModule(target);
    setSelected(target);
    setHighlight(`module.${target}`);
  };

  /**
   * Change de rubrique. Referme la fiche ouverte dans l'aperçu et remonte le
   * formulaire en haut : on arrive au début de la nouvelle rubrique, pas au
   * milieu de son contenu.
   */
  const goToSection = (section: EditorSection) => {
    setEditorSection(section);
    setOpenModule(null);
    setSelected(null);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Ouvre / referme un module depuis le panneau de gauche. */
  const toggleModuleOpen = (id: ModuleId) => {
    const next = openModule === id ? null : id;
    setOpenModule(next);
    setSelected(next);
    if (next) setHighlight(`module.${next}`);
  };

  /**
   * L'aperçu a ouvert ou fermé une modale : on synchronise le panneau de
   * gauche. À la fermeture on lève aussi la sélection, sinon le liseré rose
   * resterait sur une tuile dont l'éditeur vient de se replier.
   */
  const handlePreviewModuleChange = (module: ModuleId | null) => {
    setOpenModule(module);
    if (module) {
      const host = ADMIN_SECTIONS.find((section) => section.modules.includes(module));
      if (host) {
        setEditorSection(host.id);
        }
      setSelected(module);
    } else {
      setSelected((current) => (current === "cover" || current === "identity" ? current : null));
    }
  };

  // Fait défiler l'élément ciblé et le met brièvement en évidence.
  useEffect(() => {
    if (!highlight) return;
    const raf = requestAnimationFrame(() => {
      const el = bodyRef.current?.querySelector(`[data-field="${highlight}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    const timer = setTimeout(() => setHighlight(null), 1900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [highlight, editorSection, openModule]);

  /*
   * Expose l'application d'un correctif externe. On passe par setData et NON
   * par mutate : ces valeurs viennent d'être écrites en base, les marquer
   * comme « non enregistrées » afficherait une alerte fantôme.
   */
  useEffect(() => {
    if (!externalPatchRef) return;
    externalPatchRef.current = (patch) => {
      setData((current) => ({
        ...current,
        ...patch,
        owner: patch.owner ? { ...current.owner, ...patch.owner } : current.owner,
      }));
      // Les instantanés antérieurs décrivent un état que la base a dépassé :
      // les rejouer réécraserait ce qui vient d'être écrit hors éditeur.
      setHistory({ past: [], future: [] });
    };
    return () => {
      externalPatchRef.current = null;
    };
  }, [externalPatchRef]);

  /*
   * Ramène la rubrique active dans la barre : un clic depuis l'aperçu peut
   * l'activer alors qu'elle est hors champ, à droite du défilement.
   */
  useEffect(() => {
    const chip = chipsRef.current?.querySelector(`[data-section="${editorSection}"]`);
    chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [editorSection]);

  /* Commandes déjà passées pour ce logement. */
  useEffect(() => {
    if (!estAdmin) return;
    let cancelled = false;
    getOrdersForAccommodation(docId)
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch((err) => console.error("Chargement des commandes", err));
    return () => {
      cancelled = true;
    };
  }, [docId, estAdmin]);

  // Prévient la perte de modifications non enregistrées.
  useEffect(() => {
    if (!dirty || demo) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, demo]);

  /* ══════════════════════════════════════════════════════════════════
     ENREGISTREMENT / PUBLICATION
     ══════════════════════════════════════════════════════════════════ */
  /**
   * Renvoie l'identifiant du document enregistré, ou null en cas d'échec.
   *
   * Un seul envoi à la fois : sans ce verrou, deux Ctrl+S rapprochés (ou
   * « Publier » pendant un enregistrement automatique) lancent deux créations
   * et laissent un livret en double dans la base.
   */
  const handleSave = async (): Promise<string | null> => {
    if (demo) {
      setMessage("Démo libre — rien n’est enregistré. Tout repart à zéro au rechargement.");
      setSaveState("idle");
      return null;
    }
    if (inFlightSaveRef.current) return inFlightSaveRef.current;

    const run = performSave();
    inFlightSaveRef.current = run;
    try {
      return await run;
    } finally {
      inFlightSaveRef.current = null;
    }
  };

  const performSave = async (): Promise<string | null> => {
    setSaveState("saving");
    setMessage(null);
    try {
      // `data` est l'instantané du clic ; on note la révision pour savoir si
      // l'utilisateur a continué à taper pendant l'aller-retour serveur.
      const revisionSent = revisionRef.current;
      const returnedId = await onSubmit(data);
      const savedId = typeof returnedId === "string" && returnedId ? returnedId : docId;
      if (savedId !== docId) setDocId(savedId);
      setSavedSlug(data.slug);

      setLastSavedAt(Date.now());
      if (revisionRef.current === revisionSent) {
        setDirty(false);
        setSaveState("saved");
        setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
      } else {
        // Des modifications sont arrivées après l'envoi : elles restent à enregistrer.
        setSaveState("idle");
      }
      return savedId;
    } catch (err) {
      console.error(err);
      setSaveState("error");
      setMessage(err instanceof Error ? err.message : "L’enregistrement a échoué.");
      return null;
    }
  };

  const handlePublish = async () => {
    // Un livret publié à moitié vide donne une mauvaise première impression :
    // on n'interdit pas, mais on nomme précisément ce qui manque.
    const missing = getEssentials(data).filter((item) => !item.filled);
    if (missing.length > 0) {
      const list = missing.map((item) => `  · ${item.label}`).join("\n");
      const plural = missing.length > 1;
      const proceed = confirm(
        `${missing.length} élément${plural ? "s" : ""} essentiel${plural ? "s ne sont" : " n’est"} pas rempli${plural ? "s" : ""} :\n\n${list}\n\n` +
          "Les rubriques vides seront masquées à vos voyageurs. Publier quand même ?"
      );
      if (!proceed) {
        setEditorSection(missing[0].tab);
        return;
      }
    }

    setPublishing(true);
    setMessage(null);
    try {
      // On enregistre d'abord : le document doit exister pour être publié,
      // et sur un livret neuf c'est cet appel qui le crée.
      const savedId = await handleSave();
      if (!savedId) return;
      await publishAdminAccommodation(savedId);
      setData((d) => ({ ...d, isActive: true, publishedAt: d.publishedAt || Date.now() }));
      setMessage(`Livret publié — il est en ligne sur /h/${data.slug}`);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "La publication a échoué.");
      setSaveState("error");
    } finally {
      setPublishing(false);
    }
  };

  /*
   * Enregistrement automatique : 3 s après la dernière frappe. On ne relance
   * jamais pendant qu'un envoi est en cours, et on s'arrête après une erreur
   * pour ne pas marteler une base injoignable — le bouton reste disponible.
   */
  useEffect(() => {
    if (!autosave || !dirty || saveState === "saving" || saveState === "error" || isLoading) return;
    const timer = setTimeout(() => {
      void handleSave();
    }, 3000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosave, dirty, saveState, isLoading, data]);

  /*
   * Réarmement après échec : sans cela, un hôte qui subit une coupure réseau
   * puis cesse de taper voit son travail rester indéfiniment non enregistré.
   */
  useEffect(() => {
    if (!autosave || !dirty || saveState !== "error") return;
    const timer = setTimeout(() => setSaveState("idle"), 20000);
    return () => clearTimeout(timer);
  }, [autosave, dirty, saveState]);

  /* Raccourcis : Ctrl/Cmd+S enregistre, Ctrl/Cmd+Z annule, +Maj rétablit. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        void handleSave();
      } else if (key === "z") {
        // Dans un champ de saisie, on laisse le navigateur gérer son propre undo.
        const tag = (event.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, data, docId]);


  /* ══════════════════════════════════════════════════════════════════
     DONNÉES DÉRIVÉES
     ══════════════════════════════════════════════════════════════════ */
  const essentials = getEssentials(data);
  const filledCount = essentials.filter((e) => e.filled).length;

  const sectionIndex = ADMIN_SECTIONS.findIndex((s) => s.id === editorSection);
  const previousSection = sectionIndex > 0 ? ADMIN_SECTIONS[sectionIndex - 1] : null;
  const nextSection =
    sectionIndex >= 0 && sectionIndex < ADMIN_SECTIONS.length - 1
      ? ADMIN_SECTIONS[sectionIndex + 1]
      : null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/h/${savedSlug}`;
  /*
   * Adresse gravée : permanente, donc distincte du lien de partage. Tant que
   * l'identifiant n'est pas attribué, on montre la forme sans prétendre
   * qu'elle est définitive.
   */
  const engravedUrl = data.permanentId ? `${origin}/g/${data.permanentId}` : `${origin}/g/…`;
  const emergencyIdx = (data.contacts || [])
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.type === "emergency");
  const regularIdx = (data.contacts || [])
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.type !== "emergency" && c.type !== "owner");

  /* ══════════════════════════════════════════════════════════════════
     RENDU DES SECTIONS
     ══════════════════════════════════════════════════════════════════ */

  /** Bandeau de tête d'une section : ce qu'on y fait, et où on en est. */
  const renderSectionIntro = (section: EditorSection) => {
    const def = getSectionDefinition(section);
    const sectionMissing = essentials.filter((item) => item.tab === section && !item.filled);
    return (
      <header className="pb-1">
        <h2 className="font-[family-name:var(--font-display)] text-[22px] font-bold text-[#2A2016] flex items-center gap-2.5">
          <span className="text-lg">{def.emoji}</span>
          {def.label}
        </h2>
        <p className="text-xs text-[#6B5D4E] mt-1 leading-relaxed">{def.hint}</p>
        {sectionMissing.length > 0 && (
          <div className="mt-3 rounded-xl bg-[#FDF3DC] border border-[#EDD9A3] p-2.5">
            <p className="text-[11px] font-bold text-[#A35A38] mb-1.5">
              {sectionMissing.length} point{sectionMissing.length > 1 ? "s" : ""} essentiel{sectionMissing.length > 1 ? "s" : ""} à compléter ici
            </p>
            <div className="space-y-0.5">
              {sectionMissing.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => jumpTo(item)}
                  className="w-full flex items-center justify-between gap-2 py-1 px-1.5 rounded-lg hover:bg-white/70 transition-colors text-left group"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-[15px] h-[15px] rounded-full border border-[#C4714A]/40 shrink-0" />
                    <span className="text-[11px] text-[#5C3D2E] truncate">{item.label}</span>
                  </span>
                  <ArrowRight size={12} weight="bold" className="text-[#C4714A]/40 group-hover:text-[#C4714A] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    );
  };

  /**
   * Cartes des rubriques rattachées à une section.
   *
   * Chaque carte porte son interrupteur de visibilité et ses flèches d'ordre
   * juste à côté de son contenu — au lieu d'un onglet « Modules » séparé où il
   * fallait deviner à quoi correspondait quoi.
   */
  const renderSectionModules = (section: EditorSection) => {
    const def = getSectionDefinition(section);
    const ids = modules
      .filter((m) => def.modules.includes(m.id))
      .map((m) => m.id);
    if (ids.length === 0) return null;

    return (
      <div className="space-y-3">
        {ids.map((id) => {
          const moduleConfig = modules.find((m) => m.id === id);
          if (!moduleConfig) return null;
          const definition = getModuleDefinition(id);
          const Icon = MODULE_ICONS[id];
          const tint = MODULE_TINTS[id];
          const status = getModuleStatus(data, id);
          const isOpen = openModule === id;
          const showTodo = ESSENTIAL_MODULES.includes(id) && !status.complete;

          return (
            <div
              key={id}
              data-field={`module.${id}`}
              className={`rounded-2xl border overflow-hidden transition-all ${
                isOpen
                  ? "border-[#C4714A] shadow-[0_0_0_3px_rgba(196,113,74,0.08)]"
                  : "border-[#EDD9A3]/60 hover:border-[#EDD9A3]"
              } ${moduleConfig.visible ? "bg-white" : "bg-[#FBF5EC]"}`}
            >
              <div className="p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: tint.bg, color: tint.fg, opacity: moduleConfig.visible ? 1 : 0.5 }}
                  >
                    <Icon size={19} weight="duotone" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[#2A2016] flex items-center gap-2 flex-wrap">
                      {definition?.label}
                      {showTodo && (
                        <span className="text-[10px] font-bold text-[#A35A38] bg-[#FDF3DC] border border-[#EDD9A3] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C4714A]" /> À compléter
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-[#6B5D4E] truncate">{status.summary}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Toggle
                    checked={moduleConfig.visible}
                    onChange={() => toggleModuleVisible(id)}
                    label={`Afficher ${definition?.label}`}
                  />
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${moduleConfig.visible ? "text-[#C4714A]" : "text-[#A8998A]"}`}>
                    {moduleConfig.visible ? "Visible" : "Masqué"}
                  </span>
                </div>
              </div>

              <div className="px-3.5 pb-3.5 flex items-center gap-2">
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveModule(id, -1)}
                    disabled={neighbourInGroup(id, -1) < 0}
                    title="Monter"
                    className="w-8 h-8 rounded-lg border border-[#EDD9A3]/60 flex items-center justify-center text-[#6B5D4E] hover:border-[#EDD9A3] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <CaretUp size={13} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveModule(id, 1)}
                    disabled={neighbourInGroup(id, 1) < 0}
                    title="Descendre"
                    className="w-8 h-8 rounded-lg border border-[#EDD9A3]/60 flex items-center justify-center text-[#6B5D4E] hover:border-[#EDD9A3] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <CaretDown size={13} weight="bold" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => toggleModuleOpen(id)}
                  className="flex-1 h-8 rounded-lg border border-[#EDD9A3]/60 hover:border-[#C4714A] text-xs font-bold text-[#2A2016] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isOpen ? <CaretUp size={13} weight="bold" /> : <PencilSimple size={13} weight="bold" />}
                  {isOpen ? "Fermer" : "Modifier"}
                </button>
              </div>

              {isOpen && (
                <div className="p-3.5 bg-[#FDF9F2] border-t border-[#EDD9A3]/60 animate-fadeIn">
                  {renderModuleEditor(id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════════
     ÉDITEURS DE MODULE
     ══════════════════════════════════════════════════════════════════ */
  const renderModuleEditor = (id: ModuleId) => {
    switch (id) {
      /* ── ARRIVÉE ──────────────────────────────────────────────── */
      case "arrivee":
        return (
          <div className="space-y-4">
            <TimeField
              label="Arrivée à partir de"
              value={data.practicalInfo?.checkin || "14h00"}
              onChange={(v) => setPractical({ checkin: v })}
              hours={CHECKIN_HOURS}
              field="practicalInfo.checkin"
              highlighted={highlight === "practicalInfo.checkin"}
            />
            <TextAreaField
              label="Consignes d'arrivée"
              hint="Comment entrer, où sont les clés, à qui se signaler…"
              rows={4}
              value={data.practicalInfo?.arrivalNotes || ""}
              onChange={(v) => setPractical({ arrivalNotes: v })}
              placeholder="Ex : Entrez par le portail bleu, la boîte à clés est à gauche…"
              field="practicalInfo.arrivalNotes"
              highlighted={highlight === "practicalInfo.arrivalNotes"}
            />
            <div>
              <Label hint="Sert à afficher la carte et l'itinéraire dans le livret.">
                Adresse exacte
              </Label>
              <PlaceSearch
                disabled={demo}
                disabledHint="Recherche d’adresse indisponible dans la démo."
                placeholder="Commencez à taper votre adresse…"
                onSelect={applyPropertyAddress}
                clearOnSelect={false}
              />
              {data.property?.address && (
                <p className="mt-2 text-[11px] text-[#4A3D30] bg-[#FDF9F2] border border-[#EDD9A3] rounded-lg px-2.5 py-2">
                  {data.property.address}
                </p>
              )}
            </div>
            <TextField
              label="Stationnement"
              value={data.practicalInfo?.parking || ""}
              onChange={(v) => setPractical({ parking: v })}
              placeholder="Place n°42 au sous-sol, bip sur le trousseau"
            />
          </div>
        );

      /* ── CODES & WI-FI ────────────────────────────────────────── */
      case "wifi":
        return (
          <div className="space-y-4">
            <TextField
              label="Nom du réseau (SSID)"
              value={data.wifi?.ssid || ""}
              onChange={(v) => setWifi({ ssid: v })}
              placeholder="Livebox-A1B2"
              field="wifi.ssid"
              highlighted={highlight === "wifi.ssid"}
            />
            <TextField
              label="Mot de passe"
              mono
              value={data.wifi?.password || ""}
              onChange={(v) => setWifi({ password: v })}
              placeholder="CodeSecret123"
            />

            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <SectionTitle>Digicodes & clés</SectionTitle>
              {(data.codes || []).map((code, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={code.label}
                    onChange={(e) => codes.update(idx, { label: e.target.value })}
                    placeholder="Code portail"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#C4714A]"
                  />
                  <input
                    type="text"
                    value={code.value}
                    onChange={(e) => codes.update(idx, { value: e.target.value })}
                    placeholder="1234#"
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold outline-none focus:border-[#C4714A]"
                  />
                  <ItemToolbar index={idx} total={(data.codes || []).length} onMove={codes.move} onDelete={() => codes.remove(idx)} />
                </div>
              ))}
              <AddButton onClick={() => codes.add({ label: "Nouveau code", value: "" })}>
                Ajouter un code
              </AddButton>
            </div>
          </div>
        );

      /* ── CONTACTS ─────────────────────────────────────────────── */
      case "contacts":
        return (
          <div className="space-y-4">
            <TextField
              label="Votre nom d'hôte"
              value={data.owner?.name || ""}
              onChange={(v) => setOwner({ name: v })}
              field="owner.name"
              highlighted={highlight === "owner.name"}
            />
            <TextField
              label="Votre téléphone"
              hint="C'est le numéro que le voyageur appellera en priorité."
              value={data.owner?.phone || ""}
              onChange={(v) => setOwner({ phone: v })}
              placeholder="06 12 34 56 78"
              field="owner.phone"
              highlighted={highlight === "owner.phone"}
            />

            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <SectionTitle>Autres contacts utiles</SectionTitle>
              {regularIdx.length === 0 && (
                <p className="text-[11px] text-[#6B5D4E]">Aucun contact supplémentaire.</p>
              )}
              {regularIdx.map(({ c, i }, pos) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => contacts.update(i, { label: e.target.value })}
                      placeholder="Conciergerie"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#C4714A]"
                    />
                    <ItemToolbar
                      index={pos}
                      total={regularIdx.length}
                      onMove={(from, to) =>
                        moveWithinSubset(
                          data.contacts || [],
                          regularIdx.map((r) => r.i),
                          from,
                          to,
                          (next) => mutate((d) => ({ ...d, contacts: next }))
                        )
                      }
                      onDelete={() => contacts.remove(i)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => contacts.update(i, { name: e.target.value })}
                      placeholder="Rôle / précision"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                    />
                    <input
                      type="text"
                      value={c.phone}
                      onChange={(e) => contacts.update(i, { phone: e.target.value })}
                      placeholder="04 91 00 00 00"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono outline-none focus:border-[#C4714A]"
                    />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => contacts.add({ label: "Nouveau contact", name: "", phone: "", type: "service" })}>
                Ajouter un contact
              </AddButton>
            </div>

            {/* Urgences : même module que les contacts côté voyageur, donc
                même endroit côté éditeur. */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <SectionTitle>Urgences &amp; santé</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {EMERGENCY_PRESETS.filter(
                  (preset) => !(data.contacts || []).some((c) => c.phone === preset.phone)
                ).map((preset) => (
                  <button
                    key={preset.phone}
                    type="button"
                    onClick={() => contacts.add({ ...preset, type: "emergency" })}
                    className="px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-[#C4714A] text-[11px] font-bold text-[#2A2016] flex items-center gap-1"
                  >
                    <Plus size={11} weight="bold" /> {preset.label} · {preset.phone}
                  </button>
                ))}
              </div>

              {emergencyIdx.length === 0 && (
                <p className="text-[11px] text-[#6B5D4E]">
                  Aucun numéro d&apos;urgence. Ajoutez-en depuis les raccourcis ci-dessus.
                </p>
              )}

              {emergencyIdx.map(({ c, i }) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) => contacts.update(i, { label: e.target.value })}
                    placeholder="SAMU"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#C4714A]"
                  />
                  <input
                    type="text"
                    value={c.phone}
                    onChange={(e) => contacts.update(i, { phone: e.target.value })}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold outline-none focus:border-[#C4714A]"
                  />
                  <button
                    type="button"
                    onClick={() => contacts.remove(i)}
                    aria-label="Retirer ce numéro"
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shrink-0"
                  >
                    <Trash size={12} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      /* ── DÉPART ───────────────────────────────────────────────── */
      case "depart":
        return (
          <div className="space-y-4">
            <TimeField
              label="Départ avant"
              value={data.practicalInfo?.checkout || "10h00"}
              onChange={(v) => setPractical({ checkout: v })}
              hours={CHECKOUT_HOURS}
              field="practicalInfo.checkout"
              highlighted={highlight === "practicalInfo.checkout"}
            />

            <div className="space-y-2.5">
              <SectionTitle>Consignes de départ</SectionTitle>
              <Hint>
                Le voyageur pourra cocher chaque consigne avant de partir. Marquez comme
                « obligatoire » celles qui ne peuvent pas être oubliées.
              </Hint>
              {(data.practicalInfo?.departureInstructions || []).map((step, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => departures.update(idx, { text: e.target.value })}
                    placeholder="Ex : Déposer les clés dans la boîte à clés"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                  />
                  <button
                    type="button"
                    onClick={() => departures.update(idx, { required: !step.required })}
                    title={step.required ? "Obligatoire" : "Facultative"}
                    className={`px-2 h-7 rounded-lg border text-[10px] font-extrabold uppercase shrink-0 transition-colors ${
                      step.required
                        ? "border-[#C4714A] text-[#C4714A] bg-[#C4714A]/5"
                        : "border-gray-200 text-gray-400"
                    }`}
                  >
                    Oblig.
                  </button>
                  <ItemToolbar
                    index={idx}
                    total={(data.practicalInfo?.departureInstructions || []).length}
                    onMove={departures.move}
                    onDelete={() => departures.remove(idx)}
                  />
                </div>
              ))}
              <LibraryPicker
                kind="departure"
                existing={(data.practicalInfo?.departureInstructions || []).map((i) => i.text)}
                onAdd={(picked) => addFromLibrary("departure", picked)}
              />
              <AddButton onClick={() => departures.add({ text: "", required: false })}>
                Ajouter une consigne sur mesure
              </AddButton>
            </div>

            <TextAreaField
              label="Note complémentaire"
              rows={3}
              value={data.practicalInfo?.departureNotes || ""}
              onChange={(v) => setPractical({ departureNotes: v })}
              placeholder="Ex : Merci de laisser la climatisation éteinte."
            />
          </div>
        );

      /* ── BIENVENUE ────────────────────────────────────────────── */
      case "bienvenue":
        return (
          <TextAreaField
            label="Mot d'accueil"
            hint="Quelques lignes chaleureuses — c'est la première chose que lit le voyageur."
            rows={6}
            value={data.property?.welcomeMessage || ""}
            onChange={(v) => setProperty({ welcomeMessage: v })}
            placeholder="Nous sommes ravis de vous accueillir…"
            field="property.welcomeMessage"
            highlighted={highlight === "property.welcomeMessage"}
          />
        );

      /* ── RÈGLEMENT ────────────────────────────────────────────── */
      case "reglement":
        return (
          <div className="space-y-2.5">
            {(data.rules || []).map((rule, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                <input
                  type="text"
                  value={rule}
                  onChange={(e) => rules.replace(idx, e.target.value)}
                  placeholder="Ex : Logement non-fumeur"
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                />
                <ItemToolbar index={idx} total={(data.rules || []).length} onMove={rules.move} onDelete={() => rules.remove(idx)} />
              </div>
            ))}
            <LibraryPicker
              kind="rules"
              existing={data.rules || []}
              onAdd={(picked) => addFromLibrary("rules", picked)}
            />
            <AddButton onClick={() => rules.add("")}>Ajouter une règle sur mesure</AddButton>
          </div>
        );

      /* ── ÉQUIPEMENTS & SERVICES ───────────────────────────────── */
      case "equipements":
        return (
          <div className="space-y-5">
            <div className="space-y-2.5">
              <SectionTitle>Compris dans le logement</SectionTitle>
              {(data.equipments || []).map((eq, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={eq.icon || ""}
                      onChange={(e) => equipments.update(idx, { icon: e.target.value })}
                      className="w-10 text-center py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#C4714A]"
                    />
                    <input
                      type="text"
                      value={eq.title}
                      onChange={(e) => equipments.update(idx, { title: e.target.value })}
                      placeholder="Lave-vaisselle"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#C4714A]"
                    />
                    <ItemToolbar index={idx} total={(data.equipments || []).length} onMove={equipments.move} onDelete={() => equipments.remove(idx)} />
                  </div>
                  <textarea
                    rows={2}
                    value={eq.desc}
                    onChange={(e) => equipments.update(idx, { desc: e.target.value })}
                    placeholder="Mode d'emploi, où trouver les consommables…"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A] resize-y"
                  />
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_PALETTE.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => equipments.update(idx, { icon: emoji })}
                        className="w-6 h-6 rounded-md hover:bg-gray-100 text-sm leading-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <LibraryPicker
                kind="equipments"
                existing={(data.equipments || []).map((e) => e.title)}
                onAdd={(picked) => addFromLibrary("equipments", picked)}
              />
              <AddButton onClick={() => equipments.add({ title: "", desc: "", icon: "✨" })}>
                Ajouter un équipement sur mesure
              </AddButton>
            </div>

          </div>
        );

      /* ── BONNES ADRESSES ──────────────────────────────────────── */
      case "adresses":
        return (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2.5">
              <Label hint="Tapez le nom du lieu et choisissez-le : nom, catégorie, distance et lien Maps se remplissent tout seuls.">
                Chercher un lieu
              </Label>
              <PlaceSearch
                disabled={demo}
                disabledHint="Recherche d’adresse indisponible dans la démo."
                placeholder="Ex : Pizzeria Chez Étienne, Parc Borély…"
                near={propertyPoint}
                onSelect={applyRecommendation}
                hintWhenNoOrigin
              />
              <div className="flex items-center gap-2 pt-0.5">
                <span className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] uppercase tracking-wider text-[#A8998A] font-bold">ou</span>
                <span className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAddress.trim()) {
                      e.preventDefault();
                      recos.add({ title: newAddress.trim(), category: "Restaurant", description: "" });
                      setNewAddress("");
                    }
                  }}
                  placeholder="Saisir un nom à la main"
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                />
                <button
                  type="button"
                  disabled={!newAddress.trim()}
                  onClick={() => {
                    recos.add({ title: newAddress.trim(), category: "Restaurant", description: "" });
                    setNewAddress("");
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-[#2A2016] text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 hover:border-[#C4714A]"
                >
                  <Plus size={14} weight="bold" /> Ajouter
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {(data.recommendations || []).map((rec, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-2xl border border-gray-200 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rec.title}
                      onChange={(e) => recos.update(idx, { title: e.target.value })}
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#C4714A]"
                    />
                    <ItemToolbar index={idx} total={(data.recommendations || []).length} onMove={recos.move} onDelete={() => recos.remove(idx)} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={rec.category}
                      onChange={(e) => recos.update(idx, { category: e.target.value })}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                    >
                      {[...new Set([...ADDRESS_CATEGORIES, rec.category].filter(Boolean))].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={rec.distance || ""}
                      onChange={(e) => recos.update(idx, { distance: e.target.value })}
                      placeholder="5 min à pied"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={rec.description}
                    onChange={(e) => recos.update(idx, { description: e.target.value })}
                    placeholder="En une phrase, pourquoi y aller ?"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A] resize-y"
                  />

                  <input
                    type="text"
                    value={rec.comment || ""}
                    onChange={(e) => recos.update(idx, { comment: e.target.value })}
                    placeholder="Votre mot perso (affiché en italique)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200">
                      <Star size={13} weight="fill" className="text-amber-400 shrink-0" />
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        max={5}
                        value={rec.rating ?? ""}
                        onChange={(e) => recos.update(idx, { rating: e.target.value === "" ? undefined : Number(e.target.value) })}
                        placeholder="Note"
                        className="w-full text-xs outline-none"
                      />
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={rec.reviews ?? ""}
                      onChange={(e) => recos.update(idx, { reviews: e.target.value === "" ? undefined : Number(e.target.value) })}
                      placeholder="Nb d'avis"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                    />
                  </div>

                  <input
                    type="text"
                    value={rec.imageUrl || ""}
                    onChange={(e) => recos.update(idx, { imageUrl: e.target.value })}
                    placeholder="Lien de la photo (https://…)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-mono outline-none focus:border-[#C4714A]"
                  />
                  <input
                    type="text"
                    value={rec.mapsUrl || ""}
                    onChange={(e) => recos.update(idx, { mapsUrl: e.target.value })}
                    placeholder="Lien Google Maps"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-mono outline-none focus:border-[#C4714A]"
                  />
                </div>
              ))}
            </div>

            <AddButton onClick={() => recos.add({ title: "Nouvelle adresse", category: "Restaurant", description: "" })}>
              Ajouter une adresse manuellement
            </AddButton>
          </div>
        );

      /* ── TRANSPORTS ───────────────────────────────────────────── */
      case "transports":
        return (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {(data.transportLines || []).map((line, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={line.type}
                      onChange={(e) => transports.update(idx, { type: e.target.value })}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#C4714A]"
                    >
                      {[...new Set([...TRANSPORT_TYPES, line.type].filter(Boolean))].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={(line.lines || []).join(", ")}
                      onChange={(e) =>
                        transports.update(idx, {
                          lines: e.target.value.split(",").map((s) => s.trim()),
                        })
                      }
                      onBlur={(e) =>
                        transports.update(idx, {
                          lines: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="M2, 19, 83"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                    />
                    <ItemToolbar index={idx} total={(data.transportLines || []).length} onMove={transports.move} onDelete={() => transports.remove(idx)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={line.station}
                      onChange={(e) => transports.update(idx, { station: e.target.value })}
                      placeholder="Arrêt / station"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                    />
                    <input
                      type="text"
                      value={line.distance || ""}
                      onChange={(e) => transports.update(idx, { distance: e.target.value })}
                      placeholder="~500 m"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
                    />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => transports.add({ type: "Bus", lines: [], station: "", distance: "" })}>
                Ajouter une ligne
              </AddButton>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-3">
              <SectionTitle>Lien vers le réseau</SectionTitle>
              <TextField
                value={data.transportLink?.label || ""}
                onChange={(v) => mutate((d) => ({ ...d, transportLink: { url: d.transportLink?.url || "", label: v } }))}
                placeholder="Voir le réseau RTM (plans & horaires)"
              />
              <TextField
                value={data.transportLink?.url || ""}
                onChange={(v) => mutate((d) => ({ ...d, transportLink: { label: d.transportLink?.label || "", url: v } }))}
                placeholder="https://www.rtm.fr"
                mono
              />
            </div>
          </div>
        );

      /* ── FAQ ──────────────────────────────────────────────────── */
      case "faq":
        return (
          <div className="space-y-2.5">
            {(data.comfortOptions?.faq || []).map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => faq.update(idx, { question: e.target.value })}
                    placeholder="La question du voyageur"
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#C4714A]"
                  />
                  <ItemToolbar
                    index={idx}
                    total={(data.comfortOptions?.faq || []).length}
                    onMove={faq.move}
                    onDelete={() => faq.remove(idx)}
                  />
                </div>
                <textarea
                  rows={2}
                  value={item.answer}
                  onChange={(e) => faq.update(idx, { answer: e.target.value })}
                  placeholder="Votre réponse"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#C4714A] resize-y"
                />
              </div>
            ))}
            <AddButton onClick={() => faq.add({ question: "", answer: "" })}>Ajouter une question</AddButton>
          </div>
        );

      /* ── LIVRE D'OR ───────────────────────────────────────────── */
      case "livredor":
        return (
          <div className="space-y-3">
            <Hint>
              Le livre d&apos;or invite vos voyageurs à vous écrire en fin de séjour. Les messages
              arrivent sur l&apos;adresse e-mail de réception des signalements.
            </Hint>
            <TextField
              label="Adresse de réception"
              value={data.owner?.reportEmail || data.owner?.email || ""}
              onChange={(v) => setOwner({ reportEmail: v })}
              placeholder="vous@email.com"
              field="owner.reportEmail"
              highlighted={highlight === "owner.reportEmail"}
            />
          </div>
        );

      default:
        return null;
    }
  };

  /* ══════════════════════════════════════════════════════════════════
     RENDU
     ══════════════════════════════════════════════════════════════════ */
  const saveLabel =
    saveState === "saving" || isLoading ? "Enregistrement…"
      : saveState === "saved" ? "✓ Enregistré"
        : dirty ? "Enregistrer •"
          : "Enregistrer";

  const savedClock = lastSavedAt
    ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(lastSavedAt)
    : null;

  const statusText = demo
    ? "Démo — rien n’est enregistré"
    : saveState === "saving" || isLoading ? "Enregistrement…"
      : saveState === "error" ? "Échec de l’enregistrement"
        : dirty ? "Modifications non enregistrées"
          : savedClock ? `Enregistré à ${savedClock}`
            : "Aucune modification";


  const handleUnpublish = async () => {
    if (!confirm("Retirer ce livret de la ligne ? Le lien et le QR code cesseront de fonctionner.")) return;
    setPublishing(true);
    setMessage(null);
    try {
      await unpublishAdminAccommodation(docId);
      setData((d) => ({ ...d, isActive: false }));
      setMessage("Livret repassé en brouillon — il n’est plus visible publiquement.");
      setSaveState("idle");
    } catch (err) {
      console.error(err);
      setSaveState("error");
      setMessage(err instanceof Error ? err.message : "La dépublication a échoué.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FBF5EC] text-[#2A2016] font-sans">
      {/* ────────── BARRE SUPÉRIEURE ────────── */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          {demo ? null : (
          <Link
            href="/admin/hebergements"
            onClick={(e) => {
              if (dirty && !confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?")) {
                e.preventDefault();
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            title="Retour aux hébergements"
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>
          )}
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] font-bold text-[19px] truncate text-[#2A2016]">{data.property?.name || "Livret sans titre"}</h1>
            {data.isActive ? (
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <CheckCircle size={12} weight="fill" /> En ligne
              </span>
            ) : (
              <span className="max-w-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {/* Le complément tombe sur les petits écrans : le mot
                    « Brouillon » suffit à comprendre, et la pastille cesse
                    de déborder de l'en-tête. */}
                <span className="truncate">
                  Brouillon<span className="hidden sm:inline"> · pas encore en ligne</span>
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Annuler / rétablir — également accessibles par Ctrl+Z / Ctrl+Maj+Z */}
          <div className="hidden xl:flex bg-gray-100 p-1 rounded-full border border-gray-200">
            <button
              type="button"
              onClick={undo}
              disabled={history.past.length === 0}
              title="Annuler (Ctrl+Z)"
              className="p-2 rounded-full transition-all text-[#6B5D4E] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowCounterClockwise size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={history.future.length === 0}
              title="Rétablir (Ctrl+Maj+Z)"
              className="p-2 rounded-full transition-all text-[#6B5D4E] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ArrowClockwise size={16} weight="bold" />
            </button>
          </div>

          <div className="hidden sm:flex bg-gray-100 p-1 rounded-full border border-gray-200">
            <button
              type="button"
              onClick={() => setViewDevice("desktop")}
              title="Vue ordinateur"
              className={`p-2 rounded-full transition-all ${viewDevice === "desktop" ? "bg-white shadow-sm" : "text-[#6B5D4E]"}`}
            >
              <Desktop size={17} />
            </button>
            <button
              type="button"
              onClick={() => setViewDevice("mobile")}
              title="Vue smartphone"
              className={`p-2 rounded-full transition-all ${viewDevice === "mobile" ? "bg-white shadow-sm" : "text-[#6B5D4E]"}`}
            >
              <DeviceMobile size={17} />
            </button>
          </div>

          {/* État d'enregistrement : l'hôte doit toujours savoir si son travail est en sécurité. */}
          <button
            type="button"
            onClick={() => setAutosave((a) => !a)}
            title={autosave ? "Enregistrement automatique activé — cliquez pour le désactiver" : "Enregistrement automatique désactivé — cliquez pour l’activer"}
            className={`hidden lg:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-2 rounded-full transition-colors ${
              saveState === "error"
                ? "text-red-600 bg-red-50"
                : dirty
                  ? "text-amber-700 bg-amber-50"
                  : "text-[#6B5D4E] hover:bg-gray-50"
            }`}
          >
            {autosave ? <CloudCheck size={14} weight="fill" /> : <CloudSlash size={14} weight="fill" />}
            <span className="uppercase tracking-wider text-[9px] font-extrabold opacity-70">
              Auto {autosave ? "on" : "off"}
            </span>
            <span className="w-px h-3 bg-current opacity-20" />
            <span className="max-w-[11rem] truncate">{statusText}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saveState === "saving" || isLoading}
            className={`px-5 sm:px-6 py-2.5 rounded-full border text-xs font-bold transition-all disabled:opacity-60 ${
              saveState === "saved"
                ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                : "border-gray-300 text-[#2A2016] hover:bg-gray-50"
            }`}
          >
            {saveLabel}
          </button>

          {demo ? null : data.isActive ? (
            <a
              href={`/h/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-6 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C4714A]/20 transition-all"
            >
              Voir le livret <ArrowSquareOut size={13} weight="bold" />
            </a>
          ) : !estAdmin ? (
            <button
              type="button"
              onClick={() => void handlePayer()}
              disabled={paiement || isLoading}
              className="px-4 sm:px-6 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C4714A]/20 transition-all disabled:opacity-60"
            >
              {paiement ? "Ouverture du paiement…" : "Publier et commander ma plaque"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={publishing}
              className="px-4 sm:px-6 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C4714A]/20 transition-all disabled:opacity-60"
            >
              {publishing ? "Publication…" : "Mettre en ligne"}
            </button>
          )}
        </div>
      </header>

      {message && (
        <div
          className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 border-b ${
            saveState === "error"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {saveState === "error" ? <Warning size={14} weight="fill" /> : <CheckCircle size={14} weight="fill" />}
          {message}
        </div>
      )}

      {/* ────────── ESPACE DE TRAVAIL ────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── PANNEAU DE GAUCHE ── */}
        <aside className="w-full lg:w-[440px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
          {/*
            Barre de rubriques, rangée par moment du séjour. On n'en affiche
            qu'une à la fois dans le formulaire : la liste verticale occupait
            la moitié du panneau pour une information consultée une fois.
          */}
          <div
            ref={chipsRef}
            className="flex gap-1.5 px-3 py-2.5 border-b border-[#EDD9A3]/60 bg-[#FBF5EC] shrink-0 overflow-x-auto hide-scrollbar"
          >
            {ADMIN_SECTIONS.map((section) => {
              const progress = getSectionProgress(data, section.id);
              const isCurrent = editorSection === section.id;
              const complete = progress.total > 0 && progress.done === progress.total;
              return (
                <button
                  key={section.id}
                  type="button"
                  data-section={section.id}
                  onClick={() => goToSection(section.id)}
                  title={section.hint}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border text-[11px] font-bold transition-colors ${
                    isCurrent
                      ? "bg-[#C4714A] border-[#C4714A] text-white shadow-sm"
                      : "bg-white border-[#EDD9A3]/60 text-[#5C3D2E] hover:border-[#C4714A]/50"
                  }`}
                >
                  <span className="text-xs leading-none">{section.emoji}</span>
                  {section.short}
                  {progress.total > 0 && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        isCurrent
                          ? "bg-white/25 text-white"
                          : complete
                            ? "bg-[#EBF0E6] text-[#3F5836]"
                            : "bg-[#FDF3DC] text-[#A35A38]"
                      }`}
                    >
                      {complete ? "✓" : `${progress.done}/${progress.total}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto thin-scroll p-5 space-y-5">
            {/* ─────── GÉNÉRAL ─────── */}
            {editorSection === "logement" && (
              <>
                {renderSectionIntro("logement")}

                <div className="space-y-4">
                  <SectionTitle>Identification</SectionTitle>
                  <TextField
                    label="Titre du livret"
                    hint="C'est le titre que verront vos voyageurs."
                    value={data.property?.name || ""}
                    onChange={(v) => setProperty({ name: v })}
                    field="property.name"
                    highlighted={highlight === "property.name"}
                  />
                  <TextField
                    label="Type de logement"
                    value={data.property?.type || ""}
                    onChange={(v) => setProperty({ type: v })}
                    placeholder="Penthouse, Villa, Appartement…"
                  />
                  <div
                    data-field="property.address"
                    className={highlight === "property.address" ? "rounded-xl animate-pulseRing" : undefined}
                  >
                    <Label hint="Choisissez-la dans les suggestions : la ville, la carte, la météo et les distances se calent dessus.">
                      Adresse du logement
                    </Label>
                    <PlaceSearch
                      disabled={demo}
                      disabledHint="Recherche d’adresse indisponible dans la démo."
                      placeholder="Commencez à taper votre adresse…"
                      onSelect={applyPropertyAddress}
                      clearOnSelect={false}
                    />
                    {data.property?.address && (
                      <p className="mt-2 text-[11px] flex items-start gap-1.5 text-[#4A3D30] bg-[#FDF9F2] border border-[#EDD9A3] rounded-lg px-2.5 py-2">
                        <MapPin size={13} weight="fill" className="shrink-0 mt-0.5 text-[#C4714A]" />
                        <span className="min-w-0">
                          {data.property.address}
                          {propertyPoint ? (
                            <span className="block text-[10px] text-[#6B5D4E] mt-0.5">
                              Position enregistrée — distances et météo automatiques.
                            </span>
                          ) : (
                            <span className="block text-[10px] text-amber-700 mt-0.5">
                              Saisie libre : choisissez une suggestion pour activer les distances.
                            </span>
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                  <TextField
                    label="Ville"
                    value={data.property?.city || ""}
                    onChange={(v) => setProperty({ city: v })}
                    field="property.city"
                  />
                  <SelectField
                    label="Fuseau horaire du logement"
                    value={data.property?.timezone || "Europe/Paris"}
                    onChange={(v) => setProperty({ timezone: v })}
                    options={TIMEZONES.map((t) => ({ value: t.value, label: t.label }))}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-[#EDD9A3]/60">
                  <SectionTitle>Contact hôte</SectionTitle>
                  <TextField
                    label="Nom de l'hôte"
                    value={data.owner?.name || ""}
                    onChange={(v) => setOwner({ name: v })}
                    field="owner.name"
                    highlighted={highlight === "owner.name"}
                  />
                  <TextField
                    label="Téléphone"
                    value={data.owner?.phone || ""}
                    onChange={(v) => setOwner({ phone: v })}
                    field="owner.phone"
                    highlighted={highlight === "owner.phone"}
                  />
                  <TextField
                    label="E-mail"
                    type="email"
                    value={data.owner?.email || ""}
                    onChange={(v) => setOwner({ email: v })}
                  />
                  <TextField
                    label="Où recevoir les signalements"
                    hint="Laissez vide pour utiliser l'e-mail ci-dessus."
                    type="email"
                    value={data.owner?.reportEmail || ""}
                    onChange={(v) => setOwner({ reportEmail: v })}
                    field="owner.reportEmail"
                    highlighted={highlight === "owner.reportEmail"}
                  />
                </div>

                {renderSectionModules("logement")}
              </>
            )}

            {/* ─────── AVANT L'ARRIVÉE ─────── */}
            {editorSection === "arrivee" && (
              <>
                {renderSectionIntro("arrivee")}
                {renderSectionModules("arrivee")}
              </>
            )}

            {/* ─────── PENDANT LE SÉJOUR ─────── */}
            {editorSection === "sejour" && (
              <>
                {renderSectionIntro("sejour")}
                {renderSectionModules("sejour")}
              </>
            )}

            {/* ─────── LE DÉPART ─────── */}
            {editorSection === "depart" && (
              <>
                {renderSectionIntro("depart")}
                {renderSectionModules("depart")}
              </>
            )}

            {/* ─────── APPARENCE ─────── */}
            {editorSection === "apparence" && !estConfort && (
              <VerrouConfort
                verrouille
                argument="Couleurs, typographie et photos personnalisées donnent à votre page l’allure de votre logement."
              >
                <div className="h-64" />
              </VerrouConfort>
            )}

            {editorSection === "apparence" && estConfort && (
              <>
                {renderSectionIntro("apparence")}

                <div className="space-y-3" data-field="property.gallery">
                  <SectionTitle>Photos</SectionTitle>
                  <p className="text-[11px] text-[#6B5D4E] leading-relaxed">
                    3 à 5 belles photos suffisent — la 1re sert aussi d&apos;image de partage (WhatsApp, QR…).
                  </p>
                  <Label>Photos de couverture (diaporama)</Label>
                  <div className={highlight === "property.gallery" ? "rounded-2xl animate-pulseRing" : undefined}>
                    <PhotoManager
                      allowUpload={!demo}
                      photos={resolveGallery(data.property)}
                      onChange={setPhotos}
                      city={data.property?.city}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <SectionTitle>Couleur principale</SectionTitle>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {COLOR_PRESETS.map((color) => {
                      const active = (data.comfortOptions?.theme?.primaryColor || "#2B5F75") === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setTheme({ primaryColor: color })}
                          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-transform hover:scale-110 ${
                            active ? "ring-2 ring-offset-2 ring-[#2A2016]" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {active && <Check size={15} className="text-white" weight="bold" />}
                        </button>
                      );
                    })}
                    <label className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#C4714A]">
                      <Plus size={14} weight="bold" className="text-[#6B5D4E]" />
                      <input
                        type="color"
                        value={data.comfortOptions?.theme?.primaryColor || "#2B5F75"}
                        onChange={(e) => setTheme({ primaryColor: e.target.value })}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <SectionTitle>Blocs du livret</SectionTitle>
                  {([
                    {
                      key: "weather" as const,
                      title: "Météo sur place",
                      hint: data.property?.city
                        ? `Température et prévisions à ${data.property.city}, dans la carte de l'heure.`
                        : "Renseignez la ville pour activer la météo.",
                      disabled: !data.property?.city?.trim(),
                    },
                    {
                      key: "map" as const,
                      title: "Carte du logement",
                      hint: data.property?.address
                        ? "Plan et itinéraire en bas du livret."
                        : "Renseignez l'adresse pour afficher la carte.",
                      disabled: !data.property?.address?.trim(),
                    },
                  ]).map((block) => (
                    <div
                      key={block.key}
                      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border ${
                        block.disabled ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2A2016]">{block.title}</p>
                        <p className="text-[11px] text-[#6B5D4E] mt-0.5 leading-snug">{block.hint}</p>
                      </div>
                      <Toggle
                        checked={data.display?.[block.key] !== false && !block.disabled}
                        onChange={(value) => setDisplay({ [block.key]: value })}
                        label={block.title}
                      />
                    </div>
                  ))}
                </div>


                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <SectionTitle>Typographie des titres</SectionTitle>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(["classic", "modern"] as const).map((font) => {
                      const active = (data.comfortOptions?.theme?.fontFamily || "classic") === font;
                      return (
                        <button
                          key={font}
                          type="button"
                          onClick={() => setTheme({ fontFamily: font })}
                          className={`p-3 rounded-xl border text-left transition-colors ${
                            active ? "border-[#C4714A] bg-[#C4714A]/5" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span
                            className={`block text-base font-bold ${
                              font === "classic" ? "font-[family-name:var(--font-serif)]" : "font-sans"
                            } ${active ? "text-[#C4714A]" : "text-[#2A2016]"}`}
                          >
                            Aa
                          </span>
                          <span className="block text-[11px] font-bold text-[#6B5D4E] mt-0.5">
                            {font === "classic" ? "Serif classique" : "Sans-serif moderne"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ─────── PLAQUE ─────── */}
            {editorSection === "plaque" && (
              <>
                {renderSectionIntro("plaque")}
                <PlaqueTab
                  data={data}
                  onChange={setPlaque}
                  orders={orders}
                  onOrder={handleOrderPlaque}
                  ordering={ordering}
                  dirty={dirty}
                  error={orderError}
                  commandable={estAdmin}
                />
              </>
            )}

            {/* ─────── DIFFUSION ─────── */}
            {editorSection === "diffusion" && renderSectionIntro("diffusion")}

            {editorSection === "diffusion" && (
              <VerrouConfort
                verrouille={!estConfort}
                argument="Vos voyageurs étrangers lisent le livret dans leur langue, traduit automatiquement."
              >
              <TranslationsTab
                data={data}
                onLayerChange={updateTranslationLayer}
                enabled={data.comfortOptions?.enabledLanguages || ["fr"]}
                contactEmail={data.owner?.email}
                onEnabledChange={(langs) =>
                  mutate((d) => ({
                    ...d,
                    comfortOptions: { ...d.comfortOptions, enabledLanguages: langs },
                  }))
                }
              />
              </VerrouConfort>
            )}

            {editorSection === "diffusion" && (
              <div className="space-y-5">
                {/*
                  Ni lien public, ni export : ils n'ont de sens qu'une fois la
                  page en ligne, et rejoindront le tableau de bord. Ce qui
                  compte ici, c'est de VOIR le résultat avant de valider —
                  surtout sur téléphone, où l'aperçu de côté n'existe pas.
                */}
                <div className="lg:hidden space-y-3">
                  <SectionTitle>Votre page, telle qu’elle sera vue</SectionTitle>
                  <div className="mx-auto w-full max-w-[320px] rounded-[2rem] border-4 border-gray-800 bg-black p-2 shadow-xl">
                    <div className="h-[520px] rounded-[1.5rem] overflow-hidden bg-[#FBF5EC] relative grid">
                      <div className="overflow-y-auto min-h-0 hide-scrollbar overscroll-contain">
                        {estConfort ? (
                          <CleoTemplate data={data} inlineModal />
                        ) : (
                          <EssentialTemplate data={data} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <SectionTitle>Votre page est prête</SectionTitle>
                  <p className="text-[11px] text-[#6B5D4E] leading-relaxed mt-1.5">
                    L’aperçu de droite montre exactement ce que verront vos
                    voyageurs. Relisez-le, puis validez.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-4 text-xs ${
                    data.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-[#EDD9A3] bg-[#FDF9F2] text-[#5C3D2E]"
                  }`}
                >
                  {data.isActive ? (
                    <>
                      <strong className="flex items-center gap-1.5 mb-1">
                        <CheckCircle size={14} weight="fill" /> Page en ligne
                      </strong>
                      Vos voyageurs peuvent y accéder dès maintenant.
                      {estAdmin && (
                        <button
                          type="button"
                          onClick={() => void handleUnpublish()}
                          disabled={publishing}
                          className="mt-3 w-full py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                        >
                          <EyeSlash size={14} weight="bold" />
                          {publishing ? "Traitement…" : "Repasser en brouillon"}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <strong className="block mb-1">Encore en brouillon</strong>
                      {estAdmin
                        ? "Publiez-la depuis le bouton en haut à droite."
                        : "Validez votre page pour la mettre en ligne et lancer la gravure de votre plaque."}
                    </>
                  )}
                </div>

                {!estAdmin && !data.isActive && (
                  <button
                    type="button"
                    onClick={() => void handlePayer()}
                    disabled={paiement || isLoading}
                    className="w-full py-3 rounded-2xl bg-[#C4714A] hover:bg-[#A35A38] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#C4714A]/20 transition-colors disabled:opacity-60"
                  >
                    {paiement ? "Ouverture du paiement…" : "Valider ma page"}
                  </button>
                )}

                {/* Ce que le livret publié produit réellement. */}
                {docId && estAdmin && <StatsPanel accommodationId={docId} />}

                {ownerPanel && <div className="pt-4 border-t border-gray-100">{ownerPanel}</div>}
              </div>
            )}
          </div>

          {/* Progression d'ensemble + passage à la rubrique suivante */}
          <div className="border-t border-[#EDD9A3]/60 bg-[#FBF5EC] shrink-0">
            <div className="px-4 pt-3 flex items-center gap-2.5">
              <span className="flex-1 h-1.5 rounded-full bg-[#EDD9A3]/50 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-[#C4714A] transition-[width] duration-500"
                  style={{ width: `${(filledCount / essentials.length) * 100}%` }}
                />
              </span>
              <span className="text-[10px] font-extrabold text-[#A35A38] shrink-0">
                {filledCount}/{essentials.length} essentiels
              </span>
            </div>

            <div className="p-3 flex items-center gap-2">
              {previousSection ? (
                <button
                  type="button"
                  onClick={() => goToSection(previousSection.id)}
                  className="shrink-0 px-3 py-2.5 rounded-full border border-[#EDD9A3] bg-white text-[11px] font-bold text-[#5C3D2E] hover:border-[#C4714A] transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={12} weight="bold" />
                  {previousSection.short}
                </button>
              ) : (
                <span className="shrink-0" />
              )}

              {nextSection ? (
                <button
                  type="button"
                  onClick={() => goToSection(nextSection.id)}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  Suivant : {nextSection.short}
                  <ArrowRight size={13} weight="bold" />
                </button>
              ) : (
                <span className="flex-1 text-center text-[11px] text-[#6B5D4E]">
                  Dernière rubrique — votre livret est complet.
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 border-t border-[#EDD9A3]/60 text-center shrink-0">
            <Link
              href="/admin/hebergements"
              onClick={(e) => {
                if (dirty && !confirm("Des modifications ne sont pas enregistrées. Quitter quand même ?")) {
                  e.preventDefault();
                }
              }}
              className="text-[11px] font-bold text-gray-400 hover:text-[#2A2016] transition-colors"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </aside>

        {/* ── APERÇU EN DIRECT ── */}
        {/*
          `justify-start` et non `justify-center` : sur un écran d'ordinateur
          portable le cadre de 748 px dépasse la hauteur disponible, et un
          contenu centré déborde alors vers le HAUT, hors de portée du scroll.
        */}
        <main className="hidden lg:flex flex-1 flex-col items-center justify-start p-6 overflow-y-auto min-h-0 relative">
          {/*
            Sur la rubrique Plaque, l'aperçu montre l'OBJET, pas le livret :
            un téléphone n'apprendrait rien à qui choisit une gravure. Les
            autres rubriques retrouvent le mockup habituel.
          */}
          {editorSection === "plaque" ? (
            <div className="w-full max-w-[540px] flex flex-col items-center gap-4">
              <PlaquePreview
                wood={essenceCommandable(data.plaque?.wood)}
                tagline={
                  data.plaque?.engravedTagline?.trim()
                    ? data.plaque.engravedTagline
                    : TAGLINE_PAR_DEFAUT
                }
                qrValue={engravedUrl}
              />
              <p className="text-[11px] text-[#6B5D4E] text-center leading-relaxed px-4">
                Cet aperçu est construit sur le gabarit de gravure lui-même : ce
                que vous voyez est ce qui sera gravé.
                <span className="block text-[10px] text-[#A8998A] mt-1">
                  Seule la texture du bois est une illustration.
                </span>
              </p>
            </div>
          ) : (
          <>



          {viewDevice === "mobile" ? (
            <div className="relative w-[375px] h-[740px] bg-black rounded-[3rem] p-3 shadow-2xl border-4 border-gray-800 flex flex-col overflow-hidden shrink-0">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50" />
              {/*
                Le conteneur qui DÉFILE ne doit pas être le bloc englobant de
                la modale : sinon `absolute inset-0` s'ancre au sommet du
                contenu défilé et la modale sort de l'écran dès que l'aperçu
                est scrollé. On ancre donc sur ce parent de taille fixe, et le
                scroller interne reste en position statique.
              */}
              <div className="w-full h-full bg-[#FBF5EC] rounded-[2.2rem] relative overflow-hidden grid">
                <div className="overflow-y-auto min-h-0 hide-scrollbar overscroll-contain">
                  {estConfort ? (
                    <CleoTemplate
                      data={data}
                      inlineModal
                      editable={!previewAsGuest}
                      activeModule={previewAsGuest ? undefined : openModule}
                      onActiveModuleChange={previewAsGuest ? undefined : handlePreviewModuleChange}
                      onSelect={handlePreviewSelect}
                      selected={selected}
                    />
                  ) : (
                    <EssentialTemplate data={data} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[980px] h-[740px] bg-white rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden">
              <div className="h-10 bg-gray-100 border-b border-gray-200 px-4 flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white rounded-lg px-3 py-1 text-[11px] text-gray-500 font-mono border border-gray-200 truncate">
                  {publicUrl}
                </div>
              </div>
              <div className="flex-1 min-h-0 bg-[#FBF5EC] relative overflow-hidden grid">
                <div className="overflow-y-auto min-h-0 overscroll-contain">
                  {estConfort ? (
                    <CleoTemplate
                      data={data}
                      inlineModal
                      editable={!previewAsGuest}
                      activeModule={previewAsGuest ? undefined : openModule}
                      onActiveModuleChange={previewAsGuest ? undefined : handlePreviewModuleChange}
                      onSelect={handlePreviewSelect}
                      selected={selected}
                    />
                  ) : (
                    <EssentialTemplate data={data} />
                  )}
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </main>
      </div>
    </div>
  );
}
