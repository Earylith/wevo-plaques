"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ARTICLES_PAR_DATE } from "@/lib/blog";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 pb-20 border-b border-white/10">

          {/* Brand Col */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-start">
            <Link href="/" className="flex items-center group mb-6">
              <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-white tracking-tight">
                Guidzme<span className="text-[#C4714A]">.</span>
              </span>
            </Link>
            <p className="text-sm md:text-base text-white/40 max-w-sm leading-relaxed font-light mb-10">
              L&rsquo;expérience premium de vos locataires commence ici. Un support physique élégant, couplé à une interface digitale sur-mesure.
            </p>
            <a href="mailto:contact@guidzme.fr" className="inline-flex items-center gap-2 text-[#E8BE72] hover:text-white transition-colors text-sm tracking-wide font-medium group">
              contact@guidzme.fr
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-70 group-hover:opacity-100" />
            </a>
          </div>

          {/* Links Col 1 */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 font-semibold mb-8">Navigation</h4>
            <ul className="flex flex-col gap-5">
              {[
                { label: 'Concept', href: '/#concept' },
                { label: 'Démo', href: '/#demo' },
                { label: 'Tous les livrets de démonstration', href: '/livrets-demo' },
                { label: 'Fonctionnalités', href: '/#fonctionnalites' },
                { label: 'Formules et tarifs', href: '/#offres' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[15px] text-white/60 hover:text-white hover:translate-x-1.5 transition-all inline-block font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/*
            Les guides.
            Ils sont listés depuis le sommaire du blog : un article publié
            apparaît ici sans intervention, et le pied de page reste le
            chemin le plus court entre n'importe quelle page et le contenu.
          */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 font-semibold mb-8">Nos guides</h4>
            <ul className="flex flex-col gap-5">
              {ARTICLES_PAR_DATE.slice(0, 5).map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-[15px] text-white/60 hover:text-white hover:translate-x-1.5 transition-all inline-block font-light leading-snug"
                  >
                    {article.titreSeo ?? article.titre}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/blog"
                  className="text-[15px] text-[#E8BE72] hover:text-white transition-colors inline-block font-medium"
                >
                  Voir tous les articles →
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-white/30 font-semibold mb-8">Informations</h4>
            <ul className="flex flex-col gap-5">
              {[
                { label: 'Multi-biens (Pro)', href: '/#pro' },
                { label: 'Demander un devis', href: '/devis?offre=multibien' },
                { label: 'FAQ', href: '/#faq' },
                { label: 'Confidentialité & cookies', href: '/confidentialite' },
                { label: 'Gérer mes cookies', href: '/confidentialite#choix' },
                { label: 'Mentions légales', href: '#' },
                { label: 'CGV', href: '#' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[15px] text-white/60 hover:text-white hover:translate-x-1.5 transition-all inline-block font-light">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 flex-wrap">
          <p className="text-[13px] text-white/30 font-light tracking-wide shrink-0">
            © {new Date().getFullYear()} Guidz. Tous droits réservés.
          </p>

          {/* Logos de réassurance paiement */}
          <div className="flex items-center justify-center gap-4">
            <img src="/images/R%C3%A9assurances/Stripe_Logo,_revised_2016.svg.webp" alt="Stripe" className="h-5 w-auto object-contain" />
            <img src="/images/R%C3%A9assurances/Visa_Inc._logo_(2021%E2%80%93present).svg.webp" alt="Visa" className="h-3 w-auto object-contain" />
            <img src="/images/R%C3%A9assurances/Mastercard-logo.svg.webp" alt="Mastercard" className="h-5 w-auto object-contain" />
            <img src="/images/R%C3%A9assurances/Apple_Pay_logo.svg.webp" alt="Apple Pay" className="h-5 w-auto object-contain" />
            <img src="/images/R%C3%A9assurances/Google_Pay_Logo.svg.webp" alt="Google Pay" className="h-5 w-auto object-contain" />
          </div>

          {/* Signature Removed */}
        </div>
      </div>
    </footer>
  );
}
