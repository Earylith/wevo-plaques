import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Server, ShieldCheck, Mail, Phone, MapPin, ArrowLeft, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Légales — GuidzMe",
  description: "Mentions légales du site guidzme.fr et informations sur l'éditeur CRÉART SAS et ses hébergeurs.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#FBF5EC] text-[#2A2016]">
      {/* Top Header Banner */}
      <header className="border-b border-[#EDD9A3]/60 bg-[#1C1612] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#E8BE72]/10 blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#E8BE72] hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Retour au site
            </Link>
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/10">
              Version du 4 septembre 2026
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Mentions Légales
          </h1>
          <p className="text-white/70 max-w-2xl text-base font-light leading-relaxed">
            Informations légales obligatoires concernant l'éditeur du site guidzme.fr, la direction de la publication et l'hébergement.
          </p>

          {/* Nav Tabs */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10 overflow-x-auto hide-scrollbar">
            <Link href="/cgv" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              CGV (Vente)
            </Link>
            <Link href="/cgu" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              CGU (Utilisation)
            </Link>
            <Link href="/mentions-legales" className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E8BE72] text-[#1C1612] shadow-sm whitespace-nowrap">
              Mentions Légales
            </Link>
            <Link href="/confidentialite" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              Confidentialité & Cookies
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 space-y-10 text-[15px] leading-relaxed text-[#4A3D30]">
        
        {/* Éditeur Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs">
          <div className="flex items-center gap-3 text-[#C4714A] font-bold text-lg mb-6">
            <Building2 size={24} /> 1. Éditeur du site
          </div>

          <p className="mb-6 text-[#5C3D2E]">
            Le site internet <strong>https://guidzme.fr</strong> et les services associés sont édités et exploités par la société :
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium bg-[#FDFBF7] p-5 rounded-2xl border border-[#EDD9A3]/40">
            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">Raison Sociale</span>
              <span className="text-[#2A2016] font-bold text-sm block">CRÉART SAS</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">Forme juridique</span>
              <span className="text-[#2A2016] font-bold text-sm block">Société par Actions Simplifiée (SAS)</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">Capital Social</span>
              <span className="text-[#2A2016] font-bold block">1 000,00 €</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">Siège Social</span>
              <span className="text-[#2A2016] font-bold block">4 rue du Capitaine Guiraud, 33320 Eysines, France</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">Immatriculation RCS</span>
              <span className="text-[#2A2016] font-bold block">RCS Bordeaux 943 936 369</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">SIREN / SIRET</span>
              <span className="text-[#2A2016] font-bold block">943 936 369 / 943 936 369 00017</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">TVA Intracommunautaire</span>
              <span className="text-[#2A2016] font-bold block">FR43 943936369</span>
            </div>

            <div className="space-y-1">
              <span className="text-[#6B5D4E] uppercase text-[10px] tracking-wider font-bold block">Contact direct</span>
              <span className="text-[#2A2016] font-bold block">contact@guidzme.fr — 05 54 54 09 10</span>
            </div>
          </div>
        </section>

        {/* Direction publication */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs">
          <div className="flex items-center gap-3 text-[#C4714A] font-bold text-lg mb-4">
            <ShieldCheck size={24} /> 2. Direction de la publication
          </div>
          <p>
            <strong>Directeur de la publication :</strong> Le représentant légal de la SAS CRÉART.
          </p>
          <p className="mt-2 text-xs text-[#6B5D4E]">
            Pour toute question ou demande de rectification concernant les contenus édités, vous pouvez nous écrire directement à <a href="mailto:contact@guidzme.fr" className="underline font-bold text-[#2A2016]">contact@guidzme.fr</a>.
          </p>
        </section>

        {/* Hébergeurs */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs space-y-6">
          <div className="flex items-center gap-3 text-[#C4714A] font-bold text-lg">
            <Server size={24} /> 3. Hébergement du site & des services
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vercel */}
            <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#EDD9A3]/40 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B5D4E]">Hébergement Web (Front-end)</div>
              <div className="font-bold text-[#2A2016] text-base">Vercel Inc.</div>
              <p className="text-xs text-[#5C3D2E]">
                440 N Barranca Ave #4133<br />Covina, CA 91723, États-Unis
              </p>
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C4714A] hover:underline pt-2">
                <Globe size={12} /> vercel.com
              </a>
            </div>

            {/* Firebase */}
            <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#EDD9A3]/40 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B5D4E]">Bases de données & Comptes</div>
              <div className="font-bold text-[#2A2016] text-base">Google Firebase</div>
              <p className="text-xs text-[#5C3D2E]">
                Google Ireland Limited<br />Gordon House, Barrow Street, Dublin 4, Irlande
              </p>
              <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C4714A] hover:underline pt-2">
                <Globe size={12} /> firebase.google.com
              </a>
            </div>

            {/* OVH */}
            <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#EDD9A3]/40 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6B5D4E]">Nom de domaine</div>
              <div className="font-bold text-[#2A2016] text-base">OVH SAS</div>
              <p className="text-xs text-[#5C3D2E]">
                2 rue Kellermann<br />59100 Roubaix, France
              </p>
              <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C4714A] hover:underline pt-2">
                <Globe size={12} /> ovhcloud.com
              </a>
            </div>
          </div>
        </section>

        {/* Propriété Intellectuelle */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2A2016]">
            4. Propriété intellectuelle
          </h2>
          <p>
            L’ensemble des contenus (textes, graphismes, logos, modèles de plaques, interfaces, éléments logiciels) présents sur le site <strong>guidzme.fr</strong> est protégé par le droit d’auteur et la propriété intellectuelle. Toute reproduction, distribution ou exploitation sans autorisation préalable écrite de la société CRÉART SAS est strictement interdite.
          </p>
        </section>

        {/* Données personnelles */}
        <section className="bg-[#1C1612] text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
          <div className="text-[#E8BE72] font-bold text-lg">
            5. Protections des données personnelles (RGPD)
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour en savoir plus sur la gestion de vos données et exercer vos droits, consultez notre page dédiée :
          </p>
          <div>
            <Link href="/confidentialite" className="inline-flex items-center gap-2 bg-[#C4714A] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#b05d37] transition-colors">
              Consulter la Politique de Confidentialité →
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
