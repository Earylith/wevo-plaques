"use client";

import { Accommodation } from "@/lib/types/accommodation";
import { useState, useEffect } from "react";
import { List, X, WifiHigh, Info, BookOpen, ForkKnife, MapPin, Phone, Question, Bus, Warning, WarningCircle, Siren, PoliceCar, FirstAid, House } from "@phosphor-icons/react";
import WifiCard from "../cards/WifiCard";
import PracticalInfoCard from "../cards/PracticalInfoCard";
import RulesCard from "../cards/RulesCard";
import ContactsCard from "../cards/ContactsCard";
import RecommendationsCard from "../cards/RecommendationsCard";
import MobileAccordion from "../ui/MobileAccordion";

export default function ComfortTemplate({ data }: { data: Accommodation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = [
    { label: "Bienvenue", href: "#accueil", icon: <Info size={20} /> },
    { label: "Wi-Fi", href: "#wifi", icon: <WifiHigh size={20} /> },
    { label: "Arrivée / départ", href: "#infos", icon: <Bus size={20} /> },
    { label: "Règles", href: "#regles", icon: <BookOpen size={20} /> },
    { label: "Contacts", href: "#contacts", icon: <Phone size={20} /> },
    { label: "Urgences", href: "#urgences", icon: <Warning size={20} className="text-red-500" /> },
    { label: "Restaurants", href: "#restaurants", icon: <ForkKnife size={20} /> },
    { label: "À découvrir", href: "#decouvrir", icon: <MapPin size={20} /> },
  ];

  const quickLinks = [
    { label: "Wi-Fi", icon: <WifiHigh size={24} />, href: "#wifi" },
    { label: "Arrivée / départ", icon: <Bus size={24} />, href: "#infos" },
    { label: "Règles", icon: <BookOpen size={24} />, href: "#regles" },
    { label: "Restaurants", icon: <ForkKnife size={24} />, href: "#restaurants" },
    { label: "À découvrir", icon: <MapPin size={24} />, href: "#decouvrir" },
    { label: "Contacts", icon: <Phone size={24} />, href: "#contacts" },
  ];

  const primaryColor = data.comfortOptions?.theme?.primaryColor || "#C4714A";

  // Restaurant filter
  const isRestaurantCategory = (cat: string) =>
    cat.toLowerCase().includes('resto') ||
    cat.toLowerCase().includes('bist') ||
    cat.toLowerCase().includes('caf') ||
    cat.toLowerCase().includes('pizza') ||
    cat.toLowerCase().includes('gastro') ||
    cat.toLowerCase().includes('cuisine') ||
    cat.toLowerCase().includes('table');

  const restaurants = data.recommendations.filter(r =>
    r.type === 'restaurant' || (!r.type && isRestaurantCategory(r.category))
  );
  const decouvrir = data.recommendations.filter(r =>
    r.type === 'decouvrir' || (!r.type && !isRestaurantCategory(r.category))
  );

  return (
    <div className="min-h-screen bg-[#EBE7DF] font-[family-name:var(--font-sans)] text-[#2A2016] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#EDD9A3]/30 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: primaryColor }}>
            <span className="font-serif font-bold text-xs" style={{ color: primaryColor }}>
              {data.property.name.charAt(0)}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-sm leading-tight uppercase tracking-widest">
            {data.property.name}
          </h1>
        </div>
        <button className="p-2 text-[#2A2016]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </header>

      {/* Desktop Sidebar & Mobile Menu Content */}
      <aside className={`
        ${isMenuOpen ? "fixed inset-0 top-[57px] bg-[#FDFBF7] z-40 p-6 overflow-y-auto" : "hidden"} 
        lg:block lg:w-72 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 lg:bg-[#FDFBF7] lg:border-r lg:border-[#EDD9A3]/30 lg:p-8 lg:overflow-y-auto
        flex flex-col
      `}>
        <div className="hidden lg:flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4" style={{ borderColor: primaryColor }}>
             <span className="font-serif font-bold text-2xl" style={{ color: primaryColor }}>
               {data.property.name.charAt(0)}
             </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-xl text-center leading-tight uppercase tracking-widest">
            {data.property.name}
          </h1>
          <p className="text-xs text-[#6B5D4E] uppercase tracking-wider mt-1">{data.property.type}</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href} 
              onClick={() => isMobile && setIsMenuOpen(false)}
              className="flex items-center gap-4 py-3 px-4 rounded-xl text-sm font-medium text-[#6B5D4E] hover:bg-[#F5E6C8]/50 transition-colors"
              style={{ '--hover-color': primaryColor } as React.CSSProperties}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto lg:p-6 pb-24">
        {/* Hero Section */}
        <div id="accueil" className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] lg:rounded-3xl overflow-hidden shadow-sm">
          {data.property.mainImageUrl ? (
            <img src={data.property.mainImageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: primaryColor, opacity: 0.8 }} />
          )}
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-6 lg:pt-10">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-1 lg:mb-2 text-center drop-shadow-md">
              Bienvenue
            </h2>
            <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-4xl lg:text-5xl font-bold text-white text-center drop-shadow-md">
              chez vous !
            </h2>
          </div>

          {/* Welcome Box overlapping */}
          <div className="absolute bottom-6 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 lg:left-12 lg:right-auto lg:w-[480px]">
            <div className="bg-[#FDFBF7]/95 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-xl">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold mb-3">Bienvenue à {data.property.name}</h3>
              <p className="text-[#2A2016] text-xs sm:text-sm lg:text-[15px] leading-relaxed line-clamp-4 lg:line-clamp-none">
                Nous sommes ravis de vous accueillir. Vous trouverez ici toutes les informations utiles pour votre séjour : Wi-Fi, horaires, règles de la maison, bonnes adresses et contacts pratiques.
              </p>
              <p className="text-xs sm:text-sm font-medium text-[#6B5D4E] mt-3 lg:mt-4 italic">
                — L&apos;équipe {data.property.name}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-6 pb-12 pt-8 lg:pt-12">
          {/* Quick Links */}
          <div className="mb-10 lg:mb-16">
            <h3 className="lg:hidden font-semibold text-lg mb-4 px-2">Accès rapides</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center gap-3 lg:gap-6 bg-[#FDFBF7] p-4 lg:p-6 rounded-3xl border border-[#EDD9A3]/20 shadow-sm">
              {quickLinks.map((link) => (
                <a 
                  key={link.label}
                  href={link.href}
                  className="flex flex-col items-center gap-2 lg:gap-3 p-3 lg:p-4 bg-white lg:bg-transparent rounded-2xl border border-[#EDD9A3]/30 lg:border-none hover:scale-105 transition-transform text-[#6B5D4E] hover:text-[#C4714A]"
                >
                  <div className="text-[#6B5D4E]">{link.icon}</div>
                  <span className="text-[10px] lg:text-xs font-bold text-center">{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Content — 2 columns */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Column 1 */}
            <div className="space-y-6 lg:space-y-8">
              <div id="wifi"><WifiCard ssid={data.wifi.ssid} password={data.wifi.password} /></div>
              
              <MobileAccordion title="Arrivée / départ" icon={<Bus size={24} weight="duotone" color="#D4A34A" />}>
                <div id="infos">
                  <PracticalInfoCard 
                    checkin={data.practicalInfo.checkin} 
                    checkout={data.practicalInfo.checkout} 
                    parking={data.practicalInfo.parking} 
                    breakfast={data.practicalInfo.breakfast}
                    address={data.property.address}
                  />
                </div>
              </MobileAccordion>

              <MobileAccordion title="Règles de la maison" icon={<BookOpen size={24} weight="duotone" color="#5A7A4E" />}>
                <div id="regles" className="lg:bg-white lg:rounded-3xl lg:p-6 lg:shadow-sm lg:border lg:border-[#EDD9A3]/40">
                  <RulesCard rules={data.rules} />
                </div>
              </MobileAccordion>

              <MobileAccordion title="Contacts utiles" icon={<Phone size={24} weight="duotone" color="#C4714A" />}>
                <div id="contacts" className="lg:bg-white lg:rounded-3xl lg:p-6 lg:shadow-sm lg:border lg:border-[#EDD9A3]/40">
                  <ContactsCard contacts={data.contacts} />
                </div>
              </MobileAccordion>
            </div>

            {/* Column 2 */}
            <div className="space-y-6 lg:space-y-8">
              {/* Urgences */}
              <MobileAccordion title="Urgences" icon={<WarningCircle size={24} weight="duotone" color="#EF4444" />}>
                <div id="urgences" className="bg-white rounded-3xl p-6 shadow-sm border border-red-100">
                  <div className="hidden lg:flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                      <WarningCircle size={24} weight="duotone" color="#EF4444" />
                    </div>
                    <h3 className="font-semibold text-[#2A2016]">Urgences</h3>
                  </div>
                  <p className="text-sm text-[#6B5D4E] mb-6 leading-relaxed">
                    En cas d&apos;urgence, contactez directement les services concernés. Pour un problème lié au logement, vous pouvez joindre votre hôte via les boutons ci-dessous.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6 text-center">
                    <a href="tel:15" className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100">
                      <Siren size={20} className="text-red-500 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-red-700">SAMU</span>
                      <span className="text-sm font-bold text-red-600">15</span>
                    </a>
                    <a href="tel:18" className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100">
                      <FirstAid size={20} className="text-red-500 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-red-700">Pompiers</span>
                      <span className="text-sm font-bold text-red-600">18</span>
                    </a>
                    <a href="tel:17" className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100">
                      <PoliceCar size={20} className="text-red-500 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-red-700">Police</span>
                      <span className="text-sm font-bold text-red-600">17</span>
                    </a>
                    <a href="tel:112" className="flex flex-col items-center p-3 rounded-2xl bg-red-600 border border-red-700">
                      <Warning size={20} className="text-white mb-1" />
                      <span className="text-[10px] uppercase font-bold text-white/80">Europe</span>
                      <span className="text-sm font-bold text-white">112</span>
                    </a>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#6B5D4E] uppercase tracking-widest">Urgence logement</p>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <House size={20} className="text-[#C4714A]" />
                        <span className="text-sm font-semibold">Contact Hôte</span>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${data.owner.phone}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#EDD9A3] text-[#C4714A]">
                          <Phone size={16} weight="bold" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </MobileAccordion>

              {/* Restaurants */}
              <MobileAccordion title="Restaurants" icon={<ForkKnife size={24} weight="duotone" color="#C4714A" />}>
                <div id="restaurants" className="lg:bg-white lg:rounded-3xl lg:p-6 lg:shadow-sm lg:border lg:border-[#EDD9A3]/40">
                  <RecommendationsCard 
                    title="Restaurants"
                    subtitle="Les bonnes adresses du coin"
                    recommendations={restaurants} 
                    showImages={true} 
                  />
                </div>
              </MobileAccordion>
              
              {/* À découvrir */}
              <MobileAccordion title="À découvrir" icon={<MapPin size={24} weight="duotone" color="#5A7A4E" />}>
                <div id="decouvrir" className="lg:bg-white lg:rounded-3xl lg:p-6 lg:shadow-sm lg:border lg:border-[#EDD9A3]/40">
                  <RecommendationsCard 
                    title="À découvrir"
                    subtitle="Sites, activités et bons plans"
                    recommendations={decouvrir} 
                    showImages={true} 
                  />
                </div>
              </MobileAccordion>
            </div>
          </div>

          {/* Full-width: Transports & FAQ */}
          {(data.comfortOptions?.transports || (data.comfortOptions?.faq && data.comfortOptions.faq.length > 0)) && (
            <div className="space-y-6 mt-6 lg:mt-8">
              {data.comfortOptions?.transports && (
                <MobileAccordion title="Accès & Transports" icon={<Bus size={24} weight="duotone" />}>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
                    <div className="hidden lg:flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FDF3DC] flex items-center justify-center shrink-0">
                        <Bus size={24} weight="duotone" color="#D4A34A" />
                      </div>
                      <h3 className="font-semibold text-[#2A2016]">Accès &amp; Transports</h3>
                    </div>
                    <p className="text-sm text-[#6B5D4E] leading-relaxed whitespace-pre-wrap">{data.comfortOptions.transports}</p>
                  </div>
                </MobileAccordion>
              )}

              {data.comfortOptions?.faq && data.comfortOptions.faq.length > 0 && (
                <MobileAccordion title="FAQ" icon={<Question size={24} weight="duotone" />}>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
                    <div className="hidden lg:flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#E4EEF3] flex items-center justify-center shrink-0">
                        <Question size={24} weight="duotone" color="#2B5F75" />
                      </div>
                      <h3 className="font-semibold text-[#2A2016]">FAQ</h3>
                    </div>
                    <div className="space-y-4">
                      {data.comfortOptions.faq.map((item, idx) => (
                        <div key={idx} className="border-b border-[#F5E6C8] pb-3 last:border-0 last:pb-0">
                          <h4 className="font-medium text-sm text-[#2A2016] mb-1">{item.question}</h4>
                          <p className="text-xs text-[#6B5D4E] leading-relaxed">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </MobileAccordion>
              )}
            </div>
          )}
        </div>

        <footer className="bg-[#7A624E] text-white py-8 text-center lg:m-6 lg:rounded-2xl mb-0 lg:mb-12">
          <p className="text-xs sm:text-sm font-medium mb-1">Bon séjour à {data.property.name} !</p>
          <a href="https://wevo-creart.fr" className="text-[10px] sm:text-xs text-[#EDD9A3] hover:underline opacity-80">Livret d&apos;accueil digital par WEVO × CRÉART</a>
        </footer>
      </main>
    </div>
  );
}
