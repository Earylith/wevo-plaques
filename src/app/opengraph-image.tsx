import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * L'image d'aperçu de l'accueil.
 *
 * C'est ce que voient WhatsApp, Messenger, LinkedIn, Slack et Facebook
 * quand quelqu'un partage le lien — et, avec `max-image-preview: large`,
 * ce que Google peut afficher à côté du résultat. Sans elle, les plateformes
 * choisissent une image au hasard dans la page, souvent un logo de carte
 * bancaire du pied de page.
 *
 * Elle est dessinée ici plutôt que dans un fichier image pour une raison
 * simple : elle reprend le vrai logo, lu sur le disque, et la vraie palette.
 * Changer la marque ne laissera pas une ancienne image traîner.
 */

export const alt =
  "Guidzme — plaque d’accueil en bois gravée avec QR code, reliée à un livret numérique";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "src/app/icon.png"));
  const logoData = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(150deg, #F5E6C8 0%, #FBF5EC 55%, #F7EBE4 100%)",
        }}
      >
        {/* Marque */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoData} width={78} height={78} alt="" />
          <div style={{ display: "flex", fontSize: 40, color: "#2A2016", letterSpacing: -1 }}>
            Guidzme
            <span style={{ color: "#C4714A" }}>.</span>
          </div>
        </div>

        {/* Promesse */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              lineHeight: 1.12,
              color: "#2A2016",
              letterSpacing: -2.5,
              maxWidth: 940,
            }}
          >
            Une plaque en bois gravée, un livret d’accueil qui change quand vous
            voulez.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 30,
              color: "#6B5D4E",
              maxWidth: 900,
            }}
          >
            Wi-Fi, codes d’accès, équipements, bonnes adresses — en un scan.
          </div>
        </div>

        {/* Pied */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              padding: "12px 26px",
              borderRadius: 999,
              background: "#2A2016",
              color: "#FFFDF8",
              fontSize: 26,
            }}
          >
            Dès 49 €, sans abonnement
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#A35A38" }}>
            guidzme.fr
          </div>
        </div>
      </div>
    ),
    size,
  );
}
