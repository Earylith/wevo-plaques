"use client";

import { Clock, CarProfile, Coffee, MapPin } from "@phosphor-icons/react";

interface PracticalInfoCardProps {
  checkin: string;
  checkout: string;
  parking?: string;
  breakfast?: string;
  address?: string;
}

export default function PracticalInfoCard({ checkin, checkout, parking, breakfast, address }: PracticalInfoCardProps) {
  const openItinerary = () => {
    if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#FDF3DC] flex items-center justify-center shrink-0">
          <Clock size={24} weight="duotone" color="#D4A34A" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2A2016]">Infos pratiques</h3>
          <p className="text-sm text-[#6B5D4E]">Horaires et commodités</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#F5E6C8] pb-3">
          <span className="text-sm text-[#6B5D4E]">Arrivée</span>
          <span className="font-semibold text-[#2A2016]">{checkin}</span>
        </div>
        
        <div className="flex items-center justify-between border-b border-[#F5E6C8] pb-3">
          <span className="text-sm text-[#6B5D4E]">Départ</span>
          <span className="font-semibold text-[#2A2016]">{checkout}</span>
        </div>

        {parking && (
          <div className="flex items-start gap-3 pt-1">
            <CarProfile size={18} className="text-[#C4714A] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-[#6B5D4E] uppercase tracking-wider font-medium block mb-1">Stationnement</span>
              <p className="text-sm text-[#2A2016]">{parking}</p>
            </div>
          </div>
        )}

        {breakfast && (
          <div className="flex items-start gap-3 pt-2">
            <Coffee size={18} className="text-[#C4714A] shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-[#6B5D4E] uppercase tracking-wider font-medium block mb-1">Petit-déjeuner</span>
              <p className="text-sm text-[#2A2016]">{breakfast}</p>
            </div>
          </div>
        )}

        {address && (
          <button 
            onClick={openItinerary}
            className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl border-2 border-[#C4714A]/10 text-[#C4714A] font-bold text-sm hover:bg-[#F7EBE4] transition-all group"
          >
            <MapPin size={18} weight="bold" className="group-hover:bounce" />
            Ouvrir l&apos;itinéraire
          </button>
        )}
      </div>
    </div>
  );
}
