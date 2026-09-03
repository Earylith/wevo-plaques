import type { MetadataRoute } from "next";

/**
 * Le manifeste de l'application web.
 *
 * Il sert à deux choses ici. Sur téléphone, il donne son nom et sa couleur à
 * l'icône ajoutée à l'écran d'accueil. Dans les résultats de recherche, le
 * `short_name` est l'un des signaux que Google utilise pour décider du nom
 * affiché au-dessus du lien — c'est pourquoi il dit « Guidzme », exactement
 * comme le logo, et non « Guidz » ni le nom de domaine.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Guidzme — Plaque d’accueil gravée et livret numérique",
    short_name: "Guidzme",
    description:
      "Une plaque en bois gravée avec QR code, reliée à une page dédiée à votre logement : Wi-Fi, codes d’accès, équipements, bonnes adresses.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF5EC",
    theme_color: "#FBF5EC",
    icons: [
      { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
