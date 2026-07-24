import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guidz — Guide d’accueil avec QR code pour hébergements",
  description:
    "Transformez votre accueil voyageur avec une plaque en bois personnalisée et un QR code connecté à une page web dédiée. Wifi, consignes, bonnes adresses, contacts — tout en un scan.",
  keywords: [
    "plaque accueil",
    "QR code hébergement",
    "livret accueil numérique",
    "airbnb accueil",
    "plaque bois connectée",
    "conciergerie",
    "WEVO",
    "CRÉART",
    "Guidz",
    "GuidzMe",
  ],
  openGraph: {
    title: "Guidz — Plaques d'accueil connectées",
    description:
      "Une plaque en bois personnalisée + QR code relié à une page web dédiée à votre logement.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
