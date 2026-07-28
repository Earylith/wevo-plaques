export type OfferType = "essential" | "comfort";
export type PlanType = OfferType; // alias

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
}

export interface PointOfInterest {
  title: string;
  description: string;
  distance?: string;
  mapsUrl?: string;
  imageUrl?: string;
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

export interface UpsellItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit?: 'per_stay' | 'per_person' | 'per_day';
}

export interface Accommodation {
  id?: string;
  slug: string;
  offerType: OfferType;
  isActive: boolean;
  mustChangePassword?: boolean; // true à la 1ère connexion propriétaire
  ownerUid?: string; // UID Firebase Auth du propriétaire
  
  owner: {
    name: string;
    email: string;
    phone: string;
    slug?: string;
  };
  
  property: {
    name: string;
    type: string; // e.g., "Villa", "Appartement"
    address?: string;
    city: string;
    welcomeMessage: string;
    mainImageUrl?: string;
    logoUrl?: string;
    gallery?: string[];
  };
  
  wifi: {
    ssid: string;
    password?: string;
  };
  
  practicalInfo: {
    checkin: string;
    checkout: string;
    parking?: string;
    breakfast?: string;
  };
  
  rules: string[];
  
  contacts: ContactInfo[];
  recommendations: Recommendation[];
  pointsOfInterest: PointOfInterest[];
  
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
