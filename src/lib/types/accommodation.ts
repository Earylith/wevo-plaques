export type OfferType = "essential" | "comfort";
export type PlanType = OfferType; // alias

/** Gabarit de rendu du livret côté voyageur. */
export type TemplateId = "essential" | "comfort" | "cleo";

export interface ContactInfo {
  label: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  type: "owner" | "emergency" | "service" | "other";
}

export interface Recommendation {
  title: string;
  category: string;
  type?: "restaurant" | "decouvrir"; // Explicit type for filtering
  description: string;
  distance?: string;
  mapsUrl?: string;
  websiteUrl?: string;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  comment?: string;
}

export interface PointOfInterest {
  title: string;
  description: string;
  distance?: string;
  mapsUrl?: string;
  imageUrl?: string;
}

export interface TransportLine {
  type: string; // e.g. "Métro", "Bus", "Tram", "Train"
  lines: string[]; // e.g. ["M2"], ["19", "83"]
  station: string; // e.g. "Rond-Point du Prado"
  distance?: string;
}

export interface AccessCodeItem {
  label: string;
  value: string;
  icon?: string;
}

/** Un équipement du logement, avec sa notice d'utilisation facultative. */
export interface EquipmentItem {
  title: string;
  desc: string;
  icon: string;
}

export interface CleaningLog {
  id?: string;
  date: number; // General timestamp / start date
  startTime?: number; // Heure d'arrivée
  endTime?: number;   // Heure de départ
  durationMinutes?: number; // Durée calculée en minutes
  status?: 'in_progress' | 'completed';
  agentName?: string;
}

export interface InventoryReport {
  id: string;
  date: number;
  type: 'arrival' | 'departure';
  travelerName: string;
  notes: string;
  photos: string[];
}

/**
 * « Les petits plus » — services payants proposés en supplément.
 * Aucun paiement ne transite par le livret : le voyageur découvre l'offre
 * et contacte l'hôte, qui règle la transaction de son côté.
 */
export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit?: 'per_stay' | 'per_person' | 'per_day';
  /** Étiquette libre affichée à la place du prix (« sur devis », « offert »…). */
  priceLabel?: string;
  icon?: string;
}

/* ──────────────────────────────────────────────────────────────────────────
   PLAQUE GRAVÉE
   ────────────────────────────────────────────────────────────────────────── */

/** Essence du bois. Une seule dimension physique, deux teintes. */
/**
 * Essences de bois.
 *
 * `clair` n'est plus proposé à la commande, mais reste dans le type : des
 * livrets l'ont enregistré, et le retirer rendrait leur configuration
 * invalide au lieu de simplement retomber sur le noyer.
 */
export type PlaqueWood = "clair" | "noyer";

/**
 * Configuration de la plaque.
 *
 * Volontairement encadrée : le client choisit parmi des modèles Guidz, il ne
 * déplace ni ne redimensionne rien. C'est ce qui garantit la lisibilité, les
 * marges et la compatibilité avec la gravure laser.
 */
export interface PlaqueConfig {
  wood: PlaqueWood;
  /** Modèle de mise en page (un seul pour l'instant). */
  model?: string;
  /** Nom gravé. Par défaut celui du logement. */
  engravedName?: string;
  /** Phrase d'accueil gravée. */
  engravedTagline?: string;
  /** Rubriques dont le pictogramme apparaît sur la plaque. */
  pictograms?: ModuleId[];
}

/** Étapes de fabrication d'une commande de plaque. */
export type OrderStatus =
  | "en_attente_paiement"
  | "payee"
  | "fichier_genere"
  | "en_gravure"
  | "expediee"
  | "annulee";

/**
 * Une commande de plaque.
 *
 * Elle fige la configuration au moment de l'achat : modifier le livret plus
 * tard ne doit jamais altérer une plaque déjà gravée.
 */
