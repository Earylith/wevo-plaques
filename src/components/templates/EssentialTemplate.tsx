"use client";

import { Accommodation, ModuleId } from "@/lib/types/accommodation";
import React, { useState } from "react";
import { List, X, WifiHigh, Info, BookOpen, MapPin, Phone, WarningCircle, House, Bus } from "@phosphor-icons/react";
import WifiCard from "../cards/WifiCard";
import PracticalInfoCard from "../cards/PracticalInfoCard";
import RulesCard from "../cards/RulesCard";
import ContactsCard from "../cards/ContactsCard";

import MobileAccordion from "../ui/MobileAccordion";

interface EssentialTemplateProps {
  data: Accommodation;
  /**
   * Ouvre la rubrique correspondante dans l'éditeur.
   *
   * Absent sur la page publiée : le voyageur n'a rien à éditer, et sans ce
   * rappel aucune zone ne devient cliquable.
   */
  onModuleClick?: (id: ModuleId) => void;
  /** Rubrique en cours d'édition, mise en évidence dans l'aperçu. */
  activeModule?: ModuleId;
}

export default function EssentialTemplate({
  data,
  onModuleClick,
  activeModule,
}: EssentialTemplateProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Habille une zone pour la rendre cliquable côté éditeur.
   *
   * On renvoie des propriétés plutôt qu'un composant : envelopper les
   * sections dans un bouton casserait leur mise en page, et un simple
   * gestionnaire de clic suffit ici.
   */
  const zone = (id: ModuleId) =>
    onModuleClick
      ? {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onModuleClick(id);
          },
          role: "button" as const,
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onModuleClick(id);
            }
          },
          className: `cursor-pointer rounded-2xl transition-all outline-none ${
            activeModule === id
              ? "ring-2 ring-[#C4714A] ring-offset-2"
              : "hover:ring-2 hover:ring-[#C4714A]/40 hover:ring-offset-2"
          }`,
          title: "Cliquez pour modifier cette rubrique",
        }
      : {};

  const navLinks = [
    { label: "Bienvenue", href: "#accueil", icon: <Info size={18} /> },
    { label: "Règles", href: "#regles", icon: <BookOpen size={18} /> },
    { label: "Contacts", href: "#contacts", icon: <Phone size={18} /> },
    { label: "Urgences", href: "#urgences", icon: <WarningCircle size={18} className="text-red-500" /> },
  ];

  const quickLinks = [
    { label: "Wi-Fi", icon: <WifiHigh size={24} />, href: "#wifi" },
    { label: "Arrivée / départ", icon: <Bus size={24} />, href: "#infos" },
    { label: "Règles", icon: <BookOpen size={24} />, href: "#regles" },
    { label: "Contacts", icon: <Phone size={24} />, href: "#contacts" },
    { label: "Urgences", icon: <WarningCircle size={24} />, href: "#urgences" },
  ];

  return (
    <div className="@container min-h-screen bg-[#FDFBF7] font-[family-name:var(--font-sans)] text-[#2A2016] overflow-x-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#EDD9A3]/30 px-4 @2xl:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E8BE72]/20 rounded-full flex items-center justify-center text-[#C4714A]">
            <MapPin size={24} weight="duotone" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] font-bold text-base @2xl:text-lg leading-tight uppercase tracking-widest">
              {data.property.name}
            </h1>
            <p className="text-[9px] @2xl:text-[10px] text-[#6B5D4E] uppercase tracking-wider">{data.property.type}</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden @5xl:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="flex items-center gap-2 text-sm font-medium text-[#6B5D4E] hover:text-[#C4714A] transition-colors">
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile Nav Toggle */}
        <button className="@5xl:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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

      {/*
        Pas de photo de couverture : elle n'est pas comprise dans la formule
        Essentielle. En afficher une promettrait ce qui n'est pas vendu — le
        mot d'accueil ouvre donc directement la page.
      */}
      <div id="accueil" className="px-4 @2xl:px-6 pt-8 @2xl:pt-12">
        <div
          {...zone("bienvenue")}
          className={`max-w-2xl mx-auto bg-white p-6 @2xl:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-center ${zone("bienvenue").className || ""}`}
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl @2xl:text-4xl font-bold mb-3 @2xl:mb-4 leading-tight">
            Bienvenue à {data.property.name}
          </h2>
          <p className="text-[#6B5D4E] text-xs @2xl:text-[15px] leading-relaxed max-w-lg mx-auto">
            {data.property.welcomeMessage?.trim() ||
              "Nous sommes ravis de vous accueillir. Vous trouverez ici toutes les informations utiles pour votre séjour."}
          </p>
          <p className="text-xs @2xl:text-sm font-medium text-[#C4714A] mt-4 @2xl:mt-6 italic">
            — L&apos;équipe {data.property.name}
          </p>
        </div>
      </div>

      <div className="h-10 @2xl:h-14" />

      <main className="max-w-4xl mx-auto px-4 @2xl:px-6 pb-24">
        {/* Accès rapides */}
        <div className="mb-12 @2xl:mb-16">
          <h3 className="font-semibold text-lg mb-4 @2xl:mb-6 px-2">Accès rapides</h3>
          <div className="grid grid-cols-3 @5xl:grid-cols-6 gap-2 @2xl:gap-4">
            {quickLinks.map((link) => (
              <a 
                key={link.label}
                href={link.href}
                className="flex flex-col items-center justify-center py-4 px-2 bg-white border border-[#EDD9A3]/30 rounded-2xl hover:border-[#C4714A]/50 hover:shadow-md transition-all text-center gap-2 group"
              >
                <div className="text-[#6B5D4E] group-hover:text-[#C4714A] transition-colors">
                  {link.icon}
                </div>
                <span className="text-[10px] @2xl:text-xs font-semibold">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Content Grids */}
        <div className="space-y-6 @2xl:space-y-10">
          <div className="grid @2xl:grid-cols-2 gap-6 @2xl:gap-8">
            <div id="wifi" {...zone("wifi")}>
              <WifiCard ssid={data.wifi.ssid} password={data.wifi.password} />
              {/* Les digicodes se saisissent dans la même rubrique que le
                  Wi-Fi : ils doivent s'afficher au même endroit. */}
              {(data.codes || []).filter((c) => c.label || c.value).length > 0 && (
                <div className="mt-4 bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/30">
                  <h3 className="font-semibold text-[#2A2016] mb-3">Digicodes &amp; clés</h3>
                  <div className="space-y-2">
                    {(data.codes || [])
                      .filter((c) => c.label || c.value)
                      .map((code, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FDFBF7] border border-[#EDD9A3]/30"
                        >
                          <span className="text-sm text-[#6B5D4E] min-w-0 truncate">{code.label}</span>
                          <span className="font-mono text-sm font-bold text-[#2A2016] shrink-0">
                            {code.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div id="infos" {...zone("arrivee")}>
              <PracticalInfoCard 
                checkin={data.practicalInfo.checkin} 
                checkout={data.practicalInfo.checkout} 
                parking={data.practicalInfo.parking} 
                breakfast={data.practicalInfo.breakfast}
                address={data.property.address}
              />
              {/*
                Consignes d'arrivée, note de départ et check-list : saisies
                dans l'éditeur, elles n'apparaissaient nulle part.
              */}
              {(data.practicalInfo?.arrivalNotes?.trim() ||
                data.practicalInfo?.departureNotes?.trim() ||
                (data.practicalInfo?.departureInstructions || []).some((i) => i.text?.trim())) && (
                <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/30 space-y-4">
                  {data.practicalInfo?.arrivalNotes?.trim() && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-1.5">
                        À l&apos;arrivée
                      </h4>
                      <p className="text-sm text-[#2A2016] leading-relaxed whitespace-pre-line">
                        {data.practicalInfo.arrivalNotes}
                      </p>
                    </div>
                  )}
                  {data.practicalInfo?.departureNotes?.trim() && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-1.5">
                        Au départ
                      </h4>
                      <p className="text-sm text-[#2A2016] leading-relaxed whitespace-pre-line">
                        {data.practicalInfo.departureNotes}
                      </p>
                    </div>
                  )}
                  {(data.practicalInfo?.departureInstructions || []).some((i) => i.text?.trim()) && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-2">
                        Avant de partir
                      </h4>
                      <ul className="space-y-1.5">
                        {(data.practicalInfo?.departureInstructions || [])
                          .filter((i) => i.text?.trim())
                          .map((etape, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-[#2A2016]">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C4714A] shrink-0" />
                              <span>{etape.text}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            id="urgences"
            {...zone("contacts")}
            className={`bg-white rounded-3xl p-6 @2xl:p-8 shadow-sm border border-red-100 ${zone("contacts").className || ""}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <WarningCircle size={24} weight="duotone" color="#EF4444" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2A2016]">Urgences</h3>
                <p className="text-xs text-[#6B5D4E]">Numéros utiles et assistance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 @2xl:grid-cols-4 gap-3 mb-8">
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

          <div className="grid @5xl:grid-cols-2 gap-0 @2xl:gap-8">
            <MobileAccordion title="Règles de la maison" icon={<BookOpen size={24} weight="duotone" color="#5A7A4E" />}>
              <div
                id="regles"
                {...zone("reglement")}
                className={`@5xl:bg-white @5xl:rounded-3xl @5xl:p-6 @5xl:shadow-sm @5xl:border @5xl:border-[#EDD9A3]/30 ${zone("reglement").className || ""}`}
              >
                <RulesCard rules={data.rules} />
              </div>
            </MobileAccordion>
            
            <MobileAccordion title="Contacts utiles" icon={<Phone size={24} weight="duotone" color="#C4714A" />}>
              <div
                id="contacts"
                {...zone("contacts")}
                className={`@5xl:bg-white @5xl:rounded-3xl @5xl:p-6 @5xl:shadow-sm @5xl:border @5xl:border-[#EDD9A3]/30 ${zone("contacts").className || ""}`}
              >
                <ContactsCard contacts={data.contacts} />
              </div>
            </MobileAccordion>
          </div>

          {/*
            Pas de bonnes adresses : la rubrique n'est pas comprise dans la
            formule Essentielle, et elle est verrouillée dans l'éditeur.
            L'afficher promettait ce que l'hôte ne peut pas remplir.
          */}
        </div>
      </main>

      <footer className="bg-[#2A2016] text-white py-10 text-center">
        <p className="text-sm font-medium opacity-80 mb-2">Bon séjour à {data.property.name} !</p>

      </footer>
    </div>
  );
}
