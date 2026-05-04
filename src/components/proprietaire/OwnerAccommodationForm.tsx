"use client";

import { useState } from "react";
import { Accommodation, ContactInfo, Recommendation } from "@/lib/types/accommodation";
import { WifiHigh, Clock, ListChecks, Phone, Star, MapPin, Question, Plus, Trash } from "@phosphor-icons/react";

interface Props {
  initialData: Accommodation;
  onSubmit: (data: Partial<Accommodation>) => Promise<void>;
  isLoading: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDD9A3]/40 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#EDD9A3]/30 bg-[#FBF5EC]">
        <span className="text-[#C4714A]">{icon}</span>
        <h3 className="font-semibold text-[#2A2016]">{title}</h3>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40 bg-[#FBF5EC] text-[#2A2016] text-sm placeholder-[#B0A090]";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OwnerAccommodationForm({ initialData, onSubmit, isLoading }: Props) {
  const isComfort = initialData.offerType === "comfort";

  // ── WiFi ──────────────────────────────────────────────────────────────────
  const [wifiSsid, setWifiSsid] = useState(initialData.wifi.ssid);
  const [wifiPassword, setWifiPassword] = useState(initialData.wifi.password || "");

  // ── Practical Info ────────────────────────────────────────────────────────
  const [checkin, setCheckin] = useState(initialData.practicalInfo.checkin);
  const [checkout, setCheckout] = useState(initialData.practicalInfo.checkout);
  const [parking, setParking] = useState(initialData.practicalInfo.parking || "");
  const [breakfast, setBreakfast] = useState(initialData.practicalInfo.breakfast || "");

  // ── Rules ─────────────────────────────────────────────────────────────────
  const [rules, setRules] = useState<string[]>(initialData.rules || []);

  // ── Contacts ──────────────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<ContactInfo[]>(initialData.contacts || []);

  // ── Recommendations (Comfort only) ────────────────────────────────────────
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialData.recommendations || []);

  // ── FAQ (Comfort only) ────────────────────────────────────────────────────
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>(
    initialData.comfortOptions?.faq || []
  );

  // ── Welcome Message ───────────────────────────────────────────────────────
  const [welcomeMessage, setWelcomeMessage] = useState(initialData.property.welcomeMessage);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<Accommodation> = {
      property: { ...initialData.property, welcomeMessage },
      wifi: { ssid: wifiSsid, password: wifiPassword },
      practicalInfo: { checkin, checkout, parking, breakfast },
      rules: rules.filter(r => r.trim()),
      contacts,
      recommendations,
      comfortOptions: isComfort
        ? { ...initialData.comfortOptions, faq }
        : initialData.comfortOptions,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Message d'accueil */}
      <Section icon={<WifiHigh size={20} />} title="Message d'accueil">
        <Field label="Message de bienvenue">
          <textarea
            rows={3}
            value={welcomeMessage}
            onChange={e => setWelcomeMessage(e.target.value)}
            className={inputCls + " resize-none"}
            placeholder="Bienvenue dans notre logement…"
          />
        </Field>
      </Section>

      {/* WiFi */}
      <Section icon={<WifiHigh size={20} />} title="WiFi">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom du réseau (SSID)">
            <input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} className={inputCls} placeholder="MonWifi" />
          </Field>
          <Field label="Mot de passe">
            <input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
          </Field>
        </div>
      </Section>

      {/* Infos pratiques */}
      <Section icon={<Clock size={20} />} title="Informations pratiques">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Check-in">
            <input type="text" value={checkin} onChange={e => setCheckin(e.target.value)} className={inputCls} placeholder="Dès 15h00" />
          </Field>
          <Field label="Check-out">
            <input type="text" value={checkout} onChange={e => setCheckout(e.target.value)} className={inputCls} placeholder="Avant 11h00" />
          </Field>
          <Field label="Parking">
            <input type="text" value={parking} onChange={e => setParking(e.target.value)} className={inputCls} placeholder="Parking gratuit devant…" />
          </Field>
          <Field label="Petit-déjeuner">
            <input type="text" value={breakfast} onChange={e => setBreakfast(e.target.value)} className={inputCls} placeholder="Non inclus / Inclus…" />
          </Field>
        </div>
      </Section>

      {/* Règles */}
      <Section icon={<ListChecks size={20} />} title="Règles du logement">
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={rule}
                onChange={e => {
                  const updated = [...rules];
                  updated[i] = e.target.value;
                  setRules(updated);
                }}
                className={inputCls}
                placeholder={`Règle ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => setRules(rules.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-600 p-1 shrink-0"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setRules([...rules, ""])}
            className="flex items-center gap-2 text-sm text-[#C4714A] hover:text-[#A35A38] font-medium mt-1"
          >
            <Plus size={16} /> Ajouter une règle
          </button>
        </div>
      </Section>

      {/* Contacts */}
      <Section icon={<Phone size={20} />} title="Contacts">
        <div className="space-y-4">
          {contacts.map((contact, i) => (
            <div key={i} className="p-4 rounded-xl border border-[#EDD9A3]/60 bg-[#FBF5EC]/50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nom">
                  <input type="text" value={contact.name} onChange={e => {
                    const updated = [...contacts];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setContacts(updated);
                  }} className={inputCls} placeholder="Jean Dupont" />
                </Field>
                <Field label="Rôle">
                  <input type="text" value={contact.label} onChange={e => {
                    const updated = [...contacts];
                    updated[i] = { ...updated[i], label: e.target.value };
                    setContacts(updated);
                  }} className={inputCls} placeholder="Propriétaire" />
                </Field>
                <Field label="Téléphone">
                  <input type="tel" value={contact.phone} onChange={e => {
                    const updated = [...contacts];
                    updated[i] = { ...updated[i], phone: e.target.value };
                    setContacts(updated);
                  }} className={inputCls} placeholder="+33 6 00 00 00 00" />
                </Field>
                <Field label="Email (optionnel)">
                  <input type="email" value={contact.email || ""} onChange={e => {
                    const updated = [...contacts];
                    updated[i] = { ...updated[i], email: e.target.value };
                    setContacts(updated);
                  }} className={inputCls} placeholder="contact@email.com" />
                </Field>
              </div>
              <button
                type="button"
                onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
              >
                <Trash size={14} /> Supprimer ce contact
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setContacts([...contacts, { label: "", name: "", phone: "", type: "other" }])}
            className="flex items-center gap-2 text-sm text-[#C4714A] hover:text-[#A35A38] font-medium"
          >
            <Plus size={16} /> Ajouter un contact
          </button>
        </div>
      </Section>

      {/* ── Sections Confort uniquement ───────────────────────────────────────── */}
      {isComfort && (
        <>
          {/* Recommandations */}
          <Section icon={<MapPin size={20} />} title="Recommandations">
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#EDD9A3]/60 bg-[#FBF5EC]/50 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nom">
                      <input type="text" value={rec.title} onChange={e => {
                        const updated = [...recommendations];
                        updated[i] = { ...updated[i], title: e.target.value };
                        setRecommendations(updated);
                      }} className={inputCls} placeholder="Le Bistrot du Coin" />
                    </Field>
                    <Field label="Catégorie">
                      <input type="text" value={rec.category} onChange={e => {
                        const updated = [...recommendations];
                        updated[i] = { ...updated[i], category: e.target.value };
                        setRecommendations(updated);
                      }} className={inputCls} placeholder="Restaurant, Musée…" />
                    </Field>
                    <Field label="Description">
                      <input type="text" value={rec.description} onChange={e => {
                        const updated = [...recommendations];
                        updated[i] = { ...updated[i], description: e.target.value };
                        setRecommendations(updated);
                      }} className={inputCls} placeholder="Notre coup de cœur…" />
                    </Field>
                    <Field label="Distance">
                      <input type="text" value={rec.distance || ""} onChange={e => {
                        const updated = [...recommendations];
                        updated[i] = { ...updated[i], distance: e.target.value };
                        setRecommendations(updated);
                      }} className={inputCls} placeholder="5 min à pied" />
                    </Field>
                    <Field label="Lien Google Maps">
                      <input type="url" value={rec.mapsUrl || ""} onChange={e => {
                        const updated = [...recommendations];
                        updated[i] = { ...updated[i], mapsUrl: e.target.value };
                        setRecommendations(updated);
                      }} className={inputCls} placeholder="https://maps.google.com/…" />
                    </Field>
                    <Field label="Site web">
                      <input type="url" value={rec.websiteUrl || ""} onChange={e => {
                        const updated = [...recommendations];
                        updated[i] = { ...updated[i], websiteUrl: e.target.value };
                        setRecommendations(updated);
                      }} className={inputCls} placeholder="https://…" />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecommendations(recommendations.filter((_, idx) => idx !== i))}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                  >
                    <Trash size={14} /> Supprimer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setRecommendations([...recommendations, { title: "", category: "", description: "" }])}
                className="flex items-center gap-2 text-sm text-[#C4714A] hover:text-[#A35A38] font-medium"
              >
                <Plus size={16} /> Ajouter une recommandation
              </button>
            </div>
          </Section>

          {/* FAQ */}
          <Section icon={<Question size={20} />} title="FAQ — Questions fréquentes">
            <div className="space-y-4">
              {faq.map((item, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#EDD9A3]/60 bg-[#FBF5EC]/50 space-y-3">
                  <Field label="Question">
                    <input type="text" value={item.question} onChange={e => {
                      const updated = [...faq];
                      updated[i] = { ...updated[i], question: e.target.value };
                      setFaq(updated);
                    }} className={inputCls} placeholder="Y a-t-il une machine à laver ?" />
                  </Field>
                  <Field label="Réponse">
                    <textarea rows={2} value={item.answer} onChange={e => {
                      const updated = [...faq];
                      updated[i] = { ...updated[i], answer: e.target.value };
                      setFaq(updated);
                    }} className={inputCls + " resize-none"} placeholder="Oui, elle se trouve…" />
                  </Field>
                  <button
                    type="button"
                    onClick={() => setFaq(faq.filter((_, idx) => idx !== i))}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                  >
                    <Trash size={14} /> Supprimer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFaq([...faq, { question: "", answer: "" }])}
                className="flex items-center gap-2 text-sm text-[#C4714A] hover:text-[#A35A38] font-medium"
              >
                <Plus size={16} /> Ajouter une question
              </button>
            </div>
          </Section>
        </>
      )}

      {/* Confort badge si essentiel */}
      {!isComfort && (
        <div className="bg-[#FDF3DC] border border-[#EDD9A3] rounded-2xl p-5 mb-6 flex items-start gap-3">
          <Star size={20} className="text-[#D4A34A] shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="font-semibold text-[#A07828] text-sm">Passez au pack Confort</p>
            <p className="text-xs text-[#B08A30] mt-0.5">
              Débloquez les recommandations, FAQ, points d&apos;intérêt et la personnalisation avancée en contactant WEVO.
            </p>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
