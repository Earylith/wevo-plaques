"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Accommodation, AccessCodeItem, ContactInfo, Recommendation, TransportLine,
  EquipmentItem, UpsellItem, DepartureInstruction, ModuleId, ModuleConfig,
  MODULE_GROUP_LABELS, ModuleGroup, resolveModules, getModuleDefinition,
} from "@/lib/types/accommodation";
import { getEssentials, getModuleStatus, resolveGallery, EssentialItem, EditorTab } from "@/lib/livret";
import CleoTemplate, { PreviewTarget } from "@/components/templates/CleoTemplate";
import PhotoManager from "@/components/admin/editor/PhotoManager";
import PlaceSearch from "@/components/admin/editor/PlaceSearch";
import TranslationsTab from "@/components/admin/editor/TranslationsTab";
import { TranslatableLang, TranslationLayer, Translations } from "@/lib/i18n";
import { PlaceResult, LatLon, describeDistance, mapsUrlFor } from "@/lib/geo";
import {
  TextField, TextAreaField, SelectField, TimeField, Toggle, AddButton,
  ItemToolbar, SectionTitle, Hint, Label,
} from "@/components/admin/editor/Primitives";
import { publishAdminAccommodation, unpublishAdminAccommodation } from "@/app/admin/actions";
import {
  Key, Eye, GridFour, QrCode, ArrowLeft, Desktop, DeviceMobile, CaretUp, CaretDown, Translate,
  ArrowRight, Check, PencilSimple, Plus, Copy, ArrowSquareOut, Warning, CheckCircle,
  MapPin, DownloadSimple, Star, Trash, WifiHigh, Phone, DoorOpen, HandWaving,
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
  transports: { bg: "#E9F3FF", fg: "#1D64B4" },
  faq: { bg: "#EFF2FF", fg: "#4356C0" }, livredor: { bg: "#F5EFFF", fg: "#7048B6" },
};

/** Modules dont l'incomplétude bloque un point de la check-list « Les essentiels ». */
const ESSENTIAL_MODULES: ModuleId[] = ["arrivee", "wifi", "contacts", "depart"];

/** Ordre d'apparition des sections dans le livret du voyageur. */
const GROUP_ORDER: ModuleGroup[] = ["tuiles", "sejour", "surplace", "alentours"];

