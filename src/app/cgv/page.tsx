import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldCheck, Scale, ArrowLeft, Download, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente (CGV) — GuidzMe",
  description: "Conditions générales de vente applicables aux plaques d'accueil physiques et livrets numériques GuidzMe.",
};

const ARTICLES = [
  { id: "art-1", title: "1. Identité du vendeur" },
  { id: "art-2", title: "2. Objet, champ d’application et définitions" },
  { id: "art-3", title: "3. Offres GuidzMe" },
  { id: "art-4", title: "4. Commande et formation du contrat" },
  { id: "art-5", title: "5. Personnalisation, validation et contenus fournis" },
  { id: "art-6", title: "6. Prix, taxes et promotions" },
  { id: "art-7", title: "7. Paiement" },
  { id: "art-8", title: "8. Abonnements Confort" },
  { id: "art-9", title: "9. Fourniture du service numérique et mises à jour" },
  { id: "art-10", title: "10. Fabrication, livraison et transfert des risques" },
  { id: "art-11", title: "11. Droit de rétractation des consommateurs" },
  { id: "art-12", title: "12. Garanties légales — consommateurs" },
  { id: "art-13", title: "13. Réclamations et service après-vente" },
  { id: "art-14", title: "14. Responsabilité" },
  { id: "art-15", title: "15. Compte Client et sécurité" },
  { id: "art-16", title: "16. Propriété intellectuelle" },
  { id: "art-17", title: "17. Données personnelles" },
  { id: "art-18", title: "18. Force majeure" },
  { id: "art-19", title: "19. Preuve et archivage" },
  { id: "art-20", title: "20. Modification des CGV" },
  { id: "art-21", title: "21. Médiation de la consommation" },
  { id: "art-22", title: "22. Droit applicable et juridictions compétentes" },
  { id: "annexe", title: "Annexe — Formulaire type de rétractation" },
];

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-[#FBF5EC] text-[#2A2016]">
      {/* Top Header Banner */}
      <header className="border-b border-[#EDD9A3]/60 bg-[#1C1612] text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C4714A]/10 blur-[100px] pointer-events-none" />
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
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#C4714A]/20 text-[#E8BE72] px-3 py-1 rounded-full border border-[#C4714A]/30">
                Partie I — CGV
              </span>
            </div>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Conditions Générales de Vente
          </h1>
          <p className="text-white/70 max-w-2xl text-base font-light leading-relaxed">
            Plaques d’accueil avec QR code et livrets d’accueil numériques GuidzMe. Applicable aux clients particuliers et professionnels.
          </p>

          {/* Nav Tabs between Legal Pages */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10 overflow-x-auto hide-scrollbar">
            <Link href="/cgv" className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C4714A] text-white shadow-sm whitespace-nowrap">
              CGV (Vente)
            </Link>
            <Link href="/cgu" className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap">
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
                <Scale size={16} className="text-[#C4714A]" /> Sommaire des CGV
              </h3>
              <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1 hide-scrollbar">
                {ARTICLES.map((art) => (
                  <a
                    key={art.id}
                    href={`#${art.id}`}
                    className="block text-[13px] text-[#5C3D2E] hover:text-[#C4714A] hover:bg-[#FDFBF7] px-2.5 py-1.5 rounded-lg transition-colors truncate"
                  >
                    {art.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Legal Text Body */}
          <div className="lg:col-span-8 space-y-10 text-[15px] leading-relaxed text-[#4A3D30]">
            
            {/* Intro Header Note */}
            <div className="bg-white rounded-2xl p-5 border-l-4 border-[#C4714A] border-y border-r border-[#EDD9A3]/40 shadow-xs">
              <p className="text-xs font-semibold text-[#6B5D4E]">
                Cette première partie (Partie I) encadre les commandes, paiements, abonnements, livraisons, rétractations et garanties.
                La Partie II (CGU) encadre l’utilisation quotidienne du Site, de l’éditeur et des livrets numériques.
              </p>
            </div>

            {/* Article 1 */}
            <section id="art-1" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-4">
                1. Identité du vendeur
              </h2>
              <p className="mb-4">Le site <strong>guidzme.fr</strong> et les offres commercialisées sous la marque GuidzMe sont exploités par :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#FDFBF7] p-4 rounded-2xl border border-[#EDD9A3]/40">
                <div><span className="font-bold text-[#2A2016]">Dénomination :</span> CRÉART</div>
                <div><span className="font-bold text-[#2A2016]">Forme juridique :</span> SAS au capital de 1 000 €</div>
                <div><span className="font-bold text-[#2A2016]">Siège social :</span> 4 rue du Capitaine Guiraud, 33320 Eysines</div>
                <div><span className="font-bold text-[#2A2016]">Immatriculation :</span> SIREN 943 936 369 — RCS Bordeaux</div>
                <div><span className="font-bold text-[#2A2016]">SIRET :</span> 943 936 369 00017</div>
                <div><span className="font-bold text-[#2A2016]">TVA Intracommunautaire :</span> FR43 943936369</div>
                <div><span className="font-bold text-[#2A2016]">Contact :</span> contact@guidzme.fr — 05 54 54 09 10</div>
                <div><span className="font-bold text-[#2A2016]">Site web :</span> https://guidzme.fr</div>
              </div>
            </section>

            {/* Article 2 */}
            <section id="art-2" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                2. Objet, champ d’application et définitions
              </h2>
              <p>
                Les présentes conditions générales de vente (« CGV ») régissent les ventes conclues à distance sur <strong>guidzme.fr</strong> entre CRÉART et toute personne physique ou morale qui commande une plaque d’accueil, un livret d’accueil numérique ou un service associé (« Client »).
              </p>
              <p>
                Elles s’appliquent aux consommateurs, aux non-professionnels et aux professionnels. Les dispositions identifiées comme propres aux consommateurs ne s’appliquent qu’aux personnes agissant à des fins n’entrant pas dans le cadre de leur activité commerciale, industrielle, artisanale, libérale ou agricole. Les règles impératives protégeant les consommateurs prévalent sur toute stipulation contraire.
              </p>
              <p>
                Les caractéristiques essentielles, le contenu exact de chaque formule, sa durée, son prix et les éventuelles limitations fonctionnelles sont ceux présentés sur le Site et récapitulés avant validation de la commande. En cas de contradiction, le récapitulatif de commande accepté par le Client prévaut pour les éléments propres à la commande.
              </p>
            </section>

            {/* Article 3 */}
            <section id="art-3" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                3. Offres GuidzMe
              </h2>
              
              <div>
                <h3 className="font-bold text-[#2A2016] text-base mb-1">3.1 Plaque physique</h3>
                <p>
                  La plaque comporte notamment un QR code permettant d’accéder au livret d’accueil numérique associé. Ses dimensions, son matériau, sa finition, son système de fixation, les éléments personnalisables et les contraintes d’utilisation sont indiqués dans la fiche produit et le configurateur au moment de la commande. Le bois étant un matériau naturel, ses teintes, veinages, nœuds et contrastes peuvent varier. Ces variations normales ne constituent pas un défaut de conformité si le produit reste conforme aux caractéristiques annoncées.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#2A2016] text-base mb-1">3.2 Formule Essentielle</h3>
                <p>
                  La formule Essentielle comprend une plaque comportant un QR code unique, rattaché à un hébergement déterminé, et un livret numérique aux fonctionnalités définies sur le Site. Le prix actuellement affiché de la formule est de <strong>49 € TTC</strong>, sous réserve du prix définitif récapitulé avant paiement. Une modification ultérieure du livret est facturée <strong>5 € TTC</strong>, sauf tarif différent clairement affiché et accepté avant la demande.
                </p>
                <p className="mt-2">
                  Le livret Essentiel est hébergé pour une durée indéterminée, sans abonnement récurrent. Cette stipulation ne constitue pas un engagement d’hébergement perpétuel. CRÉART peut mettre fin au service pour un motif légitime, notamment technique, économique, réglementaire ou de sécurité, moyennant un préavis de six mois communiqué sur un support durable.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#2A2016] text-base mb-1">3.3 Formule Confort</h3>
                <p>
                  La formule Confort comprend une plaque personnalisable comportant un QR code unique, rattaché à un hébergement déterminé, et un livret numérique enrichi. Le prix actuellement affiché de la formule est de <strong>69 € TTC</strong>, auquel s’ajoute un abonnement de <strong>1,99 € TTC par mois</strong> ou <strong>19 € TTC par an</strong>, selon la périodicité choisie. Les modifications du livret sont illimitées pendant la période d’abonnement, dans le respect d’un usage normal du Service.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#2A2016] text-base mb-1">3.4 Prérequis techniques</h3>
                <p>
                  L’utilisation du livret nécessite un appareil compatible, un navigateur internet récent, une connexion internet et un lecteur de QR code ou une fonction équivalente. Les frais d’équipement et de connexion restent à la charge du Client et des voyageurs.
                </p>
              </div>
            </section>

            {/* Article 4 */}
            <section id="art-4" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                4. Commande et formation du contrat
              </h2>
              <p>
                Le Client sélectionne une formule, renseigne les informations demandées, personnalise le produit lorsque l’offre le permet, vérifie le récapitulatif, corrige les éventuelles erreurs, accepte les CGV et valide le paiement au moyen d’un bouton indiquant sans ambiguïté que la commande oblige au paiement.
              </p>
              <p>
                La commande n’est définitive qu’après confirmation du paiement et envoi au Client d’un courrier électronique de confirmation sur un support durable. CRÉART peut refuser ou annuler une commande en cas de fraude suspectée, d’incident de paiement, d’informations manifestement erronées, de contenu illicite ou de litige antérieur non résolu.
              </p>
              <p>
                Le Client doit être majeur et juridiquement capable de contracter. Le professionnel garantit que la personne passant commande est habilitée à l’engager.
              </p>
            </section>

            {/* Article 5 */}
            <section id="art-5" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                5. Personnalisation, validation et contenus fournis
              </h2>
              <p>
                Le Client est seul responsable de l’exactitude des textes, coordonnées, traductions, liens, images, logos, consignes et autres contenus qu’il saisit ou transmet. Il doit vérifier attentivement l’aperçu, notamment l’orthographe, les dimensions apparentes, le positionnement des éléments et le rattachement du QR code au bon hébergement.
              </p>
              <p>
                La validation de l’aperçu ou de la commande vaut accord de fabrication sur la base des éléments affichés, sous réserve d’un défaut technique imputable à CRÉART. Une différence mineure entre l’affichage à l’écran et le rendu physique, notamment liée à l’écran, au matériau naturel ou au procédé de gravure, ne constitue pas à elle seule un défaut.
              </p>
              <p>
                Le Client garantit disposer de tous les droits et autorisations nécessaires sur les contenus transmis. Il s’interdit tout contenu illicite, trompeur, dangereux, contrefaisant, discriminatoire ou haineux.
              </p>
            </section>

            {/* Article 6 & 7 */}
            <section id="art-6" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                  6. Prix, taxes et promotions
                </h2>
                <p>
                  Les prix applicables sont ceux affichés en euros sur le Site au moment de la commande. Pour un consommateur, ils sont indiqués toutes taxes comprises. Pour un professionnel, l’affichage hors taxes ou toutes taxes comprises est précisé avant la commande. Les frais de livraison, options et coûts récurrents sont présentés séparément avant validation.
                </p>
              </div>

              <div id="art-7" className="pt-4 border-t border-[#EDD9A3]/40 scroll-mt-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                  7. Paiement
                </h2>
                <p>
                  Les moyens de paiement acceptés sont indiqués lors de la commande (carte bancaire via Stripe, Apple Pay, Google Pay). Le prix de la plaque et des options est exigible à la commande. Les échéances d’abonnement sont prélevées au début de chaque période mensuelle ou annuelle.
                </p>
                <p className="mt-2 text-xs bg-[#FDFBF7] p-3 rounded-xl border border-[#EDD9A3]/30">
                  Pour les professionnels, toute somme non payée à l’échéance entraîne, de plein droit et sans rappel, des intérêts de retard au taux de refinancement BCE + 10 points, ainsi qu’une indemnité forfaitaire légale de 40 € pour frais de recouvrement.
                </p>
              </div>
            </section>

            {/* Article 8 */}
            <section id="art-8" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                8. Abonnements Confort
              </h2>
              
              <div>
                <h3 className="font-bold text-[#2A2016] text-base mb-1">8.1 Abonnement mensuel</h3>
                <p>
                  L’abonnement mensuel est conclu pour un mois puis renouvelé automatiquement par périodes d’un mois, sauf résiliation. Le Client peut le résilier à tout moment depuis son espace client ; la résiliation prend effet à la fin de la période mensuelle déjà payée.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#2A2016] text-base mb-1">8.2 Abonnement annuel</h3>
                <p>
                  L’abonnement annuel est conclu pour douze mois puis renouvelé automatiquement. Pour le consommateur, CRÉART adressera l’information écrite préalable légale (article L. 215-1 du Code de la consommation) rappelant la possibilité de ne pas reconduire le contrat.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#2A2016] text-base mb-1">8.3 Résiliation en ligne et choix à l’échéance</h3>
                <p>
                  La résiliation s’effectue facilement en ligne depuis l’espace client via le bouton « Résilier votre abonnement ». Lors de la résiliation, le Client choisit entre :
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Le passage en formule Essentielle :</strong> Le livret bascule sans frais en formule Essentielle à l’échéance payée. Le QR code et le livret restent actifs.</li>
                  <li><strong>La suppression définitive du compte :</strong> L’accès cesse et le livret est supprimé à l’échéance.</li>
                </ul>
              </div>
            </section>

            {/* Article 9 & 10 */}
            <section id="art-9" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                  9. Fourniture du service numérique et mises à jour
                </h2>
                <p>
                  Le service numérique est activé immédiatement après confirmation du paiement. CRÉART fournit les mises à jour nécessaires au maintien de la conformité pendant toute la durée du service.
                </p>
              </div>

              <div id="art-10" className="pt-4 border-t border-[#EDD9A3]/40 scroll-mt-8">
                <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                  10. Fabrication, livraison et transfert des risques
                </h2>
                <p>
                  Les livraisons sont proposées en France métropolitaine. La plaque est expédiée au plus tard dans les <strong>5 jours ouvrés</strong> suivant la confirmation de la commande. Le délai légal maximal de livraison est de 30 jours.
                </p>
                <p className="mt-2">
                  Pour le consommateur, le transfert des risques de perte ou d’endommagement intervient lorsqu’il prend physiquement possession de la plaque.
                </p>
              </div>
            </section>

            {/* Article 11 */}
            <section id="art-11" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-3">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016] mb-2">
                11. Droit de rétractation des consommateurs
              </h2>
              <p>
                Le consommateur dispose en principe de 14 jours pour se rétracter. Toutefois, <strong>conformément à l’article L. 221-28, 3° du Code de la consommation</strong>, le droit de rétractation ne peut pas être exercé pour les biens confectionnés selon les spécifications du consommateur ou nettement personnalisés (plaques avec QR code propre à l’hébergement du Client ou gravure personnalisée).
              </p>
            </section>

            {/* Article 12 — Encadrés Légaux */}
            <section id="art-12" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-6">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016]">
                12. Garanties légales — consommateurs
              </h2>
              
              {/* Encadré 1 */}
              <div className="bg-[#FFFDF9] rounded-2xl p-6 border-2 border-[#C4714A]/30 space-y-3 text-xs leading-relaxed text-[#4A3D30]">
                <div className="flex items-center gap-2 text-[#C4714A] font-bold text-sm uppercase tracking-wider">
                  <ShieldCheck size={18} /> Encadré légal — Garantie de conformité de la plaque
                </div>
                <p>
                  Le consommateur dispose d’un délai de <strong>deux ans</strong> à compter de la délivrance du bien pour obtenir la mise en œuvre de la garantie légale de conformité en cas d’apparition d’un défaut. Durant ce délai, il n’est tenu d’établir que l’existence du défaut et non sa date d’apparition.
                </p>
                <p>
                  Le consommateur a droit à la réparation ou au remplacement du bien dans les 30 jours suivant sa demande, sans frais. Ces droits résultent des articles L. 217-1 à L. 217-32 du Code de la consommation. Le consommateur bénéficie aussi de la garantie des vices cachés (articles 1641 à 1649 du Code civil).
                </p>
              </div>

              {/* Encadré 2 */}
              <div className="bg-[#FFFDF9] rounded-2xl p-6 border-2 border-[#5A7A4E]/30 space-y-3 text-xs leading-relaxed text-[#4A3D30]">
                <div className="flex items-center gap-2 text-[#5A7A4E] font-bold text-sm uppercase tracking-wider">
                  <ShieldCheck size={18} /> Encadré légal — Garantie du livret et du service numérique
                </div>
                <p>
                  Pour une fourniture continue du service numérique, la garantie légale s’applique pendant toute la période contractuelle de fourniture. La garantie emporte l’obligation de fournir les mises à jour nécessaires au maintien de la conformité (articles L. 224-25-1 à L. 224-25-31 du Code de la consommation).
                </p>
              </div>
            </section>

            {/* Articles 13-20 summary grid */}
            <section id="art-13" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016]">
                13 à 20. Exécution, Responsabilité & Propriété Intellectuelle
              </h2>
              <div className="space-y-3 text-sm">
                <p><strong>13. Réclamations :</strong> Adressées à <code>contact@guidzme.fr</code> avec numéro de commande et photos explicatives.</p>
                <p><strong>14. Responsabilité :</strong> Le Client reste responsable des consignes et informations publiées dans son livret. GuidzMe ne se substitue pas aux consignes de sécurité ou services de secours.</p>
                <p><strong>15. Compte Client :</strong> Le Client préserve la confidentialité de ses identifiants.</p>
                <p><strong>16. Propriété intellectuelle :</strong> CRÉART reste seule propriétaire de la marque, du logiciel et des modèles. Le Client conserve ses droits sur les contenus qu’il publie.</p>
                <p><strong>17. Données personnelles :</strong> Traitées conformément au RGPD (voir notre Politique de Confidentialité).</p>
                <p><strong>18 à 20. Force majeure & Preuve :</strong> Les échanges électroniques conservés font foi entre les parties.</p>
              </div>
            </section>

            {/* Article 21 & 22 */}
            <section id="art-21" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDD9A3]/60 shadow-xs scroll-mt-8 space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#2A2016]">
                21. Médiation & 22. Droit applicable
              </h2>
              <p>
                En cas de litige, le consommateur s’adresse d’abord à CRÉART à <code>contact@guidzme.fr</code>. À défaut d’accord amiable, il peut saisir gratuitement le médiateur de la consommation :
              </p>
              <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#EDD9A3]/40 text-xs space-y-1 font-mono">
                <div className="font-bold text-[#2A2016] font-sans">Avenir Conso</div>
                <div>Site web : www.avenir-conso.com/DDM</div>
                <div>Adresse postale : 197 boulevard Saint-Germain, 75007 Paris</div>
              </div>
              <p id="art-22" className="pt-2 text-xs text-[#6B5D4E] scroll-mt-8">
                Les présentes CGV sont soumises au droit français. Pour les litiges entre professionnels, compétence exclusive est attribuée aux tribunaux compétents de <strong>Bordeaux</strong>.
              </p>
            </section>

            {/* Annexe — Formulaire de rétractation */}
            <section id="annexe" className="bg-[#1C1612] text-white rounded-3xl p-6 sm:p-8 shadow-md scroll-mt-8 space-y-4">
              <div className="flex items-center gap-2 text-[#E8BE72] font-bold text-base">
                <Download size={20} /> Annexe — Formulaire type de rétractation
              </div>
              <p className="text-xs text-white/70">
                (À compléter et renvoyer uniquement si vous souhaitez vous rétracter d’un contrat éligible au droit de rétractation).
              </p>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-xs font-mono space-y-2 text-white/90">
                <div>À l’attention de CRÉART, 4 rue du Capitaine Guiraud, 33320 Eysines (contact@guidzme.fr) :</div>
                <div className="pt-2">Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien / la prestation ci-dessous :</div>
                <div className="pt-1">Commande / service concerné : ___________________________</div>
                <div>Commandé le / reçu le : _________________________________</div>
                <div>Numéro de commande : ___________________________________</div>
                <div>Nom du/des consommateur(s) : ____________________________</div>
                <div>Adresse du/des consommateur(s) : ________________________</div>
                <div>Date & Signature : ________________________________________</div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
