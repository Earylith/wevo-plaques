"use client";

import { MapPin, NavigationArrow, Globe, Car } from "@phosphor-icons/react";
import { Recommendation } from "@/lib/types/accommodation";

interface RecommendationsCardProps {
  recommendations: Recommendation[];
  showImages?: boolean;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function RecommendationsCard({ recommendations, showImages = false, title = "Nos recommandations", subtitle = "Les bonnes adresses du coin" }: RecommendationsCardProps) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#EBF0E6] flex items-center justify-center shrink-0">
          <MapPin size={24} weight="duotone" color="#5A7A4E" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2A2016]">{title}</h3>
          <p className="text-sm text-[#6B5D4E]">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="group relative border-b border-[#F5E6C8] last:border-0 pb-6 last:pb-0 flex items-start gap-4">
            {showImages && rec.imageUrl && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-gray-200 overflow-hidden">
                <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-[#2A2016] text-sm truncate">{rec.title}</h4>
                  <span className="text-[10px] uppercase tracking-wider text-[#C4714A] whitespace-nowrap">
                    {rec.distance && `${rec.distance}`}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#6B5D4E]/60 font-bold">
                  {rec.category}
                </span>
                <p className="text-xs text-[#6B5D4E] leading-relaxed mt-1 line-clamp-2">{rec.description}</p>
                
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {rec.mapsUrl && (
                    <a 
                      href={rec.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7EBE4] text-[#C4714A] text-xs font-bold hover:bg-[#C4714A] hover:text-white transition-all shadow-sm group/btn"
                    >
                      <Car size={16} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                      Itinéraire
                    </a>
                  )}
                  
                  {rec.websiteUrl && (
                    <a 
                      href={rec.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#EDD9A3]/50 text-[#6B5D4E] text-xs font-bold hover:border-[#C4714A] hover:text-[#C4714A] transition-all bg-white shadow-sm"
                    >
                      <Globe size={16} weight="bold" />
                      Site web
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