const COLOR_PRESETS = ["#FF385C", "#1D64B4", "#C4714A", "#0E7C86", "#5A7A4E", "#D4A34A", "#1A1510"];
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

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function AdminModernTileEditor({
  initialData,
  onSubmit,
  isLoading = false,
  ownerPanel,
  externalPatchRef,
}: Props) {
  const [data, setData] = useState<Accommodation>(initialData);
  const [editorTab, setEditorTab] = useState<EditorTab>("general");
  const [viewDevice, setViewDevice] = useState<"mobile" | "desktop">("mobile");
  /*
   * « Vue voyageur » : l'aperçu se comporte exactement comme le livret publié
   * — pastilles « À compléter » retirées, rubriques encore vides masquées,
   * clics non détournés vers l'éditeur. C'est le seul moyen pour l'hôte de
   * savoir ce que son client verra vraiment.
   */
  const [previewAsGuest, setPreviewAsGuest] = useState(false);
  const [openModule, setOpenModule] = useState<ModuleId | null>(null);
  const [selected, setSelected] = useState<PreviewTarget | null>(null);
  // La check-list est dépliée dans « Général » (c'est le cœur de l'onglet) et
  // repliée dans « Apparence », où elle n'est qu'un rappel de progression.
  const [checklistOpen, setChecklistOpen] = useState<Record<EditorTab, boolean>>({
    general: true,
    apparence: false,
    modules: false,
    langues: false,
    partager: false,
  });
  const [highlight, setHighlight] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  /** Langue actuellement traduite dans l'onglet « Langues ». */
  const [editingLang, setEditingLang] = useState<TranslatableLang>("en");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [autosave, setAutosave] = useState(true);
  /** Pile d'annulation : instantanés successifs de `data`. */
  const [history, setHistory] = useState<{ past: Accommodation[]; future: Accommodation[] }>({
    past: [],
    future: [],
  });

  const bodyRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<SVGSVGElement>(null);
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
  const updateTranslationLayer = (apply: (layer: TranslationLayer) => TranslationLayer) =>
    mutate((current) => {
      const all = (current.translations as Translations | undefined) || {};
      return {
        ...current,
        translations: { ...all, [editingLang]: apply(all[editingLang] || {}) },
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
  const upsells = listOps<UpsellItem>(
    (d) => d.comfortOptions?.upsells || [],
    (d, l) => ({ ...d, comfortOptions: { ...d.comfortOptions, upsells: l } })
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
    setEditorTab(item.tab);
    if (item.module) {
      setOpenModule(item.module);
      setSelected(item.module);
    } else if (item.tab !== "modules") {
      // On quitte l'onglet Modules : refermer la modale restée ouverte dans l'aperçu.
      setOpenModule(null);
      setSelected(null);
    }
    setHighlight(item.field);
  };

  /** Un élément de l'aperçu a été cliqué : on ouvre son éditeur à gauche. */
  const handlePreviewSelect = (target: PreviewTarget) => {
    if (target === "cover") {
      setEditorTab("apparence");
      setSelected("cover");
      setHighlight("property.gallery");
      return;
    }
    if (target === "identity") {
      setEditorTab("general");
      setSelected("identity");
      setHighlight("property.name");
      return;
    }
    setEditorTab("modules");
    setOpenModule(target);
    setSelected(target);
    setHighlight(`module.${target}`);
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
      setEditorTab("modules");
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
  }, [highlight, editorTab, openModule]);

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

  // Prévient la perte de modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

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
        setEditorTab("general");
        setChecklistOpen((prev) => ({ ...prev, general: true }));
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
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/h/${savedSlug}`
    : `/h/${savedSlug}`;
  const slugPending = data.slug !== savedSlug;
  const emergencyIdx = (data.contacts || [])
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.type === "emergency");
  const regularIdx = (data.contacts || [])
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.type !== "emergency" && c.type !== "owner");

  const copyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /** Sérialise le QR affiché ; `null` si le SVG n'est pas encore monté. */
  const serializeQr = () => {
    const svg = qrRef.current;
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // Un SVG détaché du document doit porter son propre espace de noms.
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  };

  const triggerDownload = (href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadQrSvg = () => {
    const markup = serializeQr();
    if (!markup) return;
    const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
    triggerDownload(url, `qr-${data.slug}.svg`);
    URL.revokeObjectURL(url);
  };

  /** Version PNG haute définition, prête à coller sur une affiche. */
  const downloadQrPng = () => {
    const markup = serializeQr();
    if (!markup) return;
    const size = 1024;
    const source = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(image, 0, 0, size, size);
        triggerDownload(canvas.toDataURL("image/png"), `qr-${data.slug}.png`);
      }
      URL.revokeObjectURL(source);
    };
    image.onerror = () => URL.revokeObjectURL(source);
    image.src = source;
  };

  /* ══════════════════════════════════════════════════════════════════
     CHECK-LIST « LES ESSENTIELS »
     ══════════════════════════════════════════════════════════════════ */
  const renderChecklist = (tab: EditorTab) => {
    const open = checklistOpen[tab];
    return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setChecklistOpen((prev) => ({ ...prev, [tab]: !prev[tab] }))}
        className="w-full flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-[#2A2016]">
          Les essentiels
          <span className="text-[#FF385C] font-extrabold">{filledCount}/{essentials.length}</span>
        </span>
        {open ? <CaretUp size={15} weight="bold" /> : <CaretDown size={15} weight="bold" />}
      </button>

      <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#FF385C] transition-[width] duration-500"
          style={{ width: `${(filledCount / essentials.length) * 100}%` }}
        />
      </div>

      {open ? (
        <div className="mt-3 space-y-0.5 border-t border-gray-100 pt-2">
          {essentials.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => jumpTo(item)}
              className="w-full flex items-center justify-between gap-2 py-1.5 px-1 rounded-lg hover:bg-gray-50 transition-colors text-left group"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${
                    item.filled ? "bg-emerald-500 text-white" : "border border-gray-300 text-transparent"
                  }`}
                >
                  <Check size={10} weight="bold" />
                </span>
                <span className={`text-xs truncate ${item.filled ? "text-[#B0A79E] line-through" : "text-[#2A2016]"}`}>
                  {item.label}
                </span>
              </span>
              <ArrowRight size={13} weight="bold" className="text-gray-300 group-hover:text-[#FF385C] shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-[#8A8078] mt-2.5">
          Complétez-les pour un livret vraiment utile à vos voyageurs.
        </p>
      )}
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
                placeholder="Commencez à taper votre adresse…"
                onSelect={applyPropertyAddress}
                clearOnSelect={false}
              />
              {data.property?.address && (
                <p className="mt-2 text-[11px] text-[#4A3D30] bg-[#FBF9F5] border border-[#EFE9DF] rounded-lg px-2.5 py-2">
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
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
                  />
                  <input
                    type="text"
                    value={code.value}
                    onChange={(e) => codes.update(idx, { value: e.target.value })}
                    placeholder="1234#"
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold outline-none focus:border-[#FF385C]"
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
                <p className="text-[11px] text-[#8A8078]">Aucun contact supplémentaire.</p>
              )}
              {regularIdx.map(({ c, i }, pos) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => contacts.update(i, { label: e.target.value })}
                      placeholder="Conciergerie"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
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
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                    />
                    <input
                      type="text"
                      value={c.phone}
                      onChange={(e) => contacts.update(i, { phone: e.target.value })}
                      placeholder="04 91 00 00 00"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono outline-none focus:border-[#FF385C]"
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
                    className="px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 hover:border-[#FF385C] text-[11px] font-bold text-[#2A2016] flex items-center gap-1"
                  >
                    <Plus size={11} weight="bold" /> {preset.label} · {preset.phone}
                  </button>
                ))}
              </div>

              {emergencyIdx.length === 0 && (
                <p className="text-[11px] text-[#8A8078]">
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
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
                  />
                  <input
                    type="text"
                    value={c.phone}
                    onChange={(e) => contacts.update(i, { phone: e.target.value })}
                    className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold outline-none focus:border-[#FF385C]"
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
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                  />
                  <button
                    type="button"
                    onClick={() => departures.update(idx, { required: !step.required })}
                    title={step.required ? "Obligatoire" : "Facultative"}
                    className={`px-2 h-7 rounded-lg border text-[10px] font-extrabold uppercase shrink-0 transition-colors ${
                      step.required
                        ? "border-[#FF385C] text-[#FF385C] bg-[#FF385C]/5"
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
              <AddButton onClick={() => departures.add({ text: "", required: false })}>
                Ajouter une consigne de départ
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
                  className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                />
                <ItemToolbar index={idx} total={(data.rules || []).length} onMove={rules.move} onDelete={() => rules.remove(idx)} />
              </div>
            ))}
            <AddButton onClick={() => rules.add("")}>Ajouter une règle</AddButton>
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
                      className="w-10 text-center py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                    />
                    <input
                      type="text"
                      value={eq.title}
                      onChange={(e) => equipments.update(idx, { title: e.target.value })}
                      placeholder="Lave-vaisselle"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
                    />
                    <ItemToolbar index={idx} total={(data.equipments || []).length} onMove={equipments.move} onDelete={() => equipments.remove(idx)} />
                  </div>
                  <textarea
                    rows={2}
                    value={eq.desc}
                    onChange={(e) => equipments.update(idx, { desc: e.target.value })}
                    placeholder="Mode d'emploi, où trouver les consommables…"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C] resize-y"
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
              <AddButton onClick={() => equipments.add({ title: "", desc: "", icon: "✨" })}>
                Ajouter un équipement
              </AddButton>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <SectionTitle>Les petits plus (en supplément)</SectionTitle>
              <p className="text-[11px] text-[#6B5D4E] leading-relaxed">
                Vos services payants : petit-déjeuner, arrivée anticipée, départ tardif, ménage…
                Le voyageur les découvre et vous contacte pour réserver. Aucun paiement ne passe
                par le livret — vous réglez cela entre vous.
              </p>
              {(data.comfortOptions?.upsells || []).map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => upsells.update(idx, { title: e.target.value })}
                      placeholder="Petit-déjeuner livré"
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
                    />
                    <ItemToolbar
                      index={idx}
                      total={(data.comfortOptions?.upsells || []).length}
                      onMove={upsells.move}
                      onDelete={() => upsells.remove(idx)}
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => upsells.update(idx, { description: e.target.value })}
                    placeholder="Ce que comprend le service…"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C] resize-y"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      value={item.price ?? 0}
                      onChange={(e) => upsells.update(idx, { price: Number(e.target.value) || 0 })}
                      placeholder="15"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                    />
                    <select
                      value={item.priceUnit || "per_stay"}
                      onChange={(e) => upsells.update(idx, { priceUnit: e.target.value as UpsellItem["priceUnit"] })}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                    >
                      <option value="per_stay">par séjour</option>
                      <option value="per_person">par personne</option>
                      <option value="per_day">par jour</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={item.priceLabel || ""}
                    onChange={(e) => upsells.update(idx, { priceLabel: e.target.value })}
                    placeholder="Étiquette libre (« sur devis », « offert ») — remplace le prix"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                  />
                </div>
              ))}
              <AddButton
                onClick={() => upsells.add({ id: uid(), title: "", description: "", price: 0, priceUnit: "per_stay" })}
              >
                Ajouter un petit plus
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
                placeholder="Ex : Pizzeria Chez Étienne, Parc Borély…"
                near={propertyPoint}
                onSelect={applyRecommendation}
                hintWhenNoOrigin
              />
              <div className="flex items-center gap-2 pt-0.5">
                <span className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] uppercase tracking-wider text-[#B0A79E] font-bold">ou</span>
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
                  className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                />
                <button
                  type="button"
                  disabled={!newAddress.trim()}
                  onClick={() => {
                    recos.add({ title: newAddress.trim(), category: "Restaurant", description: "" });
                    setNewAddress("");
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-[#2A2016] text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 hover:border-[#FF385C]"
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
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
                    />
                    <ItemToolbar index={idx} total={(data.recommendations || []).length} onMove={recos.move} onDelete={() => recos.remove(idx)} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={rec.category}
                      onChange={(e) => recos.update(idx, { category: e.target.value })}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
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
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={rec.description}
                    onChange={(e) => recos.update(idx, { description: e.target.value })}
                    placeholder="En une phrase, pourquoi y aller ?"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C] resize-y"
                  />

                  <input
                    type="text"
                    value={rec.comment || ""}
                    onChange={(e) => recos.update(idx, { comment: e.target.value })}
                    placeholder="Votre mot perso (affiché en italique)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
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
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                    />
                  </div>

                  <input
                    type="text"
                    value={rec.imageUrl || ""}
                    onChange={(e) => recos.update(idx, { imageUrl: e.target.value })}
                    placeholder="Lien de la photo (https://…)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-mono outline-none focus:border-[#FF385C]"
                  />
                  <input
                    type="text"
                    value={rec.mapsUrl || ""}
                    onChange={(e) => recos.update(idx, { mapsUrl: e.target.value })}
                    placeholder="Lien Google Maps"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-mono outline-none focus:border-[#FF385C]"
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
                      className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
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
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                    />
                    <ItemToolbar index={idx} total={(data.transportLines || []).length} onMove={transports.move} onDelete={() => transports.remove(idx)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={line.station}
                      onChange={(e) => transports.update(idx, { station: e.target.value })}
                      placeholder="Arrêt / station"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
                    />
                    <input
                      type="text"
                      value={line.distance || ""}
                      onChange={(e) => transports.update(idx, { distance: e.target.value })}
                      placeholder="~500 m"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C]"
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
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold outline-none focus:border-[#FF385C]"
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
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#FF385C] resize-y"
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

  const statusText =
    saveState === "saving" || isLoading ? "Enregistrement…"
      : saveState === "error" ? "Échec de l’enregistrement"
        : dirty ? "Modifications non enregistrées"
          : savedClock ? `Enregistré à ${savedClock}`
            : "Aucune modification";

  /** Normalise le slug : c'est l'URL publique du livret. */
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F5F3EF] text-[#2A2016] font-sans">
      {/* ────────── BARRE SUPÉRIEURE ────────── */}
      <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
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
          <div className="min-w-0">
            <h1 className="font-bold text-[15px] truncate">{data.property?.name || "Livret sans titre"}</h1>
            {data.isActive ? (
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <CheckCircle size={12} weight="fill" /> En ligne
              </span>
            ) : (
              <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Brouillon · 29 € pour publier
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
                  : "text-[#8A8078] hover:bg-gray-50"
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
            className={`px-4 sm:px-5 py-2.5 rounded-full border text-xs font-bold transition-all disabled:opacity-60 ${
              saveState === "saved"
                ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                : "border-gray-300 text-[#2A2016] hover:bg-gray-50"
            }`}
          >
            {saveLabel}
          </button>

          {data.isActive ? (
            <a
              href={`/h/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 sm:px-6 py-2.5 rounded-full bg-[#FF385C] hover:bg-[#E03150] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF385C]/20 transition-all"
            >
              Voir le livret <ArrowSquareOut size={13} weight="bold" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => void handlePublish()}
              disabled={publishing}
              className="px-4 sm:px-6 py-2.5 rounded-full bg-[#FF385C] hover:bg-[#E03150] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#FF385C]/20 transition-all disabled:opacity-60"
            >
              {publishing ? "Publication…" : "→ Publier · 29 €"}
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
          <div className="grid grid-cols-5 border-b border-gray-200 bg-gray-50 text-[10px] font-bold text-[#6B5D4E] shrink-0">
            {([
              { id: "general", label: "Général", icon: Key },
              { id: "apparence", label: "Apparence", icon: Eye },
              { id: "modules", label: "Modules", icon: GridFour },
              { id: "langues", label: "Langues", icon: Translate },
              { id: "partager", label: "Partager", icon: QrCode },
            ] as const).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setEditorTab(t.id);
                  if (t.id !== "modules") {
                    setOpenModule(null);
                    setSelected(null);
                  }
                }}
                className={`py-3.5 flex flex-col items-center gap-1 transition-colors border-b-2 ${
                  editorTab === t.id
                    ? "border-[#FF385C] text-[#FF385C] bg-white"
                    : "border-transparent hover:text-[#2A2016]"
                }`}
              >
                <t.icon size={19} weight={editorTab === t.id ? "fill" : "regular"} />
                {t.label}
              </button>
            ))}
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto thin-scroll p-5 space-y-5">
            {/* ─────── GÉNÉRAL ─────── */}
            {editorTab === "general" && (
              <>
                {renderChecklist("general")}

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
                      placeholder="Commencez à taper votre adresse…"
                      onSelect={applyPropertyAddress}
                      clearOnSelect={false}
                    />
                    {data.property?.address && (
                      <p className="mt-2 text-[11px] flex items-start gap-1.5 text-[#4A3D30] bg-[#FBF9F5] border border-[#EFE9DF] rounded-lg px-2.5 py-2">
                        <MapPin size={13} weight="fill" className="shrink-0 mt-0.5 text-[#FF385C]" />
                        <span className="min-w-0">
                          {data.property.address}
                          {propertyPoint ? (
                            <span className="block text-[10px] text-[#8A8078] mt-0.5">
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
                  <TextAreaField
                    label="Message d'accueil"
                    rows={3}
                    value={data.property?.welcomeMessage || ""}
                    onChange={(v) => setProperty({ welcomeMessage: v })}
                    field="property.welcomeMessage"
                    highlighted={highlight === "property.welcomeMessage"}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <SectionTitle>Réseau Wi-Fi</SectionTitle>
                  <TextField
                    label="Nom du réseau (SSID)"
                    value={data.wifi?.ssid || ""}
                    onChange={(v) => setWifi({ ssid: v })}
                    field="wifi.ssid"
                    highlighted={highlight === "wifi.ssid"}
                  />
                  <TextField
                    label="Mot de passe"
                    mono
                    value={data.wifi?.password || ""}
                    onChange={(v) => setWifi({ password: v })}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100">
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

                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <SectionTitle>Arrivée et départ</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <TimeField
                      label="Arrivée à partir de"
                      value={data.practicalInfo?.checkin || "14h00"}
                      onChange={(v) => setPractical({ checkin: v })}
                      hours={CHECKIN_HOURS}
                      field="practicalInfo.checkin"
                      highlighted={highlight === "practicalInfo.checkin"}
                    />
                    <TimeField
                      label="Départ avant"
                      value={data.practicalInfo?.checkout || "10h00"}
                      onChange={(v) => setPractical({ checkout: v })}
                      hours={CHECKOUT_HOURS}
                      field="practicalInfo.checkout"
                      highlighted={highlight === "practicalInfo.checkout"}
                    />
                  </div>
                  <TextAreaField
                    label="Consignes d'arrivée"
                    rows={3}
                    value={data.practicalInfo?.arrivalNotes || ""}
                    onChange={(v) => setPractical({ arrivalNotes: v })}
                    placeholder="Ex : Entrez par le portail bleu, la boîte à clés est à gauche…"
                    field="practicalInfo.arrivalNotes"
                    highlighted={highlight === "practicalInfo.arrivalNotes"}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEditorTab("modules");
                      setOpenModule("depart");
                      setSelected("depart");
                      setHighlight("module.depart");
                    }}
                    className="w-full py-2.5 rounded-xl border border-gray-200 hover:border-[#FF385C] text-xs font-bold text-[#2A2016] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Gérer les consignes de départ <ArrowRight size={13} weight="bold" />
                  </button>
                </div>
              </>
            )}

            {/* ─────── APPARENCE ─────── */}
            {editorTab === "apparence" && (
              <>
                {renderChecklist("apparence")}

                <div className="space-y-3" data-field="property.gallery">
                  <SectionTitle>Photos</SectionTitle>
                  <p className="text-[11px] text-[#8A8078] leading-relaxed">
                    3 à 5 belles photos suffisent — la 1re sert aussi d&apos;image de partage (WhatsApp, QR…).
                  </p>
                  <Label>Photos de couverture (diaporama)</Label>
                  <div className={highlight === "property.gallery" ? "rounded-2xl animate-pulseRing" : undefined}>
                    <PhotoManager
                      photos={resolveGallery(data.property)}
                      onChange={setPhotos}
                      city={data.property?.city}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <SectionTitle>Couleur d&apos;accent</SectionTitle>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {COLOR_PRESETS.map((color) => {
                      const active = (data.comfortOptions?.theme?.primaryColor || "#1D64B4") === color;
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
                    <label className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#FF385C]">
                      <Plus size={14} weight="bold" className="text-[#8A8078]" />
                      <input
                        type="color"
                        value={data.comfortOptions?.theme?.primaryColor || "#1D64B4"}
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
                        <p className="text-[11px] text-[#8A8078] mt-0.5 leading-snug">{block.hint}</p>
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
                  <SectionTitle>Disposition sur ordinateur</SectionTitle>
                  <p className="text-[11px] text-[#8A8078] leading-relaxed">
                    Sur téléphone, le livret reste toujours en liste. Vos voyageurs
                    pourront basculer eux-mêmes depuis le livret.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {([
                      { value: "list" as const, label: "Liste", hint: "Rubriques fermées, une fiche s’ouvre au clic" },
                      { value: "grid" as const, label: "Grille", hint: "Fiches dépliées côte à côte, plus illustré" },
                    ]).map((mode) => {
                      const active = (data.display?.desktopLayout || "list") === mode.value;
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => setDisplay({ desktopLayout: mode.value })}
                          className={`p-3 rounded-xl border text-left transition-colors ${
                            active ? "border-[#FF385C] bg-[#FF385C]/5" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className={`block text-xs font-bold ${active ? "text-[#FF385C]" : "text-[#2A2016]"}`}>
                            {mode.label}
                          </span>
                          <span className="block text-[10px] text-[#8A8078] mt-0.5 leading-snug">{mode.hint}</span>
                        </button>
                      );
                    })}
                  </div>
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
                            active ? "border-[#FF385C] bg-[#FF385C]/5" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span
                            className={`block text-base font-bold ${
                              font === "classic" ? "font-[family-name:var(--font-serif)]" : "font-sans"
                            } ${active ? "text-[#FF385C]" : "text-[#2A2016]"}`}
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

            {/* ─────── MODULES ─────── */}
            {editorTab === "modules" && (
              <div className="space-y-3">
                <Hint>
                  Activez, réorganisez et remplissez les rubriques de votre livret. Cliquez aussi
                  directement sur un élément de l&apos;aperçu pour l&apos;ouvrir ici.
                </Hint>

                {modules.map((mod) => {
                  const def = getModuleDefinition(mod.id);
                  const Icon = MODULE_ICONS[mod.id];
                  const tint = MODULE_TINTS[mod.id];
                  const status = getModuleStatus(data, mod.id);
                  const isOpen = openModule === mod.id;
                  const showTodo = ESSENTIAL_MODULES.includes(mod.id) && !status.complete;

                  return (
                    <div
                      key={mod.id}
                      data-field={`module.${mod.id}`}
                      className={`rounded-2xl border overflow-hidden transition-all ${
                        isOpen
                          ? "border-[#FF385C] shadow-[0_0_0_3px_rgba(255,56,92,0.08)]"
                          : "border-gray-200 hover:border-gray-300"
                      } ${mod.visible ? "bg-white" : "bg-gray-50"}`}
                    >
                      <div className="p-3.5 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: tint.bg, color: tint.fg, opacity: mod.visible ? 1 : 0.5 }}
                          >
                            <Icon size={19} weight="duotone" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#2A2016] flex items-center gap-2 flex-wrap">
                              {def?.label}
                              {showTodo && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> À compléter
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-[#8A8078] truncate">{status.summary}</p>
                            <p className="text-[10px] text-[#B0A79E] mt-0.5">
                              {MODULE_GROUP_LABELS[def?.group ?? "surplace"]}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <Toggle
                            checked={mod.visible}
                            onChange={() => toggleModuleVisible(mod.id)}
                            label={`Afficher ${def?.label}`}
                          />
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider ${mod.visible ? "text-[#FF385C]" : "text-gray-400"}`}>
                            {mod.visible ? "Visible" : "Masqué"}
                          </span>
                        </div>
                      </div>

                      <div className="px-3.5 pb-3.5 flex items-center gap-2">
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveModule(mod.id, -1)}
                            disabled={neighbourInGroup(mod.id, -1) < 0}
                            title="Monter"
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#6B5D4E] hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <CaretUp size={13} weight="bold" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveModule(mod.id, 1)}
                            disabled={neighbourInGroup(mod.id, 1) < 0}
                            title="Descendre"
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[#6B5D4E] hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <CaretDown size={13} weight="bold" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleModuleOpen(mod.id)}
                          className="flex-1 h-8 rounded-lg border border-gray-200 hover:border-[#FF385C] text-xs font-bold text-[#2A2016] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {isOpen ? <CaretUp size={13} weight="bold" /> : <PencilSimple size={13} weight="bold" />}
                          {isOpen ? "Fermer" : "Modifier"}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="p-3.5 bg-[#FBF9F5] border-t border-gray-100 animate-fadeIn">
                          {renderModuleEditor(mod.id)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─────── LANGUES ─────── */}
            {editorTab === "langues" && (
              <TranslationsTab
                data={data}
                lang={editingLang}
                onLangChange={setEditingLang}
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
            )}

            {/* ─────── PARTAGER ─────── */}
            {editorTab === "partager" && (
              <div className="space-y-5">
                <div className="text-center space-y-3">
                  <div className="w-52 h-52 mx-auto bg-white p-4 rounded-3xl shadow-sm border border-gray-200 flex items-center justify-center">
                    <QRCodeSVG
                      ref={qrRef}
                      value={publicUrl}
                      size={180}
                      level="M"
                      marginSize={2}
                      title={`QR code du livret ${data.property?.name || ""}`}
                      fgColor="#2A2016"
                      bgColor="#FFFFFF"
                    />
                  </div>
                  <p className="text-[11px] text-[#8A8078]">
                    Ce QR code mène directement à votre livret.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Lien public</Label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={publicUrl}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[11px] font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={copyLink}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-[#FF385C] text-xs font-bold flex items-center gap-1.5"
                    >
                      {copied ? <Check size={14} weight="bold" className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? "Copié" : "Copier"}
                    </button>
                  </div>
                </div>

                {/* Le slug EST l'URL publique : il doit être modifiable, mais
                    seulement en connaissance de cause (QR déjà imprimés). */}
                <div className="space-y-2">
                  <Label hint="Ce qui apparaît après /h/ dans l’adresse. Choisissez-le avant d’imprimer vos QR codes.">
                    Personnaliser l’adresse
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-[#B0A79E] shrink-0">/h/</span>
                    <input
                      type="text"
                      value={data.slug}
                      onChange={(e) => mutate((d) => ({ ...d, slug: e.target.value }))}
                      onBlur={(e) => {
                        const clean = slugify(e.target.value);
                        if (clean && clean !== data.slug) mutate((d) => ({ ...d, slug: clean }));
                      }}
                      className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-gray-200 text-[11px] font-mono outline-none focus:border-[#FF385C]"
                    />
                  </div>
                  {slugPending && (
                    <p className="text-[11px] text-[#8A8078] bg-[#FBF9F5] border border-[#EFE9DF] rounded-lg px-2.5 py-2">
                      Le QR code et le lien ci-dessus pointent encore vers
                      <strong> /h/{savedSlug}</strong>. Enregistrez pour appliquer la nouvelle adresse.
                    </p>
                  )}
                  {data.isActive && data.slug !== initialData.slug && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 flex items-start gap-1.5">
                      <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />
                      L’ancienne adresse cessera de fonctionner : les QR codes déjà imprimés
                      devront être remplacés.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={downloadQrPng}
                    className="py-2.5 rounded-xl border border-gray-200 hover:border-[#FF385C] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <DownloadSimple size={14} weight="bold" /> PNG
                  </button>
                  <button
                    type="button"
                    onClick={downloadQrSvg}
                    className="py-2.5 rounded-xl border border-gray-200 hover:border-[#FF385C] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <DownloadSimple size={14} weight="bold" /> SVG
                  </button>
                  <a
                    href={`/h/${data.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 rounded-xl border border-gray-200 hover:border-[#FF385C] text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <ArrowSquareOut size={14} weight="bold" /> Ouvrir
                  </a>
                </div>

                <div
                  className={`rounded-2xl border p-4 text-xs ${
                    data.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {data.isActive ? (
                    <>
                      <strong className="flex items-center gap-1.5 mb-1">
                        <CheckCircle size={14} weight="fill" /> Livret en ligne
                      </strong>
                      Vos voyageurs peuvent y accéder dès maintenant.
                      <button
                        type="button"
                        onClick={() => void handleUnpublish()}
                        disabled={publishing}
                        className="mt-3 w-full py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
                      >
                        <EyeSlash size={14} weight="bold" />
                        {publishing ? "Traitement…" : "Repasser en brouillon"}
                      </button>
                    </>
                  ) : (
                    <>
                      <strong className="block mb-1">Livret en brouillon</strong>
                      Il n&apos;est pas encore visible publiquement. Publiez-le depuis le bouton en haut à droite.
                    </>
                  )}
                </div>

                {ownerPanel && <div className="pt-4 border-t border-gray-100">{ownerPanel}</div>}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 text-center shrink-0">
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
          {/* Bascule aperçu d'édition ⇄ rendu réel côté voyageur */}
          <div className="mb-4 flex bg-white p-1 rounded-full border border-gray-200 shadow-sm shrink-0">
            {([
              { value: false, label: "Vue hôte", hint: "Cliquez un élément pour l’éditer" },
              { value: true, label: "Vue voyageur", hint: "Exactement ce que verra votre client" },
            ] as const).map((mode) => (
              <button
                key={String(mode.value)}
                type="button"
                onClick={() => setPreviewAsGuest(mode.value)}
                title={mode.hint}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  previewAsGuest === mode.value
                    ? "bg-[#2A2016] text-white shadow-sm"
                    : "text-[#6B5D4E] hover:text-[#2A2016]"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {previewAsGuest && (
            <p className="mb-3 text-[11px] text-[#8A8078] shrink-0">
              Les rubriques encore vides sont masquées, comme pour vos voyageurs.
            </p>
          )}

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
              <div className="w-full h-full bg-[#F5F3EF] rounded-[2.2rem] relative overflow-hidden grid">
                <div className="overflow-y-auto min-h-0 hide-scrollbar overscroll-contain">
                  <CleoTemplate
                    data={data}
                    inlineModal
                    editable={!previewAsGuest}
                    activeModule={previewAsGuest ? undefined : openModule}
                    onActiveModuleChange={previewAsGuest ? undefined : handlePreviewModuleChange}
                    onSelect={handlePreviewSelect}
                    selected={selected}
                  />
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
              <div className="flex-1 min-h-0 bg-[#F5F3EF] relative overflow-hidden grid">
                <div className="overflow-y-auto min-h-0 overscroll-contain">
                  <CleoTemplate
                    data={data}
                    inlineModal
                    editable={!previewAsGuest}
                    activeModule={previewAsGuest ? undefined : openModule}
                    onActiveModuleChange={previewAsGuest ? undefined : handlePreviewModuleChange}
                    onSelect={handlePreviewSelect}
                    selected={selected}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
