import type { Metadata } from "next";

/**
 * Les livrets ne sont pas des pages publiques.
 *
 * Un livret contient le code du portail, l'emplacement de la boîte à clés
 * et le mot de passe du Wi-Fi de quelqu'un. Ces pages sont accessibles à
 * qui possède l'adresse — c'est leur raison d'être, un voyageur ne se
 * connecte pas — mais elles ne doivent jamais se retrouver dans un index de
 * moteur de recherche.
 *
 * L'interdiction est posée ici, sur la mise en page, pour qu'elle couvre
 * aussi les écrans de ménage et d'état des lieux, qui sont des composants
 * clients et ne peuvent donc rien déclarer eux-mêmes.
 *
 * Les livrets de démonstration lèvent cette interdiction depuis leur page :
 * une valeur déclarée par la page l'emporte sur celle de la mise en page.
 *
 * À noter : rien n'est ajouté à `robots.txt`. Interdire l'exploration de
 * `/h/` empêcherait les moteurs de LIRE cette consigne, et les adresses
 * pourraient rester listées sans contenu. C'est bien l'exploration qu'on
 * autorise, et l'indexation qu'on refuse.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function LivretLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
