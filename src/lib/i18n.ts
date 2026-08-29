import { Accommodation, ModuleId } from "@/lib/types/accommodation";

/**
 * Multilingue du livret.
 *
 * Deux natures de texte, traitées différemment :
 *
 * 1. L'INTERFACE (« Heure sur place », « Copier », les états vides…) est
 *    livrée traduite dans ce fichier : elle est identique pour tous les
 *    livrets, l'hôte n'a rien à saisir.
 *
 * 2. LE CONTENU de l'hôte (mot d'accueil, règles, bonnes adresses…) vit dans
 *    `accommodation.translations`, un calque par langue rempli depuis l'admin.
 *
 * Le français fait toujours foi : toute traduction manquante retombe dessus,
 * de sorte qu'une langue à moitié remplie reste lisible plutôt que trouée.
 */

export type Lang = "fr" | "en" | "es" | "it";

export const LANGS: { code: Lang; label: string; flag: string; short: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", short: "FR" },
  { code: "en", label: "English", flag: "🇬🇧", short: "EN" },
  { code: "es", label: "Español", flag: "🇪🇸", short: "ES" },
  { code: "it", label: "Italiano", flag: "🇮🇹", short: "IT" },
];

export const isLang = (value: string): value is Lang =>
  LANGS.some((l) => l.code === value);

/* ══════════════════════════════════════════════════════════════════════════
   1. INTERFACE
   ══════════════════════════════════════════════════════════════════════════ */

type Dict = Record<string, string>;

const FR: Dict = {
  // Carte heure / météo
  localTime: "Heure sur place",
  live: "En direct",
  otherTimezoneHint: "Visible pour vos voyageurs d’un autre fuseau",
  feelsLike: "Ressenti",
  weatherCredit: "Météo Open-Meteo · mise à jour en continu",
  phaseNight: "Nuit sur place",
  phaseEarly: "Petit matin sur place",
  phaseMorning: "Matinée sur place",
  phaseNoon: "Midi sur place",
  phaseAfternoon: "Après-midi sur place",
  phaseEvening: "Soirée sur place",

  // Sections & navigation
  groupSejour: "Votre séjour",
  groupSurplace: "Sur place",
  groupAlentours: "Aux alentours",
  toComplete: "À compléter",
  display: "Affichage",
  viewList: "Liste",
  viewGrid: "Grille",
  edit: "Modifier",
  close: "Fermer",
  defaultSubtitle: "Votre guide pour profiter simplement de votre séjour",
  footer: "Livret d’accueil numérique",

  // Arrivée
  essentialInfo: "Information essentielle",
  checkinFrom: "Arrivée possible à partir de",
  checkinHint: "Préparez votre itinéraire avant de prendre la route.",
  accessNotes: "Consignes & accès",
  location: "Localisation",
  arrivalPoint: "Votre point d’arrivée",
  directions: "Itinéraire",
  parking: "Stationnement",
  emptyArrival: "Les consignes d’arrivée arrivent bientôt",
  emptyArrivalText: "Votre hôte ajoutera ici comment entrer dans le logement et récupérer les clés.",

  // Wi-Fi
  wifiNetwork: "Réseau Wi-Fi",
  password: "Mot de passe",
  copy: "Copier",
  copied: "Copié !",
  accessCodes: "Codes d’accès au logement",
  noCodes: "Aucun code d’accès n’est nécessaire pour ce logement.",
  noPassword: "Mot de passe non renseigné — demandez-le à votre hôte.",
  emptyWifi: "Le Wi-Fi arrive bientôt",
  emptyWifiText: "Votre hôte ajoutera ici le nom du réseau et son mot de passe.",

  // Contacts & urgences
  yourHost: "Votre hôte",
  hostPhoneMissing: "Numéro de téléphone à renseigner.",
  usefulContacts: "Contacts utiles",
  emergencies: "Urgences & santé",
  emergencyNotice:
    "En cas d’urgence vitale, composez le 112 — numéro européen, gratuit depuis tout téléphone, même sans carte SIM.",
  emptyContacts: "Les contacts arrivent bientôt",
  emptyContactsText: "Votre hôte ajoutera ici les numéros utiles pendant votre séjour.",

  // Départ
  checkoutTime: "Horaire de départ",
  checkoutBefore: "Départ impératif avant",
  beforeLeaving: "Avant de partir",
  required: "Obligatoire",
  alsoKnow: "À savoir également",
  departureInstructions: "Instructions de fin de séjour",
  emptyDeparture: "Les consignes de départ arrivent bientôt",
  emptyDepartureText: "Votre hôte listera ici ce qu’il faut faire avant de rendre les clés.",

  // Bienvenue
  welcome: "Bienvenue",
  emptyWelcome: "Le mot d’accueil arrive bientôt",
  emptyWelcomeText: "Votre hôte écrira ici quelques mots pour vous souhaiter la bienvenue.",

  // Règlement
  houseRules: "Les règles de la maison",
  emptyRules: "Le règlement arrive bientôt",
  emptyRulesText: "Votre hôte précisera ici les quelques règles à respecter.",

  // Équipements
  howItWorks: "Mode d’emploi du logement",
  yourEquipment: "Vos équipements",
  equipmentAvailable: "équipement disponible",
  equipmentsAvailable: "équipements disponibles",
  openForInstructions: "ouvrez ceux qui ont des instructions.",
  instructionsAvailable: "Notice disponible",
  extras: "Les petits plus",
  extrasIntro: "Services proposés en supplément par votre hôte. Contactez-le directement pour en profiter.",
  askHost: "Demander à votre hôte",
  onRequest: "Sur demande",
  perPerson: "/ pers.",
  perDay: "/ jour",
  emptyEquipment: "Les équipements arrivent bientôt",
  emptyEquipmentText: "Votre hôte ajoutera ici les équipements disponibles et leur mode d’emploi.",

  // Adresses
  localBook: "Carnet local",
  discoverAround: "À découvrir aux alentours",
  addressSelected: "adresse sélectionnée",
  addressesSelected: "adresses sélectionnées",
  all: "Tout",
  emptyAddresses: "Les bonnes adresses arrivent bientôt",
  emptyAddressesText: "Votre hôte partagera ici ses restaurants et lieux préférés du quartier.",

  // Transports
  nearbyLines: "Lignes à proximité",
  emptyTransport: "Les transports arrivent bientôt",
  emptyTransportText: "Votre hôte indiquera ici les lignes et arrêts les plus proches.",

  // FAQ & livre d'or
  emptyFaq: "Les questions fréquentes arrivent bientôt",
  emptyFaqText: "Votre hôte répondra ici aux questions les plus souvent posées.",
  guestbookTitle: "Laissez-nous un mot",
  guestbookText: "Votre séjour touche à sa fin ? Écrivez quelques lignes à votre hôte — cela fait toujours plaisir.",
  writeToHost: "Écrire à votre hôte",

  // Carte
  whereIsIt: "Où se situe le logement",
};

