"use client";

import { useState } from "react";
import { Check, ArrowRight, X, Zap, Sparkles, Plus, ShieldCheck, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PricingSection() {
  const [showCompare, setShowCompare] = useState(false);

  const plans = [
    {
      name: "Essentiel",
      price: "49",
      popular: false,
      badge: "Simple et efficace",
      desc: "Une solution simple en paiement unique, avec page fixe et modifications à la demande.",
      features: [
        "1 support Guidz standard",
        "Choix parmi 4 thèmes",
        "QR code unique",
        "Page mobile dédiée",
        "Wi‑Fi",
        "Arrivée / départ",
        "Règles du logement",
        "Contacts & urgences",
        "Page hébergée en ligne",
        "Modifications possibles à la demande (25€/modification de page)",
      ],
      after: "Paiement unique",
      cta: "Choisir l'Essentiel",
      href: "https://buy.stripe.com/7sY4gyb8BfzU9s7brl7IY00",
    },
    {
      name: "Confort",
      price: "69",
      popular: true,
      badge: "La plus populaire",
      desc: "Modifiez votre Guidz quand vous voulez depuis votre espace",
      features: [
        "Toutes les fonctionnalités de l'Essentiel",
        "1 Support Guidz personnalisé",
        "Couleurs personnalisées",
        "Nom du logement",
        "Logo ou visuel du logement",
        "Message de bienvenue",
        "Recommandations locales",
        "Page multilingue",
        "Espace propriétaire",
        "Modifications illimitées en autonomie",
      ],
      after: "Puis 1,99 €/mois ou 19 €/an",
      cta: "Choisir le Confort",
      href: "https://buy.stripe.com/eVq6oG2C5afAgUz52X7IY01",
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
                Choisissez <br/> l'offre qui vous <span className="text-[#C4714A] italic">correspond.</span>
              </h2>
              <p className="text-[#FBF5EC]/70 text-[15px] leading-relaxed mb-8 max-w-sm">
                Une tarification claire et sans surprise. Optez pour la simplicité d'un paiement unique ou la liberté d'une gestion 100% autonome de vos informations.
              </p>
            </div>
            
            <button
              onClick={() => setShowCompare(true)}
              className="group inline-flex items-center gap-2 text-[13px] font-bold tracking-wide uppercase text-[#E8BE72] hover:text-white transition-colors self-start mt-4 xl:mt-auto py-2"
            >
              Comparer en détail
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* RIGHT COLUMN: PRICING CARDS */}
          <div className="xl:w-[65%] grid md:grid-cols-2 gap-4 lg:gap-5 relative z-10">
            {plans.map((plan, i) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`rounded-[32px] p-6 sm:p-8 flex flex-col relative group overflow-hidden transition-all duration-500 ${
                  plan.popular 
                    ? "bg-gradient-to-b from-[#C4714A] to-[#A35A38] shadow-[0_10px_40px_rgba(196,113,74,0.4)] border border-[#D4866A]/40 scale-[1.02]" 
                    : "bg-[#FBF5EC] border border-[#EDD9A3]/60 shadow-lg"
                }`}
              >
                {/* Shine Sweep Effect for Popular Card */}
                {plan.popular && (
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "200%" }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] z-20 pointer-events-none"
                  />
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-5 relative z-10 min-h-[60px]">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className={`text-2xl font-bold font-[family-name:var(--font-display)] ${plan.popular ? "text-white" : "text-[#2A2016]"}`}>{plan.name}</h3>
                      {plan.badge && (
                        <span className={`${plan.popular ? "bg-white/20 text-white border-white/20" : "bg-[#2A2016]/10 text-[#2A2016] border-[#2A2016]/10"} backdrop-blur-md text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-snug max-w-[180px] ${plan.popular ? "text-white/80" : "text-[#6B5D4E]/80"}`}>{plan.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-4xl font-bold tracking-tighter mb-0.5 ${plan.popular ? "text-white" : "text-[#2A2016]"}`}>
                      {plan.price}<span className={`text-2xl ${plan.popular ? "text-white/70" : "text-[#2A2016]/50"}`}>€</span>
                    </div>
                    <div className={`text-[9px] uppercase tracking-widest font-semibold ${plan.popular ? "text-white/60" : "text-[#6B5D4E]/60"}`}>{plan.after}</div>
                  </div>
                </div>

                {/* Features List (Compact) */}
                <div className={`rounded-[20px] p-4 sm:p-5 flex-1 mb-6 relative z-10 ${
                  plan.popular ? "bg-black/15 border border-white/10 shadow-inner" : "bg-white/60 border border-[#EDD9A3]/30"
                }`}>

                  <ul className="space-y-2.5">
                    {plan.features.map((f, index) => {
                      const isBaseFeature = plan.name === "Confort" && index === 0;
                      const isPremiumFeature = plan.name === "Confort" && index > 0;
                      const isPremiumDivider = plan.name === "Confort" && index === 1;

                      return (
                        <li key={index} className="flex flex-col">
                          {isPremiumDivider && (
                            <div className="flex items-center gap-2 mb-3 mt-2 pt-3 border-t border-white/10">
                              <Sparkles size={13} className="text-[#E8BE72] fill-[#E8BE72]" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E8BE72]">En plus, vous obtenez :</span>
                            </div>
                          )}
                          <div className={`flex items-start gap-3 ${isPremiumFeature ? 'pl-2' : ''}`}>
                            {isPremiumFeature ? (
                              <Check size={14} className="shrink-0 mt-0.5 text-[#E8BE72]" strokeWidth={4} />
                            ) : isBaseFeature ? (
                              <Plus size={14} className="shrink-0 mt-0.5 text-white/60" strokeWidth={3} />
                            ) : (
                              <Check size={14} className="shrink-0 mt-0.5 text-[#5A7A4E]" strokeWidth={3} />
                            )}
                            <span className={`text-[13px] leading-tight ${
                              isPremiumFeature ? 'font-semibold text-white' : 
                              isBaseFeature ? 'font-medium text-white/60' : 
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

                {/* Réassurance Stripe */}
                {(plan.name === "Essentiel" || plan.name === "Confort") && (
                  <div className="mt-4 flex flex-col items-center gap-1.5 relative z-10">
                    <div className={`flex items-center gap-1.5 text-[11px] font-medium ${plan.popular ? "text-white/90" : "text-[#6B5D4E]/80"}`}>
                      <Lock size={12} />
                      Paiement 100% sécurisé
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] ${plan.popular ? "text-white/70" : "text-[#6B5D4E]/60"}`}>
                      <ShieldCheck size={12} className={plan.popular ? "text-white/90" : "text-[#635BFF]"} />
                      Certifié par <span className={`font-bold ${plan.popular ? "text-white" : "text-[#635BFF]"}`}>stripe</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
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
                        <th className="py-5 px-6 font-bold text-[#2A2016] text-center bg-gray-50 rounded-t-2xl w-1/4 text-lg">Essentiel</th>
                        <th className="py-5 px-6 font-bold text-white text-center bg-[#C4714A] rounded-t-2xl w-1/4 text-lg shadow-inner">Confort</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: "Support Guidz en bois", ess: "Standard (4 thèmes)", conf: "100% Personnalisé", hl: true },
                        { name: "Nom & Logo sur le support", ess: "-", conf: "check", hl: false },
                        { name: "Page mobile dédiée", ess: "check-green", conf: "check", hl: false },
                        { name: "Wi-Fi, Horaires, Consignes, Contacts", ess: "check-green", conf: "check", hl: false },
                        { name: "Transports & Recommandations", ess: "-", conf: "check", hl: false },
                        { name: "Page multilingue automatique", ess: "-", conf: "check", hl: false },
                        { name: "Espace propriétaire en ligne", ess: "-", conf: "check", hl: false },
                        { name: "Mises à jour des informations", ess: "À la demande (25€)", conf: "Illimitées et autonomes", hl: true, last: true },
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
