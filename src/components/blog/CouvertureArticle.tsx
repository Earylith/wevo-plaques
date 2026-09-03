import {
  BookOpen,
  Building2,
  Calculator,
  MessageSquare,
  QrCode,
  Scale,
  Star,
  TreePine,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { Article } from "@/lib/blog";

/**
 * La couverture d'un article, dessinée et non photographiée.
 *
 * Le choix mérite d'être expliqué : une photo d'illustration achetée sur
 * une banque d'images ne dit rien de l'article, se charge lentement et
 * casse le jour où l'adresse distante change. Un motif géométrique tiré de
 * la couleur de l'article coûte quelques octets, ne peut pas tomber, et
 * donne au blog une identité qui lui appartient.
 *
 * Six motifs, un par article : ils se reconnaissent d'une vignette à
 * l'autre, ce qui aide le lecteur à savoir où il est déjà allé.
 */

const ICONES: Record<Article["icone"], LucideIcon> = {
  livre: BookOpen,
  balance: Scale,
  qr: QrCode,
  messages: MessageSquare,
  etoile: Star,
  immeubles: Building2,
  plaque: TreePine,
  prix: Calculator,
  canaux: Waypoints,
};

function Motif({ motif, couleur }: { motif: Article["motif"]; couleur: string }) {
  const commun = {
    className: "absolute inset-0 h-full w-full",
    preserveAspectRatio: "none" as const,
    "aria-hidden": true,
  };

  switch (motif) {
    case "arches":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${-40 + i * 100} 200 A 70 70 0 0 1 ${100 + i * 100} 200`}
              stroke={couleur}
              strokeWidth="1.5"
              opacity={0.5 - i * 0.06}
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={`b${i}`}
              d={`M${-40 + i * 100} 200 A 40 40 0 0 1 ${40 + i * 100} 200`}
              stroke={couleur}
              strokeWidth="1.5"
              opacity="0.35"
            />
          ))}
        </svg>
      );

    case "vagues":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M-20 ${50 + i * 28} Q 80 ${28 + i * 28} 180 ${50 + i * 28} T 420 ${50 + i * 28}`}
              stroke={couleur}
              strokeWidth="1.5"
              opacity={0.45 - i * 0.05}
            />
          ))}
        </svg>
      );

    case "grille":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 40}
              y1="0"
              x2={i * 40}
              y2="200"
              stroke={couleur}
              strokeWidth="1"
              opacity="0.25"
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 40}
              x2="400"
              y2={i * 40}
              stroke={couleur}
              strokeWidth="1"
              opacity="0.25"
            />
          ))}
          <rect x="120" y="40" width="80" height="80" fill={couleur} opacity="0.12" />
          <rect x="240" y="80" width="40" height="40" fill={couleur} opacity="0.18" />
        </svg>
      );

    case "rayons":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {Array.from({ length: 14 }, (_, i) => (
            <line
              key={i}
              x1="330"
              y1="30"
              x2={330 - Math.cos((i * Math.PI) / 13) * 420}
              y2={30 + Math.sin((i * Math.PI) / 13) * 420}
              stroke={couleur}
              strokeWidth="1.2"
              opacity="0.28"
            />
          ))}
          <circle cx="330" cy="30" r="52" fill={couleur} opacity="0.12" />
        </svg>
      );

    case "collines":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          <path d="M0 190 Q 90 110 190 160 T 400 120 L400 200 L0 200Z" fill={couleur} opacity="0.14" />
          <path d="M0 200 Q 110 140 220 180 T 400 165 L400 200 L0 200Z" fill={couleur} opacity="0.2" />
          <path d="M-10 150 Q 100 80 210 130 T 410 90" stroke={couleur} strokeWidth="1.5" opacity="0.35" />
        </svg>
      );

    case "cercles":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle
              key={i}
              cx="200"
              cy="100"
              r={26 + i * 26}
              stroke={couleur}
              strokeWidth="1.4"
              opacity={0.4 - i * 0.05}
            />
          ))}
          <circle cx="200" cy="100" r="16" fill={couleur} opacity="0.18" />
        </svg>
      );

    case "chevrons":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M${-60 + i * 56} 210 L${-10 + i * 56} 100 L${-60 + i * 56} -10`}
              stroke={couleur}
              strokeWidth="1.6"
              opacity={0.4 - i * 0.03}
            />
          ))}
        </svg>
      );

    case "briques":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {Array.from({ length: 5 }, (_, ligne) =>
            Array.from({ length: 7 }, (_, colonne) => (
              <rect
                key={`${ligne}-${colonne}`}
                x={-30 + colonne * 62 + (ligne % 2 ? 31 : 0)}
                y={6 + ligne * 40}
                width="54"
                height="30"
                rx="6"
                stroke={couleur}
                strokeWidth="1.2"
                opacity={0.32 - ligne * 0.03}
              />
            )),
          )}
        </svg>
      );

    case "eventail":
      return (
        <svg {...commun} viewBox="0 0 400 200" fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M200 210 A ${40 + i * 22} ${40 + i * 22} 0 0 1 ${200 + (40 + i * 22)} 210`}
              stroke={couleur}
              strokeWidth="1.5"
              opacity={0.38 - i * 0.035}
            />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={`g${i}`}
              d={`M200 210 A ${40 + i * 22} ${40 + i * 22} 0 0 0 ${200 - (40 + i * 22)} 210`}
              stroke={couleur}
              strokeWidth="1.5"
              opacity={0.38 - i * 0.035}
            />
          ))}
        </svg>
      );
  }
}

export default function CouvertureArticle({
  article,
  taille = "carte",
  className = "",
}: {
  article: Article;
  taille?: "carte" | "vedette" | "entete";
  className?: string;
}) {
  const Icone = ICONES[article.icone];
  const tailleIcone = taille === "carte" ? 26 : 34;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(145deg, ${article.accentPale} 0%, #FFFDF8 55%, ${article.accentPale} 100%)`,
      }}
    >
      <Motif motif={article.motif} couleur={article.accent} />

      {/* Grain : la même texture que le reste du site, pour que le blog ne
          paraisse pas rapporté d'ailleurs. */}
      <div className="bg-grain absolute inset-0" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-2xl shadow-[0_10px_30px_rgba(42,32,22,0.12)] backdrop-blur-sm"
          style={{
            width: taille === "carte" ? 54 : 70,
            height: taille === "carte" ? 54 : 70,
            background: "rgba(255,253,248,0.86)",
            border: `1px solid ${article.accent}33`,
          }}
        >
          <Icone size={tailleIcone} strokeWidth={1.6} style={{ color: article.accent }} />
        </div>
      </div>
    </div>
  );
}