const EN: Dict = {
  localTime: "Local time",
  live: "Live",
  otherTimezoneHint: "Handy for guests in another time zone",
  feelsLike: "Feels like",
  weatherCredit: "Weather by Open-Meteo · continuously updated",
  phaseNight: "Night on site",
  phaseEarly: "Early morning on site",
  phaseMorning: "Morning on site",
  phaseNoon: "Midday on site",
  phaseAfternoon: "Afternoon on site",
  phaseEvening: "Evening on site",

  groupSejour: "Your stay",
  groupSurplace: "On site",
  groupAlentours: "Nearby",
  toComplete: "To complete",
  display: "View",
  viewList: "List",
  viewGrid: "Grid",
  edit: "Edit",
  close: "Close",
  defaultSubtitle: "Your guide to a simple, easy stay",
  footer: "Digital welcome guide",

  essentialInfo: "Key information",
  checkinFrom: "Check-in from",
  checkinHint: "Plan your route before setting off.",
  accessNotes: "Access & instructions",
  location: "Location",
  arrivalPoint: "Where to arrive",
  directions: "Directions",
  parking: "Parking",
  emptyArrival: "Arrival instructions coming soon",
  emptyArrivalText: "Your host will explain here how to get in and collect the keys.",

  wifiNetwork: "Wi-Fi network",
  password: "Password",
  copy: "Copy",
  copied: "Copied!",
  accessCodes: "Access codes",
  noCodes: "No access code is needed for this property.",
  noPassword: "No password set — please ask your host.",
  emptyWifi: "Wi-Fi details coming soon",
  emptyWifiText: "Your host will add the network name and password here.",

  yourHost: "Your host",
  hostPhoneMissing: "Phone number not set yet.",
  usefulContacts: "Useful contacts",
  emergencies: "Emergencies & health",
  emergencyNotice:
    "In a life-threatening emergency, call 112 — the European emergency number, free from any phone, even without a SIM card.",
  emptyContacts: "Contacts coming soon",
  emptyContactsText: "Your host will add the numbers you may need during your stay.",

  checkoutTime: "Check-out time",
  checkoutBefore: "Please check out before",
  beforeLeaving: "Before you leave",
  required: "Required",
  alsoKnow: "Also worth knowing",
  departureInstructions: "End-of-stay instructions",
  emptyDeparture: "Check-out instructions coming soon",
  emptyDepartureText: "Your host will list here what to do before handing back the keys.",

  welcome: "Welcome",
  emptyWelcome: "A welcome note is coming soon",
  emptyWelcomeText: "Your host will write a few words to welcome you here.",

  houseRules: "House rules",
  emptyRules: "House rules coming soon",
  emptyRulesText: "Your host will set out the few rules to follow here.",

  howItWorks: "How the place works",
  yourEquipment: "Your amenities",
  equipmentAvailable: "amenity available",
  equipmentsAvailable: "amenities available",
  openForInstructions: "open the ones with instructions.",
  instructionsAvailable: "Instructions available",
  extras: "Little extras",
  extrasIntro: "Optional services offered by your host. Contact them directly to book.",
  askHost: "Ask your host",
  onRequest: "On request",
  perPerson: "/ person",
  perDay: "/ day",
  emptyEquipment: "Amenities coming soon",
  emptyEquipmentText: "Your host will list the available amenities and how to use them.",

  localBook: "Local guide",
  discoverAround: "Worth discovering nearby",
  addressSelected: "hand-picked spot",
  addressesSelected: "hand-picked spots",
  all: "All",
  emptyAddresses: "Local recommendations coming soon",
  emptyAddressesText: "Your host will share their favourite restaurants and places here.",

  nearbyLines: "Nearby lines",
  emptyTransport: "Transport details coming soon",
  emptyTransportText: "Your host will list the closest stops and lines here.",

  emptyFaq: "Frequently asked questions coming soon",
  emptyFaqText: "Your host will answer the most common questions here.",
  guestbookTitle: "Leave us a note",
  guestbookText: "Stay coming to an end? Drop your host a few lines — it always means a lot.",
  writeToHost: "Write to your host",

  whereIsIt: "Where the place is",
};

