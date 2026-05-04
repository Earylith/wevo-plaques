export type OfferType = "essential" | "comfort";

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

export interface Accommodation {
  id?: string;
  slug: string;
  offerType: OfferType;
  isActive: boolean;
  
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  
  property: {
    name: string;
    type: string; // e.g., "Villa", "Appartement"
    address?: string;
    city: string;
    welcomeMessage: string;
    mainImageUrl?: string;
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
  
  comfortOptions?: {
    enabledLanguages?: string[];
    transports?: string;
    emergencyNumbers?: ContactInfo[];
    faq?: { question: string; answer: string }[];
    customSections?: { title: string; content: string }[];
    theme?: {
      primaryColor?: string;
      backgroundColor?: string;
      style?: "nature" | "modern" | "classic";
    };
  };
  
  createdAt: number;
  updatedAt: number;
}
