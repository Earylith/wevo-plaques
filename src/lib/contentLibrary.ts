import { EquipmentItem, DepartureInstruction } from "@/lib/types/accommodation";
import { Lang, TranslatableLang } from "@/lib/i18n";

/**
 * Bibliothèque de contenus pré-rédigés.
 *
 * C'est le principal gain de temps de l'admin : au lieu de rédiger douze
 * notices d'équipement un dimanche soir, l'hôte coche. Chaque entrée porte sa
 * traduction dans les quatre langues, de sorte qu'un livret coché est
 * immédiatement quadrilingue — sans passer par la traduction automatique.
 *
 * Les textes sont volontairement génériques et modifiables : ils donnent un
 * point de départ correct, pas une vérité sur le logement.
 */

/** Un texte et ses traductions. Le français fait foi. */
export interface LocalizedText {
  fr: string;
  en: string;
  es: string;
  it: string;
}

export interface LibraryEquipment {
  id: string;
  icon: string;
  title: LocalizedText;
  desc: LocalizedText;
  /** Regroupement dans le sélecteur. */
  category: "cuisine" | "confort" | "salle_de_bain" | "exterieur" | "pratique";
}

export const EQUIPMENT_CATEGORIES: { id: LibraryEquipment["category"]; label: string }[] = [
  { id: "cuisine", label: "Cuisine" },
  { id: "confort", label: "Confort & multimédia" },
  { id: "salle_de_bain", label: "Salle de bain" },
  { id: "exterieur", label: "Extérieur" },
  { id: "pratique", label: "Praticité" },
];