const ES: Dict = {
  localTime: "Hora local",
  live: "En directo",
  otherTimezoneHint: "Útil para viajeros de otro huso horario",
  feelsLike: "Sensación",
  weatherCredit: "Meteorología de Open-Meteo · actualizada en continuo",
  phaseNight: "Noche en el destino",
  phaseEarly: "Madrugada en el destino",
  phaseMorning: "Mañana en el destino",
  phaseNoon: "Mediodía en el destino",
  phaseAfternoon: "Tarde en el destino",
  phaseEvening: "Noche en el destino",

  groupSejour: "Tu estancia",
  groupSurplace: "En el alojamiento",
  groupAlentours: "En los alrededores",
  toComplete: "Por completar",
  display: "Vista",
  viewList: "Lista",
  viewGrid: "Cuadrícula",
  edit: "Editar",
  close: "Cerrar",
  defaultSubtitle: "Tu guía para disfrutar de la estancia sin complicaciones",
  footer: "Guía de bienvenida digital",

  essentialInfo: "Información esencial",
  checkinFrom: "Entrada a partir de",
  checkinHint: "Prepara tu ruta antes de salir.",
  accessNotes: "Instrucciones y acceso",
  location: "Ubicación",
  arrivalPoint: "Tu punto de llegada",
  directions: "Cómo llegar",
  parking: "Aparcamiento",
  emptyArrival: "Las instrucciones de llegada llegarán pronto",
  emptyArrivalText: "Tu anfitrión explicará aquí cómo entrar y recoger las llaves.",

  wifiNetwork: "Red Wi-Fi",
  password: "Contraseña",
  copy: "Copiar",
  copied: "¡Copiado!",
  accessCodes: "Códigos de acceso",
  noCodes: "Este alojamiento no necesita ningún código de acceso.",
  noPassword: "Sin contraseña indicada — pídesela a tu anfitrión.",
  emptyWifi: "Los datos del Wi-Fi llegarán pronto",
  emptyWifiText: "Tu anfitrión añadirá aquí el nombre de la red y su contraseña.",

  yourHost: "Tu anfitrión",
  hostPhoneMissing: "Teléfono aún sin indicar.",
  usefulContacts: "Contactos útiles",
  emergencies: "Emergencias y salud",
  emergencyNotice:
    "En caso de emergencia vital, marca el 112 — número europeo, gratuito desde cualquier teléfono, incluso sin tarjeta SIM.",
  emptyContacts: "Los contactos llegarán pronto",
  emptyContactsText: "Tu anfitrión añadirá aquí los números útiles durante tu estancia.",

  checkoutTime: "Hora de salida",
  checkoutBefore: "Salida antes de",
  beforeLeaving: "Antes de marcharte",
  required: "Obligatorio",
  alsoKnow: "También conviene saber",
  departureInstructions: "Instrucciones de fin de estancia",
  emptyDeparture: "Las instrucciones de salida llegarán pronto",
  emptyDepartureText: "Tu anfitrión indicará aquí qué hacer antes de devolver las llaves.",

  welcome: "Bienvenido",
  emptyWelcome: "El mensaje de bienvenida llegará pronto",
  emptyWelcomeText: "Tu anfitrión escribirá aquí unas palabras para darte la bienvenida.",

  houseRules: "Normas de la casa",
  emptyRules: "Las normas llegarán pronto",
  emptyRulesText: "Tu anfitrión indicará aquí las pocas normas a respetar.",

  howItWorks: "Cómo funciona el alojamiento",
  yourEquipment: "Tus equipamientos",
  equipmentAvailable: "equipamiento disponible",
  equipmentsAvailable: "equipamientos disponibles",
  openForInstructions: "abre los que tienen instrucciones.",
  instructionsAvailable: "Instrucciones disponibles",
  extras: "Los pequeños extras",
  extrasIntro: "Servicios opcionales que ofrece tu anfitrión. Contáctale directamente para reservarlos.",
  askHost: "Pregunta a tu anfitrión",
  onRequest: "Bajo petición",
  perPerson: "/ pers.",
  perDay: "/ día",
  emptyEquipment: "Los equipamientos llegarán pronto",
  emptyEquipmentText: "Tu anfitrión añadirá aquí los equipamientos disponibles y su modo de empleo.",

  localBook: "Guía local",
  discoverAround: "Para descubrir cerca",
  addressSelected: "dirección seleccionada",
  addressesSelected: "direcciones seleccionadas",
  all: "Todo",
  emptyAddresses: "Las recomendaciones llegarán pronto",
  emptyAddressesText: "Tu anfitrión compartirá aquí sus restaurantes y lugares preferidos.",

  nearbyLines: "Líneas cercanas",
  emptyTransport: "La información de transporte llegará pronto",
  emptyTransportText: "Tu anfitrión indicará aquí las paradas y líneas más cercanas.",

  emptyFaq: "Las preguntas frecuentes llegarán pronto",
  emptyFaqText: "Tu anfitrión responderá aquí a las preguntas más habituales.",
  guestbookTitle: "Déjanos unas palabras",
  guestbookText: "¿Se acaba tu estancia? Escríbele unas líneas a tu anfitrión — siempre hace ilusión.",
  writeToHost: "Escribir a tu anfitrión",

  whereIsIt: "Dónde está el alojamiento",
};

