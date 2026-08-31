import { ArrowUpRight, Building2, Mountain, Sun, Waves } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

/*
 * Les quatre livrets Confort ouverts au public.
 *
 * Le résumé de chaque carte reprend le message d'accueil du livret : la carte
 * doit annoncer ce que le visiteur va réellement trouver derrière le lien.
 * Les repères restent thématiques, sans chiffres — le contenu des démos vit
 * dans Firestore, un décompte figé ici finirait par mentir.
 */
const livrets = [
  {
    slug: "demo-paris",
    ville: "Paris 9e",
    nom: "Le Loft Haussmannien",
    type: "Appartement d'exception",
    resume:
      "Moulures, parquet point de Hongrie et balcon filant, entre l'Opéra Garnier et les Grands Boulevards.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=75",
    icone: Building2,
    accent: "#2B5F75",
    accentPale: "#E4EEF3",
    reperes: "Métro & transports · Bonnes adresses",
  },
  {
    slug: "demo-biarritz",
    ville: "Biarritz",
    nom: "La Villa Bleue Ocean",
    type: "Villa en bord de mer",
    resume:
      "Surplombant la Côte des Basques, jardin suspendu et spots de surf à trois minutes à pied.",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=75",
    icone: Waves,
    accent: "#4A849E",
    accentPale: "#E4EEF3",
    reperes: "Local à planches · Options sur place",
  },
  {
    slug: "demo-chamonix",
    ville: "Chamonix",
    nom: "Le Chalet Altitude 2000",
    type: "Chalet & spa montagne",
    resume:
      "Vue sur la chaîne du Mont-Blanc, sauna privatif et ski room chauffé pour rentrer les skis au sec.",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=75",
    icone: Mountain,
    accent: "#5A7A4E",
    accentPale: "#EBF0E6",
    reperes: "Ski room & garage · Consignes d'hiver",
  },
  {
    slug: "demo-confort2",
    ville: "Marseille 8e",
    nom: "Bienvenue à Marseille",
    type: "Penthouse à La Pointe-Rouge",
    resume:
      "Le guide du 8e arrondissement, entre la mer et la Bonne Mère, calanques et navettes comprises.",
    image:
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=900&q=75",
    icone: Sun,
    accent: "#C4714A",
    accentPale: "#F7EBE4",
    reperes: "Calanques & plages · Codes d'accès",
  },
];

export default function LivretsDemoSection() {
  return (
    <section
      id="livrets"
      className="py-20 lg:py-28 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FBF5EC 0%, #FFFFFF 100%)" }}
    >
      {/* Halos décoratifs */}
      <div className="absolute -top-24 left-1/4 w-[520px] h-[520px] rounded-full bg-[#E4EEF3]/50 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[#F7EBE4]/60 blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-label section-label-ocean mb-5 inline-flex">
              Côté voyageurs
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-[#2A2016] leading-tight mb-5 mt-5">
              Ouvrez un <em className="not-italic text-gradient-terra">vrai livret</em>
            </h2>
            <p className="text-lg text-[#6B5D4E] leading-relaxed">
              Parcourez nos quatre livrets de présentation. Ce sont des pages en ligne, pas des
              maquettes : exactement ce que vos voyageurs découvrent après avoir scanné la plaque.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6">
          {livrets.map((livret, index) => (
            <AnimateOnScroll key={livret.slug} delay={0.1 + index * 0.08} className="h-full">
              {/*
                Carte « produit » : la photo est encadrée à l'intérieur du
                carton, pas à ses bords, et le contour est une ombre plutôt
                qu'un trait. C'est la marge blanche autour de l'image qui donne
                l'impression d'un objet posé.
              */}
              <a
                href={`/${livret.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-[30px] bg-white p-3 ring-1 ring-[#2A2016]/[0.06] shadow-[0_1px_2px_rgba(42,32,22,0.04),0_8px_24px_-12px_rgba(42,32,22,0.14)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_2px_4px_rgba(42,32,22,0.04),0_28px_50px_-18px_rgba(42,32,22,0.28)]"
              >
                {/* Photo de couverture */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#F0E8D6]">
                  <img
                    src={livret.image}
                    alt={`${livret.nom}, ${livret.ville}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A2016]/25 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold tracking-tight text-[#2A2016] shadow-[0_2px_8px_rgba(42,32,22,0.12)] backdrop-blur-md">
                    <livret.icone size={13} style={{ color: livret.accent }} />
                    {livret.ville}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex flex-1 flex-col px-3 pb-2 pt-5">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
                    style={{ color: livret.accent }}
                  >
                    {livret.type}
                  </p>
                  <h3 className="text-[19px] font-bold tracking-[-0.02em] text-[#2A2016] leading-snug mb-2.5">
                    {livret.nom}
                  </h3>
                  <p className="text-[13.5px] leading-relaxed text-[#6B5D4E]">{livret.resume}</p>

                  <p className="mt-4 mb-6 text-[11.5px] font-medium text-[#9C8F80]">{livret.reperes}</p>

                  <div className="mt-auto flex items-center justify-between border-t border-[#2A2016]/[0.07] pt-5">
                    <span
                      className="text-[13px] font-semibold tracking-tight"
                      style={{ color: livret.accent }}
                    >
                      Ouvrir le livret
                    </span>
                    {/*
                      Pastille de lien : le fond plein n'apparaît qu'au survol.
                      La flèche hérite sa couleur du parent, une classe la
                      repasse en blanc — l'héritage cède devant la règle.
                    */}
                    <span
                      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: livret.accentPale, color: livret.accent }}
                    >
                      <span
                        className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ backgroundColor: livret.accent }}
                      />
                      <ArrowUpRight
                        size={17}
                        className="relative transition-colors duration-300 group-hover:text-white"
                      />
                    </span>
                  </div>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={0.4}>
          <p className="mt-10 text-center text-sm text-[#6B5D4E]">
            À regarder de préférence sur votre téléphone — chaque livret reste modifiable depuis
            l&apos;éditeur, sans toucher à la plaque ni au QR code.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
