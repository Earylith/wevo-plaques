"use client";

import { useState } from "react";
import { createAccommodation } from "@/lib/firebase/firestore";

const demoEssentielle = {
  slug: "demo-essentielle",
  isActive: true,
  offerType: "essential" as const,
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
    { label: "La Petite Boire", name: "", phone: "06 12 34 56 78", type: "owner" as const },
    { label: "Urgences", name: "", phone: "112", type: "emergency" as const },
    { label: "Médecin de garde", name: "", phone: "02 47 47 47 47", type: "emergency" as const },
    { label: "Pharmacie de garde", name: "", phone: "32 37", type: "emergency" as const },
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
  }
};

const demoConfort = {
  ...demoEssentielle,
  slug: "demo-confort",
  offerType: "comfort" as const,
  property: {
    ...demoEssentielle.property,
    mainImageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  recommendations: [
    { 
      title: "Le Bistrot de la Place", category: "Cuisine traditionnelle", distance: "5 min", description: "Un charmant bistrot proposant une cuisine locale.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
    },
    { 
      title: "La Table d'à Côté", category: "Gastronomique", distance: "8 min", description: "Restaurant étoilé pour une occasion spéciale.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338988a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
    },
    { 
      title: "Pizza Marco", category: "Pizzeria", distance: "6 min", description: "D'excellentes pizzas au feu de bois.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
    },
    { 
      title: "Château de Villandry", category: "À découvrir", distance: "20 min en voiture", description: "Magnifique château avec des jardins à la française exceptionnels.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1600100397608-f010f419cb96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
    },
    { 
      title: "Bords de Loire", category: "À découvrir", distance: "15 min en voiture", description: "Idéal pour une balade à vélo ou à pied.", mapsUrl: "https://maps.google.com",
      imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
    },
  ],
  comfortOptions: {
    transports: "La gare la plus proche se trouve à 15 minutes en voiture.\nUn arrêt de bus (Ligne 4) est situé à 50 mètres de l'entrée.",
    faq: [
      { question: "Où se trouvent les poubelles ?", answer: "Les conteneurs de tri sont situés à l'entrée du chemin, sur votre droite." },
      { question: "Comment régler le chauffage ?", answer: "Le thermostat se trouve dans le couloir principal. Réglez-le simplement à l'aide des flèches." }
    ],
    theme: { primaryColor: "#7A624E" }
  }
};

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await createAccommodation(demoEssentielle);
      await createAccommodation(demoConfort);
      setDone(true);
    } catch (e) {
      console.error(e);
      alert("Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold mb-4">Générer les démos</h1>
      <button 
        onClick={handleSeed} 
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        {loading ? "Génération..." : "Générer demo-essentielle et demo-confort"}
      </button>
      {done && <p className="mt-4 text-green-600">Démos créées !</p>}
    </div>
  );
}
