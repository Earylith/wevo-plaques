"use client";

import { Accommodation } from "@/lib/types/accommodation";
import React, { useState, useEffect } from "react";
import { List, X, WifiHigh, Info, BookOpen, ForkKnife, MapPin, Phone, Bus, WarningCircle, Siren, PoliceCar, FirstAid, House } from "@phosphor-icons/react";
import WifiCard from "../cards/WifiCard";
import PracticalInfoCard from "../cards/PracticalInfoCard";
import RulesCard from "../cards/RulesCard";
import ContactsCard from "../cards/ContactsCard";
import RecommendationsCard from "../cards/RecommendationsCard";
import { motion, AnimatePresence } from "framer-motion";

export default function ComfortTemplate({ data }: { data: Accommodation }) {
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const primaryColor = data.comfortOptions?.theme?.primaryColor || "#C4714A";
  const fontFamilyType = data.comfortOptions?.theme?.fontFamily || "classic";

  let fontClass = "font-[family-name:var(--font-sans)]";
  if (fontFamilyType === "classic") fontClass = "font-serif";
  else if (fontFamilyType === "modern") fontClass = "font-[family-name:var(--font-display)]";

  // Navigation Links
  const navLinks = [
    { label: "Wi-Fi", href: "#wifi", icon: <WifiHigh size={24} weight="duotone" /> },
    { label: "Arrivée / départ", href: "#infos", icon: <Bus size={24} weight="duotone" /> },
    { label: "Règles", href: "#regles", icon: <BookOpen size={24} weight="duotone" /> },
    { label: "Contacts", href: "#contacts", icon: <Phone size={24} weight="duotone" /> },
    { label: "Urgences", href: "#urgences", icon: <WarningCircle size={24} weight="duotone" /> },
    { label: "À découvrir", href: "#decouvrir", icon: <MapPin size={24} weight="duotone" /> },
  ];

  // Filtre Restaurants vs Découvrir
  const isRestaurantCategory = (cat: string) =>
    cat.toLowerCase().includes('resto') || cat.toLowerCase().includes('bist') || cat.toLowerCase().includes('caf') || cat.toLowerCase().includes('pizza') || cat.toLowerCase().includes('gastro') || cat.toLowerCase().includes('cuisine') || cat.toLowerCase().includes('table');

  const restaurants = data.recommendations.filter(r => r.type === 'restaurant' || (!r.type && isRestaurantCategory(r.category)));
  const decouvrir = data.recommendations.filter(r => r.type === 'decouvrir' || (!r.type && !isRestaurantCategory(r.category)));

  // Animations
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <div className={`min-h-screen bg-[#FDFBF7] text-[#2A2016] overflow-x-hidden ${fontClass}`}>
      
      {/* Mobile Floating Bottom Navigation (Dynamic Island Style) */}
      <div className="lg:hidden fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="flex items-center justify-between w-full max-w-sm bg-white/80 backdrop-blur-3xl px-6 py-4 rounded-full shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-white/60 pointer-events-auto">
          {navLinks.map(link => (
            <a 
              key={link.label} 
              href={link.href} 
              className="flex flex-col items-center gap-1 text-[#6B5D4E] hover:text-[#C4714A] transition-colors active:scale-95"
            >
              <div style={{ color: primaryColor }}>
                {/* Clone icon to adjust size for mobile */}
                {React.cloneElement(link.icon as React.ReactElement<any>, { size: 24, weight: "duotone" })}
              </div>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="relative pb-28 lg:pb-0">
        
        {/* Parallax Hero Section */}
        <section className="relative h-[50vh] lg:h-[80vh] w-full overflow-hidden flex items-center justify-center px-6 lg:px-12">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-0 z-0 origin-center"
          >
            {data.property.mainImageUrl ? (
              <img src={data.property.mainImageUrl} alt="Main" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: primaryColor }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1510]/90 via-[#1A1510]/40 to-[#1A1510]/20" />
          </motion.div>

          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center gap-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-white flex flex-col items-center text-center">
              {data.property.logoUrl && (
                <div className="w-20 h-20 lg:w-32 lg:h-32 mb-6 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
                  <img src={data.property.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-4 ${fontFamilyType === 'classic' ? 'font-serif' : ''}`}>
                {data.property.name}
              </h1>
              <p className="text-lg lg:text-2xl font-light text-white/90 max-w-2xl tracking-wide">
                Votre guide de séjour numérique
              </p>
            </motion.div>
          </div>
        </section>

        {/* Floating Welcome Message (Glassmorphism) */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 -mt-10 lg:-mt-16">
          <motion.div 
            initial="hidden" animate="visible" variants={fadeUp}
            className="bg-white/80 backdrop-blur-3xl p-6 lg:p-10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white/60"
          >
            <h2 className="text-xl lg:text-3xl font-bold mb-4" style={{ color: primaryColor }}>Bienvenue chez vous</h2>
            <p className="text-[#4A3D30] text-sm lg:text-lg leading-relaxed font-medium">
              {data.property.welcomeMessage}
            </p>
          </motion.div>
        </div>

        {/* Desktop Horizontal Smart Shortcuts */}
        <div className="hidden lg:flex sticky top-6 z-40 max-w-4xl mx-auto px-4 justify-center mt-12 mb-[-2rem]">
          <nav className="flex items-center gap-2 p-2 bg-white/70 backdrop-blur-xl rounded-full shadow-xl border border-white/40">
            {navLinks.map(link => (
              <a 
                key={link.label} 
                href={link.href} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[#6B5D4E] hover:bg-white hover:text-[#C4714A] hover:shadow-sm transition-all font-medium text-sm border border-transparent hover:border-white/50"
              >
                <div style={{ color: primaryColor }}>{link.icon}</div>
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bento Grid Content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Colonne 1 : Wi-Fi, Contacts, Urgences */}
            <div className="flex flex-col gap-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} id="wifi" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_40px_rgba(212,163,74,0.12)] hover:border-[#D4A34A]/30 transition-all duration-500 group">
                  <WifiCard ssid={data.wifi.ssid} password={data.wifi.password} />
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} id="contacts" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_40px_rgba(212,163,74,0.12)] hover:border-[#D4A34A]/30 transition-all duration-500">
                  <ContactsCard contacts={data.contacts} />
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} id="urgences" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="bg-[#FFF5F5]/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(239,68,68,0.05)] border border-red-100/50 hover:shadow-[0_8px_40px_rgba(239,68,68,0.15)] transition-all duration-500">
                  <h3 className="flex items-center gap-2 font-bold text-red-600 mb-4">
                    <WarningCircle size={24} weight="fill" /> Urgences
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <a href={`tel:${data.standardEmergencies?.samu || "15"}`} className="bg-white p-3 rounded-xl flex flex-col items-center shadow-sm border border-red-50 hover:scale-105 transition-transform">
                      <Siren size={24} className="text-red-500 mb-1" weight="duotone" />
                      <span className="text-[10px] uppercase font-bold text-red-400">SAMU</span>
                      <span className="text-sm font-bold text-red-700">{data.standardEmergencies?.samu || "15"}</span>
                    </a>
                    <a href={`tel:${data.standardEmergencies?.pompiers || "18"}`} className="bg-white p-3 rounded-xl flex flex-col items-center shadow-sm border border-red-50 hover:scale-105 transition-transform">
                      <FirstAid size={24} className="text-red-500 mb-1" weight="duotone" />
                      <span className="text-[10px] uppercase font-bold text-red-400">Pompiers</span>
                      <span className="text-sm font-bold text-red-700">{data.standardEmergencies?.pompiers || "18"}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Colonne 2 : Arrivée/Départ, Règles */}
            <div className="flex flex-col gap-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} id="infos" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_40px_rgba(212,163,74,0.12)] hover:border-[#D4A34A]/30 transition-all duration-500">
                  <PracticalInfoCard 
                    checkin={data.practicalInfo.checkin} 
                    checkout={data.practicalInfo.checkout} 
                    parking={data.practicalInfo.parking} 
                    breakfast={data.practicalInfo.breakfast}
                    address={data.property.address}
                  />
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} id="regles" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_40px_rgba(212,163,74,0.12)] hover:border-[#D4A34A]/30 transition-all duration-500">
                  <RulesCard rules={data.rules} />
                </div>
              </motion.div>
            </div>

            {/* Colonne 3 : Recommandations (Restaurants & À découvrir) */}
            <div className="flex flex-col gap-8">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} id="restaurants" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_40px_rgba(212,163,74,0.12)] hover:border-[#D4A34A]/30 transition-all duration-500">
                  <RecommendationsCard 
                    title="Restaurants"
                    subtitle="Nos meilleures tables"
                    recommendations={restaurants} 
                    showImages={true} 
                  />
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} id="decouvrir" whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-white/60 hover:shadow-[0_8px_40px_rgba(212,163,74,0.12)] hover:border-[#D4A34A]/30 transition-all duration-500">
                  <RecommendationsCard 
                    title="À découvrir"
                    subtitle="Activités et lieux incontournables"
                    recommendations={decouvrir} 
                    showImages={true} 
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#1A1510] text-white py-12 text-center lg:rounded-t-[3rem] mt-12 mx-0 lg:mx-6 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
          <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            {data.property.logoUrl ? (
              <img src={data.property.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <span className="font-serif font-bold text-2xl" style={{ color: primaryColor }}>{data.property.name.charAt(0)}</span>
            )}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${fontFamilyType === 'classic' ? 'font-serif' : ''}`}>{data.property.name}</h2>
          <p className="text-white/60 text-sm mb-8">Nous vous souhaitons un excellent séjour.</p>
          <a href="https://wevo-creart.fr" className="text-xs text-white/40 hover:text-white transition-colors tracking-widest uppercase">
            Propulsé par WEVO × CRÉART
          </a>
        </footer>

      </main>
    </div>
  );
}
