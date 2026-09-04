import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowLeft, Shield, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales d’Utilisation (CGU) — GuidzMe",
  description: "Conditions générales d'utilisation du site guidzme.fr, de l'espace client, de l'éditeur et des livrets numériques.",
};

const CGU_ARTICLES = [
  { id: "cgu-1", title: "1. Objet et acceptation" },
  { id: "cgu-2", title: "2. Accès au Service" },
  { id: "cgu-3", title: "3. Compte et habilitations" },
  { id: "cgu-4", title: "4. Création et publication d’un livret" },
  { id: "cgu-5", title: "5. Règles relatives aux contenus" },
  { id: "cgu-6", title: "6. Signalement et modération" },
  { id: "cgu-7", title: "7. Utilisations interdites du Service" },
  { id: "cgu-8", title: "8. Propriété intellectuelle" },
  { id: "cgu-9", title: "9. Services, liens et recommandations de tiers" },
  { id: "cgu-10", title: "10. Disponibilité, maintenance et sécurité" },
  { id: "cgu-11", title: "11. Données personnelles et traceurs" },
  { id: "cgu-12", title: "12. Suspension, suppression et fin d’accès" },
  { id: "cgu-13", title: "13. Responsabilité" },
  { id: "cgu-14", title: "14. Modification des CGU" },
  { id: "cgu-15", title: "15. Contact" },
  { id: "cgu-16", title: "16. Droit applicable et litiges" },
];

