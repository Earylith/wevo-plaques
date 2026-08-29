import { Accommodation } from "./types/accommodation";

export const demoEssentielle: Accommodation = {
  id: "demo-essentielle",
  slug: "demo-essentielle",
  isActive: true,
  offerType: "essential",
  owner: { name: "L'équipe La Petite Boire", email: "contact@lapetiteboire.fr", phone: "06 12 34 56 78" },
  property: { 
    name: "La Petite Boire", 
    type: "Chambres d'hôtes", 
    city: "Villandry", 
    welcomeMessage: "Nous sommes ravis de vous accueillir à La Petite Boire. Nous espérons que vous passerez un excellent séjour. Retrouvez ici toutes les informations utiles pour profiter pleinement de votre séjour.",
    mainImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  wifi: { ssid: "LaPetiteBoire_5G", password: "Bienvenue2024" },
  practicalInfo: { 
    checkin: "À partir de 17h", 
    checkout: "Avant 11h", 
    parking: "Parking privé disponible sur place", 
    breakfast: "Servi de 8h30 à 10h" 
  },
  rules: [
    "Merci de ne pas fumer à l'intérieur",
    "Les animaux ne sont pas admis",
    "Merci de respecter le calme après 22h",
    "Merci de fermer les portes et fenêtres en partant"
  ],
  contacts: [
    { label: "La Petite Boire", name: "Réception", phone: "06 12 34 56 78", type: "owner" },
    { label: "Urgences", name: "Secours 112", phone: "112", type: "emergency" },
    { label: "Médecin de garde", name: "Médecin", phone: "02 47 47 47 47", type: "emergency" },
    { label: "Pharmacie de garde", name: "Pharmacie", phone: "32 37", type: "emergency" },
  ],
  recommendations: [
    { title: "Le Bistrot de la Place", category: "Cuisine traditionnelle", distance: "5 min", description: "Un charmant bistrot proposant une cuisine locale.", mapsUrl: "https://maps.google.com" },
    { title: "La Table d'à Côté", category: "Gastronomique", distance: "8 min", description: "Restaurant étoilé pour une occasion spéciale.", mapsUrl: "https://maps.google.com" },
    { title: "Pizza Marco", category: "Pizzeria", distance: "6 min", description: "D'excellentes pizzas au feu de bois.", mapsUrl: "https://maps.google.com" },
    { title: "Château de Villandry", category: "À découvrir", distance: "20 min en voiture", description: "Magnifique château avec des jardins à la française exceptionnels.", mapsUrl: "https://maps.google.com" },
    { title: "Bords de Loire", category: "À découvrir", distance: "15 min en voiture", description: "Idéal pour une balade à vélo ou à pied.", mapsUrl: "https://maps.google.com" },
  ],
  pointsOfInterest: [],
  comfortOptions: {
    transports: "",
    faq: [],
    theme: { primaryColor: "#C4714A" }
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
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
