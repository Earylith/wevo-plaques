import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demande de devis — Conciergeries et hébergements multiples | Guidzme",
  description:
    "Obtenez un devis personnalisé pour équiper vos hébergements en plaques connectées et livrets numériques. Tarifs dégressifs pour professionnels.",
  alternates: { canonical: "/devis" },
};

export default function DevisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