export default function CGUPage() {
  return (
    <main className="min-h-screen bg-[#FBF5EC] text-[#2A2016]">
      {/* Top Header Banner */}
      <header className="border-b border-[#EDD9A3]/60 bg-[#1C1612] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#5A7A4E]/10 blur-[100px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#E8BE72] hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Retour au site
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/10">
                Version du 4 septembre 2026
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#5A7A4E]/20 text-[#A2C498] px-3 py-1 rounded-full border border-[#5A7A4E]/30">
                Partie II — CGU
              </span>
            </div>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Conditions Générales d’Utilisation
          </h1>
          <p className="text-white/70 max-w-2xl text-base font-light leading-relaxed">
            Règles d'accès et d'utilisation du site, de l'espace client, de l'éditeur et des livrets d'accueil numériques.
          </p>

          {/* Nav Tabs */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10 overflow-x-auto hide-scrollbar">
            <Link href="/cgv" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              CGV (Vente)
            </Link>
            <Link href="/cgu" className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5A7A4E] text-white shadow-sm whitespace-nowrap">
              CGU (Utilisation)
            </Link>
            <Link href="/mentions-legales" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              Mentions Légales
            </Link>
            <Link href="/confidentialite" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              Confidentialité & Cookies
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-8 bg-white rounded-3xl p-6 border border-[#EDD9A3]/60 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B5D4E] mb-4 flex items-center gap-2">
                <Scale size={16} className="text-[#5A7A4E]" /> Sommaire des CGU
              </h3>
              <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 hide-scrollbar">
                {CGU_ARTICLES.map((art) => (
                  <a
                    key={art.id}
                    href={`#${art.id}`}
                    className="block text-[13px] text-[#5C3D2E] hover:text-[#5A7A4E] hover:bg-[#FDFBF7] px-2.5 py-1.5 rounded-lg transition-colors truncate"
                  >
                    {art.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Legal Text Body */}
          <div className="lg:col-span-8 space-y-10 text-[15px] leading-relaxed text-[#4A3D30]">
            
            {/* Article 1 */}
            <section id="cgu-1" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                1. Objet et acceptation
              </h2>
              <p>
                Les présentes conditions générales d’utilisation (« CGU ») définissent les règles d’accès et d’utilisation du site <strong>guidzme.fr</strong>, de l’espace client, de l’éditeur de livret et des pages accessibles au moyen d’un QR code (ensemble, le « Service »). Le Service est exploité par CRÉART.
              </p>
              <p>
                Les CGU s’appliquent à toute personne qui consulte ou utilise le Service, notamment le propriétaire ou gestionnaire d’un hébergement, ses collaborateurs et les voyageurs (l’« Utilisateur »).
              </p>
            </section>

            {/* Article 2 */}
            <section id="cgu-2" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                2. Accès au Service
              </h2>
              <p>
                La consultation générale des livrets est possible sans compte pour les voyageurs. La création, personnalisation et gestion d’un livret nécessitent un compte et une formule active.
              </p>
              <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#EDD9A3]/50 text-xs text-[#5C3D2E]">
                <strong>Important :</strong> Les livrets ne sont pas référencés ni destinés à être indexés par les moteurs de recherche. Toutefois, ils restent accessibles via leur QR code et adresse web propre. Ne publiez pas de codes secrets d'accès permanent, données bancaires ou documents d'identité confidentiels sur le livret.
              </div>
            </section>

            {/* Article 3 & 4 */}
            <section id="cgu-3" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                  3. Compte et habilitations
                </h2>
                <p>
                  L’Utilisateur doit fournir des informations exactes et protéger ses identifiants. Le titulaire du compte répond des actions effectuées depuis son accès.
                </p>
              </div>

              <div id="cgu-4" className="pt-4 border-t border-[#EDD9A3]/40 scroll-mt-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                  4. Création et publication d’un livret
                </h2>
                <p>
                  Le gestionnaire sélectionne les rubriques et publie son livret sous sa responsabilité. Il doit vérifier l’aperçu avant publication et maintenir les données à jour (accès, Wi-Fi, consignes, contacts d'urgence).
                </p>
              </div>
            </section>

            {/* Article 5 — Interdictions de contenus */}
            <section id="cgu-5" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016]">
                5. Règles relatives aux contenus
              </h2>
              <p>Sont strictement interdits sur le Service :</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2 bg-[#FFFDF9] p-3 rounded-xl border border-[#EDD9A3]/30">
                  <AlertTriangle size={16} className="text-[#C4714A] shrink-0 mt-0.5" />
                  <span>Contenus portant atteinte à la propriété intellectuelle, à la vie privée ou aux données personnelles de tiers.</span>
                </li>
                <li className="flex items-start gap-2 bg-[#FFFDF9] p-3 rounded-xl border border-[#EDD9A3]/30">
                  <AlertTriangle size={16} className="text-[#C4714A] shrink-0 mt-0.5" />
                  <span>Propos diffamatoires, injurieux, haineux, discriminatoires ou frauduleux.</span>
                </li>
                <li className="flex items-start gap-2 bg-[#FFFDF9] p-3 rounded-xl border border-[#EDD9A3]/30">
                  <AlertTriangle size={16} className="text-[#C4714A] shrink-0 mt-0.5" />
                  <span>Informations dangereuses compromettant la sécurité du logement ou d'un équipement.</span>
                </li>
              </ul>
            </section>

            {/* Article 6 à 10 */}
            <section id="cgu-6" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016]">
                6 à 10. Modération, Propriété & Liens Tiers
              </h2>
              <div className="space-y-3 text-sm">
                <p><strong>6. Signalement :</strong> Tout contenu abusif peut être signalé à <code>contact@guidzme.fr</code> ou via le bouton de signalement en bas de page.</p>
                <p><strong>7. Utilisations interdites :</strong> Attaques informatiques, tentatives d'intrusion ou extraction massive de données sont prohibées.</p>
                <p><strong>8. Propriété intellectuelle :</strong> CRÉART détient les droits sur le logiciel et les modèles. L'hôte conserve la propriété de ses textes et photos.</p>
                <p><strong>9. Recommandations & Liens :</strong> Les boutons d'itinéraires ouvrent des applications externes (Google Maps, Waze, Apple Plans) qui appliquent leurs propres conditions.</p>
                <p><strong>10. Disponibilité :</strong> Des interventions de maintenance planifiées peuvent intervenir pour la sécurité et l'amélioration du service.</p>
              </div>
            </section>

            {/* Article 11 à 16 */}
            <section id="cgu-11" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016]">
                11 à 16. Résiliation, Contact & Droit Applicable
              </h2>
              <p>
                En cas de violation des CGU, un compte peut être suspendu de manière proportionnée. Tout utilisateur peut demander la suppression de ses données à <code>contact@guidzme.fr</code>.
              </p>
              <div className="bg-[#1C1612] text-white p-5 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-[#E8BE72] text-sm">CRÉART SAS</div>
                <div>4 rue du Capitaine Guiraud, 33320 Eysines, France</div>
                <div>E-mail : contact@guidzme.fr — Tél : 05 54 54 09 10</div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