export const EQUIPMENT_LIBRARY: LibraryEquipment[] = [
  {
    id: "wifi", icon: "🌐", category: "confort",
    title: { fr: "Wi-Fi", en: "Wi-Fi", es: "Wi-Fi", it: "Wi-Fi" },
    desc: {
      fr: "Le nom du réseau et le mot de passe sont dans la rubrique Codes & Wi-Fi.",
      en: "The network name and password are in the Codes & Wi-Fi section.",
      es: "El nombre de la red y la contraseña están en la sección Códigos y Wi-Fi.",
      it: "Nome della rete e password si trovano nella sezione Codici e Wi-Fi.",
    },
  },
  {
    id: "tv", icon: "📺", category: "confort",
    title: { fr: "Télévision", en: "Television", es: "Televisión", it: "Televisione" },
    desc: {
      fr: "Allumez la TV et sélectionnez l’entrée HDMI 1.",
      en: "Switch the TV on and select input HDMI 1.",
      es: "Enciende la tele y selecciona la entrada HDMI 1.",
      it: "Accendi la TV e seleziona l’ingresso HDMI 1.",
    },
  },
  {
    id: "netflix", icon: "🎬", category: "confort",
    title: { fr: "Netflix", en: "Netflix", es: "Netflix", it: "Netflix" },
    desc: {
      fr: "Le compte est déjà connecté. Merci de ne pas vous déconnecter en partant.",
      en: "The account is already signed in. Please don’t log out when you leave.",
      es: "La cuenta ya está conectada. Por favor, no cierres sesión al marcharte.",
      it: "L’account è già collegato. Per favore non disconnetterti alla partenza.",
    },
  },
  {
    id: "enceinte", icon: "🔊", category: "confort",
    title: { fr: "Enceinte Bluetooth", en: "Bluetooth speaker", es: "Altavoz Bluetooth", it: "Cassa Bluetooth" },
    desc: {
      fr: "Appairez-la depuis les réglages Bluetooth de votre téléphone.",
      en: "Pair it from your phone’s Bluetooth settings.",
      es: "Vincúlalo desde los ajustes Bluetooth de tu teléfono.",
      it: "Associala dalle impostazioni Bluetooth del telefono.",
    },
  },
  {
    id: "clim", icon: "❄️", category: "confort",
    title: { fr: "Climatisation", en: "Air conditioning", es: "Aire acondicionado", it: "Climatizzatore" },
    desc: {
      fr: "Télécommande dans le salon. Merci de fermer les fenêtres quand elle fonctionne.",
      en: "Remote in the living room. Please keep the windows closed while it runs.",
      es: "Mando en el salón. Cierra las ventanas mientras funcione, por favor.",
      it: "Telecomando in soggiorno. Tieni le finestre chiuse quando è in funzione.",
    },
  },
  {
    id: "chauffage", icon: "🔥", category: "confort",
    title: { fr: "Chauffage", en: "Heating", es: "Calefacción", it: "Riscaldamento" },
    desc: {
      fr: "Thermostat dans l’entrée. Merci de le baisser en quittant le logement.",
      en: "Thermostat in the hallway. Please turn it down when you go out.",
      es: "Termostato en la entrada. Bájalo al salir, por favor.",
      it: "Termostato all’ingresso. Abbassalo quando esci, per favore.",
    },
  },
  {
    id: "cuisine_equipee", icon: "🍳", category: "cuisine",
    title: { fr: "Cuisine équipée", en: "Fully equipped kitchen", es: "Cocina equipada", it: "Cucina attrezzata" },
    desc: {
      fr: "Plaques, four et micro-ondes à disposition. Ustensiles dans les tiroirs.",
      en: "Hob, oven and microwave available. Utensils are in the drawers.",
      es: "Placa, horno y microondas disponibles. Utensilios en los cajones.",
      it: "Piano cottura, forno e microonde disponibili. Utensili nei cassetti.",
    },
  },
  {
    id: "lave_vaisselle", icon: "🍽️", category: "cuisine",
    title: { fr: "Lave-vaisselle", en: "Dishwasher", es: "Lavavajillas", it: "Lavastoviglie" },
    desc: {
      fr: "Tablettes sous l’évier. Le programme Éco convient à la plupart des lavages.",
      en: "Tablets under the sink. The Eco cycle works for most loads.",
      es: "Pastillas debajo del fregadero. El programa Eco sirve para casi todo.",
      it: "Pastiglie sotto il lavello. Il programma Eco va bene quasi sempre.",
    },
  },
  {
    id: "cafe", icon: "☕", category: "cuisine",
    title: { fr: "Machine à café", en: "Coffee machine", es: "Cafetera", it: "Macchina del caffè" },
    desc: {
      fr: "Quelques capsules vous attendent sur le plan de travail.",
      en: "A few capsules are waiting for you on the worktop.",
      es: "Te esperan unas cápsulas en la encimera.",
      it: "Alcune capsule ti aspettano sul piano di lavoro.",
    },
  },
  {
    id: "bouilloire", icon: "🫖", category: "cuisine",
    title: { fr: "Bouilloire", en: "Kettle", es: "Hervidor", it: "Bollitore" },
    desc: {
      fr: "Thé et infusions dans le placard au-dessus.",
      en: "Tea and herbal infusions in the cupboard above.",
      es: "Té e infusiones en el armario de encima.",
      it: "Tè e infusi nell’armadietto sopra.",
    },
  },
  {
    id: "frigo", icon: "🧊", category: "cuisine",
    title: { fr: "Réfrigérateur & congélateur", en: "Fridge & freezer", es: "Nevera y congelador", it: "Frigorifero e congelatore" },
    desc: {
      fr: "Merci de le vider avant votre départ.",
      en: "Please empty it before you leave.",
      es: "Vacíala antes de marcharte, por favor.",
      it: "Svuotalo prima di partire, per favore.",
    },
  },
  {
    id: "lave_linge", icon: "🧺", category: "pratique",
    title: { fr: "Lave-linge", en: "Washing machine", es: "Lavadora", it: "Lavatrice" },
    desc: {
      fr: "Lessive dans le placard de la salle de bain.",
      en: "Detergent is in the bathroom cupboard.",
      es: "Detergente en el armario del baño.",
      it: "Detersivo nell’armadietto del bagno.",
    },
  },
  {
    id: "seche_linge", icon: "🌀", category: "pratique",
    title: { fr: "Sèche-linge", en: "Tumble dryer", es: "Secadora", it: "Asciugatrice" },
    desc: {
      fr: "Pensez à vider le filtre après chaque cycle.",
      en: "Remember to empty the filter after each cycle.",
      es: "Acuérdate de vaciar el filtro tras cada ciclo.",
      it: "Ricorda di svuotare il filtro dopo ogni ciclo.",
    },
  },
  {
    id: "fer", icon: "👔", category: "pratique",
    title: { fr: "Fer & table à repasser", en: "Iron & ironing board", es: "Plancha y tabla", it: "Ferro e asse da stiro" },
    desc: {
      fr: "Rangés dans le placard de l’entrée.",
      en: "Stored in the hallway cupboard.",
      es: "Guardados en el armario de la entrada.",
      it: "Riposti nell’armadio d’ingresso.",
    },
  },
  {
    id: "seche_cheveux", icon: "💨", category: "salle_de_bain",
    title: { fr: "Sèche-cheveux", en: "Hairdryer", es: "Secador de pelo", it: "Asciugacapelli" },
    desc: {
      fr: "Dans le meuble de la salle de bain.",
      en: "In the bathroom cabinet.",
      es: "En el mueble del baño.",
      it: "Nel mobile del bagno.",
    },
  },
  {
    id: "serviettes", icon: "🛁", category: "salle_de_bain",
    title: { fr: "Serviettes fournies", en: "Towels provided", es: "Toallas incluidas", it: "Asciugamani forniti" },
    desc: {
      fr: "Une serviette de bain et une de toilette par personne.",
      en: "One bath towel and one hand towel per person.",
      es: "Una toalla de baño y una de manos por persona.",
      it: "Un asciugamano da bagno e uno da viso a persona.",
    },
  },
  {
    id: "draps", icon: "🛌", category: "pratique",
    title: { fr: "Draps fournis", en: "Bed linen provided", es: "Ropa de cama incluida", it: "Biancheria da letto fornita" },
    desc: {
      fr: "Les lits sont faits à votre arrivée.",
      en: "Beds are made for your arrival.",
      es: "Las camas están hechas a tu llegada.",
      it: "I letti sono già pronti al tuo arrivo.",
    },
  },
  {
    id: "parking", icon: "🚗", category: "exterieur",
    title: { fr: "Parking", en: "Parking", es: "Aparcamiento", it: "Parcheggio" },
    desc: {
      fr: "Une place vous est réservée. Détails dans la rubrique Arrivée.",
      en: "A space is reserved for you. Details in the Arrival section.",
      es: "Tienes una plaza reservada. Detalles en la sección Llegada.",
      it: "Un posto è riservato per te. Dettagli nella sezione Arrivo.",
    },
  },
  {
    id: "terrasse", icon: "☀️", category: "exterieur",
    title: { fr: "Terrasse", en: "Terrace", es: "Terraza", it: "Terrazza" },
    desc: {
      fr: "Mobilier de jardin à disposition. Merci de rentrer les coussins par temps de pluie.",
      en: "Garden furniture available. Please bring the cushions in if it rains.",
      es: "Muebles de jardín disponibles. Guarda los cojines si llueve, por favor.",
      it: "Mobili da giardino disponibili. Ritira i cuscini in caso di pioggia.",
    },
  },
  {
    id: "barbecue", icon: "🔥", category: "exterieur",
    title: { fr: "Barbecue", en: "Barbecue", es: "Barbacoa", it: "Barbecue" },
    desc: {
      fr: "Merci de le nettoyer après usage.",
      en: "Please clean it after use.",
      es: "Límpiala después de usarla, por favor.",
      it: "Puliscilo dopo l’uso, per favore.",
    },
  },
  {
    id: "piscine", icon: "🏊", category: "exterieur",
    title: { fr: "Piscine", en: "Swimming pool", es: "Piscina", it: "Piscina" },
    desc: {
      fr: "Baignade non surveillée. Les enfants doivent être accompagnés.",
      en: "Unsupervised pool. Children must be accompanied.",
      es: "Piscina sin vigilancia. Los niños deben estar acompañados.",
      it: "Piscina non sorvegliata. I bambini devono essere accompagnati.",
    },
  },
  {
    id: "bureau", icon: "💻", category: "pratique",
    title: { fr: "Espace de travail", en: "Workspace", es: "Zona de trabajo", it: "Angolo di lavoro" },
    desc: {
      fr: "Bureau avec prises et port USB.",
      en: "Desk with power sockets and a USB port.",
      es: "Escritorio con enchufes y puerto USB.",
      it: "Scrivania con prese e porta USB.",
    },
  },
  {
    id: "lit_bebe", icon: "🍼", category: "pratique",
    title: { fr: "Lit bébé", en: "Cot", es: "Cuna", it: "Lettino" },
    desc: {
      fr: "Disponible sur demande, à signaler avant votre arrivée.",
      en: "Available on request — please let us know before you arrive.",
      es: "Disponible bajo petición, avísanos antes de llegar.",
      it: "Disponibile su richiesta, segnalalo prima dell’arrivo.",
    },
  },
  {
    id: "ascenseur", icon: "🛗", category: "pratique",
    title: { fr: "Ascenseur", en: "Lift", es: "Ascensor", it: "Ascensore" },
    desc: {
      fr: "Il dessert tous les étages depuis le rez-de-chaussée.",
      en: "It serves every floor from the ground floor.",
      es: "Llega a todas las plantas desde la planta baja.",
      it: "Serve tutti i piani dal piano terra.",
    },
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   RÈGLES DE LA MAISON
   ══════════════════════════════════════════════════════════════════════════ */

export const RULES_LIBRARY: LocalizedText[] = [
  {
    fr: "Logement non-fumeur à l’intérieur",
    en: "No smoking indoors",
    es: "Prohibido fumar en el interior",
    it: "Vietato fumare all’interno",
  },
  {
    fr: "Fêtes et événements non autorisés",
    en: "Parties and events are not allowed",
    es: "No se permiten fiestas ni eventos",
    it: "Feste ed eventi non sono ammessi",
  },
  {
    fr: "Calme après 22h par respect du voisinage",
    en: "Quiet after 10 pm out of respect for the neighbours",
    es: "Silencio a partir de las 22:00 por respeto al vecindario",
    it: "Silenzio dopo le 22 per rispetto del vicinato",
  },
  {
    fr: "Animaux acceptés sur demande préalable",
    en: "Pets welcome by prior arrangement",
    es: "Mascotas admitidas con acuerdo previo",
    it: "Animali ammessi previo accordo",
  },
  {
    fr: "Merci de fermer les fenêtres en quittant le logement",
    en: "Please close the windows when you go out",
    es: "Cierra las ventanas al salir, por favor",
    it: "Chiudi le finestre quando esci, per favore",
  },
  {
    fr: "Chaussures à retirer à l’entrée",
    en: "Please take your shoes off at the door",
    es: "Quítate los zapatos en la entrada",
    it: "Togli le scarpe all’ingresso",
  },
  {
    fr: "Nombre de voyageurs limité à celui de la réservation",
    en: "Occupancy is limited to the number booked",
    es: "El número de huéspedes se limita al de la reserva",
    it: "Il numero di ospiti è limitato a quello prenotato",
  },
  {
    fr: "Merci de trier les déchets selon les bacs prévus",
    en: "Please sort waste into the bins provided",
    es: "Separa los residuos en los contenedores previstos",
    it: "Differenzia i rifiuti negli appositi contenitori",
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   CONSIGNES DE DÉPART
   ══════════════════════════════════════════════════════════════════════════ */

export const DEPARTURE_LIBRARY: { text: LocalizedText; required: boolean }[] = [
  {
    required: true,
    text: {
      fr: "Déposer les clés à l’endroit convenu",
      en: "Leave the keys where agreed",
      es: "Deja las llaves en el lugar acordado",
      it: "Lascia le chiavi nel posto concordato",
    },
  },
  {
    required: true,
    text: {
      fr: "Fermer les fenêtres et les volets",
      en: "Close the windows and shutters",
      es: "Cierra las ventanas y las persianas",
      it: "Chiudi finestre e persiane",
    },
  },
  {
    required: true,
    text: {
      fr: "Éteindre les lumières, le chauffage et la climatisation",
      en: "Switch off the lights, heating and air conditioning",
      es: "Apaga las luces, la calefacción y el aire acondicionado",
      it: "Spegni luci, riscaldamento e climatizzatore",
    },
  },
  {
    required: false,
    text: {
      fr: "Lancer le lave-vaisselle si nécessaire",
      en: "Run the dishwasher if needed",
      es: "Pon el lavavajillas si hace falta",
      it: "Avvia la lavastoviglie se necessario",
    },
  },
  {
    required: false,
    text: {
      fr: "Sortir les poubelles",
      en: "Take out the bins",
      es: "Saca la basura",
      it: "Porta fuori i rifiuti",
    },
  },
  {
    required: false,
    text: {
      fr: "Vider le réfrigérateur",
      en: "Empty the fridge",
      es: "Vacía la nevera",
      it: "Svuota il frigorifero",
    },
  },
  {
    required: false,
    text: {
      fr: "Regrouper le linge utilisé dans la salle de bain",
      en: "Gather used linen in the bathroom",
      es: "Reúne la ropa usada en el baño",
      it: "Raccogli la biancheria usata in bagno",
    },
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   CONVERSION VERS LE MODÈLE DU LIVRET
   ══════════════════════════════════════════════════════════════════════════ */

export function toEquipment(item: LibraryEquipment): EquipmentItem {
  return { title: item.title.fr, desc: item.desc.fr, icon: item.icon };
}

export function toDepartureInstruction(item: (typeof DEPARTURE_LIBRARY)[number]): DepartureInstruction {
  return { text: item.text.fr, required: item.required };
}

/** Traduction d'une entrée, pour alimenter le calque de langue. */
export function translationOf(text: LocalizedText, lang: TranslatableLang): string {
  return text[lang as Exclude<Lang, "fr">] || text.fr;
}
