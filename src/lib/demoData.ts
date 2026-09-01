import { Accommodation } from "./types/accommodation";

/**
 * Démonstration de la formule Essentielle.
 *
 * Elle remplit TOUS les champs que la formule permet de modifier, et aucun
 * autre : pas de message d'accueil personnalisé, pas de photos, pas de bonnes
 * adresses — ce sont des promesses de la formule Confort.
 *
 * Ce jeu ne s'affiche qu'en secours, si Firestore est injoignable. La vitrine
 * réelle est le livret `demo-essentielle`, modifiable depuis l'administration.
 */
export const demoEssentielle: Accommodation = {
  id: "demo-essentielle",
  slug: "demo-essentielle",
  isActive: true,
  offerType: "essential",
  template: "essential",

  owner: {
    name: "Camille Ferrand",
    email: "camille@closdesoliviers.fr",
    phone: "06 24 71 08 33",
  },
  property: {
    name: "Le Clos des Oliviers",
    type: "Maison de village",
    address: "14 rue des Remparts, 84160 Lourmarin",
    city: "Lourmarin",
    welcomeMessage: "",
    gallery: [],
    timezone: "Europe/Paris",
  },

  wifi: { ssid: "ClosDesOliviers", password: "Lourmarin2026" },
  codes: [
    { label: "Portail de la rue", value: "14A72" },
    { label: "Boîte à clés", value: "3081" },
  ],

  practicalInfo: {
    checkin: "16h00",
    checkout: "10h30",
    arrivalNotes:
      "La boîte à clés est fixée à gauche du portail, sous la boîte aux lettres.\nEntrez le code, récupérez le trousseau, et refermez bien le clapet.",
    departureNotes:
      "Laissez les clés dans la boîte, code inchangé. Un message me suffit pour me prévenir de votre départ.",
    parking: "Place réservée n°3 dans la cour, entrée par la rue des Remparts",
    departureInstructions: [
      { text: "Sortir les poubelles (containers au bout de la rue)", required: true },
      { text: "Lancer le lave-vaisselle", required: false },
      { text: "Fermer les volets du rez-de-chaussée", required: true },
      { text: "Remettre les clés dans la boîte", required: true },
    ],
  },

  rules: [
    "Logement non-fumeur à l'intérieur",
    "Pas de fête ni d'événement",
    "Calme entre 22h et 8h — les murs sont anciens",
    "Animaux acceptés sur demande préalable",
  ],

  contacts: [
    { label: "Gardien", name: "Marc Aubry", phone: "06 11 45 22 90", type: "other" },
    { label: "Ménage", name: "Sonia", phone: "06 78 90 12 34", type: "other" },
    { label: "SAMU", name: "SAMU", phone: "15", type: "emergency" },
    { label: "Pompiers", name: "Pompiers", phone: "18", type: "emergency" },
    { label: "Police", name: "Police", phone: "17", type: "emergency" },
    { label: "Urgences Europe", name: "Urgences Europe", phone: "112", type: "emergency" },
  ],

  equipments: [],
  recommendations: [],
  pointsOfInterest: [],
  transportLines: [],

  comfortOptions: {
    faq: [],
    upsells: [],
    theme: { primaryColor: "#5A7A4E", fontFamily: "classic" },
    enabledLanguages: ["fr"],
  },

  display: { weather: false, map: false, desktopLayout: "list" },

  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const demoConfort: Accommodation = {
  ...demoEssentielle,
  id: "demo-confort",
  slug: "demo-confort",
  offerType: "comfort",
  owner: { name: "Conciergerie L'Écrin", email: "contact@ecrin-dor.fr", phone: "06 98 76 54 32" },
  property: {
    name: "Villa L'Écrin d'Or",
    type: "Villa de prestige",
    city: "Cannes",
    welcomeMessage: "Bienvenue à la Villa L'Écrin d'Or. Plongez dans un univers d'exception où chaque détail a été pensé pour votre confort absolu. Laissez-vous séduire par la sérénité des lieux et profitez pleinement de cette expérience unique sur la Côte d'Azur.",
    mainImageUrl: "https://images.unsplash.com/photo-1613490900233-0fa4cb4be562?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    logoUrl: "https://ui-avatars.com/api/?name=V+E&background=1A1510&color=E8BE72&bold=true&size=256"
  },
  practicalInfo: { 
    checkin: "À partir de 16h00 (Accueil VIP)", 
    checkout: "Jusqu'à 12h00", 
    parking: "Double garage sécurisé & Voiturier sur demande", 
    breakfast: "Panier gourmand livré tous les matins à 8h30" 
  },
  wifi: { ssid: "ECRIN_DOR_5G", password: "LuxuryStay2024" },
  recommendations: [
    { 
      title: "La Palme d'Or", category: "Gastronomique (2 Étoiles Michelin)", distance: "10 min en voiture", description: "Une expérience culinaire inoubliable face à la baie de Cannes.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    { 
      title: "Plage du Martinez", category: "Plage Privée", distance: "15 min", description: "Bain de soleil et cocktails signature sur les mythiques transats blancs.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1548504781-a6a1ceef1c71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    { 
      title: "Spa Marin", category: "Bien-être", distance: "5 min", description: "Massages sur mesure et parcours aquatique chauffé.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    { 
      title: "Croisière Îles de Lérins", category: "À découvrir", distance: "Départ Vieux Port", description: "Embarquez pour une journée d'évasion sur notre yacht partenaire.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ],
  comfortOptions: {
    transports: "Un service de transfert privé depuis l'aéroport de Nice est inclus dans votre réservation.\nLa gare TGV se trouve à 15 minutes. Un chauffeur reste à votre entière disposition.",
    faq: [
      { question: "Comment activer le jacuzzi de la terrasse ?", answer: "Utilisez la tablette tactile située dans le salon, rubrique 'Domotique > Extérieur'." },
      { question: "Où se trouve le système son Devialet ?", answer: "Vous pouvez vous y connecter en Bluetooth en sélectionnant 'Villa_Ecrin_Audio' sur votre smartphone." }
    ],
    theme: { primaryColor: "#D4A34A", fontFamily: "classic" as const }
  }
};

export const demoConfortMarseille: Accommodation = {
  id: "demo-confort2",
  slug: "demo-confort2",
  offerType: "comfort",
  template: "cleo",
  isActive: true,
  owner: {
    name: "Sophie & Marc",
    email: "hote@demo.fr",
    phone: "06 12 34 56 78",
    reportEmail: "hote@demo.fr",
  },
  property: {
    name: "Bienvenue à Marseille",
    type: "Penthouse",
    address: "Traverse Parangon, La Pointe-Rouge, 8e Arrondissement, Marseille, Bouches-du-Rhône, France",
    city: "Marseille",
    timezone: "Europe/Paris",
    // Position réelle du logement : sert au calcul des distances des bonnes
    // adresses et au relevé météo du quartier plutôt que du centre-ville.
    latitude: 43.2419,
    longitude: 5.3733,
    welcomeMessage: "Votre guide pour profiter du 8e, entre la mer et la Bonne mère",
    mainImageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80",
    logoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=70",
    gallery: [
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  wifi: {
    ssid: "Penthouse_Prado",
    password: "Bienvenue2026"
  },
  codes: [
    { label: "Code portail principal", value: "1842#" },
    { label: "Code hall d'immeuble", value: "4321A#" },
    { label: "Interphone", value: "Sonnette n°12" },
    { label: "Place de parking", value: "N°42 (sous-sol)" }
  ],
  practicalInfo: {
    checkin: "14h00",
    checkout: "10h00",
    parking: "Place de parking réservée n°42 au sous-sol sécurisé.",
    breakfast: "Non inclus. Boulangeries et cafés à 5 min à pied.",
    arrivalNotes: "L'arrivée se fait à partir de 14h00. La boîte à clés sécurisée est située à l'entrée du penthouse. Un code unique vous sera communiqué par SMS le matin même.",
    departureNotes: "Merci de bien vouloir quitter les lieux avant 10h00 pour permettre le ménage.",
    departureInstructions: [
      { text: "Déposer les clés dans la boîte à clés de l'entrée", required: true },
      { text: "Fermer les fenêtres et les volets des deux terrasses", required: true },
      { text: "Éteindre la climatisation et les lumières", required: true },
      { text: "Lancer le lave-vaisselle si nécessaire", required: false },
      { text: "Sortir les poubelles dans le local du sous-sol", required: false }
    ]
  },
  rules: [
    "Logement strictement non-fumeur à l'intérieur (terrasses autorisées)",
    "Fêtes et événements strictly interdits",
    "Respect du voisinage et du calme après 22h00",
    "Animaux de compagnie acceptés uniquement sur demande préalable",
    "Fermer les fenêtres et éteindre la climatisation lors des sorties",
    "Ranger la vaisselle propre avant le départ"
  ],
  contacts: [
    { label: "Sophie & Marc", name: "Vos Hôtes", phone: "06 12 34 56 78", type: "owner" },
    { label: "SAMU", name: "Urgences Médicales", phone: "15", type: "emergency" },
    { label: "Pompiers", name: "Secours Pompiers", phone: "18", type: "emergency" },
    { label: "Police Secours", name: "Police", phone: "17", type: "emergency" },
    { label: "Hôpital Saint-Joseph", name: "Services Urgences", phone: "04 91 80 65 00", type: "service" },
    { label: "Pharmacie du Stade Vélodrome", name: "Pharmacie", phone: "04 91 22 00 00", type: "service" }
  ],
  recommendations: [
    {
      title: "Pizzeria La Bonne Mère MARSEILLE",
      category: "Restaurant",
      type: "restaurant",
      distance: "5,9 km · 85 min à pied · 15 min en voiture",
      description: "Restaurant de style détendu servant des pizzas à base d'ingrédients bio ainsi que des pichets de vins italiens et français.",
      rating: 4.5,
      reviews: 940,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Pizzeria+La+Bonne+Mère+Marseille",
      comment: "Incontournable pour goûter les meilleures pizzas artisanales de Marseille !"
    },
    {
      title: "Plage des Catalans",
      category: "Plage",
      type: "decouvrir",
      distance: "7,1 km · 96 min à pied · 19 min en voiture",
      description: "Située près du centre-ville, cette petite plage animée idéale pour la baignade et le bronzage comprend des terrains de beach-volley.",
      rating: 4.0,
      reviews: 4691,
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Plage+des+Catalans+Marseille"
    },
    {
      title: "Plage du Prophète",
      category: "Plage",
      type: "decouvrir",
      distance: "4,5 km · 61 min à pied · 16 min en voiture",
      description: "Une des plus anciennes plages de sable de Marseille, familiale et peu profonde.",
      rating: 4.0,
      reviews: 2213,
      imageUrl: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Plage+du+Prophète+Marseille"
    },
    {
      title: "SportBeach",
      category: "Restaurant",
      type: "restaurant",
      distance: "1,5 km · plages du Prado",
      description: "Restaurant en bord de mer avec piscine et lounge, face aux îles du Frioul.",
      rating: 3.9,
      reviews: 4010,
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/SportBeach+Marseille",
      comment: "Coup de cœur pour un apéritif au coucher du soleil."
    },
    {
      title: "Pierrot Coquillages",
      category: "Restaurant",
      type: "restaurant",
      distance: "800 m · avenue du Prado",
      description: "Institution marseillaise réputée pour ses plteaux de coquillages et fruits de mer ultra-frais.",
      rating: 4.5,
      reviews: 1417,
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Pierrot+Coquillages+Marseille"
    },
    {
      title: "Le Café des Thés",
      category: "Bar",
      type: "restaurant",
      distance: "600 m",
      description: "Salon de thé cosy, pâtisseries maison et sélection de thés d'exception.",
      rating: 4.6,
      reviews: 402,
      imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Le+Café+des+Thés+Marseille"
    },
    {
      title: "Escale Borély",
      category: "Commerce",
      type: "decouvrir",
      distance: "1,8 km",
      description: "Promenade animée en bord de mer bordée de cafés, glaciers et boutiques.",
      rating: 4.3,
      reviews: 7264,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Escale+Borély+Marseille"
    },
    {
      title: "Parc Borély",
      category: "Activité",
      type: "decouvrir",
      distance: "1,5 km",
      description: "Grand parc ombragé de 17 hectares avec lac, roseraie et jardins botaniques.",
      rating: 4.5,
      reviews: 14066,
      imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Parc+Borély+Marseille"
    },
    {
      title: "Calanque de Sormiou",
      category: "Activité",
      type: "decouvrir",
      distance: "20 min en voiture",
      description: "Spectaculaire crique aux eaux turquoises au cœur du Parc national des Calanques.",
      rating: 4.5,
      reviews: 1007,
      imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Calanque+de+Sormiou+Marseille"
    },
    {
      title: "Orange Vélodrome",
      category: "Activité",
      type: "decouvrir",
      distance: "1,2 km · 15 min à pied",
      description: "Stade mythique de l'Olympique de Marseille : matchs, concerts et visites guidées.",
      rating: 4.6,
      reviews: 41401,
      imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Orange+Vélodrome+Marseille"
    }
  ],
  equipments: [
    { title: "Wi-Fi fibre 1 Gb/s", desc: "Mot de passe et codes dans la rubrique dédiée.", icon: "🌐" },
    { title: "TV 4K & Netflix", desc: "Allumez la TV, sélectionnez l'entrée HDMI 1. Netflix est pré-connecté.", icon: "📺" },
    { title: "Cuisine entièrement équipée", desc: "Plaques à induction, four à chaleur tournante, micro-ondes.", icon: "🍳" },
    { title: "Nespresso & bouilloire", desc: "Capsules fournies sur le plan de travail à votre arrivée.", icon: "☕" },
    { title: "Lave-vaisselle", desc: "Tablettes d'entretien sous l'évier. Programme Eco 50° recommandé.", icon: "🍽️" },
    { title: "Lave-linge", desc: "Lessive disponible dans le placard de la salle de bain.", icon: "🧺" },
    { title: "Climatisation réversible", desc: "Télécommande sur le mur du salon. Merci de fermer les fenêtres.", icon: "❄️" },
    { title: "Espace de travail", desc: "Bureau avec prises et port USB à disposition.", icon: "💻" },
    { title: "Parking privé (place n°42)", desc: "Place réservée en sous-sol. Bip d'accès accroché au trousseau.", icon: "🚗" },
    { title: "Linge & serviettes fournis", desc: "Draps de lit et serviettes de bain préparés pour vous.", icon: "🛌" },
    { title: "Sèche-cheveux & fer à repasser", desc: "Rangés dans le meuble de salle de bain.", icon: "💨" },
    { title: "Deux terrasses", desc: "Mobilier de jardin et transats disponibles.", icon: "☀️" }
  ],
  pointsOfInterest: [],
  transportLines: [
    { type: "Métro", lines: ["M2"], station: "Rond-Point du Prado (terminus)", distance: "~500 m" },
    { type: "Bus", lines: ["19", "83"], station: "Rond-Point du Prado → plages", distance: "~500 m" },
    { type: "Bus", lines: ["72"], station: "Rond-Point du Prado → Vieux-Port", distance: "~500 m" },
    { type: "Tram", lines: ["T3"], station: "Sainte-Marguerite Dromel", distance: "~10 min" },
    { type: "Train", lines: ["TER"], station: "Gare Marseille Saint-Charles", distance: "~15 min en métro" }
  ],
  transportLink: {
    url: "https://www.rtm.fr",
    label: "Voir le réseau RTM (plans & horaires)"
  },
  comfortOptions: {
    enabledLanguages: ["fr", "en", "es", "it"],
    transports: "Métro M2 (Rond-Point du Prado), Bus 19, 83, 72. Accès direct aux plages et au Vieux-Port.",
    faq: [
      { question: "Peut-on accéder à la terrasse la nuit ?", answer: "Oui, jusqu'à 22h00. Merci de respecter le calme du voisinage au-delà." },
      { question: "Y a-t-il un ascenseur ?", answer: "Oui, il dessert le sous-sol (parking) jusqu'au dernier étage." }
    ],
    upsells: [
      {
        id: "petit-dejeuner",
        title: "Petit-déjeuner livré",
        description: "Viennoiseries de la boulangerie du coin, jus pressé et café, livrés devant la porte à l'heure de votre choix.",
        price: 12,
        priceUnit: "per_person",
        icon: "🥐"
      },
      {
        id: "arrivee-anticipee",
        title: "Arrivée anticipée",
        description: "Accédez au logement dès 11h00 selon disponibilité, pour poser vos bagages et profiter de la journée.",
        price: 25,
        priceUnit: "per_stay",
        icon: "🕚"
      },
      {
        id: "menage-fin-sejour",
        title: "Ménage de fin de séjour renforcé",
        description: "Vous partez sans rien ranger : on s'occupe de tout, vaisselle et poubelles comprises.",
        price: 45,
        priceUnit: "per_stay",
        icon: "🧽"
      }
    ],
    theme: {
      primaryColor: "#1D64B4",
      fontFamily: "modern"
    }
  },
  // Traductions du contenu : les tableaux suivent l’ordre de la version
  // française, l’entrée n° 3 traduit la règle n° 3.
  translations: {
    "en": {
      "property": {
        "name": "Welcome to Marseille",
        "type": "Penthouse",
        "welcomeMessage": "Your guide to the 8th arrondissement, between the sea and the Bonne Mère."
      },
      "practicalInfo": {
        "arrivalNotes": "Check-in is from 2:00 pm. The secure key box is at the entrance to the penthouse. A one-time code will be texted to you on the morning of your arrival.",
        "departureNotes": "Please vacate the apartment before 10:00 am so the cleaning team can get started.",
        "parking": "Reserved parking space no. 42 in the secure underground car park.",
        "breakfast": "Not included. Bakeries and cafés are a 5-minute walk away."
      },
      "departureInstructions": [
        "Leave the keys in the key box by the entrance",
        "Close the windows and shutters on both terraces",
        "Switch off the air conditioning and the lights",
        "Run the dishwasher if needed",
        "Take the bins down to the basement waste room"
      ],
      "rules": [
        "Strictly no smoking indoors (terraces are fine)",
        "Parties and events are not permitted",
        "Please respect the neighbours and keep quiet after 10:00 pm",
        "Pets welcome by prior arrangement only",
        "Close the windows and switch off the air conditioning when you go out",
        "Put the clean dishes away before you leave"
      ],
      "codes": [
        "Main gate code",
        "Building entrance code",
        "Intercom",
        "Parking space"
      ],
      "contacts": [
        {
          "label": "Sophie & Marc",
          "name": "Your hosts"
        },
        {
          "label": "SAMU",
          "name": "Medical emergencies"
        },
        {
          "label": "Fire brigade",
          "name": "Fire & rescue"
        },
        {
          "label": "Police",
          "name": "Police emergencies"
        },
        {
          "label": "Saint-Joseph Hospital",
          "name": "Accident & emergency"
        },
        {
          "label": "Stade Vélodrome pharmacy",
          "name": "Pharmacy"
        }
      ],
      "equipments": [
        {
          "title": "1 Gb/s fibre Wi-Fi",
          "desc": "Password and codes are in the dedicated section."
        },
        {
          "title": "4K TV & Netflix",
          "desc": "Switch the TV on and select input HDMI 1. Netflix is already signed in."
        },
        {
          "title": "Fully equipped kitchen",
          "desc": "Induction hob, fan-assisted oven, microwave."
        },
        {
          "title": "Nespresso & kettle",
          "desc": "Capsules are left on the worktop for your arrival."
        },
        {
          "title": "Dishwasher",
          "desc": "Tablets are under the sink. The Eco 50° cycle works best."
        },
        {
          "title": "Washing machine",
          "desc": "Detergent is in the bathroom cupboard."
        },
        {
          "title": "Reversible air conditioning",
          "desc": "Remote on the living-room wall. Please keep the windows closed."
        },
        {
          "title": "Workspace",
          "desc": "Desk with power sockets and a USB port."
        },
        {
          "title": "Private parking (space no. 42)",
          "desc": "Reserved space in the basement. The entry fob is on the keyring."
        },
        {
          "title": "Linen & towels provided",
          "desc": "Bed linen and bath towels are ready for you."
        },
        {
          "title": "Hairdryer & iron",
          "desc": "In the bathroom cabinet."
        },
        {
          "title": "Two terraces",
          "desc": "Garden furniture and sun loungers available."
        }
      ],
      "recommendations": [
        {
          "title": "Pizzeria La Bonne Mère",
          "category": "Restaurant",
          "description": "Relaxed spot serving organic pizzas alongside carafes of Italian and French wine.",
          "comment": "A must for the best artisan pizzas in Marseille!"
        },
        {
          "title": "Plage des Catalans",
          "category": "Beach",
          "description": "A small, lively beach near the city centre, great for swimming and sunbathing, with beach volleyball courts."
        },
        {
          "title": "Plage du Prophète",
          "category": "Beach",
          "description": "One of Marseille's oldest sandy beaches — family-friendly and shallow."
        },
        {
          "title": "SportBeach",
          "category": "Restaurant",
          "description": "Seafront restaurant with a pool and lounge, facing the Frioul islands.",
          "comment": "A favourite for sunset drinks."
        },
        {
          "title": "Pierrot Coquillages",
          "category": "Restaurant",
          "description": "A Marseille institution, famous for its ultra-fresh shellfish and seafood platters."
        },
        {
          "title": "Le Café des Thés",
          "category": "Bar",
          "description": "Cosy tea room with homemade pastries and an exceptional tea selection."
        },
        {
          "title": "Escale Borély",
          "category": "Shopping",
          "description": "A lively seafront promenade lined with cafés, ice-cream parlours and shops."
        },
        {
          "title": "Parc Borély",
          "category": "Activity",
          "description": "A vast 17-hectare shaded park with a lake, a rose garden and botanical gardens."
        },
        {
          "title": "Calanque de Sormiou",
          "category": "Activity",
          "description": "A spectacular turquoise cove in the heart of the Calanques National Park."
        },
        {
          "title": "Orange Vélodrome",
          "category": "Activity",
          "description": "The legendary Olympique de Marseille stadium: matches, concerts and guided tours."
        }
      ],
      "transportLines": [
        {
          "type": "Metro",
          "station": "Rond-Point du Prado (terminus)"
        },
        {
          "type": "Bus",
          "station": "Rond-Point du Prado → beaches"
        },
        {
          "type": "Bus",
          "station": "Rond-Point du Prado → Old Port"
        },
        {
          "type": "Tram",
          "station": "Sainte-Marguerite Dromel"
        },
        {
          "type": "Train",
          "station": "Marseille Saint-Charles station"
        }
      ],
      "upsells": [
        {
          "title": "Breakfast delivered",
          "description": "Pastries from the local bakery, fresh juice and coffee, delivered to your door at a time of your choosing."
        },
        {
          "title": "Early check-in",
          "description": "Get into the apartment from 11:00 am, subject to availability — drop your bags and enjoy the day."
        },
        {
          "title": "Full end-of-stay cleaning",
          "description": "Leave without tidying a thing: we handle everything, dishes and bins included."
        }
      ],
      "faq": [
        {
          "question": "Can we use the terrace at night?",
          "answer": "Yes, until 10:00 pm. Please keep the noise down out of respect for the neighbours after that."
        },
        {
          "question": "Is there a lift?",
          "answer": "Yes, it runs from the basement (car park) to the top floor."
        }
      ]
    },
    "es": {
      "property": {
        "name": "Bienvenidos a Marsella",
        "type": "Ático",
        "welcomeMessage": "Tu guía para disfrutar del distrito 8, entre el mar y la Bonne Mère."
      },
      "practicalInfo": {
        "arrivalNotes": "La entrada es a partir de las 14:00. La caja de llaves segura está en la entrada del ático. Recibirás un código único por SMS la misma mañana.",
        "departureNotes": "Te rogamos que dejes el alojamiento antes de las 10:00 para permitir la limpieza.",
        "parking": "Plaza de aparcamiento reservada n.º 42 en el sótano vigilado.",
        "breakfast": "No incluido. Panaderías y cafeterías a 5 minutos a pie."
      },
      "departureInstructions": [
        "Deja las llaves en la caja de llaves de la entrada",
        "Cierra las ventanas y las persianas de las dos terrazas",
        "Apaga el aire acondicionado y las luces",
        "Pon el lavavajillas si hace falta",
        "Baja la basura al cuarto del sótano"
      ],
      "rules": [
        "Prohibido fumar en el interior (las terrazas sí están permitidas)",
        "No se permiten fiestas ni eventos",
        "Respeta al vecindario y guarda silencio a partir de las 22:00",
        "Mascotas admitidas únicamente con acuerdo previo",
        "Cierra las ventanas y apaga el aire acondicionado al salir",
        "Guarda la vajilla limpia antes de marcharte"
      ],
      "codes": [
        "Código de la verja principal",
        "Código del portal",
        "Interfono",
        "Plaza de aparcamiento"
      ],
      "contacts": [
        {
          "label": "Sophie & Marc",
          "name": "Tus anfitriones"
        },
        {
          "label": "SAMU",
          "name": "Urgencias médicas"
        },
        {
          "label": "Bomberos",
          "name": "Emergencias"
        },
        {
          "label": "Policía",
          "name": "Policía"
        },
        {
          "label": "Hospital Saint-Joseph",
          "name": "Urgencias"
        },
        {
          "label": "Farmacia del Stade Vélodrome",
          "name": "Farmacia"
        }
      ],
      "equipments": [
        {
          "title": "Wi-Fi fibra 1 Gb/s",
          "desc": "La contraseña y los códigos están en la sección correspondiente."
        },
        {
          "title": "TV 4K y Netflix",
          "desc": "Enciende la tele y selecciona la entrada HDMI 1. Netflix ya está conectado."
        },
        {
          "title": "Cocina totalmente equipada",
          "desc": "Placa de inducción, horno con ventilador, microondas."
        },
        {
          "title": "Nespresso y hervidor",
          "desc": "Cápsulas disponibles en la encimera a tu llegada."
        },
        {
          "title": "Lavavajillas",
          "desc": "Pastillas debajo del fregadero. Recomendamos el programa Eco 50°."
        },
        {
          "title": "Lavadora",
          "desc": "Detergente en el armario del baño."
        },
        {
          "title": "Aire acondicionado reversible",
          "desc": "Mando en la pared del salón. Cierra las ventanas al usarlo."
        },
        {
          "title": "Zona de trabajo",
          "desc": "Escritorio con enchufes y puerto USB."
        },
        {
          "title": "Aparcamiento privado (plaza n.º 42)",
          "desc": "Plaza reservada en el sótano. El mando está en el llavero."
        },
        {
          "title": "Ropa de cama y toallas",
          "desc": "Sábanas y toallas preparadas para ti."
        },
        {
          "title": "Secador y plancha",
          "desc": "En el mueble del baño."
        },
        {
          "title": "Dos terrazas",
          "desc": "Mobiliario de jardín y tumbonas disponibles."
        }
      ],
      "recommendations": [
        {
          "title": "Pizzeria La Bonne Mère",
          "category": "Restaurante",
          "description": "Local desenfadado con pizzas de ingredientes ecológicos y jarras de vino italiano y francés.",
          "comment": "¡Imprescindible para probar las mejores pizzas artesanas de Marsella!"
        },
        {
          "title": "Playa des Catalans",
          "category": "Playa",
          "description": "Pequeña playa animada cerca del centro, ideal para bañarse y tomar el sol, con pistas de vóley-playa."
        },
        {
          "title": "Playa du Prophète",
          "category": "Playa",
          "description": "Una de las playas de arena más antiguas de Marsella, familiar y de poca profundidad."
        },
        {
          "title": "SportBeach",
          "category": "Restaurante",
          "description": "Restaurante frente al mar con piscina y lounge, con vistas a las islas del Frioul.",
          "comment": "Nuestro favorito para un aperitivo al atardecer."
        },
        {
          "title": "Pierrot Coquillages",
          "category": "Restaurante",
          "description": "Institución marsellesa famosa por sus mariscadas y pescados ultrafrescos."
        },
        {
          "title": "Le Café des Thés",
          "category": "Bar",
          "description": "Salón de té acogedor, con repostería casera y una selección de tés excepcional."
        },
        {
          "title": "Escale Borély",
          "category": "Comercio",
          "description": "Animado paseo marítimo lleno de cafeterías, heladerías y tiendas."
        },
        {
          "title": "Parque Borély",
          "category": "Actividad",
          "description": "Gran parque de 17 hectáreas con lago, rosaleda y jardines botánicos."
        },
        {
          "title": "Cala de Sormiou",
          "category": "Actividad",
          "description": "Espectacular cala de aguas turquesas en el corazón del Parque Nacional de las Calanques."
        },
        {
          "title": "Orange Vélodrome",
          "category": "Actividad",
          "description": "El mítico estadio del Olympique de Marsella: partidos, conciertos y visitas guiadas."
        }
      ],
      "transportLines": [
        {
          "type": "Metro",
          "station": "Rond-Point du Prado (final de línea)"
        },
        {
          "type": "Autobús",
          "station": "Rond-Point du Prado → playas"
        },
        {
          "type": "Autobús",
          "station": "Rond-Point du Prado → Puerto Viejo"
        },
        {
          "type": "Tranvía",
          "station": "Sainte-Marguerite Dromel"
        },
        {
          "type": "Tren",
          "station": "Estación Marseille Saint-Charles"
        }
      ],
      "upsells": [
        {
          "title": "Desayuno a domicilio",
          "description": "Bollería de la panadería del barrio, zumo natural y café, entregados en la puerta a la hora que prefieras."
        },
        {
          "title": "Entrada anticipada",
          "description": "Accede al alojamiento desde las 11:00 según disponibilidad, deja las maletas y aprovecha el día."
        },
        {
          "title": "Limpieza final reforzada",
          "description": "Márchate sin recoger nada: nos ocupamos de todo, vajilla y basura incluidas."
        }
      ],
      "faq": [
        {
          "question": "¿Se puede usar la terraza de noche?",
          "answer": "Sí, hasta las 22:00. A partir de esa hora, te pedimos respetar el descanso del vecindario."
        },
        {
          "question": "¿Hay ascensor?",
          "answer": "Sí, va desde el sótano (aparcamiento) hasta la última planta."
        }
      ]
    },
    "it": {
      "property": {
        "name": "Benvenuti a Marsiglia",
        "type": "Attico",
        "welcomeMessage": "La tua guida per goderti l'8° arrondissement, tra il mare e la Bonne Mère."
      },
      "practicalInfo": {
        "arrivalNotes": "Il check-in è a partire dalle 14:00. La cassetta portachiavi di sicurezza si trova all'ingresso dell'attico. Riceverai un codice monouso via SMS la mattina stessa.",
        "departureNotes": "Ti chiediamo di lasciare l'alloggio entro le 10:00 per consentire le pulizie.",
        "parking": "Posto auto riservato n. 42 nel garage interrato sorvegliato.",
        "breakfast": "Non incluso. Panetterie e caffè a 5 minuti a piedi."
      },
      "departureInstructions": [
        "Lascia le chiavi nella cassetta all'ingresso",
        "Chiudi le finestre e le persiane delle due terrazze",
        "Spegni il climatizzatore e le luci",
        "Avvia la lavastoviglie se necessario",
        "Porta i rifiuti nel locale al piano interrato"
      ],
      "rules": [
        "Vietato fumare all'interno (terrazze consentite)",
        "Feste ed eventi non sono ammessi",
        "Rispetta il vicinato e il silenzio dopo le 22:00",
        "Animali ammessi solo previo accordo",
        "Chiudi le finestre e spegni il climatizzatore quando esci",
        "Riponi le stoviglie pulite prima di partire"
      ],
      "codes": [
        "Codice del cancello principale",
        "Codice del portone",
        "Citofono",
        "Posto auto"
      ],
      "contacts": [
        {
          "label": "Sophie & Marc",
          "name": "I tuoi host"
        },
        {
          "label": "SAMU",
          "name": "Emergenze mediche"
        },
        {
          "label": "Vigili del fuoco",
          "name": "Soccorso"
        },
        {
          "label": "Polizia",
          "name": "Polizia"
        },
        {
          "label": "Ospedale Saint-Joseph",
          "name": "Pronto soccorso"
        },
        {
          "label": "Farmacia Stade Vélodrome",
          "name": "Farmacia"
        }
      ],
      "equipments": [
        {
          "title": "Wi-Fi fibra 1 Gb/s",
          "desc": "Password e codici si trovano nella sezione dedicata."
        },
        {
          "title": "TV 4K e Netflix",
          "desc": "Accendi la TV e seleziona l'ingresso HDMI 1. Netflix è già collegato."
        },
        {
          "title": "Cucina completamente attrezzata",
          "desc": "Piano a induzione, forno ventilato, microonde."
        },
        {
          "title": "Nespresso e bollitore",
          "desc": "Capsule a disposizione sul piano di lavoro al tuo arrivo."
        },
        {
          "title": "Lavastoviglie",
          "desc": "Pastiglie sotto il lavello. Consigliato il programma Eco 50°."
        },
        {
          "title": "Lavatrice",
          "desc": "Detersivo nell'armadietto del bagno."
        },
        {
          "title": "Climatizzatore reversibile",
          "desc": "Telecomando sulla parete del soggiorno. Tieni le finestre chiuse."
        },
        {
          "title": "Angolo di lavoro",
          "desc": "Scrivania con prese elettriche e porta USB."
        },
        {
          "title": "Parcheggio privato (posto n. 42)",
          "desc": "Posto riservato nell'interrato. Il telecomando è sul portachiavi."
        },
        {
          "title": "Biancheria e asciugamani",
          "desc": "Lenzuola e asciugamani già pronti per te."
        },
        {
          "title": "Asciugacapelli e ferro da stiro",
          "desc": "Nel mobile del bagno."
        },
        {
          "title": "Due terrazze",
          "desc": "Mobili da giardino e lettini a disposizione."
        }
      ],
      "recommendations": [
        {
          "title": "Pizzeria La Bonne Mère",
          "category": "Ristorante",
          "description": "Locale informale con pizze a base di ingredienti biologici e caraffe di vino italiano e francese.",
          "comment": "Imperdibile per le migliori pizze artigianali di Marsiglia!"
        },
        {
          "title": "Spiaggia des Catalans",
          "category": "Spiaggia",
          "description": "Piccola spiaggia vivace vicino al centro, ideale per nuotare e prendere il sole, con campi da beach volley."
        },
        {
          "title": "Spiaggia du Prophète",
          "category": "Spiaggia",
          "description": "Una delle spiagge di sabbia più antiche di Marsiglia, adatta alle famiglie e poco profonda."
        },
        {
          "title": "SportBeach",
          "category": "Ristorante",
          "description": "Ristorante sul mare con piscina e lounge, di fronte alle isole del Frioul.",
          "comment": "Il nostro preferito per un aperitivo al tramonto."
        },
        {
          "title": "Pierrot Coquillages",
          "category": "Ristorante",
          "description": "Istituzione marsigliese famosa per i suoi plateau di frutti di mare freschissimi."
        },
        {
          "title": "Le Café des Thés",
          "category": "Bar",
          "description": "Sala da tè accogliente, con pasticceria fatta in casa e una selezione di tè eccezionale."
        },
        {
          "title": "Escale Borély",
          "category": "Negozi",
          "description": "Vivace passeggiata sul mare costellata di caffè, gelaterie e negozi."
        },
        {
          "title": "Parco Borély",
          "category": "Attività",
          "description": "Grande parco ombreggiato di 17 ettari con lago, roseto e giardini botanici."
        },
        {
          "title": "Calanque de Sormiou",
          "category": "Attività",
          "description": "Spettacolare cala dalle acque turchesi nel cuore del Parco nazionale delle Calanques."
        },
        {
          "title": "Orange Vélodrome",
          "category": "Attività",
          "description": "Il mitico stadio dell'Olympique Marsiglia: partite, concerti e visite guidate."
        }
      ],
      "transportLines": [
        {
          "type": "Metro",
          "station": "Rond-Point du Prado (capolinea)"
        },
        {
          "type": "Autobus",
          "station": "Rond-Point du Prado → spiagge"
        },
        {
          "type": "Autobus",
          "station": "Rond-Point du Prado → Vieux-Port"
        },
        {
          "type": "Tram",
          "station": "Sainte-Marguerite Dromel"
        },
        {
          "type": "Treno",
          "station": "Stazione Marseille Saint-Charles"
        }
      ],
      "upsells": [
        {
          "title": "Colazione consegnata",
          "description": "Cornetti della panetteria del quartiere, spremuta e caffè, consegnati alla porta all'orario che preferisci."
        },
        {
          "title": "Check-in anticipato",
          "description": "Accedi all'alloggio dalle 11:00 secondo disponibilità: lascia i bagagli e goditi la giornata."
        },
        {
          "title": "Pulizia finale completa",
          "description": "Parti senza sistemare nulla: pensiamo a tutto noi, stoviglie e rifiuti compresi."
        }
      ],
      "faq": [
        {
          "question": "Si può usare la terrazza di sera?",
          "answer": "Sì, fino alle 22:00. Dopo quell'ora ti chiediamo di rispettare la quiete del vicinato."
        },
        {
          "question": "C'è l'ascensore?",
          "answer": "Sì, collega il piano interrato (parcheggio) all'ultimo piano."
        }
      ]
    }
  },
  display: { weather: true, map: true, desktopLayout: "grid" },
  // Configuration des rubriques du livret : ordre d'affichage et visibilité.
  modules: [
    { id: "arrivee", visible: true, order: 0 },
    { id: "wifi", visible: true, order: 1 },
    { id: "contacts", visible: true, order: 2 },
    { id: "depart", visible: true, order: 3 },
    { id: "bienvenue", visible: true, order: 4 },
    { id: "reglement", visible: true, order: 5 },
    { id: "equipements", visible: true, order: 6 },
    { id: "adresses", visible: true, order: 7 },
    { id: "transports", visible: true, order: 8 },
    { id: "faq", visible: true, order: 9 },
    { id: "livredor", visible: false, order: 10 }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export const demoParis: Accommodation = {
  id: "demo-paris",
  slug: "demo-paris",
  offerType: "comfort",
  template: "cleo",
  isActive: true,
  owner: {
    name: "Alexandre & Camille",
    email: "paris@demo-guidz.fr",
    phone: "06 23 45 67 89",
    reportEmail: "paris@demo-guidz.fr",
  },
  property: {
    name: "Le Loft Haussmannien",
    type: "Appartement d'Exception",
    address: "18 Rue de la Chaussée d'Antin, 75009 Paris, France",
    city: "Paris",
    timezone: "Europe/Paris",
    latitude: 48.8719,
    longitude: 2.3316,
    welcomeMessage: "Bienvenue au cœur du 9e arrondissement, entre l'Opéra Garnier et les Grands Boulevards. Profitez du charme haussmannien avec moulures, parquet point de Hongrie et balcon filant.",
    mainImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    logoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=70",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  wifi: {
    ssid: "Loft_Haussmann_Fibre",
    password: "OperaParis2026"
  },
  codes: [
    { label: "Code rue (porte d'entrée)", value: "28A47" },
    { label: "Code hall d'immeuble", value: "9102B" },
    { label: "Étage & Porte", value: "3e étage avec ascenseur - Porte Droite" },
    { label: "Boîte à clés (entrée)", value: "Code: 7509 (sur la grille à gauche)" },
    { label: "Local vélos", value: "Clé sur le trousseau principal" }
  ],
  practicalInfo: {
    checkin: "15h00",
    checkout: "11h00",
    parking: "Pas de parking privé. Parking public payant INDIGO Haussmann-Lafayette à 150 m.",
    breakfast: "Non inclus. Boulangeries artisanales et cafés mythiques à 2 min à pied.",
    arrivalNotes: "L'accès se fait via digicode et boîte à clés. Les instructions détaillées et le code vous sont envoyés par SMS le matin de votre arrivée.",
    departureNotes: "Merci de bien vouloir libérer le loft avant 11h00 afin de permettre le nettoyage pour les voyageurs suivants.",
    departureInstructions: [
      { text: "Replacer la clé dans la boîte sécurisée à l'entrée", required: true },
      { text: "Fermer les portes-fenêtres du balcon filant", required: true },
      { text: "Éteindre les lumières et la climatisation / chauffage", required: true },
      { text: "Déposer les poubelles dans le local de la cour intérieure", required: false },
      { text: "Rincer et ranger les tasses dans le lave-vaisselle", required: false }
    ]
  },
  rules: [
    "Logement strictement non-fumeur à l'intérieur (balcon autorisé avec cendrier)",
    "Fêtes et soirées strictement interdites (immeuble haussmannien résidentiel)",
    "Respect absolu du calme du voisinage à partir de 22h00",
    "Chaussures à talons évitées sur le parquet ancien d'époque",
    "Animaux de compagnie non admis",
    "Fermer les fenêtres lorsque la climatisation est activée"
  ],
  contacts: [
    { label: "Alexandre & Camille", name: "Vos Hôtes", phone: "06 23 45 67 89", type: "owner" },
    { label: "SAMU", name: "Urgences Médicales", phone: "15", type: "emergency" },
    { label: "Pompiers", name: "Secours Pompiers", phone: "18", type: "emergency" },
    { label: "Police Secours", name: "Police", phone: "17", type: "emergency" },
    { label: "Hôpital Lariboisière", name: "Urgences 24/7", phone: "01 49 95 65 65", type: "service" },
    { label: "Pharmacie des Opéras", name: "Pharmacie", phone: "01 42 65 52 75", type: "service" }
  ],
  recommendations: [
    {
      title: "Bouillon Chartier",
      category: "Restaurant",
      type: "restaurant",
      distance: "400 m · 5 min à pied",
      description: "Institution parisienne mythique servant une cuisine française traditionnelle dans un décor Belle Époque classé.",
      rating: 4.4,
      reviews: 18200,
      imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Bouillon+Chartier+Paris",
      comment: "Incontournable pour l'ambiance et les classiques à prix très doux !"
    },
    {
      title: "Rooftop Galeries Lafayette Haussmann",
      category: "À découvrir",
      type: "decouvrir",
      distance: "200 m · 3 min à pied",
      description: "Terrasse panoramique gratuite au 8ème étage avec vue imprenable sur l'Opéra Garnier et la Tour Eiffel.",
      rating: 4.7,
      reviews: 9500,
      imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Galeries+Lafayette+Haussmann+Paris"
    },
    {
      title: "Palais Garnier - Opéra de Paris",
      category: "Culture",
      type: "decouvrir",
      distance: "350 m · 4 min à pied",
      description: "Chef-d'œuvre d'architecture du XIXe siècle, visites libres ou guidées du grand escalier et de la salle de spectacle.",
      rating: 4.8,
      reviews: 32100,
      imageUrl: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Palais+Garnier+Paris"
    },
    {
      title: "Le Grand Colbert",
      category: "Restaurant",
      type: "restaurant",
      distance: "700 m · 9 min à pied",
      description: "Brasserie parisienne chic classée monument historique, réputée pour ses sélections de coquillages et sa sole meunière.",
      rating: 4.5,
      reviews: 4200,
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Le+Grand+Colbert+Paris"
    },
    {
      title: "Café de la Paix",
      category: "Bar",
      type: "restaurant",
      distance: "300 m · 4 min à pied",
      description: "Café historique face à l'Opéra Garnier, idéal pour un chocolat chaud gourmand ou un apéritif élégant.",
      rating: 4.3,
      reviews: 5100,
      imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Cafe+de+la+Paix+Paris"
    },
    {
      title: "Mamiche Boulangerie",
      category: "Commerce",
      type: "decouvrir",
      distance: "600 m · 7 min à pied",
      description: "Boulangerie artisanale ultra-populaire pour son pain au levain, ses babkas au chocolat et ses croissants pur beurre.",
      rating: 4.7,
      reviews: 2100,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Mamiche+Boulangerie+Paris"
    }
  ],
  equipments: [
    { title: "Wi-Fi Fibre 1 Gb/s", desc: "Codes Wi-Fi dans la rubrique dédiée.", icon: "🌐" },
    { title: "Smart TV OLED 65\" avec Netflix", desc: "Accès gratuit aux applications de streaming pré-configurées.", icon: "📺" },
    { title: "Cuisine sur mesure & Nespresso", desc: "Capsules Vertuo et sélection de thés Mariage Frères offertes.", icon: "☕" },
    { title: "Lave-linge séchant", desc: "Lessive hypoallergénique sous l'évier.", icon: "🧺" },
    { title: "Espace Télétravail Premium", desc: "Grand bureau en chêne avec écran 27\" 4K et hub USB-C.", icon: "💻" },
    { title: "Climatisation & Chauffage central", desc: "Climatisation silencieuse réversible pour un confort optimal.", icon: "❄️" },
    { title: "Enceinte Bluetooth Marshall", desc: "Connectez votre smartphone sur 'Marshall_Haussmann'.", icon: "🎵" },
    { title: "Linge & Draps de luxe", desc: "Draps en gaze de coton et serviettes moelleuses 600g/m².", icon: "🛌" }
  ],
  pointsOfInterest: [],
  transportLines: [
    { type: "Métro", lines: ["M3", "M7", "M8", "M9"], station: "Opéra / Chaussée d'Antin", distance: "150 m" },
    { type: "RER", lines: ["RER A"], station: "Auber (accès direct Châtelet & La Défense)", distance: "250 m" },
    { type: "Bus", lines: ["68", "20", "32"], station: "Chaussée d'Antin - Haussmann", distance: "100 m" },
    { type: "Train", lines: ["TGV"], station: "Gare Saint-Lazare", distance: "8 min à pied" }
  ],
  transportLink: {
    url: "https://www.ratp.fr",
    label: "Voir le réseau RATP (horaires & itinéraires en direct)"
  },
  comfortOptions: {
    enabledLanguages: ["fr", "en", "es", "it"],
    transports: "Métro M3, M7, M8, M9 (Opéra / Chaussée d'Antin), RER A (Auber), Gare Saint-Lazare à 8 min.",
    faq: [
      { question: "Y a-t-il un ascenseur dans l'immeuble ?", answer: "Oui, un ascenseur parisien dessert le 3ème étage." },
      { question: "Où se trouve le local poubelles ?", answer: "Dans la première cour intérieure au rez-de-chaussée sur votre droite." }
    ],
    upsells: [
      {
        id: "petit-dejeuner-parisien",
        title: "Petit-déjeuner parisien livré",
        description: "Croissants croustillants de chez Mamiche, baguette fraîche, jus d'orange pressé et confitures maison livrés à 8h30.",
        price: 15,
        priceUnit: "per_person",
        icon: "🥐"
      },
      {
        id: "depart-tardif",
        title: "Départ tardif (Late Check-out 14h)",
        description: "Profitez de votre matinée et conservez le loft jusqu'à 14h00 selon disponibilité.",
        price: 35,
        priceUnit: "per_stay",
        icon: "🕚"
      },
      {
        id: "chauffeur-aeroport",
        title: "Transfert Chauffeur Privé VTC",
        description: "Accueil personnalisé aux aéroports Paris-CDG / Orly ou en Gare Saint-Lazare.",
        price: 75,
        priceUnit: "per_stay",
        icon: "🚘"
      }
    ],
    theme: {
      primaryColor: "#8B263E",
      fontFamily: "classic"
    }
  },
  translations: {
    en: {
      property: {
        name: "The Haussmann Loft",
        type: "Luxury Apartment",
        welcomeMessage: "Welcome to the heart of the 9th arrondissement, between Opéra Garnier and Grands Boulevards. Enjoy Haussmannian charm with moldings, herringbone parquet, and a balcony."
      },
      practicalInfo: {
        arrivalNotes: "Self check-in via key pad and lockbox. Detailed instructions will be texted on arrival morning.",
        departureNotes: "Please check out before 11:00 am so the cleaning team can prepare the loft for the next guests.",
        parking: "No private parking. Public paid parking INDIGO Haussmann-Lafayette is 150m away.",
        breakfast: "Not included. Bakery and iconic cafés 2 minutes away."
      },
      departureInstructions: [
        "Put the key back into the lockbox by the entrance",
        "Close the balcony windows",
        "Turn off lights and air conditioning / heating",
        "Take out the trash to the courtyard bin room",
        "Rinse and load cups into the dishwasher"
      ],
      rules: [
        "Strictly non-smoking indoors (balcony allowed with ashtray)",
        "No parties or events (residential Haussmannian building)",
        "Respect quiet hours after 10:00 pm",
        "Avoid high heels on vintage parquet floors",
        "No pets allowed",
        "Keep windows closed while air conditioning is running"
      ]
    },
    es: {
      property: {
        name: "El Loft Haussmanniano",
        type: "Apartamento de Lujo",
        welcomeMessage: "Bienvenido al corazón del distrito 9, entre la Ópera Garnier y los Grandes Bulevares. Disfruta del encanto haussmanniano con molduras, parqué y balcón."
      },
      practicalInfo: {
        arrivalNotes: "Entrada autónoma mediante código y caja de llaves. Instrucciones detalladas por SMS el día de llegada.",
        departureNotes: "Le rogamos salir antes de las 11:00 para la limpieza.",
        parking: "Sin parking privado. Aparcamiento público INDIGO Haussmann-Lafayette a 150 m.",
        breakfast: "No incluido. Panaderías y cafeterías a 2 min."
      },
      departureInstructions: [
        "Dejar la llave en la caja de llaves de la entrada",
        "Cerrar los ventanales del balcón",
        "Apagar luces y climatización / calefacción",
        "Bajar la basura al cuarto del patio interior",
        "Aclarar y poner las tazas en el lavavajillas"
      ],
      rules: [
        "Estrictamente no fumadores en el interior (balcón permitido con cenicero)",
        "Fiestas y eventos prohibidos",
        "Respetar el silencio a partir de las 22:00",
        "Evitar tacones sobre el parqué antiguo",
        "No se admiten mascotas",
        "Cerrar ventanas al usar el aire acondicionado"
      ]
    },
    it: {
      property: {
        name: "Il Loft Haussmanniano",
        type: "Appartamento di Lusso",
        welcomeMessage: "Benvenuti nel cuore del 9° arrondissement, tra l'Opéra Garnier e i Grands Boulevards. Godetevi il fascino haussmanniano con modanature, parquet e balcone."
      },
      practicalInfo: {
        arrivalNotes: "Accesso autonomo con tastiera e cassetta chiavi. Istruzioni inviate via SMS la mattina dell'arrivo.",
        departureNotes: "Si prega di liberare il loft entro le 11:00 per le pulizie.",
        parking: "Nessun parcheggio privato. Parcheggio pubblico a pagamento INDIGO Haussmann-Lafayette a 150 m.",
        breakfast: "Non inclusa. Panetterie e caffè a 2 min a piedi."
      },
      departureInstructions: [
        "Riporre la chiave nella cassetta all'ingresso",
        "Chiudere le porte finestre del balcone",
        "Spegnere luci e aria condizionata / riscaldamento",
        "Portare i rifiuti nel cortile interno",
        "Sciacquare e caricare le tazze nella lavastoviglie"
      ],
      rules: [
        "Rigorosamente vietato fumare all'interno (balcone consentito con portacenere)",
        "Feste ed eventi vietati",
        "Rispetto del silenzio dalle 22:00",
        "Evitare tacchi alti sul parquet d'epoca",
        "Animali non ammessi",
        "Chiudere le finestre quando l'aria condizionata è accesa"
      ]
    }
  },
  display: { weather: true, map: true, desktopLayout: "grid" },
  modules: [
    { id: "arrivee", visible: true, order: 0 },
    { id: "wifi", visible: true, order: 1 },
    { id: "contacts", visible: true, order: 2 },
    { id: "depart", visible: true, order: 3 },
    { id: "bienvenue", visible: true, order: 4 },
    { id: "reglement", visible: true, order: 5 },
    { id: "equipements", visible: true, order: 6 },
    { id: "adresses", visible: true, order: 7 },
    { id: "transports", visible: true, order: 8 },
    { id: "faq", visible: true, order: 9 },
    { id: "livredor", visible: false, order: 10 }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export const demoBiarritz: Accommodation = {
  id: "demo-biarritz",
  slug: "demo-biarritz",
  offerType: "comfort",
  template: "cleo",
  isActive: true,
  owner: {
    name: "Guillaume & Hélène",
    email: "biarritz@demo-guidz.fr",
    phone: "06 34 56 78 90",
    reportEmail: "biarritz@demo-guidz.fr",
  },
  property: {
    name: "La Villa Bleue Ocean",
    type: "Villa en Bord de Mer",
    address: "12 Boulevard Prince de Galles, 64200 Biarritz, France",
    city: "Biarritz",
    timezone: "Europe/Paris",
    latitude: 43.4832,
    longitude: -1.5586,
    welcomeMessage: "Bienvenue à La Villa Bleue, surplombant la mythique Côte des Basques. Réveillez-vous au son de l'océan, profitez du jardin suspendu et rejoignez les spots de surf en 3 minutes à pied.",
    mainImageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=70",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613490900233-0fa4cb4be562?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  wifi: {
    ssid: "VillaBleue_Ocean_5G",
    password: "SurfBiarritz2026"
  },
  codes: [
    { label: "Code portail automatique", value: "6420#" },
    { label: "Serrure connectée villa", value: "Code par SMS le jour J" },
    { label: "Code local planches & surf", value: "1957" },
    { label: "Parking privé", value: "2 places réservées dans l'allée" }
  ],
  practicalInfo: {
    checkin: "16h00",
    checkout: "10h30",
    parking: "2 places privées gratuites dans l'enceinte fermée de la villa.",
    breakfast: "Non inclus. Panier gourmand basque disponible en option.",
    arrivalNotes: "Entrée autonome via serrure connectée. Votre code personnalisé valide durant tout le séjour vous est transmis à 12h00 le jour J.",
    departureNotes: "Merci de libérer la villa avant 10h30 pour permettre l'intervention de l'équipe de ménage.",
    departureInstructions: [
      { text: "Rincer les combinaisons et planches à la douche extérieure", required: true },
      { text: "Ranger les planches de surf dans le local sécurisé", required: true },
      { text: "Éteindre la plancha extérieure et couper le gaz", required: true },
      { text: "Fermer les stores banne et verrouiller la baie vitrée", required: true },
      { text: "Déposer le linge usagé dans le bac de la buanderie", required: false }
    ]
  },
  rules: [
    "Logement non-fumeur à l'intérieur (terrasses et jardin autorisés)",
    "Rincer impérativement le sable à la douche extérieure avant d'entrer",
    "Fêtes et rassemblements bruyants interdits",
    "Respect de la tranquillité du quartier résidentiel après 22h00",
    "Animaux admis uniquement sur accord préalable"
  ],
  contacts: [
    { label: "Guillaume & Hélène", name: "Vos Hôtes", phone: "06 34 56 78 90", type: "owner" },
    { label: "CROSS / Secours Mer", name: "Sauvetage Mer", phone: "196", type: "emergency" },
    { label: "SAMU", name: "Urgences Médicales", phone: "15", type: "emergency" },
    { label: "Pompiers", name: "Secours Pompiers", phone: "18", type: "emergency" },
    { label: "Clinique Aguilera", name: "Urgences Biarritz", phone: "05 59 41 33 33", type: "service" },
    { label: "Pharmacie de la Côte", name: "Pharmacie", phone: "05 59 24 01 89", type: "service" }
  ],
  recommendations: [
    {
      title: "Le Surfing",
      category: "Restaurant",
      type: "restaurant",
      distance: "300 m · Côte des Basques",
      description: "Restaurant emblématique surplombant la plage, idéal pour un déjeuner bowl / burger face aux vagues et aux surfeurs.",
      rating: 4.5,
      reviews: 1450,
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Le+Surfing+Biarritz",
      comment: "Coup de cœur pour le coucher de soleil !"
    },
    {
      title: "Le Bar Jean",
      category: "Restaurant",
      type: "restaurant",
      distance: "800 m · Les Halles",
      description: "Institution conviviale des Halles de Biarritz réputée pour ses tapas basques, chipirons à la plancha et sangria.",
      rating: 4.4,
      reviews: 3200,
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Le+Bar+Jean+Biarritz"
    },
    {
      title: "Les Halles de Biarritz",
      category: "Commerce",
      type: "decouvrir",
      distance: "750 m · 9 min à pied",
      description: "Marché couvert vibrant pour déguster gâteau basque, jambon de Bayonne et oysters fraîches auprès des producteurs locaux.",
      rating: 4.7,
      reviews: 6800,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Les+Halles+Biarritz"
    },
    {
      title: "Plage de la Côte des Basques",
      category: "Plage",
      type: "decouvrir",
      distance: "250 m · 3 min à pied",
      description: "Berceau du surf en Europe, encadré par des falaises spectaculaires avec vue sur les côtes espagnoles.",
      rating: 4.8,
      reviews: 8900,
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Cote+des+Basques+Biarritz"
    },
    {
      title: "Rocher de la Vierge",
      category: "À découvrir",
      type: "decouvrir",
      distance: "1,2 km · 15 min à pied",
      description: "Monument emblématique relié à la terre par une passerelle métallique attribuée à Gustave Eiffel, battu par les vagues.",
      rating: 4.6,
      reviews: 14200,
      imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Rocher+de+la+Vierge+Biarritz"
    }
  ],
  equipments: [
    { title: "Wi-Fi Fibre Haut Débit", desc: "Mot de passe et accès dans la rubrique Wi-Fi.", icon: "🌐" },
    { title: "Planches de Surf & Combis", desc: "4 planches (foam & longboards) en accès libre dans le local à surf.", icon: "🏄" },
    { title: "Douche extérieure chauffée", desc: "Idéale au retour de plage pour rincer le sable et le sel.", icon: "🚿" },
    { title: "Plancha Forge Adour", desc: "Sur la terrasse extérieure. Bouteille de gaz de rechange en buanderie.", icon: "🍳" },
    { title: "Système audio Sonos", desc: "Sonos Arc & Move dans le salon et la terrasse.", icon: "🎵" },
    { title: "2 Vélos électriques (E-bikes)", desc: "Casques et antivols disponibles dans le garage.", icon: "🚲" },
    { title: "Cuisine équipée & Cave à vin", desc: "Nespresso, lave-vaisselle, cave à vin régulée.", icon: "🍷" },
    { title: "Transats & Salons de jardin", desc: "Mobilier de terrasse et bains de soleil au jardin.", icon: "☀️" }
  ],
  pointsOfInterest: [],
  transportLines: [
    { type: "Bus", lines: ["Ligne 38", "Ligne 4"], station: "Square d'Alsace / Côte des Basques", distance: "200 m" },
    { type: "Navette", lines: ["N11"], station: "Navette Gratuite Centre-Ville Biarritz", distance: "150 m" },
    { type: "Train", lines: ["TGV"], station: "Gare de Biarritz (La Négresse)", distance: "8 min en voiture" },
    { type: "Avion", lines: ["Aéroport"], station: "Aéroport Biarritz-Pays Basque (BIQ)", distance: "12 min en voiture" }
  ],
  transportLink: {
    url: "https://www.txiktxak.fr",
    label: "Voir le réseau Txik Txak (plans & horaires des bus)"
  },
  comfortOptions: {
    enabledLanguages: ["fr", "en", "es", "it"],
    transports: "Bus Txik Txak ligne 38/4, Navette gratuite centre-ville, Gare TGV Biarritz à 8 min.",
    faq: [
      { question: "Où se trouve la clé du local à surf ?", answer: "Dans le petit boîtier mural à côté de la douche extérieure." },
      { question: "Comment fonctionne la plancha ?", answer: "Ouvrez la vanne de la bouteille de gaz sous la plancha puis activez l'allumage piezo." }
    ],
    upsells: [
      {
        id: "cours-surf-prive",
        title: "Cours de surf privé (2h)",
        description: "Session sur mesure à la Côte des Basques avec un moniteur diplômé d'État, matériel complet fourni.",
        price: 65,
        priceUnit: "per_person",
        icon: "🏄"
      },
      {
        id: "panier-gourmand-basque",
        title: "Panier gourmand du Pays Basque",
        description: "Jambon Kintoa, fromage d'Ossau-Iraty, gâteau basque artisanal et bouteille d'Irouléguy.",
        price: 40,
        priceUnit: "per_stay",
        icon: "🍷"
      },
      {
        id: "menage-mi-sejour",
        title: "Ménage de mi-séjour & linge frais",
        description: "Nettoyage complet de la villa et remplacement des serviettes au milieu de votre séjour.",
        price: 80,
        priceUnit: "per_stay",
        icon: "🧹"
      }
    ],
    theme: {
      primaryColor: "#1A6B85",
      fontFamily: "modern"
    }
  },
  translations: {
    en: {
      property: {
        name: "Villa Bleue Ocean",
        type: "Seafront Villa",
        welcomeMessage: "Welcome to Villa Bleue, overlooking the legendary Côte des Basques. Wake up to ocean sounds, enjoy the garden, and hit surf spots in 3 minutes."
      },
      practicalInfo: {
        arrivalNotes: "Self check-in via smart lock. Custom code delivered via SMS on arrival day.",
        departureNotes: "Please vacate before 10:30 am for house cleaning.",
        parking: "2 free private parking spaces inside the gated villa.",
        breakfast: "Not included. Basque hamper option available."
      },
      departureInstructions: [
        "Rinse wetsuits and boards at the outdoor shower",
        "Store surfboards in the secure room",
        "Turn off outdoor plancha grill and gas valve",
        "Close awnings and lock sliding doors",
        "Drop used towels in the laundry basket"
      ],
      rules: [
        "Non-smoking indoors (terraces and garden allowed)",
        "Rinse off sand at outdoor shower before entering",
        "No parties or noisy gatherings",
        "Respect quiet neighborhood after 10:00 pm",
        "Pets allowed by prior agreement only"
      ]
    },
    es: {
      property: {
        name: "La Villa Bleue Ocean",
        type: "Villa Frente al Mar",
        welcomeMessage: "Bienvenido a La Villa Bleue, sobre la mítica Côte des Basques. Despiértate con el sonido del océano y llega a los spots de surf en 3 minutos."
      },
      practicalInfo: {
        arrivalNotes: "Entrada autónoma con cerradura inteligente. Código enviado por SMS a las 12:00.",
        departureNotes: "Por favor libere la villa antes de las 10:30.",
        parking: "2 plazas de aparcamiento privadas en el recinto de la villa.",
        breakfast: "No incluido. Cesta gourmand vasca disponible."
      },
      departureInstructions: [
        "Aclarar trajes y tablas en la ducha exterior",
        "Guardar las tablas en el local seguro",
        "Apagar la plancha exterior y cerrar el gas",
        "Cerrar toldos y bloquear puertas correderas",
        "Dejar la ropa usada en el cesto de la colada"
      ],
      rules: [
        "No fumar en el interior (terrazas y jardín permitidos)",
        "Aclarar la arena en la ducha exterior antes de entrar",
        "Fiestas y eventos prohibidos",
        "Respetar el descanso del vecindario tras las 22:00",
        "Mascotas previa consulta"
      ]
    },
    it: {
      property: {
        name: "La Villa Bleue Ocean",
        type: "Villa Fronte Mare",
        welcomeMessage: "Benvenuti a La Villa Bleue, affacciata sulla leggendaria Côte des Basques. Svegliatevi con il suono dell'oceano e raggiungete i surf spot in 3 minuti."
      },
      practicalInfo: {
        arrivalNotes: "Check-in autonomo tramite serratura intelligente. Codice inviato via SMS il giorno dell'arrivo.",
        departureNotes: "Si prega di lasciare la villa entro le 10:30.",
        parking: "2 posti auto privati gratuiti all'interno della villa.",
        breakfast: "Non inclusa. Cesto gastronomico basco disponibile."
      },
      departureInstructions: [
        "Sciacquare mute e tavole nella doccia esterna",
        "Riporre le tavole da surf nel locale sicuro",
        "Spegnere la piastra esterna e chiudere il gas",
        "Chiudere le tende da sole e bloccare le vetrate",
        "Mettere la biancheria usata nella lavanderia"
      ],
      rules: [
        "Vietato fumare all'interno (terrazze e giardino consentiti)",
        "Sciacquare la sabbia nella doccia esterna prima di entrare",
        "Feste e serate rumorose vietate",
        "Rispetto del silenzio nel quartiere dopo le 22:00",
        "Animali ammessi solo su richiesta"
      ]
    }
  },
  display: { weather: true, map: true, desktopLayout: "grid" },
  modules: [
    { id: "arrivee", visible: true, order: 0 },
    { id: "wifi", visible: true, order: 1 },
    { id: "contacts", visible: true, order: 2 },
    { id: "depart", visible: true, order: 3 },
    { id: "bienvenue", visible: true, order: 4 },
    { id: "reglement", visible: true, order: 5 },
    { id: "equipements", visible: true, order: 6 },
    { id: "adresses", visible: true, order: 7 },
    { id: "transports", visible: true, order: 8 },
    { id: "faq", visible: true, order: 9 },
    { id: "livredor", visible: false, order: 10 }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
};

export const demoChamonix: Accommodation = {
  id: "demo-chamonix",
  slug: "demo-chamonix",
  offerType: "comfort",
  template: "cleo",
  isActive: true,
  owner: {
    name: "Mathieu & Sophie",
    email: "chamonix@demo-guidz.fr",
    phone: "06 45 67 89 01",
    reportEmail: "chamonix@demo-guidz.fr",
  },
  property: {
    name: "Le Chalet Altitude 2000",
    type: "Chalet & Spa Montagne",
    address: "45 Route des Praz, 74400 Chamonix-Mont-Blanc, France",
    city: "Chamonix-Mont-Blanc",
    timezone: "Europe/Paris",
    latitude: 45.9237,
    longitude: 6.8694,
    welcomeMessage: "Bienvenue au Chalet Altitude 2000. Profitez d'une vue époustouflante sur la chaîne du Mont-Blanc, détendez-vous dans notre sauna privé après une journée de ski et vivez l'expérience alpine ultime.",
    mainImageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80",
    logoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=70",
    gallery: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  wifi: {
    ssid: "Altitude2000_Chalet_5G",
    password: "MontBlanc2026"
  },
  codes: [
    { label: "Code digicode chalet", value: "7440B" },
    { label: "Code ski room / casier skis", value: "2000" },
    { label: "Sauna privatif", value: "Activable depuis le boîtier salon" },
    { label: "Garage couvert chauffé", value: "Télécommande sur le trousseau" }
  ],
  practicalInfo: {
    checkin: "16h00",
    checkout: "10h00",
    parking: "Garage couvert chauffé 2 véhicules avec borne de recharge pour véhicule électrique.",
    breakfast: "Non inclus. Service livraison pains & traiteur savoyard disponible.",
    arrivalNotes: "Arrivée autonome. Le trousseau de clés et la télécommande de garage se trouvent dans le boîtier à clé sécurisé du ski room.",
    departureNotes: "Merci de bien vouloir libérer le chalet avant 10h00 pour le déneigement des accès et le ménage.",
    departureInstructions: [
      { text: "Ranger les skis et chaussures dans le ski-room chauffé", required: true },
      { text: "Vérifier l'extinction complète du poêle à bois et poser le pare-feu", required: true },
      { text: "Baisser le chauffage sur le mode Éco (17°C)", required: true },
      { text: "Lancer le lave-vaisselle avec les appareils à fondue / raclette rincés", required: true },
      { text: "Éteindre le sauna scandinave", required: false }
    ]
  },
  rules: [
    "Chaussures de ski et de randonnée strictement interdites dans les pièces à vivre",
    "Fumer est strictement interdit à l'intérieur (balcons autorisés avec cendrier)",
    "Ne jamais laisser le poêle à bois allumé sans surveillance ou sans le pare-feu",
    "Respect du calme du hameau des Praz à partir de 22h00",
    "Accès au sauna réservé exclusivement aux résidents du chalet"
  ],
  contacts: [
    { label: "Mathieu & Sophie", name: "Vos Hôtes", phone: "06 45 67 89 01", type: "owner" },
    { label: "Secours Montagne / PGHM", name: "Secours Montagne", phone: "04 50 53 16 89", type: "emergency" },
    { label: "SAMU Urgences", name: "Urgences Médicales", phone: "15", type: "emergency" },
    { label: "Pompiers", name: "Secours Pompiers", phone: "18", type: "emergency" },
    { label: "Hôpital de Sallanches", name: "Urgences 24h", phone: "04 50 89 30 30", type: "service" },
    { label: "Pharmacie du Mont-Blanc", name: "Pharmacie Chamonix", phone: "04 50 53 10 43", type: "service" }
  ],
  recommendations: [
    {
      title: "La Calèche",
      category: "Restaurant",
      type: "restaurant",
      distance: "1,5 km · Chamonix centre",
      description: "Restaurant typique savoyard au décor authentique d'alpage servant fondues, raclettes à l'ancienne et tartiflettes.",
      rating: 4.6,
      reviews: 2850,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/La+Caleche+Chamonix",
      comment: "Incontournable pour une soirée raclette au feu de bois !"
    },
    {
      title: "Aiguille du Midi & Téléphérique",
      category: "À découvrir",
      type: "decouvrir",
      distance: "2 km · 5 min en skibus",
      description: "Ascension mythique à 3 842 mètres d'altitude face au Mont-Blanc avec la célèbre cabine 'Pas dans le vide'.",
      rating: 4.8,
      reviews: 24500,
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Aiguille+du+Midi+Chamonix"
    },
    {
      title: "QC Terme Chamonix",
      category: "Bien-être",
      type: "decouvrir",
      distance: "1,1 km · 12 min à pied",
      description: "Spa thermal d'exception avec bains bouillonnants extérieurs chauffés face au glacier des Bossons et au Mont-Blanc.",
      rating: 4.7,
      reviews: 3100,
      imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/QC+Terme+Chamonix"
    },
    {
      title: "Mer de Glace & Train du Montenvers",
      category: "À découvrir",
      type: "decouvrir",
      distance: "1,8 km · 20 min à pied",
      description: "Voyage en train à crémaillère rouge vers la Mer de Glace et la Grotte de Glace taillée dans le glacier.",
      rating: 4.7,
      reviews: 11200,
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Montenvers+Mer+de+Glace+Chamonix"
    },
    {
      title: "Restaurant Albert 1er",
      category: "Restaurant",
      type: "restaurant",
      distance: "1,4 km",
      description: "Table gastronomique 2 étoiles Michelin célébrant les saveurs alpines et les produits du terroir savoyard.",
      rating: 4.8,
      reviews: 920,
      imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
      mapsUrl: "https://www.google.com/maps/search/Restaurant+Albert+1er+Chamonix"
    }
  ],
  equipments: [
    { title: "Wi-Fi Fibre Haut Débit", desc: "Connexion rapide dans tout le chalet.", icon: "🌐" },
    { title: "Ski Room Privé Chauffé", desc: "Racks à skis et sèche-chaussures chauffants individuels.", icon: "🎿" },
    { title: "Sauna Scandinave Privé", desc: "Sauna en cèdre rouge accessible 24/7 dans le chalet.", icon: "♨️" },
    { title: "Poêle à bois traditionnel", desc: "Bûches et allume-feux fournis gratuitement dans la réserve.", icon: "🪵" },
    { title: "Appareils à Fondue & Raclette", desc: "2 appareils traditionnels à rampes et caquelons en fonte.", icon: "🧀" },
    { title: "Smart TV 4K 55\" avec Netflix", desc: "Canal+ Sport, Disney+ et Netflix inclus.", icon: "📺" },
    { title: "Borne de recharge véhicule électrique", desc: "Wallbox 7 kW dans le garage couvert.", icon: "⚡" },
    { title: "Garage couvert chauffé", desc: "2 places fermées avec accès direct intérieur.", icon: "🚗" }
  ],
  pointsOfInterest: [],
  transportLines: [
    { type: "Skibus", lines: ["Ligne 1", "Ligne 2"], station: "Les Praz - Téléphérique Flégère", distance: "100 m (Gratuit avec Pass)" },
    { type: "Train", lines: ["Mont-Blanc Express"], station: "Gare des Praz de Chamonix", distance: "300 m" },
    { type: "Train", lines: ["SNCF / TGV"], station: "Gare de Chamonix-Mont-Blanc", distance: "5 min en skibus" },
    { type: "Navette", lines: ["Chamo'n Bus"], station: "Navette centre-ville Chamonix", distance: "150 m" }
  ],
  transportLink: {
    url: "https://www.chamonix-mobilite.com",
    label: "Consulter les horaires des Skibus & Train Mont-Blanc Express"
  },
  comfortOptions: {
    enabledLanguages: ["fr", "en", "es", "it"],
    transports: "Skibus gratuit Ligne 1/2 à 100m, Train Mont-Blanc Express gare des Praz à 300m.",
    faq: [
      { question: "Comment allumer le sauna ?", answer: "Activez l'interrupteur principal du boîtier mural 30 min avant votre séance." },
      { question: "Où trouve-t-on le bois de chauffage ?", answer: "Dans la réserve du garage couvert. Un panier garni est disposé près du poêle." }
    ],
    upsells: [
      {
        id: "forfaits-ski-livres",
        title: "Forfaits Ski prêts à l'arrivée",
        description: "Forfaits Chamonix Le Pass / Unlimited préparés et remis en main propre dans votre ski-room.",
        price: 0,
        priceLabel: "Tarif officiel sans surcoût",
        icon: "🎿"
      },
      {
        id: "soiree-fondue-traiteur",
        title: "Kit Fondue Savoyarde & Charcuterie",
        description: "Fromages d'alpage râpés, charcuterie artisanale, pain frais et bouteille de vin de Savoie livrés au chalet.",
        price: 28,
        priceUnit: "per_person",
        icon: "🧀"
      },
      {
        id: "materiel-ski-skiroom",
        title: "Matériel de Ski déposé en Ski-Room",
        description: "Skis, bâtons et chaussures réglés à votre taille et déposés directement dans le chalet.",
        price: 0,
        priceLabel: "Remise -20% partenaire",
        icon: "❄️"
      }
    ],
    theme: {
      primaryColor: "#2B5F75",
      fontFamily: "modern"
    }
  },
  translations: {
    en: {
      property: {
        name: "Altitude 2000 Chalet",
        type: "Mountain Chalet & Spa",
        welcomeMessage: "Welcome to Altitude 2000 Chalet. Enjoy stunning Mont-Blanc views, relax in our private sauna after skiing, and experience the ultimate alpine stay."
      },
      practicalInfo: {
        arrivalNotes: "Self check-in. Keys and garage remote are inside the lockbox in the ski room.",
        departureNotes: "Please check out before 10:00 am for snow clearing and cleaning.",
        parking: "Heated 2-car covered garage with EV charging station.",
        breakfast: "Not included. Bakery delivery and caterer available."
      },
      departureInstructions: [
        "Store skis and boots in the heated ski room",
        "Make sure wood stove is extinguished with fireguard placed",
        "Set heating to Eco mode (17°C)",
        "Run dishwasher with rinsed raclette/fondue sets",
        "Switch off the Scandinavian sauna"
      ],
      rules: [
        "Ski boots and hiking boots strictly prohibited inside living areas",
        "Strictly non-smoking indoors (balconies allowed with ashtray)",
        "Never leave wood stove unattended without fireguard",
        "Respect quiet hours after 10:00 pm in Les Praz hamlet",
        "Sauna access reserved for chalet guests only"
      ]
    },
    es: {
      property: {
        name: "El Chalet Altitude 2000",
        type: "Chalet & Spa de Montaña",
        welcomeMessage: "Bienvenido al Chalet Altitude 2000. Disfruta de vistas al Mont-Blanc, relájate en nuestro sauna privado tras esquiar y vive la experiencia alpina."
      },
      practicalInfo: {
        arrivalNotes: "Entrada autónoma. Llaves y mando de garaje en la caja del ski-room.",
        departureNotes: "Por favor libere el chalet antes de las 10:00.",
        parking: "Garaje cubierto y climatizado para 2 vehículos con punto de recarga EV.",
        breakfast: "No incluido. Servicio de panadería y cátering disponible."
      },
      departureInstructions: [
        "Guardar esquís y botas en el ski-room con calefacción",
        "Comprobar que la estufa de leña está apagada con cortafuegos",
        "Poner la calefacción en modo Eco (17°C)",
        "Poner el lavavajillas con los juegos de fondue/raclette",
        "Apagar el sauna escandinavo"
      ],
      rules: [
        "Botas de esquí y montaña prohibidas en zonas comunes",
        "Fumar strictly prohibido en el interior",
        "No dejar la estufa sin vigilancia ni sin cortafuegos",
        "Respetar el descanso a partir de las 22:00",
        "Sauna exclusivo para huéspedes"
      ]
    },
    it: {
      property: {
        name: "Il Chalet Altitude 2000",
        type: "Chalet & Spa di Montagna",
        welcomeMessage: "Benvenuti al Chalet Altitude 2000. Godetevi viste mozzafiato sul Monte Bianco, rilassatevi nella sauna privata dopo lo sci e vivete un'esperienza alpina."
      },
      practicalInfo: {
        arrivalNotes: "Check-in autonomo. Chiavi e telecomando garagw nella cassetta dello ski-room.",
        departureNotes: "Si prega di lasciare lo chalet entro le 10:00.",
        parking: "Garage coperto e riscaldato per 2 auto con stazione di ricarica EV.",
        breakfast: "Non inclusa. Consegna pane e servizio catering disponibili."
      },
      departureInstructions: [
        "Riporre sci e scarponi nello ski-room riscaldato",
        "Verificare lo spegnimento della stufa a legna con parafuoco",
        "Impostare il riscaldamento su modalità Eco (17°C)",
        "Avviare la lavastoviglie con i set da fonduta e raclette",
        "Spegnere la sauna scandinava"
      ],
      rules: [
        "Scarponi da sci e da trekking vietati nella zona giorno",
        "Fumo vietato all'interno (balconi consentiti)",
        "Mai lasciare la stufa accesa senza sorveglianza",
        "Rispetto del silenzio nel villaggio dalle 22:00",
        "Sauna riservata agli ospiti dello chalet"
      ]
    }
  },
  display: { weather: true, map: true, desktopLayout: "grid" },
  modules: [
    { id: "arrivee", visible: true, order: 0 },
    { id: "wifi", visible: true, order: 1 },
    { id: "contacts", visible: true, order: 2 },
    { id: "depart", visible: true, order: 3 },
    { id: "bienvenue", visible: true, order: 4 },
    { id: "reglement", visible: true, order: 5 },
    { id: "equipements", visible: true, order: 6 },
    { id: "adresses", visible: true, order: 7 },
    { id: "transports", visible: true, order: 8 },
    { id: "faq", visible: true, order: 9 },
    { id: "livredor", visible: false, order: 10 }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
};