const IT: Dict = {
  localTime: "Ora locale",
  live: "In diretta",
  otherTimezoneHint: "Utile per gli ospiti di un altro fuso orario",
  feelsLike: "Percepita",
  weatherCredit: "Meteo Open-Meteo · aggiornato in continuo",
  phaseNight: "Notte sul posto",
  phaseEarly: "Mattino presto sul posto",
  phaseMorning: "Mattina sul posto",
  phaseNoon: "Mezzogiorno sul posto",
  phaseAfternoon: "Pomeriggio sul posto",
  phaseEvening: "Sera sul posto",

  groupSejour: "Il tuo soggiorno",
  groupSurplace: "Sul posto",
  groupAlentours: "Nei dintorni",
  toComplete: "Da completare",
  display: "Vista",
  viewList: "Elenco",
  viewGrid: "Griglia",
  edit: "Modifica",
  close: "Chiudi",
  defaultSubtitle: "La tua guida per goderti il soggiorno senza pensieri",
  footer: "Guida di benvenuto digitale",

  essentialInfo: "Informazione essenziale",
  checkinFrom: "Check-in a partire dalle",
  checkinHint: "Prepara il percorso prima di metterti in viaggio.",
  accessNotes: "Istruzioni e accesso",
  location: "Posizione",
  arrivalPoint: "Il tuo punto di arrivo",
  directions: "Indicazioni",
  parking: "Parcheggio",
  emptyArrival: "Le istruzioni di arrivo arrivano presto",
  emptyArrivalText: "Il tuo host spiegherà qui come entrare e ritirare le chiavi.",

  wifiNetwork: "Rete Wi-Fi",
  password: "Password",
  copy: "Copia",
  copied: "Copiato!",
  accessCodes: "Codici di accesso",
  noCodes: "Per questo alloggio non serve alcun codice di accesso.",
  noPassword: "Password non indicata — chiedila al tuo host.",
  emptyWifi: "I dati del Wi-Fi arrivano presto",
  emptyWifiText: "Il tuo host aggiungerà qui il nome della rete e la password.",

  yourHost: "Il tuo host",
  hostPhoneMissing: "Numero di telefono non ancora indicato.",
  usefulContacts: "Contatti utili",
  emergencies: "Emergenze e salute",
  emergencyNotice:
    "In caso di emergenza grave, componi il 112 — numero europeo, gratuito da qualsiasi telefono, anche senza SIM.",
  emptyContacts: "I contatti arrivano presto",
  emptyContactsText: "Il tuo host aggiungerà qui i numeri utili durante il soggiorno.",

  checkoutTime: "Orario di partenza",
  checkoutBefore: "Check-out entro le",
  beforeLeaving: "Prima di partire",
  required: "Obbligatorio",
  alsoKnow: "Da sapere anche",
  departureInstructions: "Istruzioni di fine soggiorno",
  emptyDeparture: "Le istruzioni di partenza arrivano presto",
  emptyDepartureText: "Il tuo host indicherà qui cosa fare prima di riconsegnare le chiavi.",

  welcome: "Benvenuto",
  emptyWelcome: "Il messaggio di benvenuto arriva presto",
  emptyWelcomeText: "Il tuo host scriverà qui due righe per darti il benvenuto.",

  houseRules: "Le regole della casa",
  emptyRules: "Il regolamento arriva presto",
  emptyRulesText: "Il tuo host indicherà qui le poche regole da rispettare.",

  howItWorks: "Come funziona l’alloggio",
  yourEquipment: "Le tue dotazioni",
  equipmentAvailable: "dotazione disponibile",
  equipmentsAvailable: "dotazioni disponibili",
  openForInstructions: "apri quelle con le istruzioni.",
  instructionsAvailable: "Istruzioni disponibili",
  extras: "I piccoli extra",
  extrasIntro: "Servizi opzionali proposti dal tuo host. Contattalo direttamente per prenotarli.",
  askHost: "Chiedi al tuo host",
  onRequest: "Su richiesta",
  perPerson: "/ pers.",
  perDay: "/ giorno",
  emptyEquipment: "Le dotazioni arrivano presto",
  emptyEquipmentText: "Il tuo host aggiungerà qui le dotazioni disponibili e il loro uso.",

  localBook: "Guida locale",
  discoverAround: "Da scoprire nei dintorni",
  addressSelected: "indirizzo selezionato",
  addressesSelected: "indirizzi selezionati",
  all: "Tutto",
  emptyAddresses: "I consigli locali arrivano presto",
  emptyAddressesText: "Il tuo host condividerà qui i suoi ristoranti e luoghi preferiti.",

  nearbyLines: "Linee nelle vicinanze",
  emptyTransport: "Le informazioni sui trasporti arrivano presto",
  emptyTransportText: "Il tuo host indicherà qui le fermate e le linee più vicine.",

  emptyFaq: "Le domande frequenti arrivano presto",
  emptyFaqText: "Il tuo host risponderà qui alle domande più comuni.",
  guestbookTitle: "Lasciaci due righe",
  guestbookText: "Il soggiorno sta finendo? Scrivi due righe al tuo host — fa sempre piacere.",
  writeToHost: "Scrivi al tuo host",

  whereIsIt: "Dove si trova l’alloggio",
};

