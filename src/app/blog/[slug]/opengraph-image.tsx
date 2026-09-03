import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ARTICLES, trouverArticle } from "@/lib/blog";

/**
 * L'image d'aperçu d'un article, aux couleurs de l'article.
 *
 * Chaque guide a sa couleur dans le blog ; elle se retrouve ici, pour que
 * dix liens partagés dans une conversation ne se ressemblent pas tous. Le
 * titre est repris tel quel : un aperçu qui annonce autre chose que la page
 * fait cliquer une fois, puis plus jamais.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

/*
 * Un seul rendu par article, mais déclaré ici pour que le texte alternatif
 * soit celui de l'article et non un libellé générique. `generateImageMetadata`
 * reçoit `params` déjà résolu, contrairement au rendu lui-même.
 */
export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const article = trouverArticle(params.slug);
  return [
    {
      id: "og",
      size,
      contentType,
      alt: article ? `${article.titre} — Guidzme` : "Guidzme",
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = trouverArticle(slug);
  const logo = await readFile(join(process.cwd(), "src/app/icon.png"));
  const logoData = `data:image/png;base64,${logo.toString("base64")}`;

  const accent = article?.accent ?? "#C4714A";
  const accentPale = article?.accentPale ?? "#F7EBE4";
  const accentSombre = article?.accentSombre ?? "#A35A38";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 76px",
          background: `linear-gradient(150deg, ${accentPale} 0%, #FBF5EC 60%, ${accentPale} 100%)`,
        }}
      >
        {/* Un filet de couleur en haut : c'est lui qui distingue les articles. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 12,
            background: accent,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoData} width={62} height={62} alt="" />
          <div style={{ display: "flex", fontSize: 32, color: "#2A2016", letterSpacing: -0.8 }}>
            Guidzme
            <span style={{ color: "#C4714A" }}>.</span>
          </div>
          {article && (
            <div
              style={{
                display: "flex",
                marginLeft: 12,
                padding: "8px 20px",
                borderRadius: 999,
                background: accent,
                color: "#FFFDF8",
                fontSize: 22,
              }}
            >
              {article.categorie}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.14,
              color: "#2A2016",
              letterSpacing: -2,
              maxWidth: 1010,
            }}
          >
            {article?.titre ?? "Le journal de l’accueil voyageur"}
          </div>
          {article && (
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 27,
                color: "#6B5D4E",
                maxWidth: 960,
              }}
            >
              {article.description}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 24, color: accentSombre }}>
            {article ? `${article.tempsLecture} min de lecture` : "Guides"}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#6B5D4E" }}>·</div>
          <div style={{ display: "flex", fontSize: 24, color: "#6B5D4E" }}>
            guidzme.fr/blog
          </div>
        </div>
      </div>
    ),
    size,
  );
}
