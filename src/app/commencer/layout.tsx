import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer votre livret d’accueil numérique | Guidzme",
  description:
    "Configurez votre livret d’accueil pour location saisonnière en quelques clics. Choisissez votre formule Essentielle ou Confort et commencez gratuitement.",
  alternates: { canonical: "/commencer" },
};

export default function CommencerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