const DICTS: Record<Lang, Dict> = { fr: FR, en: EN, es: ES, it: IT };

/** Texte d'interface. Retombe sur le français si la clé manque. */
export function tr(lang: Lang, key: keyof typeof FR): string {
  return DICTS[lang]?.[key] ?? FR[key] ?? String(key);
}

/** Libellés des rubriques, par langue. */
export const MODULE_LABELS: Record<Lang, Record<ModuleId, string>> = {
  fr: {
    arrivee: "Arrivée", wifi: "Codes & Wi-Fi", contacts: "Contacts", depart: "Départ",
    bienvenue: "Bienvenue", reglement: "Règlement", equipements: "Équipements & services",
    adresses: "Bonnes adresses", transports: "Transports", faq: "Questions fréquentes",
    livredor: "Livre d’or",
  },
  en: {
    arrivee: "Arrival", wifi: "Codes & Wi-Fi", contacts: "Contacts", depart: "Check-out",
    bienvenue: "Welcome", reglement: "House rules", equipements: "Amenities & services",
    adresses: "Local favourites", transports: "Getting around", faq: "FAQ",
    livredor: "Guest book",
  },
  es: {
    arrivee: "Llegada", wifi: "Códigos y Wi-Fi", contacts: "Contactos", depart: "Salida",
    bienvenue: "Bienvenida", reglement: "Normas", equipements: "Equipamientos y servicios",
    adresses: "Direcciones recomendadas", transports: "Transporte", faq: "Preguntas frecuentes",
    livredor: "Libro de visitas",
  },
  it: {
    arrivee: "Arrivo", wifi: "Codici e Wi-Fi", contacts: "Contatti", depart: "Partenza",
    bienvenue: "Benvenuto", reglement: "Regolamento", equipements: "Dotazioni e servizi",
    adresses: "Indirizzi consigliati", transports: "Trasporti", faq: "Domande frequenti",
    livredor: "Libro degli ospiti",
  },
};