export interface PlaqueOrder {
  id?: string;
  /** Numéro lisible, du type GUIDZ-1058. */
  reference: string;
  accommodationId: string;
  accommodationSlug: string;
  accommodationName: string;
  ownerName: string;
  ownerEmail: string;
  offerType: OfferType;
  /** URL permanente gravée sur la plaque — elle ne changera jamais. */
  permanentUrl: string;
  /** Instantané figé de la configuration validée par le client. */
  plaque: PlaqueConfig;
  status: OrderStatus;
  /** Version du fichier de gravure, incrémentée à chaque nouvelle plaque. */
  version: number;
  /** Chemin du fichier de gravure une fois produit. */
  engravingFile?: string;
  /** Session de paiement qui a déclenché la commande. */
  stripeSessionId?: string;

  /*
   * Expédition.
   *
   * Renseignée par Guidz, et reprise telle quelle dans l'espace du client :
   * c'est la seule information qu'il attend vraiment une fois qu'il a payé.
   * Un client sans nouvelles écrit ; un client qui suit son colis attend.
   */
  /** Transporteur, en clair : « Colissimo », « Mondial Relay »… */
  carrier?: string;
  /** Numéro de suivi communiqué par le transporteur. */
  trackingNumber?: string;
  /** Lien de suivi, ouvert tel quel par le client. */
  trackingUrl?: string;
  /** Date d'expédition réelle. */
  shippedAt?: number;
  /** Date de livraison annoncée, si le transporteur en donne une. */
  estimatedDelivery?: number;
  /** Mot de Guidz au client, affiché dans son espace. */
  clientNote?: string;

  createdAt: number;
  updatedAt: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente_paiement: "En attente de paiement",
  payee: "Payée",
  fichier_genere: "Fichier de gravure prêt",
  en_gravure: "En gravure",
  expediee: "Expédiée",
  annulee: "Annulée",
};

/** Une consigne de départ, cochable par le voyageur. */
export interface DepartureInstruction {
  text: string;
  required?: boolean;
}

/* ──────────────────────────────────────────────────────────────────────────
   SYSTÈME DE MODULES
   Le livret est composé de modules activables, réordonnables, regroupés en
   sections côté voyageur. L'éditeur et le gabarit partagent ce catalogue.
   ────────────────────────────────────────────────────────────────────────── */

export type ModuleId =
  | "arrivee"
  | "wifi"
  | "contacts"
  | "depart"
  | "bienvenue"
  | "reglement"
  | "equipements"
  | "adresses"
  | "transports"
  | "faq"
  | "livredor";

/** Regroupement d'affichage côté voyageur. */
export type ModuleGroup = "tuiles" | "sejour" | "surplace" | "alentours";

export interface ModuleConfig {
  id: ModuleId;
  /** Le module apparaît-il dans le livret du voyageur ? */
  visible: boolean;
  /** Position dans sa section (croissant). */
  order: number;
  /** Titre personnalisé, sinon le libellé par défaut du catalogue. */
  title?: string;
}

export interface Accommodation {
  id?: string;
  slug: string;
  offerType: OfferType;
  isActive: boolean;
  /** Gabarit de rendu ; par défaut déduit de `offerType`. */
  template?: TemplateId;
  mustChangePassword?: boolean; // true à la 1ère connexion propriétaire
  ownerUid?: string; // UID Firebase Auth du propriétaire
  /** Horodatage de la première mise en ligne. */
  publishedAt?: number;

  /**
   * Identifiant court et IMMUABLE, gravé dans le QR code (/g/k7m2).
   *
   * Le slug reste modifiable pour le partage par lien, mais le QR pointe sur
   * cet identifiant : renommer son logement ne peut donc jamais tuer les
   * plaques déjà gravées.
   */
  permanentId?: string;
  /** Client Stripe, posé au premier paiement. */
  stripeCustomerId?: string | null;
  /** Abonnement Stripe qui maintient le livret en ligne. */
  stripeSubscriptionId?: string | null;
  /** Date du dernier encaissement confirmé. */
  paidAt?: number;

  /**
   * Verrouillé dès qu'une plaque est commandée : l'adresse publique devient
   * définitive, puisqu'elle est gravée dans le bois.
   */
  slugLocked?: boolean;

