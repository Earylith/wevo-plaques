"use client";

import { Leaf, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1C1612] text-white/60 pt-24 pb-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-[#C4714A]/5 blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-[#5A7A4E]/5 blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      {/* Huge Watermark */}
      <div className="absolute top-10 left-0 right-0 overflow-hidden flex justify-center pointer-events-none opacity-[0.02] select-none">
        <span className="font-[family-name:var(--font-display)] text-[22vw] font-bold text-white whitespace-nowrap leading-none tracking-tighter">
          GUIDZ.
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 pb-20 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <a href="#" className="flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-105 border border-white/10">
                <Leaf size={16} className="text-[#EDD9A3]" />
              </div>
              <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-white tracking-tight">
                Guidz<span className="text-[#C4714A]">.</span>
              </span>
            </a>
            <p className="text-sm md:text-base text-white/40 max-w-sm leading-relaxed font-light mb-10">
              L'expérience premium de vos locataires commence ici. Un support physique élégant, couplé à une interface digitale sur-mesure.
            </p>
            <a href="mailto:contact@guidz.fr" className="inline-flex items-center gap-2 text-[#E8BE72] hover:text-white transition-colors text-sm tracking-wide font-medium group">
              contact@guidz.fr
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-70 group-hover:opacity-100" />
            </a>
          </div>

          {/* Links Col 1 */}
          <div className="lg:col-span-3 lg:col-start-7">
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 font-semibold mb-8">Navigation</h4>
            <ul className="flex flex-col gap-5">
              {[
                { label: 'Concept', href: '#concept' },
                { label: 'Démo', href: '#demo' },
                { label: 'Fonctionnalités', href: '#fonctionnalites' },
                { label: 'Formules', href: '#offres' }
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-[15px] text-white/60 hover:text-white hover:translate-x-1.5 transition-all inline-block font-light">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 font-semibold mb-8">Informations</h4>
            <ul className="flex flex-col gap-5">
              {[
                { label: 'Multi-biens (Pro)', href: '#pro' },
                { label: 'FAQ', href: '#faq' },
                { label: 'Mentions légales', href: '#' },
                { label: 'CGV', href: '#' }
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-[15px] text-white/60 hover:text-white hover:translate-x-1.5 transition-all inline-block font-light">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-white/30 font-light tracking-wide">
            © {new Date().getFullYear()} Guidz. Tous droits réservés.
          </p>
          <div className="flex items-center gap-1.5 text-[13px] text-white/30 font-light tracking-wide">
            <span>Créé par</span>
            <span className="text-white/60 font-medium tracking-normal hover:text-white cursor-pointer transition-colors">Wevo & Créart</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
