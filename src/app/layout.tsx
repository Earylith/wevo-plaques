import type { Metadata } from "next";
import "./globals.css";
import BandeauCookies from "@/components/ui/BandeauCookies";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  /*
   * Sans base, les adresses canoniques et les images de partage déclarées
   * en relatif par les pages restent relatives — c'est-à-dire inutilisables
   * pour un moteur de recherche ou un aperçu de lien.
   */
  metadataBase: new URL(SITE_URL),

  /*
   * Le titre de l'accueil, écrit pour une recherche de marque.
   *
   * Il commence par le nom exact tel qu'il s'écrit sur le site — Guidzme,
   * et non Guidz — parce que c'est ce que tape quelqu'un qui nous cherche,
   * et que le premier mot du titre pèse le plus lourd. La suite dit en
   * quatre mots ce que nous vendons, pour celui qui ne nous connaît pas
   * encore et qui hésite entre dix résultats.
   */
  title: "Guidzme — Plaque d’accueil gravée et livret numérique pour locations",

  /*
   * La description n'est pas un facteur de classement : c'est un argument
   * de clic. D'où le prix et l'absence d'abonnement, qui sont nos deux
   * différences les plus lisibles en une ligne.
   */
  description:
    "Une plaque en bois gravée avec QR code, reliée à une page dédiée à votre logement : Wi-Fi, codes d’accès, équipements, bonnes adresses. Dès 49 €, sans abonnement.",

  applicationName: "Guidzme",
  keywords: [
    "Guidzme",
    "Guidz",
    "plaque accueil location saisonnière",
    "QR code hébergement",
    "livret accueil numérique",
    "livret accueil airbnb",
    "plaque bois gravée QR code",
    "conciergerie",
  ],
  authors: [{ name: "Guidzme" }],
  creator: "Guidzme",
  publisher: "Guidzme",

  /*
   * `max-image-preview: large` autorise Google à afficher une grande
   * vignette plutôt qu'un timbre-poste. C'est gratuit, et c'est ce qui
   * distingue le plus visiblement deux résultats voisins.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "Guidzme",
    title: "Guidzme — Plaque d’accueil gravée et livret numérique",
    description:
      "Une plaque en bois gravée avec QR code, reliée à une page dédiée à votre logement. Dès 49 €, sans abonnement.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guidzme — Plaque d’accueil gravée et livret numérique",
    description:
      "Une plaque en bois gravée avec QR code, reliée à une page dédiée à votre logement. Dès 49 €, sans abonnement.",
  },

  // Couleur de la barre d'adresse sur mobile : le sable du site.
  other: { "theme-color": "#FBF5EC" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        {/*
          Le consentement se demande AVANT tout dépôt, sur toutes les pages.
          Le placer plus bas dans l'arbre laisserait les livrets publics sans
          bandeau, alors que ce sont eux qui reçoivent le plus de visiteurs.
        */}
        <BandeauCookies />
      </body>
    </html>
  );
}