  /**
   * Message que l'hôte envoie avec son lien.
   *
   * Le lien seul, jeté dans une conversation, ressemble à un spam : le
   * voyageur ne sait ni de qui il vient ni pourquoi. L'hôte écrit donc son
   * mot une fois, et le retrouve prérempli à chaque partage.
   */
  shareMessage?: string;

  /** Configuration de la plaque en cours de personnalisation. */
  plaque?: PlaqueConfig;

  owner: {
    name: string;
    email: string;
    phone: string;
    slug?: string;
    /** Adresse e-mail qui reçoit les signalements des voyageurs. */
    reportEmail?: string;
  };

  property: {
    name: string;
    type: string; // e.g., "Villa", "Appartement"
    address?: string;
    city: string;
    welcomeMessage: string;
    mainImageUrl?: string;
    logoUrl?: string;
    /** Diaporama de couverture — la 1re photo sert d'aperçu (QR & partage). */
    gallery?: string[];
    /** Fuseau IANA pour la carte « Heure sur place » (défaut : Europe/Paris). */
    timezone?: string;
    /**
     * Coordonnées du logement, posées quand l'adresse est choisie dans les
     * suggestions. Elles servent à calculer les distances des bonnes adresses
     * et à relever la météo au bon endroit plutôt qu'au centre de la ville.
     */
    latitude?: number;
    longitude?: number;
  };

  wifi: {
    ssid: string;
    password?: string;
  };

  codes?: AccessCodeItem[];
  equipments?: EquipmentItem[];

  /** Configuration d'affichage des modules du livret. */
  modules?: ModuleConfig[];

  /**
   * Traductions du contenu de l'hôte, par langue.
   *
   * Le français reste la source : ce calque ne contient que ce qui a été
   * traduit, et tout champ vide retombe sur le français. Le type précis vit
   * dans @/lib/i18n pour éviter une dépendance circulaire.
   */
  translations?: Record<string, unknown>;

  /**
   * Blocs transverses du livret, en dehors du système de modules.
   * Absents = activés : un livret existant ne doit pas les perdre.
   */
  display?: {
    /** Météo locale dans la carte « Heure sur place ». */
    weather?: boolean;
    /** Carte « Où se situe le logement » en fin de page. */
    map?: boolean;
    /**
     * Disposition proposée au voyageur sur ordinateur.
     * « liste » ouvre chaque rubrique dans une fiche ; « grille » les déplie
     * côte à côte. Le voyageur peut basculer, ceci n'est que le défaut.
     * Sur mobile, la liste s'impose : une grille y serait illisible.
     */
    desktopLayout?: "list" | "grid";
  };

  practicalInfo: {
    checkin: string;
    checkout: string;
    parking?: string;
    breakfast?: string;
    arrivalNotes?: string;
    departureNotes?: string;
    departureInstructions?: DepartureInstruction[];
  };

  rules: string[];

  contacts: ContactInfo[];
  recommendations: Recommendation[];
  pointsOfInterest: PointOfInterest[];

  transportLines?: TransportLine[];
  transportLink?: { url: string; label: string };

  features?: {
    inventory?: boolean;
    cleaning?: boolean;
  };

  cleaningLogs?: CleaningLog[];
  inventories?: InventoryReport[];

  standardEmergencies?: {
    samu?: string;
    pompiers?: string;
    police?: string;
    europe?: string;
  };
  comfortOptions?: {
    enabledLanguages?: string[];
    transports?: string;
    emergencyNumbers?: ContactInfo[];
    faq?: { question: string; answer: string }[];
    customSections?: { title: string; content: string }[];
    upsells?: UpsellItem[];
    theme?: {
      primaryColor?: string;
      backgroundColor?: string;
      style?: "nature" | "modern" | "classic";
      fontFamily?: "modern" | "classic" | "nature";
    };
  };

  createdAt: number;
  updatedAt: number;
}

