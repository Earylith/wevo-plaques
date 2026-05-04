"use client";

import { useState } from "react";
import { Accommodation, OfferType, ContactInfo, Recommendation } from "@/lib/types/accommodation";
import { Plus, Trash, Image as ImageIcon, Star } from "@phosphor-icons/react";
import { uploadImage } from "@/lib/firebase/storage";

interface Props {
  initialData: Accommodation;
  onSubmit: (data: Partial<Accommodation>) => Promise<void>;
  isLoading: boolean;
}

export default function OwnerAccommodationForm({ initialData, onSubmit, isLoading }: Props) {
  const isComfort = initialData.offerType === "comfort";

  const [formData, setFormData] = useState<Partial<Accommodation>>({
    owner: initialData.owner || { name: "", email: "", phone: "" },
    property: initialData.property || { name: "", type: "", city: "", address: "", welcomeMessage: "" },
    wifi: initialData.wifi || { ssid: "", password: "" },
    practicalInfo: initialData.practicalInfo || { checkin: "", checkout: "" },
    rules: initialData.rules || [""],
    contacts: initialData.contacts || [],
    recommendations: initialData.recommendations || [],
    comfortOptions: initialData.comfortOptions || {
      transports: "",
      faq: [],
      theme: { primaryColor: "#C4714A" }
    }
  });

  const handleChange = (section: keyof Accommodation, field: string, value: any) => {
    if (section === "comfortOptions") {
      setFormData((prev) => ({
        ...prev,
        comfortOptions: {
          ...prev.comfortOptions,
          [field]: value,
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      }));
    }
  };

  const handleNestedChange = (section: "comfortOptions", subSection: "theme", field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      comfortOptions: {
        ...prev.comfortOptions,
        [subSection]: {
          ...prev.comfortOptions?.[subSection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section: "rules", index: number, value: string) => {
    const newArray = [...(formData[section] || [])];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [section]: newArray }));
  };

  const handleComplexArrayChange = (section: "contacts" | "recommendations", index: number, field: string, value: any) => {
    const newArray = formData[section] ? [...(formData[section] as any[])] : [];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData((prev) => ({ ...prev, [section]: newArray }));
  };

  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    const newFaq = [...(formData.comfortOptions?.faq || [])];
    newFaq[index] = { ...newFaq[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      comfortOptions: { ...prev.comfortOptions, faq: newFaq }
    }));
  };

  const addArrayItem = (section: string) => {
    if (section === "rules") {
      setFormData((prev) => ({ ...prev, rules: [...(prev.rules || []), ""] }));
    } else if (section === "contacts") {
      setFormData((prev) => ({ ...prev, contacts: [...(prev.contacts || []), { label: "", name: "", phone: "", email: "", whatsapp: "", type: "other" }] }));
    } else if (section === "recommendations") {
      setFormData((prev) => ({ ...prev, recommendations: [...(prev.recommendations || []), { title: "", category: "", type: "restaurant" as const, description: "" }] }));
    } else if (section === "faq") {
      setFormData((prev) => ({
        ...prev,
        comfortOptions: { ...prev.comfortOptions, faq: [...(prev.comfortOptions?.faq || []), { question: "", answer: "" }] }
      }));
    }
  };

  const removeArrayItem = (section: string, index: number) => {
    if (section === "faq") {
      const newFaq = [...(formData.comfortOptions?.faq || [])];
      newFaq.splice(index, 1);
      setFormData((prev) => ({
        ...prev,
        comfortOptions: { ...prev.comfortOptions, faq: newFaq }
      }));
      return;
    }
    const newArray = [...(formData[section as keyof Accommodation] as any[])];
    newArray.splice(index, 1);
    setFormData((prev) => ({ ...prev, [section]: newArray }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Nettoyer les tableaux vides
    const payload = {
      ...formData,
      rules: formData.rules?.filter(r => r.trim()) || [],
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {/* Propriétaire */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
        <h2 className="text-xl font-bold text-[#2A2016] mb-4">Vos informations</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nom complet"
            value={formData.owner?.name || ""}
            onChange={(e) => handleChange("owner", "name", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            required
          />
          <input
            type="email"
            placeholder="Email (contact)"
            value={formData.owner?.email || ""}
            onChange={(e) => handleChange("owner", "email", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            required
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={formData.owner?.phone || ""}
            onChange={(e) => handleChange("owner", "phone", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
          />
        </div>
      </div>

      {/* Logement */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
        <h2 className="text-xl font-bold text-[#2A2016] mb-4">Le logement</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#6B5D4E] mb-1">Nom du logement</label>
          <input
            type="text"
            value={formData.property?.name || ""}
            onChange={(e) => handleChange("property", "name", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#6B5D4E] mb-1">Message de bienvenue</label>
          <textarea
            value={formData.property?.welcomeMessage || ""}
            onChange={(e) => handleChange("property", "welcomeMessage", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            required
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
           <div>
            <label className="block text-sm font-medium text-[#6B5D4E] mb-1">Type (ex: Villa)</label>
            <input
              type="text"
              value={formData.property?.type || ""}
              onChange={(e) => handleChange("property", "type", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-[#6B5D4E] mb-1">Ville</label>
            <input
              type="text"
              value={formData.property?.city || ""}
              onChange={(e) => handleChange("property", "city", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B5D4E] mb-1">Image principale</label>
            <div className="flex gap-2 items-center">
              {formData.property?.mainImageUrl && (
                <img src={formData.property.mainImageUrl} alt="Main" className="w-10 h-10 rounded object-cover shrink-0" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const url = await uploadImage(file, "accommodations/main");
                      handleChange("property", "mainImageUrl", url);
                    } catch (err) {
                      console.error(err);
                      alert("Erreur lors de l'upload");
                    }
                  }
                }}
                className="w-full px-2 py-1.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC] text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C4714A]/10 file:text-[#C4714A] hover:file:bg-[#C4714A]/20"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-[#6B5D4E] mb-1">Adresse (pour le bouton itinéraire)</label>
          <input
            type="text"
            placeholder="Ex: 5 rue de la Paix, 37000 Tours"
            value={formData.property?.address || ""}
            onChange={(e) => handleChange("property", "address", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
          />
        </div>
      </div>

      {/* Wifi & Infos pratiques */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
          <h2 className="text-xl font-bold text-[#2A2016] mb-4">Wi-Fi</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nom du réseau (SSID)"
              value={formData.wifi?.ssid || ""}
              onChange={(e) => handleChange("wifi", "ssid", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
              required
            />
            <input
              type="text"
              placeholder="Mot de passe"
              value={formData.wifi?.password || ""}
              onChange={(e) => handleChange("wifi", "password", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
          <h2 className="text-xl font-bold text-[#2A2016] mb-4">Infos pratiques</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Heure d'arrivée (ex: 15h00)"
                value={formData.practicalInfo?.checkin || ""}
                onChange={(e) => handleChange("practicalInfo", "checkin", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
                required
              />
              <input
                type="text"
                placeholder="Heure de départ (ex: 11h00)"
                value={formData.practicalInfo?.checkout || ""}
                onChange={(e) => handleChange("practicalInfo", "checkout", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Stationnement"
                value={formData.practicalInfo?.parking || ""}
                onChange={(e) => handleChange("practicalInfo", "parking", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
              />
              <input
                type="text"
                placeholder="Petit-déjeuner"
                value={formData.practicalInfo?.breakfast || ""}
                onChange={(e) => handleChange("practicalInfo", "breakfast", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
        <h2 className="text-xl font-bold text-[#2A2016] mb-4">Contacts utiles</h2>
        <div className="space-y-4 mb-4">
          {formData.contacts?.map((contact, index) => (
            <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 bg-[#FBF5EC] p-3 rounded-xl border border-[#EDD9A3]/50">
              <div className="w-full grid sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (ex: Propriétaire)"
                  value={contact.label}
                  onChange={(e) => handleComplexArrayChange("contacts", index, "label", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={contact.name}
                  onChange={(e) => handleComplexArrayChange("contacts", index, "name", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                />
                <input
                  type="text"
                  placeholder="Téléphone"
                  value={contact.phone}
                  onChange={(e) => handleComplexArrayChange("contacts", index, "phone", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                />
                <input
                  type="email"
                  placeholder="Email (optionnel)"
                  value={contact.email || ""}
                  onChange={(e) => handleComplexArrayChange("contacts", index, "email", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                />
                <input
                  type="text"
                  placeholder="WhatsApp (optionnel, ex: +336...)"
                  value={contact.whatsapp || ""}
                  onChange={(e) => handleComplexArrayChange("contacts", index, "whatsapp", e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                />
                <select
                  value={contact.type}
                  onChange={(e) => handleComplexArrayChange("contacts", index, "type", e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                >
                  <option value="owner">Propriétaire</option>
                  <option value="emergency">Urgence</option>
                  <option value="service">Service/Concierge</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <button type="button" onClick={() => removeArrayItem("contacts", index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-start">
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addArrayItem("contacts")} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#5A7A4E] bg-[#EBF0E6] rounded-lg hover:bg-[#DCE6D5] transition-colors">
          <Plus size={16} /> Ajouter un contact
        </button>
      </div>

      {/* Urgences */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
        <h2 className="text-xl font-bold text-[#2A2016] mb-4">Numéros d'urgence</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#6B5D4E] mb-1">SAMU</label>
            <input type="text" placeholder="Par défaut: 15" value={formData.standardEmergencies?.samu || ""} onChange={(e) => handleChange("standardEmergencies", "samu", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B5D4E] mb-1">Pompiers</label>
            <input type="text" placeholder="Par défaut: 18" value={formData.standardEmergencies?.pompiers || ""} onChange={(e) => handleChange("standardEmergencies", "pompiers", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B5D4E] mb-1">Police</label>
            <input type="text" placeholder="Par défaut: 17" value={formData.standardEmergencies?.police || ""} onChange={(e) => handleChange("standardEmergencies", "police", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B5D4E] mb-1">Europe</label>
            <input type="text" placeholder="Par défaut: 112" value={formData.standardEmergencies?.europe || ""} onChange={(e) => handleChange("standardEmergencies", "europe", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white" />
          </div>
        </div>
      </div>

      {/* Règles */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
        <h2 className="text-xl font-bold text-[#2A2016] mb-4">Règles du logement</h2>
        <div className="space-y-3 mb-4">
          {formData.rules?.map((rule, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={rule}
                onChange={(e) => handleArrayChange("rules", index, e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
                placeholder="Règle (ex: Animaux non autorisés)"
              />
              <button type="button" onClick={() => removeArrayItem("rules", index)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                <Trash size={20} />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addArrayItem("rules")} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#5A7A4E] bg-[#EBF0E6] rounded-lg hover:bg-[#DCE6D5] transition-colors">
          <Plus size={16} /> Ajouter une règle
        </button>
      </div>

      {/* Recommandations */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
        <h2 className="text-xl font-bold text-[#2A2016] mb-4">Recommandations & Adresses</h2>
        <div className="space-y-4 mb-4">
          {formData.recommendations?.map((rec, index) => (
              <div key={index} className="bg-[#FBF5EC] p-4 rounded-xl border border-[#EDD9A3]/50 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="grid sm:grid-cols-2 gap-3 w-full mr-4">
                    <input
                      type="text"
                      placeholder="Titre (ex: La Pizzeria du Coin)"
                      value={rec.title}
                      onChange={(e) => handleComplexArrayChange("recommendations", index, "title", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Catégorie (ex: Restaurant)"
                      value={rec.category}
                      onChange={(e) => handleComplexArrayChange("recommendations", index, "category", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Distance (ex: 5 min à pied)"
                      value={rec.distance || ""}
                      onChange={(e) => handleComplexArrayChange("recommendations", index, "distance", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Lien Google Maps"
                      value={rec.mapsUrl || ""}
                      onChange={(e) => handleComplexArrayChange("recommendations", index, "mapsUrl", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                    />
                    <div>
                      <label className="block text-xs font-medium text-[#6B5D4E] mb-1">Type de rubrique</label>
                      <select
                        value={rec.type || "restaurant"}
                        onChange={(e) => handleComplexArrayChange("recommendations", index, "type", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                      >
                        <option value="restaurant">🍽️ Restaurant / Bar / Café</option>
                        <option value="decouvrir">🗺️ À découvrir / Activité</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Site web (optionnel)"
                      value={rec.websiteUrl || ""}
                      onChange={(e) => handleComplexArrayChange("recommendations", index, "websiteUrl", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                    />
                    <textarea
                      placeholder="Description courte..."
                      value={rec.description}
                      onChange={(e) => handleComplexArrayChange("recommendations", index, "description", e.target.value)}
                      className="w-full sm:col-span-2 px-3 py-2 rounded-lg border border-[#EDD9A3] text-sm bg-white"
                      rows={2}
                    />
                    {isComfort && (
                      <div className="w-full sm:col-span-2">
                        <label className="block text-xs font-medium text-[#6B5D4E] mb-1">Image d'illustration</label>
                        <div className="flex gap-2 items-center">
                          {rec.imageUrl && (
                            <img src={rec.imageUrl} alt="Rec" className="w-8 h-8 rounded object-cover shrink-0" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const url = await uploadImage(file, "accommodations/recs");
                                  handleComplexArrayChange("recommendations", index, "imageUrl", url);
                                } catch (err) {
                                  alert("Erreur upload");
                                }
                              }
                            }}
                            className="w-full px-2 py-1 rounded-lg border border-[#EDD9A3] text-sm bg-white file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[#C4714A]/10 file:text-[#C4714A]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => removeArrayItem("recommendations", index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addArrayItem("recommendations")} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#5A7A4E] bg-[#EBF0E6] rounded-lg hover:bg-[#DCE6D5] transition-colors">
            <Plus size={16} /> Ajouter une adresse
          </button>
        </div>

      {/* Options Confort (Premium) ou Bandeau Essentiel */}
      {isComfort ? (
        <div className="bg-[#2A2016] text-white rounded-3xl p-6 shadow-md border border-[#D4A34A]/30">
          <h2 className="text-xl font-bold text-[#E8BE72] mb-4">Options Offre Confort</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Couleur Principale (Thème)</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={formData.comfortOptions?.theme?.primaryColor || "#C4714A"}
                  onChange={(e) => handleNestedChange("comfortOptions", "theme", "primaryColor", e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0 p-0"
                />
                <input
                  type="text"
                  value={formData.comfortOptions?.theme?.primaryColor || "#C4714A"}
                  onChange={(e) => handleNestedChange("comfortOptions", "theme", "primaryColor", e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm w-32"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Accès & Transports</label>
              <textarea
                value={formData.comfortOptions?.transports || ""}
                onChange={(e) => handleChange("comfortOptions", "transports", e.target.value)}
                rows={3}
                placeholder="Comment venir depuis la gare, aéroport, métro..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#D4A34A]"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">Foire Aux Questions (FAQ)</h3>
              <div className="space-y-4 mb-4">
                {formData.comfortOptions?.faq?.map((item, index) => (
                  <div key={index} className="bg-white/5 p-4 rounded-xl border border-white/10 flex gap-3">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Question"
                        value={item.question}
                        onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-transparent text-sm"
                      />
                      <textarea
                        placeholder="Réponse"
                        value={item.answer}
                        onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-white/20 bg-transparent text-sm"
                        rows={2}
                      />
                    </div>
                    <button type="button" onClick={() => removeArrayItem("faq", index)} className="p-2 text-red-400 hover:bg-white/5 rounded-lg h-fit">
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => addArrayItem("faq")} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#2A2016] bg-[#E8BE72] rounded-lg hover:bg-[#D4A34A] transition-colors">
                <Plus size={16} /> Ajouter une question
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FDF3DC] border border-[#EDD9A3] rounded-3xl p-6 mb-6 flex items-start gap-3 shadow-sm">
          <Star size={24} className="text-[#D4A34A] shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="font-bold text-[#A07828] text-lg">Passez au pack Confort</p>
            <p className="text-sm text-[#B08A30] mt-1">
              Débloquez l'ajout d'images dans vos recommandations, la FAQ, les informations de transports et la personnalisation avancée (couleurs) en contactant l'équipe WEVO.
            </p>
          </div>
        </div>
      )}

      {/* Bouton de sauvegarde */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-end z-50">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 rounded-xl bg-[#C4714A] text-white font-bold hover:bg-[#A35A38] transition-colors shadow-lg disabled:opacity-50"
        >
          {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}

