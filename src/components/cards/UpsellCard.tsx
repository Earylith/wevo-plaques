"use client";

import { ShoppingBag, WhatsappLogo, Envelope } from "@phosphor-icons/react";
import { UpsellItem } from "@/lib/types/accommodation";

interface UpsellCardProps {
  upsells: UpsellItem[];
  ownerPhone?: string;
  ownerEmail?: string;
  propertyName: string;
}

export default function UpsellCard({ upsells, ownerPhone, ownerEmail, propertyName }: UpsellCardProps) {
  if (!upsells || upsells.length === 0) return null;

  const getPriceLabel = (price: number, unit?: string) => {
    const format = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    if (unit === 'per_person') return `${format} / pers.`;
    if (unit === 'per_day') return `${format} / jour`;
    return format;
  };

  const handleRequest = (item: UpsellItem) => {
    const text = `Bonjour, je séjourne actuellement dans le logement "${propertyName}" et je souhaiterais réserver le service : ${item.title} au prix de ${getPriceLabel(item.price, item.priceUnit)}.`;
    
    if (ownerPhone) {
      const phone = ownerPhone.replace(/\s+/g, '').replace(/^\+/, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (ownerEmail) {
      window.open(`mailto:${ownerEmail}?subject=Demande de service: ${item.title}&body=${encodeURIComponent(text)}`, "_blank");
    } else {
      alert("Aucun moyen de contact n'est configuré pour ce logement.");
    }
  };

  return (
    <div className="bg-transparent border-none p-0">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF5EC] flex items-center justify-center shrink-0">
          <ShoppingBag size={24} weight="duotone" color="#C4714A" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2A2016] text-xl">Services Premium</h3>
          <p className="text-sm text-[#6B5D4E]">Agrémentez votre séjour</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {upsells.map((item, index) => (
          <div key={item.id || index} className="bg-white rounded-2xl p-4 flex flex-col shadow-sm border border-[#EDD9A3]/30 hover:shadow-md hover:border-[#D4A34A]/50 transition-all">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-[#2A2016] text-lg pr-2">{item.title}</h4>
              <span className="bg-[#FBF5EC] text-[#C4714A] font-bold px-2 py-1 rounded-lg text-sm whitespace-nowrap">
                {getPriceLabel(item.price, item.priceUnit)}
              </span>
            </div>
            <p className="text-[#6B5D4E] text-sm mb-4 flex-1">{item.description}</p>
            <button 
              onClick={() => handleRequest(item)}
              className="w-full flex items-center justify-center gap-2 bg-[#2A2016] text-white py-2.5 rounded-xl font-medium hover:bg-[#C4714A] transition-colors"
            >
              {ownerPhone ? <WhatsappLogo size={18} weight="fill" /> : <Envelope size={18} weight="fill" />}
              Demander
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
