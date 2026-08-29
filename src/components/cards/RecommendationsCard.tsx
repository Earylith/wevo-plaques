"use client";

import { MapPin, NavigationArrow, Globe, Car, X } from "@phosphor-icons/react";
import { Recommendation } from "@/lib/types/accommodation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface RecommendationsCardProps {
  recommendations: Recommendation[];
  showImages?: boolean;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export default function RecommendationsCard({ recommendations, showImages = false, title = "Nos recommandations", subtitle = "Les bonnes adresses du coin" }: RecommendationsCardProps) {
  const [selectedItem, setSelectedItem] = useState<Recommendation | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling when modal is open
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedItem]);

  const [activeCategory, setActiveCategory] = useState<string>("Tout");

  if (!recommendations || recommendations.length === 0) return null;

  // Extract unique categories
  const categories = ["Tout", ...Array.from(new Set(recommendations.map(r => r.category).filter(Boolean)))];

  const filteredRecs = activeCategory === "Tout" 
    ? recommendations 
    : recommendations.filter(r => r.category === activeCategory);

  return (
    <>
      <div className="bg-transparent border-none p-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF0E6] flex items-center justify-center shrink-0">
            <MapPin size={24} weight="duotone" color="#5A7A4E" />
          </div>
          <div>
            <h3 className="font-semibold text-[#2A2016] text-xl">{title}</h3>
            <p className="text-sm text-[#6B5D4E]">{subtitle}</p>
          </div>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-[#2A2016] text-white shadow-sm"
                    : "bg-white text-[#6B5D4E] border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex overflow-x-auto lg:flex-col lg:overflow-visible snap-x snap-mandatory lg:snap-none space-x-4 lg:space-x-0 lg:space-y-4 pb-6 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 hide-scrollbar">
          {filteredRecs.map((rec, index) => (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedItem(rec)}
              key={index} 
              className="shrink-0 w-[85%] sm:w-[60%] lg:w-full snap-center group cursor-pointer bg-white rounded-2xl p-3 flex flex-col lg:flex-row items-start gap-4 shadow-sm border border-[#EDD9A3]/30 hover:shadow-lg hover:border-[#D4A34A]/50 transition-all duration-300"
            >
              {showImages && rec.imageUrl && (
                <div className="w-full h-40 lg:w-24 lg:h-24 shrink-0 rounded-[1rem] overflow-hidden bg-gray-100 relative">
                  <img src={rec.imageUrl} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  {rec.rating && (
                    <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="text-yellow-400">★</span> {rec.rating}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0 py-1 lg:pr-2 w-full">
                <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5 mb-1">
                  <h4 className="font-bold text-[#2A2016] text-base leading-tight flex-1 min-w-[100px]">{rec.title}</h4>
                  {rec.distance && (
                    <span className="text-[10px] uppercase tracking-widest text-[#C4714A] whitespace-nowrap font-bold bg-[#FBF5EC] px-2 py-1 rounded-md shrink-0">
                      {rec.distance}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#6B5D4E]/80 font-bold">
                    {rec.category}
                  </span>
                  {rec.rating && (
                    <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
                      ★ {rec.rating} {rec.reviews ? <span className="text-[#6B5D4E]/60 text-[10px]">({rec.reviews.toLocaleString('fr-FR')} avis)</span> : null}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B5D4E] leading-relaxed line-clamp-2">{rec.description}</p>
                {rec.comment && (
                  <p className="text-[11px] italic text-[#C4714A] mt-1 font-medium line-clamp-1">
                    « {rec.comment} »
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Modal using Portal to escape stacking context */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-[#1A1510]/60 backdrop-blur-md cursor-pointer"
                onClick={() => setSelectedItem(null)}
              />

              {/* Modal Content */}
              <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-lg bg-white rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X size={20} weight="bold" />
                </button>

                {/* Image Section */}
                {selectedItem.imageUrl ? (
                  <div className="relative w-full h-64 sm:h-80 shrink-0">
                    <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
                  </div>
                ) : (
                  <div className="h-12 w-full shrink-0" />
                )}

                {/* Text Content */}
                <div className="px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto flex-1 relative z-10 -mt-10 sm:-mt-12 bg-white rounded-t-[2rem]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#C4714A]">
                      {selectedItem.category}
                    </span>
                    {selectedItem.distance && (
                      <span className="text-xs font-semibold text-[#6B5D4E] bg-[#FBF5EC] px-3 py-1 rounded-full">
                        {selectedItem.distance}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-[#2A2016] mb-4 font-serif">
                    {selectedItem.title}
                  </h3>
                  
                  <p className="text-[#4A3D30] leading-relaxed mb-8 text-[15px]">
                    {selectedItem.description}
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t border-[#EDD9A3]/30">
                    {selectedItem.mapsUrl && (
                      <a 
                        href={selectedItem.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2A2016] text-white font-medium hover:bg-[#C4714A] transition-colors shadow-lg"
                      >
                        <Car size={20} weight="duotone" />
                        Y aller
                      </a>
                    )}
                    {selectedItem.websiteUrl && (
                      <a 
                        href={selectedItem.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-[#EBF0E6] text-[#2A2016] font-medium hover:bg-[#FBF5EC] hover:border-[#EDD9A3] transition-colors"
                      >
                        <Globe size={20} weight="duotone" />
                        Voir le site
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
