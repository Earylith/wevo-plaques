"use client";

import { useState } from "react";
import { seedDemos } from "@/app/admin/actions";

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

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedDemos(demoEssentielle, demoConfort);
      setDone(true);
    } catch (e) {
      console.error(e);
      alert("Erreur: " + String(e));
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