export function moduleLabel(lang: Lang, id: ModuleId): string {
  return MODULE_LABELS[lang]?.[id] ?? MODULE_LABELS.fr[id] ?? id;
}

/* ══════════════════════════════════════════════════════════════════════════
   2. CONTENU DE L'HÔTE
   ══════════════════════════════════════════════════════════════════════════ */

/** Langues traduisibles : le français est la source, il ne se traduit pas. */
export type TranslatableLang = Exclude<Lang, "fr">;

/**
 * Calque de traduction. Les tableaux sont indexés comme la version française :
 * l'entrée n° 3 traduit la règle n° 3. Une entrée vide retombe sur le français.
 */
export interface TranslationLayer {
  property?: { name?: string; welcomeMessage?: string; type?: string };
  practicalInfo?: {
    arrivalNotes?: string;
    departureNotes?: string;
    parking?: string;
    breakfast?: string;
  };
  departureInstructions?: string[];
  rules?: string[];
  codes?: string[];
  contacts?: { label?: string; name?: string }[];
  equipments?: { title?: string; desc?: string }[];
  recommendations?: { title?: string; description?: string; comment?: string; category?: string }[];
  transportLines?: { type?: string; station?: string }[];
  upsells?: { title?: string; description?: string; priceLabel?: string }[];
  faq?: { question?: string; answer?: string }[];
}

export type Translations = Partial<Record<TranslatableLang, TranslationLayer>>;

/** Retient la traduction si elle est renseignée, sinon la source française. */
const pick = (translated: string | undefined, source: string): string =>
  translated && translated.trim() ? translated : source;

const pickOpt = (translated: string | undefined, source?: string): string | undefined =>
  translated && translated.trim() ? translated : source;

/**
 * Renvoie une copie du livret dont les textes sont ceux de `lang`.
 *
 * Traduire les DONNÉES plutôt que d'injecter une fonction `t()` dans chaque
 * ligne du gabarit : le rendu reste identique, seule la source change, et une
 * rubrique ajoutée demain est traduite sans y penser.
 */
