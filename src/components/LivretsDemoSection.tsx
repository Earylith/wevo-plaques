import { ArrowUpRight, Building2, Mountain, Sun, Waves } from "lucide-react";
import AnimateOnScroll from "./AnimateOnScroll";

/*
 * Les quatre livrets Confort ouverts au public.
 *
 * Le résumé de chaque carte reprend le message d'accueil du livret : la carte
 * doit annoncer ce que le visiteur va réellement trouver derrière le lien.
 * Les pastilles restent thématiques, sans chiffres — le contenu des démos vit
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
    pastilles: ["Métro & transports", "Bonnes adresses"],
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
    pastilles: ["Local à planches", "Options sur place"],
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
    pastilles: ["Ski room & garage", "Consignes d'hiver"],
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
    pastilles: ["Calanques & plages", "Codes d'accès"],
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
              Côté voyageur
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-[#2A2016] leading-tight mb-5 mt-5">
              Quatre livrets Confort,{" "}
              <em className="not-italic text-gradient-terra">quatre ambiances</em>
            </h2>
            <p className="text-lg text-[#6B5D4E] leading-relaxed">
              Ce sont de vraies pages, celles que vos voyageurs découvrent après avoir scanné la
              plaque. Ouvrez-en une, de préférence sur votre téléphone.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {livrets.map((livret, index) => (
            <AnimateOnScroll key={livret.slug} delay={0.1 + index * 0.08} className="h-full">
              <a
                href={`/${livret.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group card-hover flex h-full flex-col overflow-hidden rounded-[28px] bg-white border border-[#EDD9A3]/50 shadow-[0_12px_30px_rgba(42,32,22,0.05)]"
              >
                {/* Photo de couverture */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={livret.image}
                    alt={`${livret.nom}, ${livret.ville}`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A2016]/60 via-transparent to-transparent" />
                  <span
                    className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm"
                    style={{ color: livret.accent }}
                  >
                    <livret.icone size={13} />
                    {livret.ville}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex flex-1 flex-col p-6">
                  <p
                    className="text-[11px] font-bold uppercase tracking-widest mb-1.5"
                    style={{ color: livret.accent }}
                  >
                    {livret.type}
                  </p>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016] leading-snug mb-3">
                    {livret.nom}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#6B5D4E] mb-5">{livret.resume}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {livret.pastilles.map((pastille) => (
                      <span
                        key={pastille}
                        className="rounded-full px-3 py-1 text-[11px] font-semibold"
                        style={{ backgroundColor: livret.accentPale, color: livret.accent }}
                      >
                        {pastille}
                      </span>
                    ))}
                  </div>

                  <span
                    className="mt-auto inline-flex items-center gap-2 text-sm font-bold transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: livret.accent }}
                  >
                    Ouvrir le livret
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </a>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={0.4}>
          <p className="mt-10 text-center text-sm text-[#6B5D4E]">
            Chaque livret est modifiable depuis l&apos;éditeur, sans toucher à la plaque ni au QR
            code.
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
