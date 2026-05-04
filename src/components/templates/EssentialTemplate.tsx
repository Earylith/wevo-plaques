"use client";

import { Accommodation } from "@/lib/types/accommodation";
import { useState, useEffect } from "react";
import { List, X, WifiHigh, Info, BookOpen, ForkKnife, MapPin, Phone, Bus, WarningCircle, Siren, FirstAid, PoliceCar, Warning, House } from "@phosphor-icons/react";
import WifiCard from "../cards/WifiCard";
import PracticalInfoCard from "../cards/PracticalInfoCard";
import RulesCard from "../cards/RulesCard";
import ContactsCard from "../cards/ContactsCard";
import RecommendationsCard from "../cards/RecommendationsCard";

import MobileAccordion from "../ui/MobileAccordion";

export default function EssentialTemplate({ data }: { data: Accommodation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { label: "Bienvenue", href: "#accueil", icon: <Info size={18} /> },
    { label: "Arrivée / départ", href: "#infos", icon: <Bus size={18} /> },
    { label: "Règles", href: "#regles", icon: <BookOpen size={18} /> },
    { label: "Contacts", href: "#contacts", icon: <Phone size={18} /> },
    { label: "Urgences", href: "#urgences", icon: <Warning size={18} className="text-red-500" /> },
    { label: "À découvrir", href: "#decouvrir", icon: <MapPin size={18} /> },
  ];

  const quickLinks = [
    { label: "Wi-Fi", icon: <WifiHigh size={24} />, href: "#wifi" },
    { label: "Arrivée / départ", icon: <Bus size={24} />, href: "#infos" },
    { label: "Règles", icon: <BookOpen size={24} />, href: "#regles" },
    { label: "Contacts", icon: <Phone size={24} />, href: "#contacts" },
    { label: "Urgences", icon: <WarningCircle size={24} />, href: "#urgences" },
    { label: "À découvrir", icon: <MapPin size={24} />, href: "#decouvrir" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-[family-name:var(--font-sans)] text-[#2A2016] overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#EDD9A3]/30 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E8BE72]/20 rounded-full flex items-center justify-center text-[#C4714A]">
            <MapPin size={24} weight="duotone" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] font-bold text-base sm:text-lg leading-tight uppercase tracking-widest">
              {data.property.name}
            </h1>
            <p className="text-[9px] sm:text-[10px] text-[#6B5D4E] uppercase tracking-wider">{data.property.type}</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="flex items-center gap-2 text-sm font-medium text-[#6B5D4E] hover:text-[#C4714A] transition-colors">
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="lg:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[73px] bg-white z-40 p-6 flex flex-col gap-4 overflow-y-auto">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 py-3 border-b border-gray-100 text-lg font-medium text-[#2A2016]"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <div id="accueil" className="relative h-[50vh] sm:h-[60vh] min-h-[350px]">
        {data.property.mainImageUrl ? (
          <img src={data.property.mainImageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E4EEF3] to-[#F5E6C8]" />
        )}
        
        {/* Welcome Box overlapping */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
              Bienvenue à {data.property.name}
            </h2>
            <p className="text-[#6B5D4E] text-xs sm:text-[15px] leading-relaxed max-w-lg mx-auto line-clamp-4 sm:line-clamp-none">
              Nous sommes ravis de vous accueillir. Vous trouverez ici toutes les informations utiles pour votre séjour : Wi-Fi, horaires, règles de la maison, bonnes adresses et contacts pratiques.
            </p>
            <p className="text-xs sm:text-sm font-medium text-[#C4714A] mt-4 sm:mt-6 italic">
              — L&apos;équipe {data.property.name}
            </p>
          </div>
        </div>
      </div>

      {/* Spacer for overlapping box */}
      <div className="h-40 sm:h-48" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        {/* Accès rapides */}
        <div className="mb-12 sm:mb-16">
          <h3 className="font-semibold text-lg mb-4 sm:mb-6 px-2">Accès rapides</h3>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {quickLinks.map((link) => (
              <a 
                key={link.label}
                href={link.href}
                className="flex flex-col items-center justify-center py-4 px-2 bg-white border border-[#EDD9A3]/30 rounded-2xl hover:border-[#C4714A]/50 hover:shadow-md transition-all text-center gap-2 group"
              >
                <div className="text-[#6B5D4E] group-hover:text-[#C4714A] transition-colors">
                  {link.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Grids */}
        <div className="space-y-6 sm:space-y-10">
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div id="wifi"><WifiCard ssid={data.wifi.ssid} password={data.wifi.password} /></div>
            <div id="infos">
              <PracticalInfoCard 
                checkin={data.practicalInfo.checkin} 
                checkout={data.practicalInfo.checkout} 
                parking={data.practicalInfo.parking} 
                breakfast={data.practicalInfo.breakfast}
                address={data.property.address}
              />
            </div>
          </div>

          <div id="urgences" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-red-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <WarningCircle size={24} weight="duotone" color="#EF4444" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2A2016]">Urgences</h3>
                <p className="text-xs text-[#6B5D4E]">Numéros utiles et assistance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <a href={`tel:${data.standardEmergencies?.samu || "15"}`} className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100">
                <span className="text-[10px] font-bold text-red-700 mb-1">SAMU</span>
                <span className="text-base font-bold text-red-600">{data.standardEmergencies?.samu || "15"}</span>
              </a>
              <a href={`tel:${data.standardEmergencies?.pompiers || "18"}`} className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100">
                <span className="text-[10px] font-bold text-red-700 mb-1">POMPIERS</span>
                <span className="text-base font-bold text-red-600">{data.standardEmergencies?.pompiers || "18"}</span>
              </a>
              <a href={`tel:${data.standardEmergencies?.police || "17"}`} className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100">
                <span className="text-[10px] font-bold text-red-700 mb-1">POLICE</span>
                <span className="text-base font-bold text-red-600">{data.standardEmergencies?.police || "17"}</span>
              </a>
              <a href={`tel:${data.standardEmergencies?.europe || "112"}`} className="flex flex-col items-center p-3 rounded-2xl bg-red-600 text-white">
                <span className="text-[10px] font-bold text-white/80 mb-1">EUROPE</span>
                <span className="text-base font-bold text-white">{data.standardEmergencies?.europe || "112"}</span>
              </a>
            </div>

            {data.contacts?.filter(c => c.type === 'owner').map((ownerContact, idx) => (
              <div key={`owner-${idx}`} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-4 last:mb-0">
                <div className="flex items-center gap-3">
                  <House size={20} className="text-[#C4714A]" />
                  <span className="text-sm font-semibold">{ownerContact.label || "Contact Hôte"}</span>
                </div>
                <a href={`tel:${ownerContact.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C4714A] text-white text-xs font-bold">
                  <Phone size={14} weight="bold" />
                  Appeler
                </a>
              </div>
            ))}
            {(!data.contacts || !data.contacts.some(c => c.type === 'owner')) && data.owner.phone && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <House size={20} className="text-[#C4714A]" />
                  <span className="text-sm font-semibold">Contact Hôte</span>
                </div>
                <a href={`tel:${data.owner.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C4714A] text-white text-xs font-bold">
                  <Phone size={14} weight="bold" />
                  Appeler
                </a>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-0 sm:gap-8">
            <MobileAccordion title="Règles de la maison" icon={<BookOpen size={24} weight="duotone" color="#5A7A4E" />}>
              <div id="regles" className="lg:bg-white lg:rounded-3xl lg:p-6 lg:shadow-sm lg:border lg:border-[#EDD9A3]/30">
                <RulesCard rules={data.rules} />
              </div>
            </MobileAccordion>
            
            <MobileAccordion title="Contacts utiles" icon={<Phone size={24} weight="duotone" color="#C4714A" />}>
              <div id="contacts" className="lg:bg-white lg:rounded-3xl lg:p-6 lg:shadow-sm lg:border lg:border-[#EDD9A3]/30">
                <ContactsCard contacts={data.contacts} />
              </div>
            </MobileAccordion>
          </div>

          <MobileAccordion title="À découvrir & Restaurants" icon={<ForkKnife size={24} weight="duotone" color="#C4714A" />}>
            <div id="restaurants" className="lg:bg-white lg:rounded-3xl lg:p-6 lg:shadow-sm lg:border lg:border-[#EDD9A3]/30">
              <RecommendationsCard recommendations={data.recommendations} showImages={false} />
            </div>
          </MobileAccordion>
        </div>
      </main>

      <footer className="bg-[#2A2016] text-white py-10 text-center">
        <p className="text-sm font-medium opacity-80 mb-2">Bon séjour à {data.property.name} !</p>
        <a href="https://wevo-creart.fr" className="text-xs text-[#E8BE72] hover:underline opacity-60">Livret d&apos;accueil digital par WEVO × CRÉART</a>
      </footer>
    </div>
  );
}