export function localizeAccommodation(data: Accommodation, lang: Lang): Accommodation {
  if (lang === "fr") return data;
  const layer = (data.translations as Translations | undefined)?.[lang as TranslatableLang];
  if (!layer) return data;

  const byIndex = <T, U>(list: T[] | undefined, translated: U[] | undefined, merge: (item: T, tr?: U) => T): T[] | undefined =>
    list ? list.map((item, i) => merge(item, translated?.[i])) : undefined;

  return {
    ...data,
    property: {
      ...data.property,
      name: pick(layer.property?.name, data.property.name),
      type: pick(layer.property?.type, data.property.type),
      welcomeMessage: pick(layer.property?.welcomeMessage, data.property.welcomeMessage),
    },
    practicalInfo: {
      ...data.practicalInfo,
      arrivalNotes: pickOpt(layer.practicalInfo?.arrivalNotes, data.practicalInfo.arrivalNotes),
      departureNotes: pickOpt(layer.practicalInfo?.departureNotes, data.practicalInfo.departureNotes),
      parking: pickOpt(layer.practicalInfo?.parking, data.practicalInfo.parking),
      breakfast: pickOpt(layer.practicalInfo?.breakfast, data.practicalInfo.breakfast),
      departureInstructions: byIndex(
        data.practicalInfo.departureInstructions,
        layer.departureInstructions,
        (step, text) => ({ ...step, text: pick(text, step.text) })
      ),
    },
    rules: (data.rules || []).map((rule, i) => pick(layer.rules?.[i], rule)),
    codes: byIndex(data.codes, layer.codes, (code, label) => ({ ...code, label: pick(label, code.label) })),
    contacts: byIndex(data.contacts, layer.contacts, (contact, tr) => ({
      ...contact,
      label: pick(tr?.label, contact.label),
      name: pick(tr?.name, contact.name),
    })) as Accommodation["contacts"],
    equipments: byIndex(data.equipments, layer.equipments, (eq, tr) => ({
      ...eq,
      title: pick(tr?.title, eq.title),
      desc: pick(tr?.desc, eq.desc),
    })),
    recommendations: byIndex(data.recommendations, layer.recommendations, (rec, tr) => ({
      ...rec,
      title: pick(tr?.title, rec.title),
      description: pick(tr?.description, rec.description),
      comment: pickOpt(tr?.comment, rec.comment),
      category: pick(tr?.category, rec.category),
    })) as Accommodation["recommendations"],
    transportLines: byIndex(data.transportLines, layer.transportLines, (line, tr) => ({
      ...line,
      type: pick(tr?.type, line.type),
      station: pick(tr?.station, line.station),
    })),
    comfortOptions: data.comfortOptions
      ? {
          ...data.comfortOptions,
          upsells: byIndex(data.comfortOptions.upsells, layer.upsells, (item, tr) => ({
            ...item,
            title: pick(tr?.title, item.title),
            description: pick(tr?.description, item.description),
            priceLabel: pickOpt(tr?.priceLabel, item.priceLabel),
          })),
          faq: byIndex(data.comfortOptions.faq, layer.faq, (item, tr) => ({
            question: pick(tr?.question, item.question),
            answer: pick(tr?.answer, item.answer),
          })),
        }
      : data.comfortOptions,
  };
}

/** Langues réellement proposées au voyageur : le français plus celles remplies. */
export function availableLangs(data: Accommodation): Lang[] {
  const enabled = data.comfortOptions?.enabledLanguages;
  const candidates: Lang[] = enabled?.length
    ? (enabled.filter(isLang) as Lang[])
    : (["fr", "en", "es", "it"] as Lang[]);

  return candidates.filter((lang) => {
    if (lang === "fr") return true;
    const layer = (data.translations as Translations | undefined)?.[lang as TranslatableLang];
    // Une langue sans la moindre traduction n'est pas proposée : mieux vaut
    // trois langues justes qu'un drapeau qui renvoie du français.
    return Boolean(layer && Object.keys(layer).length > 0);
  });
}

/** Locale BCP-47 pour Intl (dates, nombres). */
export const INTL_LOCALE: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-GB",
  es: "es-ES",
  it: "it-IT",
};
