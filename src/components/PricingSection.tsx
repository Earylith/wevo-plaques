"use client";

import { useState } from "react";
import { Check, ArrowRight, X, Zap, Sparkles, Plus, ShieldCheck, Truck, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingSection() {
  const [showCompare, setShowCompare] = useState(false);
  const [showConfortInfo, setShowConfortInfo] = useState(false);

  const plans = [
    {
      name: "Essentielle",
      price: "49",
      popular: false,
      badge: "L'essentielle sans abonnement",
      desc: "La solution directe avec une page fixe, accessible sans application et avec plaque en bois incluse.",
      features: [
        "Plaque en bois gravée avec QR code incluse",
        "Accessible immédiatement sans application",
        "Codes Wi‑Fi en un scan",
        "Horaires d’arrivée & de départ",
        "Règles du logement & consignes clés",
        "Numéros d’urgence & contacts hôte",
        "QR code permanent et hébergement inclus",
        "Modifications à la demande (5 € par session)",
      ],
      after: "Paiement unique",
      subDetail: "Sans aucun abonnement",
      cta: "Choisir l'Essentielle",
      href: "/commencer?offre=essentielle",
    },
    {
      name: "Confort",
      price: "69",
      popular: true,
      badge: "Recommandé · Expérience complète",
      desc: "Le véritable livret d’accueil digital : interactif, autonome et modifiable en temps réel depuis votre espace.",
      features: [
        "Toutes les fonctionnalités de l'Essentielle",
        "Plaque en bois gravée avec phrase personnalisée",
        "Modifications illimitées en toute autonomie",
        "Espace propriétaire dédié 24/7",
        "Équipements & notices pas-à-pas",
        "Recommandations locales & bonnes adresses",
        "Transports & accès détaillés",
        "Questions fréquentes interactives",
        "Livre d'or numérique pour vos voyageurs",
        "Météo en direct, carte interactive & heure locale",
        "Traduction multilingue automatique",
        "Design personnalisé & photos illimitées",
      ],
      after: "Puis 19 €/an",
      subDetail: "ou 1,99 €/mois",
      cta: "Choisir le Confort",
      href: "/commencer?offre=confort",
    },
  ];

  return (
    <section className="py-16 bg-[#FAFAF8] relative" id="offres">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-[#2A2016] rounded-[40px] p-8 lg:p-12 shadow-[0_30px_80px_rgba(42,32,22,0.15)] relative overflow-hidden flex flex-col xl:flex-row gap-10 items-stretch border border-[#3A2D20]"
        >
          {/* Ambient background for the dark container */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#C4714A]/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E8BE72]/10 blur-[100px] rounded-full pointer-events-none" />

          {/* LEFT COLUMN: INTRO */}
          <div className="xl:w-[35%] flex flex-col justify-between relative z-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C4714A]/20 border border-[#C4714A]/30 text-[#E8BE72] text-[10px] font-bold tracking-[0.2em] uppercase mb-8 backdrop-blur-md">
                <Zap size={12} className="text-[#C4714A]" /> Nos formules
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-5xl lg:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                Choisissez <br/> l’offre qui vous <span className="text-[#C4714A] italic">correspond.</span>
              </h2>
              <p className="text-[#FBF5EC]/70 text-[15px] leading-relaxed mb-6 max-w-sm">
                Une tarification transparente et sans surprise. Plaque en bois incluse dans chaque formule, livret accessible sans application pour vos voyageurs.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: PRICING CARDS */}
          <div className="xl:w-[65%] flex flex-col justify-center">
            <div className="grid md:grid-cols-2 gap-5 relative z-10">
              {plans.map((plan, i) => (
                <motion.div 
                  key={plan.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className={`rounded-[32px] p-6 sm:p-8 flex flex-col relative group transition-all duration-500 ${
                    plan.popular 
                      ? "bg-gradient-to-b from-[#C4714A] to-[#A35A38] shadow-[0_10px_40px_rgba(196,113,74,0.4)] border border-[#D4866A]/40 scale-[1.02]" 
                      : "bg-[#FBF5EC] border border-[#EDD9A3]/60 shadow-lg"
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start gap-3 sm:gap-4 mb-4 relative z-10 min-h-[68px]">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className={`text-2xl font-bold font-[family-name:var(--font-display)] ${plan.popular ? "text-white" : "text-[#2A2016]"}`}>{plan.name}</h3>
                        {plan.badge && (
                          <span className={`${plan.popular ? "bg-white/20 text-white border-white/20 font-bold" : "bg-[#5A7A4E]/15 text-[#425B39] border-[#5A7A4E]/30 font-bold"} backdrop-blur-md text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-snug ${plan.popular ? "text-white/85" : "text-[#6B5D4E]/85"}`}>{plan.desc}</p>
                    </div>
                    
                    {/* Price Block */}
                    <div className="text-right shrink-0">
                      <div className={`text-4xl lg:text-5xl font-bold tracking-tighter mb-0.5 ${plan.popular ? "text-white" : "text-[#2A2016]"}`}>
                        {plan.price}<span className={`text-2xl lg:text-3xl ${plan.popular ? "text-white/70" : "text-[#2A2016]/50"}`}>€</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`text-[10px] font-bold tracking-tight leading-tight ${plan.popular ? "text-[#E8BE72]" : "text-[#5A7A4E]"}`}>
                          {plan.after}
                        </span>
                        {plan.popular && (
                          <button
                            type="button"
                            onClick={() => setShowConfortInfo(!showConfortInfo)}
                            aria-label="Détails de l'abonnement"
                            className="p-1 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                            title="Voir le détail de l'abonnement"
                          >
                            <Info size={13} className="text-[#E8BE72]" />
                          </button>
                        )}
                      </div>
                      {plan.subDetail && (
                        <div className={`text-[9px] font-medium leading-tight ${plan.popular ? "text-white/75" : "text-[#6B5D4E]/60"}`}>
                          {plan.subDetail}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Détails de l'abonnement : panneau intégré sans aucun chevauchement */}
                  {plan.popular && (
                    <AnimatePresence>
                      {showConfortInfo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden mb-4"
                        >
                          <div className="p-3.5 rounded-2xl bg-black/35 border border-[#E8BE72]/40 text-left text-xs shadow-inner">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-[11px] text-[#E8BE72] uppercase tracking-wider flex items-center gap-1.5">
                                <Zap size={13} /> L’abonnement comprend :
                              </p>
                              <button
                                type="button"
                                onClick={() => setShowConfortInfo(false)}
                                className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                                aria-label="Fermer les détails"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <ul className="space-y-1.5 text-[11px] text-white/90">
                              <li className="flex items-start gap-2">
                                <Check size={13} className="text-[#E8BE72] mt-0.5 shrink-0" />
                                <span><strong>Hébergement sécurisé</strong> sans interruption</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check size={13} className="text-[#E8BE72] mt-0.5 shrink-0" />
                                <span><strong>Espace propriétaire 24/7</strong> pour gérer votre livret</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Check size={13} className="text-[#E8BE72] mt-0.5 shrink-0" />
                                <span><strong>Modifications illimitées</strong> prises en compte en direct</span>
                              </li>
                            </ul>
                            <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-white/80 leading-relaxed">
                              Au choix : <strong>19 €/an</strong> (soit 1,58 €/mois) ou <strong>1,99 €/mois</strong>, résiliable à tout moment.
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Features List */}
                  <div className={`rounded-[20px] p-4 sm:p-5 flex-1 mb-6 relative z-10 ${
                    plan.popular ? "bg-black/20 border border-white/10 shadow-inner" : "bg-white/70 border border-[#EDD9A3]/40"
                  }`}>
                    <ul className="space-y-2.5">
                      {plan.features.map((f, index) => {
                        const isBaseFeature = plan.name === "Confort" && index === 0;
                        const isPremiumFeature = plan.name === "Confort" && index > 0;
                        const isPremiumDivider = plan.name === "Confort" && index === 1;

                        return (
                          <li key={index} className="flex flex-col">
                            {isPremiumDivider && (
                              <div className="flex items-center gap-2 mb-3 mt-2 pt-3 border-t border-white/15">
                                <Sparkles size={13} className="text-[#E8BE72] fill-[#E8BE72]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8BE72]">Exclusif au Confort :</span>
                              </div>
                            )}
                            <div className={`flex items-start gap-3 ${isPremiumFeature ? 'pl-2' : ''}`}>
                              {isPremiumFeature ? (
                                <Check size={14} className="shrink-0 mt-0.5 text-[#E8BE72]" strokeWidth={3.5} />
                              ) : isBaseFeature ? (
                                <Plus size={14} className="shrink-0 mt-0.5 text-white/80" strokeWidth={3} />
                              ) : (
                                <Check size={14} className="shrink-0 mt-0.5 text-[#5A7A4E]" strokeWidth={3} />
                              )}
                              <span className={`text-[13px] leading-tight ${
                                isPremiumFeature ? 'font-semibold text-white' : 
                                isBaseFeature ? 'font-medium text-white/80' : 
                                'font-medium text-[#6B5D4E]'
                              }`}>
                                {f}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={plan.href || "#contact"}
                    target={plan.href ? "_blank" : undefined}
                    rel={plan.href ? "noopener noreferrer" : undefined}
                    className={`relative z-10 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                      plan.popular
                        ? "bg-white text-[#C4714A] hover:bg-[#FBF5EC] shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02]"
                        : "bg-[#2A2016] text-white hover:bg-[#5C3D2E] shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:scale-[1.02]"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                  </a>

                  {/* Réassurance Livraison & Stripe */}
                  {(plan.name === "Essentielle" || plan.name === "Confort") && (
                    <div className="mt-3.5 flex flex-col items-center gap-1.5 relative z-10 text-[11px]">
                      <div className={`flex items-center gap-1.5 font-medium ${plan.popular ? "text-[#E8BE72]" : "text-[#5A7A4E]"}`}>
                        <Truck size={13} />
                        <span>Livraison offerte</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${plan.popular ? "text-white/80" : "text-[#6B5D4E]/70"}`}>
                        <ShieldCheck size={13} className={plan.popular ? "text-white/90" : "text-[#635BFF]"} />
                        <span>
                          Paiement sécurisé par <span className={`font-bold ${plan.popular ? "text-white" : "text-[#635BFF]"}`}>stripe</span>
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Bouton pour comparer toutes les fonctionnalités */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowCompare(true)}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/10 hover:bg-[#C4714A] border border-white/20 hover:border-[#C4714A] text-[#E8BE72] hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer"
              >
                <Sparkles size={15} className="text-[#E8BE72] group-hover:text-white" />
                Comparer toutes les fonctionnalités
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Modal Comparatif */}
        <AnimatePresence>
          {showCompare && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1A1512]/60 backdrop-blur-xl"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] flex flex-col relative z-[101]"
              >
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                  <h3 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
                    Comparatif détaillé
                  </h3>
                  <button
                    onClick={() => setShowCompare(false)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-[#C4714A] hover:bg-[#C4714A]/10 rounded-full transition-all duration-300"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8 overflow-y-auto">
                  <table className="w-full text-left text-[15px]">
                    <thead>
                      <tr>
                        <th className="py-5 px-6 font-semibold text-[#2A2016]/40 uppercase tracking-widest text-xs">Fonctionnalité</th>
                        <th className="py-5 px-6 font-bold text-[#2A2016] text-center bg-gray-50 rounded-t-2xl w-1/4 text-lg">Essentielle</th>
                        <th className="py-5 px-6 font-bold text-white text-center bg-[#C4714A] rounded-t-2xl w-1/4 text-lg shadow-inner">Confort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: "Plaque en bois gravée avec QR code", ess: "check-green", conf: "check", hl: false },
                        { name: "Accessible sans application", ess: "check-green", conf: "check", hl: false },
                        { name: "Abonnement", ess: "Zéro abonnement (Unique)", conf: "19 €/an (1,58 €/m) ou 1,99 €/mois", hl: true },
                        { name: "Phrase personnalisée gravée sur plaque", ess: "-", conf: "check", hl: false },
                        { name: "Thème de la page", ess: "3 couleurs au choix", conf: "Couleur libre et photos", hl: false },
                        { name: "Wi-Fi, Horaires, Consignes, Contacts", ess: "check-green", conf: "check", hl: false },
                        { name: "Page mobile dédiée", ess: "check-green", conf: "check", hl: false },
                        { name: "Message de bienvenue", ess: "-", conf: "check", hl: false },
                        { name: "Équipements & services avec notices", ess: "-", conf: "check", hl: false },
                        { name: "Bonnes adresses & transports", ess: "-", conf: "check", hl: false },
                        { name: "Questions fréquentes", ess: "-", conf: "check", hl: false },
                        { name: "Livre d'or interactif", ess: "-", conf: "check", hl: false },
                        { name: "Météo, carte et heure locale", ess: "-", conf: "check", hl: false },
                        { name: "Vos photos sur la page", ess: "-", conf: "check", hl: false },
                        { name: "Page multilingue automatique", ess: "-", conf: "check", hl: false },
                        { name: "Espace propriétaire en ligne", ess: "check-green", conf: "check", hl: false },
                        { name: "Statistiques de consultation", ess: "check-green", conf: "check", hl: false },
                        { name: "Partage SMS & WhatsApp", ess: "check-green", conf: "check", hl: false },
                        { name: "Mises à jour des informations", ess: "5 € la session, page entière", conf: "Illimitées et autonomes", hl: true, last: true },
                      ].map((row, i) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i} 
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className={`py-5 px-6 text-[#2A2016]/80 font-light ${row.last ? 'rounded-bl-2xl' : ''}`}>{row.name}</td>
                          <td className="py-5 px-6 text-center bg-gray-50/50 text-[#6B5D4E]">
                            {row.ess === "check-green" ? <Check size={20} className="mx-auto text-[#5A7A4E]" /> : row.ess === "-" ? <span className="text-gray-300">-</span> : row.ess}
                          </td>
                          <td className={`py-5 px-6 text-center bg-[#C4714A]/5 ${row.hl ? 'font-semibold text-[#C4714A]' : ''} ${row.last ? 'rounded-br-2xl' : ''}`}>
                            {row.conf === "check" ? <Check size={20} className="mx-auto text-[#C4714A]" strokeWidth={3} /> : row.conf}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