/* ──────────────────────────────────────────────────────────────────────────
   CATALOGUE DES MODULES — source de vérité partagée éditeur ⇄ gabarit
   ────────────────────────────────────────────────────────────────────────── */

export interface ModuleDefinition {
  id: ModuleId;
  /** Libellé affiché dans l'éditeur et, par défaut, dans le livret. */
  label: string;
  /** Sous-titre explicatif dans l'éditeur. */
  hint: string;
  group: ModuleGroup;
  /** Emoji de repli (les icônes Phosphor sont câblées dans le gabarit). */
  emoji: string;
  /** Activé par défaut sur un nouveau livret. */
  defaultVisible: boolean;
}

/** Ordre canonique de référence (celui d'un livret neuf). */
export const MODULE_CATALOG: ModuleDefinition[] = [
  { id: "arrivee",     label: "Arrivée",               hint: "Horaire, accès et consignes d'arrivée", group: "tuiles",    emoji: "🔑", defaultVisible: true },
  { id: "wifi",        label: "Codes & Wi-Fi",         hint: "Réseau, mot de passe et digicodes",     group: "tuiles",    emoji: "📶", defaultVisible: true },
  { id: "contacts",    label: "Contacts",              hint: "Vos numéros, les secours et les urgences", group: "tuiles",  emoji: "📞", defaultVisible: true },
  { id: "depart",      label: "Départ",                hint: "Horaire et check-list de fin de séjour", group: "tuiles",   emoji: "🚪", defaultVisible: true },
  { id: "bienvenue",   label: "Bienvenue",             hint: "Votre mot d'accueil",                   group: "sejour",    emoji: "👋", defaultVisible: true },
  { id: "reglement",   label: "Règlement",             hint: "Les règles de la maison",               group: "surplace",  emoji: "📜", defaultVisible: true },
  { id: "equipements", label: "Équipements & services", hint: "Notices d'utilisation et petits plus", group: "surplace",  emoji: "🏅", defaultVisible: true },
  { id: "adresses",    label: "Bonnes adresses",       hint: "Restaurants, plages, activités",        group: "alentours", emoji: "📍", defaultVisible: true },
  { id: "transports",  label: "Transports",            hint: "Lignes et arrêts à proximité",          group: "alentours", emoji: "🚌", defaultVisible: true },
  { id: "faq",         label: "Questions fréquentes",  hint: "Les réponses aux questions récurrentes", group: "sejour",   emoji: "💬", defaultVisible: false },
  { id: "livredor",    label: "Livre d'or",            hint: "Laissez vos voyageurs vous écrire",     group: "sejour",    emoji: "📖", defaultVisible: false },
];

export const MODULE_GROUP_LABELS: Record<ModuleGroup, string> = {
  tuiles: "Accès rapide",
  sejour: "Votre séjour",
  surplace: "Sur place",
  alentours: "Aux alentours",
};

/**
 * Fusionne la configuration enregistrée avec le catalogue : garantit qu'un
 * module ajouté au produit après coup apparaît sur les livrets existants,
 * et qu'un identifiant obsolète en base est ignoré.
 */
export function resolveModules(saved?: ModuleConfig[]): ModuleConfig[] {
  const byId = new Map((saved || []).map((m) => [m.id, m]));
  return MODULE_CATALOG.map((def, index) => {
    const found = byId.get(def.id);
    return {
      id: def.id,
      visible: found ? found.visible !== false : def.defaultVisible,
      order: found && typeof found.order === "number" ? found.order : index,
      ...(found?.title ? { title: found.title } : {}),
    };
  }).sort((a, b) => a.order - b.order);
}

/** Vrai si le module doit s'afficher dans le livret du voyageur. */
export function isModuleVisible(data: Accommodation, id: ModuleId): boolean {
  return resolveModules(data.modules).find((m) => m.id === id)?.visible ?? true;
}

export function getModuleDefinition(id: ModuleId): ModuleDefinition {
  return MODULE_CATALOG.find((m) => m.id === id) as ModuleDefinition;
}
