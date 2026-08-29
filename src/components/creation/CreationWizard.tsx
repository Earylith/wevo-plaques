"use client";

import React, { useState } from "react";
import { Accommodation } from "@/lib/types/accommodation";
import { demoConfortMarseille } from "@/lib/demoData";
import CleoTemplate from "@/components/templates/CleoTemplate";
import {
  House, Key, Sparkle, CheckCircle, ArrowLeft, ArrowRight, Desktop, DeviceMobile,
  SlidersHorizontal, Eye, GridFour, QrCode, Image as ImageIcon, MapPin, Info, Check, Plus, Trash
} from "@phosphor-icons/react";
import Link from "next/link";

interface CreationWizardProps {
  initialData?: Accommodation;
}

export default function CreationWizard({ initialData }: CreationWizardProps) {
  // Wizard step state (1 to 5)
  const [step, setStep] = useState<number>(1);

  // Live accommodation data state
  const [data, setData] = useState<Accommodation>(initialData || demoConfortMarseille);

  // Editor active sidebar tab state (for step 5)
  const [editorTab, setEditorTab] = useState<"general" | "apparence" | "modules" | "partager">("general");
  const [viewDevice, setViewDevice] = useState<"mobile" | "desktop">("mobile");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Helpers to update state
  const updateProperty = (fields: Partial<Accommodation["property"]>) => {
    setData(prev => ({
      ...prev,
      property: { ...prev.property, ...fields }
    }));
  };

  const updateWifi = (fields: Partial<Accommodation["wifi"]>) => {
    setData(prev => ({
      ...prev,
      wifi: { ...prev.wifi, ...fields }
    }));
  };

  const updatePracticalInfo = (fields: Partial<Accommodation["practicalInfo"]>) => {
    setData(prev => ({
      ...prev,
      practicalInfo: { ...prev.practicalInfo, ...fields }
    }));
  };

  const updateOwner = (fields: Partial<Accommodation["owner"]>) => {
    setData(prev => ({
      ...prev,
      owner: { ...prev.owner, ...fields }
    }));
  };

  const setPrimaryColor = (color: string) => {
    setData(prev => ({
      ...prev,
      comfortOptions: {
        ...prev.comfortOptions,
        theme: {
          ...prev.comfortOptions?.theme,
          primaryColor: color
        }
      }
    }));
  };

  // Checklist verification
  const checklist = [
    { label: "Nommer votre livret", filled: Boolean(data.property.name.trim()) },
    { label: "Choisir l'adresse du logement dans les suggestions", filled: Boolean(data.property.address?.trim()) },
    { label: "Choisir une photo de couverture", filled: Boolean(data.property.mainImageUrl) },
    { label: "Indiquer le Wi-Fi", filled: Boolean(data.wifi.ssid.trim()) },
    { label: "Ajouter votre téléphone", filled: Boolean(data.owner.phone.trim()) },
    { label: "Votre nom d'hôte", filled: Boolean(data.owner.name.trim()) },
    { label: "Préciser l'horaire d'arrivée", filled: Boolean(data.practicalInfo.checkin) },
    { label: "Préciser l'horaire de départ", filled: Boolean(data.practicalInfo.checkout) },
    { label: "Ajouter les consignes d'arrivée", filled: Boolean(data.practicalInfo.arrivalNotes?.trim()) },
    { label: "Ajouter au moins une consigne de départ", filled: Boolean(data.practicalInfo.departureInstructions?.length) },
    { label: "Choisir où recevoir les signalements", filled: Boolean(data.owner.email.trim()) }
  ];

  const filledCount = checklist.filter(c => c.filled).length;

  const colorPresets = ["#0E7C86", "#C4714A", "#5A7A4E", "#FF385C", "#D4A34A", "#1A1510"];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A2016]">

      {/* ========================================================================= */}
      {/* STEPS 1 TO 4 : ONBOARDING WIZARD FORM */}
      {/* ========================================================================= */}
      {step < 5 && (
        <div className="min-h-screen flex flex-col">
          {/* Header Progress Bar */}
          <header className="w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <Link href="/" className="font-bold text-xl tracking-tight text-[#FF385C] flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-serif text-lg font-bold">C</span>
              Cléo
            </Link>
            <div className="flex items-center gap-2 text-sm text-[#6B5D4E]">
              <span>Étape {step} sur 4</span>
              <div className="flex items-center gap-1.5 ml-2">
                {[1, 2, 3, 4].map(s => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s === step ? "w-6 bg-[#FF385C]" : s < step ? "w-2 bg-[#FF385C]/50" : "w-2 bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </header>

          {/* Form Main Area */}
          <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col justify-between">
            {/* ----------------- STEP 1 ----------------- */}
            {step === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#2A2016] mb-3 flex items-center gap-3">
                    Où accueillez-vous ? 🏠
                  </h1>
                  <p className="text-[#6B5D4E] text-base leading-relaxed">
                    Donnez juste le nom et l'adresse — on remplit le reste pour vous : ville, carte, transports, pharmacie et contacts utiles du quartier.
                  </p>
                </div>

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-2">
                      Nom de votre logement
                    </label>
                    <input
                      type="text"
                      value={data.property.name}
                      onChange={(e) => updateProperty({ name: e.target.value })}
                      placeholder="Ex : Villa des Pins — Cassis"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none text-base transition-all"
                    />
                    <p className="text-xs text-[#6B5D4E] mt-1.5">C'est le titre que verront vos voyageurs.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={data.property.address || ""}
                      onChange={(e) => updateProperty({ address: e.target.value })}
                      placeholder="Tapez puis choisissez dans la liste..."
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none text-base transition-all"
                    />
                    <div className="mt-3 text-xs text-[#6B5D4E] bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-2">
                      <Info size={18} className="text-[#6B5D4E] shrink-0 mt-0.5" />
                      <span>Choisissez votre adresse dans la liste : c’est ce qui donne au livret sa carte, ses distances et son heure locale. Le texte tapé ici n’est pas enregistré tel quel.</span>
                    </div>

                    <div className="mt-3 text-xs text-[#4A3D30] bg-[#FFFBF0] p-3.5 rounded-2xl border border-[#FDF3DC] flex items-start gap-2.5">
                      <MapPin size={20} className="text-[#D4A34A] shrink-0" weight="fill" />
                      <span>En choisissant votre adresse dans la liste, la ville se remplit toute seule et on ajoute pour vous les transports, la pharmacie et le médecin les plus proches.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={data.property.city}
                      onChange={(e) => updateProperty({ city: e.target.value })}
                      placeholder="Ex : Cassis"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#FF385C] focus:ring-2 focus:ring-[#FF385C]/20 outline-none text-base transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- STEP 2 ----------------- */}
            {step === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#2A2016] mb-3 flex items-center gap-3">
                    Les infos que tous les voyageurs demandent 🔑
                  </h1>
                  <p className="text-[#6B5D4E] text-base leading-relaxed">
                    Wi-Fi, horaires, votre contact. Deux minutes, et le cœur du livret est fait.
                  </p>
                </div>

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                  {/* Wifi Box */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-[#FDFBF7] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#2A2016] mb-1.5">
                        Réseau Wi-Fi (SSID)
                      </label>
                      <input
                        type="text"
                        value={data.wifi.ssid}
                        onChange={(e) => updateWifi({ ssid: e.target.value })}
                        placeholder="Ex : Livebox-A1B2"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#FF385C] outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#2A2016] mb-1.5">
                        Mot de passe Wi-Fi
                      </label>
                      <input
                        type="text"
                        value={data.wifi.password || ""}
                        onChange={(e) => updateWifi({ password: e.target.value })}
                        placeholder="Ex : CodeSecret123"
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#FF385C] outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Horaires */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#2A2016] mb-1.5">
                        Arrivée à partir de
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={data.practicalInfo.checkin.split("h")[0] || "14"}
                          onChange={(e) => updatePracticalInfo({ checkin: `${e.target.value}h${data.practicalInfo.checkin.split("h")[1] || "00"}` })}
                          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none font-bold"
                        >
                          {["12", "13", "14", "15", "16", "17", "18", "19", "20"].map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="font-bold text-[#6B5D4E]">h</span>
                        <select
                          value={data.practicalInfo.checkin.split("h")[1] || "00"}
                          onChange={(e) => updatePracticalInfo({ checkin: `${data.practicalInfo.checkin.split("h")[0] || "14"}h${e.target.value}` })}
                          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none font-bold"
                        >
                          {["00", "15", "30", "45"].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[#2A2016] mb-1.5">
                        Départ avant
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={data.practicalInfo.checkout.split("h")[0] || "10"}
                          onChange={(e) => updatePracticalInfo({ checkout: `${e.target.value}h${data.practicalInfo.checkout.split("h")[1] || "00"}` })}
                          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none font-bold"
                        >
                          {["08", "09", "10", "11", "12"].map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <span className="font-bold text-[#6B5D4E]">h</span>
                        <select
                          value={data.practicalInfo.checkout.split("h")[1] || "00"}
                          onChange={(e) => updatePracticalInfo({ checkout: `${data.practicalInfo.checkout.split("h")[0] || "10"}h${e.target.value}` })}
                          className="px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none font-bold"
                        >
                          {["00", "15", "30", "45"].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Consignes arrivée */}
                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-1.5">
                      Consignes d’arrivée
                    </label>
                    <textarea
                      rows={3}
                      value={data.practicalInfo.arrivalNotes || ""}
                      onChange={(e) => updatePracticalInfo({ arrivalNotes: e.target.value })}
                      placeholder="Ex : Entrez par le portail bleu, la boîte à clés est à gauche..."
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#FF385C] outline-none text-sm"
                    />
                  </div>

                  {/* Consigne départ */}
                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-1.5">
                      Première consigne de départ
                    </label>
                    <input
                      type="text"
                      value={data.practicalInfo.departureInstructions?.[0]?.text || ""}
                      onChange={(e) => {
                        const newInst = [...(data.practicalInfo.departureInstructions || [])];
                        if (newInst.length > 0) {
                          newInst[0] = { text: e.target.value, required: true };
                        } else {
                          newInst.push({ text: e.target.value, required: true });
                        }
                        updatePracticalInfo({ departureInstructions: newInst });
                      }}
                      placeholder="Ex : Déposer les clés dans la boîte à clés"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#FF385C] outline-none text-sm"
                    />
                  </div>

                  {/* Nom de l'hôte */}
                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-1.5">
                      Votre nom (ou celui de votre conciergerie)
                    </label>
                    <input
                      type="text"
                      value={data.owner.name}
                      onChange={(e) => updateOwner({ name: e.target.value })}
                      placeholder="Ex : Sophie & Marc"
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#FF385C] outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- STEP 3 ----------------- */}
            {step === 3 && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#2A2016] mb-3 flex items-center gap-3">
                    Donnez-lui votre style ✨
                  </h1>
                  <p className="text-[#6B5D4E] text-base leading-relaxed">
                    Une belle photo et une couleur — votre livret prend vie sous vos yeux.
                  </p>
                </div>

                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
                  {/* Photo picker */}
                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-2">
                      Photos de couverture (diaporama)
                    </label>
                    <div className="relative aspect-video w-full rounded-2xl bg-gray-200 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-6 text-center overflow-hidden group">
                      {data.property.mainImageUrl ? (
                        <>
                          <img src={data.property.mainImageUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye size={32} className="text-white mb-2" />
                            <span className="text-white text-sm font-bold">Changer la photo</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-[#6B5D4E]">
                          <ImageIcon size={40} className="text-gray-400" />
                          <span className="font-bold text-sm">Changer</span>
                          <span className="text-xs">Cliquez, déposez ou collez — plusieurs photos d'un coup</span>
                        </div>
                      )}
                    </div>

                    {/* URL Paste */}
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="Ou collez un lien d'image (https://...)"
                        className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none"
                      />
                      <button
                        onClick={() => {
                          if (newPhotoUrl.trim()) {
                            updateProperty({ mainImageUrl: newPhotoUrl.trim() });
                            setNewPhotoUrl("");
                          }
                        }}
                        className="px-5 py-3 bg-white border border-gray-200 hover:border-[#FF385C] text-[#2A2016] rounded-2xl text-sm font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <Check size={16} /> Ajouter
                      </button>
                    </div>

                    <p className="text-xs text-[#6B5D4E] mt-3 leading-relaxed">
                      Sélectionnez ou déposez <strong>plusieurs photos d'un coup</strong> : elles défileront en <strong>fondu</strong> derrière le titre. La 1re sert d'aperçu (QR & partage).
                    </p>
                  </div>

                  {/* Accent color picker */}
                  <div>
                    <label className="block text-sm font-bold text-[#2A2016] mb-3">
                      Couleur d'accent
                    </label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {colorPresets.map(color => (
                        <button
                          key={color}
                          onClick={() => setPrimaryColor(color)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                            (data.comfortOptions?.theme?.primaryColor || "#0E7C86") === color
                              ? "scale-110 ring-4 ring-offset-2 ring-[#FF385C]"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {(data.comfortOptions?.theme?.primaryColor || "#0E7C86") === color && (
                            <Check size={18} className="text-white" weight="bold" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- STEP 4 ----------------- */}
            {step === 4 && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#2A2016] mb-3 flex items-center gap-3">
                    Bravo, la base est posée ✨
                  </h1>
                </div>

                {/* Progress Checklist Box */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <h2 className="text-base font-bold text-[#2A2016]">
                    {filledCount}/11 essentiels déjà remplis
                  </h2>
                  <ul className="space-y-2.5 text-sm">
                    {checklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-[#6B5D4E]">
                        <span className={`w-2 h-2 rounded-full ${item.filled ? "bg-emerald-500" : "bg-gray-300"}`} />
                        <span className={item.filled ? "font-medium text-[#2A2016]" : ""}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps Box */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-[#2A2016]">
                    La suite, en 3 petites étapes dans l'éditeur :
                  </h3>
                  <ol className="space-y-3 text-sm text-[#4A3D30] leading-relaxed">
                    <li><strong>1.</strong> Complétez les consignes d’arrivée et de départ propres à ce logement</li>
                    <li><strong>2.</strong> Ajoutez vos bonnes adresses — Google remplit photo, note et distance automatiquement</li>
                    <li><strong>3.</strong> Quand tout vous plaît, publiez (29 € une seule fois, à vie) et partagez le lien ou le QR code</li>
                  </ol>
                </div>

                <p className="text-center text-xs text-[#6B5D4E]">
                  Touchez un élément de l'aperçu pour le modifier dans l'éditeur.
                </p>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-8 border-t border-gray-100 flex items-center justify-between mt-auto">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-full border border-gray-300 hover:border-gray-400 text-[#2A2016] text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <ArrowLeft size={18} /> Retour
                </button>
              ) : <div />}

              <button
                onClick={() => setStep(step + 1)}
                className="px-8 py-3.5 rounded-full bg-[#FF385C] hover:bg-[#E03150] text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#FF385C]/25 transition-all hover:scale-105 active:scale-95"
              >
                {step === 4 ? "Compléter mon livret →" : "Continuer →"}
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5 : FULL INTERACTIVE EDITOR WITH LIVE SMARTPHONE PREVIEW */}
      {/* ========================================================================= */}
      {step === 5 && (
        <div className="h-screen flex flex-col bg-[#F8F6F0] overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(4)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#2A2016]"
                title="Retour"
              >
                <ArrowLeft size={20} weight="bold" />
              </button>
              <div>
                <h1 className="font-bold text-base text-[#2A2016] flex items-center gap-2">
                  {data.property.name || "Nouveau livret invité"}
                  <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Brouillon · 29 € pour publier
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Device View Toggles */}
              <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewDevice("desktop")}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${viewDevice === "desktop" ? "bg-white text-[#2A2016] shadow-sm" : "text-[#6B5D4E]"}`}
                >
                  <Desktop size={18} />
                </button>
                <button
                  onClick={() => setViewDevice("mobile")}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${viewDevice === "mobile" ? "bg-white text-[#2A2016] shadow-sm" : "text-[#6B5D4E]"}`}
                >
                  <DeviceMobile size={18} />
                </button>
              </div>

              <button className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm font-bold text-[#2A2016] transition-all">
                Enregistrer
              </button>
              <button className="px-5 py-2 rounded-xl bg-[#FF385C] hover:bg-[#E03150] text-white text-sm font-bold flex items-center gap-1.5 shadow-md transition-all">
                Publier · 29 € →
              </button>
            </div>
          </header>

          {/* Main Workspace (Left Sidebar + Right Interactive Phone Preview) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar Form Editor */}
            <aside className="w-full lg:w-[440px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
              {/* Sidebar Navigation Tabs */}
              <div className="grid grid-cols-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-[#6B5D4E] shrink-0">
                {[
                  { id: "general", label: "Général", icon: Key },
                  { id: "apparence", label: "Apparence", icon: Eye },
                  { id: "modules", label: "Modules", icon: GridFour },
                  { id: "partager", label: "Partager", icon: QrCode },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setEditorTab(t.id as any)}
                    className={`py-3.5 flex flex-col items-center gap-1 transition-colors border-b-2 ${
                      editorTab === t.id
                        ? "border-[#FF385C] text-[#FF385C] bg-white"
                        : "border-transparent hover:text-[#2A2016]"
                    }`}
                  >
                    <t.icon size={20} weight={editorTab === t.id ? "fill" : "regular"} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Form Input Fields Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {editorTab === "general" && (
                  <>
                    {/* Collapsible Checklist */}
                    <div className="bg-[#FFFBF0] border border-[#FDF3DC] rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2A2016]">
                        <span>Les essentiels</span>
                        <span className="text-[#D4A34A] font-extrabold">{filledCount}/11</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-[#6B5D4E]">
                        {checklist.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1">
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${item.filled ? "bg-emerald-500" : "bg-gray-300"}`} />
                              {item.label}
                            </span>
                            <ArrowRight size={14} className="text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">IDENTIFICATION</h3>
                      <div>
                        <label className="block text-xs font-bold text-[#2A2016] mb-1">Titre du livret</label>
                        <input
                          type="text"
                          value={data.property.name}
                          onChange={(e) => updateProperty({ name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2A2016] mb-1">Adresse</label>
                        <input
                          type="text"
                          value={data.property.address || ""}
                          onChange={(e) => updateProperty({ address: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2A2016] mb-1">Ville</label>
                        <input
                          type="text"
                          value={data.property.city}
                          onChange={(e) => updateProperty({ city: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">RÉSEAU WI-FI</h3>
                      <div>
                        <label className="block text-xs font-bold text-[#2A2016] mb-1">SSID Wi-Fi</label>
                        <input
                          type="text"
                          value={data.wifi.ssid}
                          onChange={(e) => updateWifi({ ssid: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2A2016] mb-1">Mot de passe</label>
                        <input
                          type="text"
                          value={data.wifi.password || ""}
                          onChange={(e) => updateWifi({ password: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">CONTACT HÔTE</h3>
                      <div>
                        <label className="block text-xs font-bold text-[#2A2016] mb-1">Nom de l'hôte</label>
                        <input
                          type="text"
                          value={data.owner.name}
                          onChange={(e) => updateOwner({ name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2A2016] mb-1">Téléphone</label>
                        <input
                          type="text"
                          value={data.owner.phone}
                          onChange={(e) => updateOwner({ phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF385C]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {editorTab === "apparence" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">COULEUR D'ACCENT</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {colorPresets.map(color => (
                          <button
                            key={color}
                            onClick={() => setPrimaryColor(color)}
                            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-md transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                          >
                            {(data.comfortOptions?.theme?.primaryColor || "#0E7C86") === color && (
                              <Check size={16} className="text-white" weight="bold" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">STYLISME DES POLICES</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {["classic", "modern"].map(font => (
                          <button
                            key={font}
                            onClick={() => setData(prev => ({
                              ...prev,
                              comfortOptions: {
                                ...prev.comfortOptions,
                                theme: { ...prev.comfortOptions?.theme, fontFamily: font as any }
                              }
                            }))}
                            className={`p-3 rounded-xl border text-left text-xs font-bold ${
                              (data.comfortOptions?.theme?.fontFamily || "classic") === font
                                ? "border-[#FF385C] bg-[#FF385C]/5 text-[#FF385C]"
                                : "border-gray-200 text-[#2A2016]"
                            }`}
                          >
                            {font === "classic" ? "Serif Classique" : "Sans-serif Moderne"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {editorTab === "modules" && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">ACTIVER LES MODULES</h3>
                    {["Wi-Fi & Codes", "Consignes Arrivée & Départ", "Bonnes adresses & Carte", "Transports", "Urgences"].map((mod, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                        <span className="text-sm font-bold text-[#2A2016]">{mod}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-[#FF385C] rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {editorTab === "partager" && (
                  <div className="space-y-6 text-center py-4">
                    <div className="w-48 h-48 mx-auto bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center">
                      <QrCode size={120} className="text-[#2A2016]" />
                      <span className="text-xs font-bold text-[#6B5D4E] mt-2">Affiche QR Code</span>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-[#2A2016] text-white text-sm font-bold w-full">
                      Télécharger l'affiche imprimable (PDF)
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar Footer Link */}
              <div className="p-4 border-t border-gray-200 text-center shrink-0">
                <button className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">
                  Déconnexion
                </button>
              </div>
            </aside>

            {/* Right Live Phone Preview Container */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto relative">
              {/* Astuce Overlay Banner */}
              <div className="mb-4 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-200 shadow-sm text-xs font-bold text-[#2A2016] flex items-center gap-2">
                <span>⚡ Astuce : cliquez un élément (tuile, photo, couverture) pour le modifier.</span>
              </div>

              {/* iPhone Mockup Frame */}
              <div className="relative w-[340px] sm:w-[380px] h-[720px] bg-[#111] rounded-[3rem] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-4 border-gray-800 flex flex-col overflow-hidden shrink-0">
                {/* Dynamic Island / Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#111] rounded-full z-50 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-black/60 mr-2" />
                  <div className="w-2 h-2 rounded-full bg-[#0E7C86]/60" />
                </div>

                {/* Smartphone Display Frame */}
                <div className="w-full h-full bg-[#FDFBF7] rounded-[2.2rem] overflow-y-auto relative scroll-smooth hide-scrollbar">
                  <CleoTemplate data={data} />
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

    </div>
  );
}
