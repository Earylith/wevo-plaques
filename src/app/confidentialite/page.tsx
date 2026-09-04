import type { Metadata } from "next";
import Link from "next/link";
import RevenirSurMonChoix from "@/components/ui/RevenirSurMonChoix";
import { ArrowLeft, Shield, Lock, Eye, Server, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Confidentialité & Cookies — GuidzMe",
  description: "Politique de protection des données personnelles (RGPD) et gestion des cookies sur GuidzMe.",
};

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs">
      <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold tracking-[-0.02em] text-[#2A2016] mb-4">
        {titre}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[#5C3D2E]">{children}</div>
    </section>
  );
}

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#FBF5EC] text-[#2A2016]">
      {/* Header Banner */}
      <header className="border-b border-[#EDD9A3]/60 bg-[#1C1612] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#5A7A4E]/10 blur-[100px] pointer-events-none" />
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
            Politique de Confidentialité
          </h1>
          <p className="text-white/70 max-w-2xl text-base font-light leading-relaxed">
            Ce que nous collectons, pourquoi, et pendant combien de temps. Transparence totale et respect de la vie privée.
          </p>

          {/* Nav Tabs */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10 overflow-x-auto hide-scrollbar">
            <Link href="/cgv" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              CGV (Vente)
            </Link>
            <Link href="/cgu" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              CGU (Utilisation)
            </Link>
            <Link href="/mentions-legales" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
              Mentions Légales
            </Link>
            <Link href="/confidentialite" className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C4714A] text-white shadow-sm whitespace-nowrap">
              Confidentialité & Cookies
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16 space-y-8">
        
        {/* Responsable de traitement */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs">
          <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-3">
            Responsable de traitement
          </h2>
          <p className="text-[15px] leading-relaxed text-[#5C3D2E]">
            Le responsable des traitements de données personnelles au sens du Règlement Général sur la Protection des Données (RGPD) est la société <strong>CRÉART SAS</strong>, située au 4 rue du Capitaine Guiraud, 33320 Eysines, France (contact : <code>contact@guidzme.fr</code>).
          </p>
        </section>

        <Section titre="Les livrets sont mesurés sans être pistés">
          <p>
            Quand un voyageur ouvre un livret d'accueil numérique via QR code, nous incrémentons uniquement un compteur : le nombre d’ouvertures, la rubrique consultée, le jour et la tranche horaire. <strong>Aucun identifiant nominatif n’est posé</strong> — pas de cookie publicitaire sur les livrets, pas d’adresse IP conservée pour du profilage.
          </p>
          <p>
            C’est ce qui permet à un hôte de voir que « Codes &amp; Wi-Fi » est sa rubrique la plus lue, sans jamais savoir qui l’a lue. Cette mesure d'audience anonyme ne dépend d’aucun consentement, précisément parce qu’elle ne concerne personne en particulier.
          </p>
        </Section>

        <Section titre="Ce que nous conservons sur les hôtes">
          <p>
            Un compte client nécessite une adresse e-mail et un mot de passe — dont nous ne voyons jamais le clair : l’authentification passe de façon sécurisée par Firebase.
          </p>
          <p>
            S’y ajoute ce que l’hôte saisit dans son livret (informations pratiques, Wi-Fi, consignes) et les coordonnées nécessaires à la livraison et à la facturation de sa plaque : nom, adresse postale de livraison, numéro de téléphone. Le paiement est entièrement délégué à notre prestataire Stripe : aucun numéro de carte ne transite ni n'est stocké sur nos serveurs.
          </p>
          <p>
            Un hôte peut demander la suppression définitive de son compte depuis son espace client ou par e-mail. La suppression est immédiate : ses livrets et statistiques sont définitivement effacés. Seules les pièces comptables obligatoires (factures) sont archivées selon les obligations légales applicables.
          </p>
        </Section>

        <Section titre="Sous-traitants et hébergement">
          <p>Pour assurer le service, CRÉART fait appel à des prestataires de confiance :</p>
          <ul className="list-disc pl-5 space-y-1 text-xs font-medium text-[#4A3D30]">
            <li><strong>Vercel Inc. :</strong> Hébergement et distribution web de l'application front-end (Serveurs sécurisés).</li>
            <li><strong>Google Ireland Limited (Firebase) :</strong> Gestion des comptes utilisateurs authentifiés et de la base de données Firestore.</li>
            <li><strong>Stripe Payments Europe :</strong> Traitement hautement sécurisé des transactions de paiement (Norme PCI-DSS).</li>
            <li><strong>OVH SAS :</strong> Gestion de l'infrastructure de nom de domaine.</li>
          </ul>
        </Section>

        <Section titre="Les traceurs, et votre choix">
          <p>
            Sur le site vitrine (guidzme.fr), nous mesurons l’audience et l’efficacité de nos offres. Ces mesures reposent sur des traceurs dont le dépôt est soumis à votre accord préalable.
          </p>
          <p>
            Vous pouvez choisir finalité par finalité, et vous pouvez modifier votre choix à tout moment. Votre consentement est conservé pendant 13 mois.
          </p>
          <div id="choix" className="scroll-mt-24 pt-4 border-t border-[#EDD9A3]/40">
            <RevenirSurMonChoix />
          </div>
        </Section>

        <Section titre="Vos droits RGPD">
          <p>
            Conformément à la réglementation européenne, vous disposez d'un droit d’accès, de rectification, de portabilité, d'effacement de vos données, ainsi que du droit de retirer votre consentement ou de vous opposer au traitement.
          </p>
          <p>
            Pour exercer vos droits, contactez-nous à{" "}
            <a
              href="mailto:contact@guidzme.fr"
              className="font-semibold underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
            >
              contact@guidzme.fr
            </a>{" "}
            — nous vous répondrons sous 30 jours au plus tard. Si vous estimez que vos droits ne sont pas respectés, vous pouvez poser une réclamation auprès de la CNIL (www.cnil.fr).
          </p>
        </Section>

        <Section titre="Signaler un contenu">
          <p>
            Les livrets d'accueil sont rédigés directement par les hôtes sous leur propre responsabilité. Chaque livret comporte un lien de signalement en bas de page. Vous pouvez également nous signaler un contenu inapproprié ou illicite directement par e-mail à <code>contact@guidzme.fr</code>.
          </p>
        </Section>

      </div>
    </main>
  );
}
