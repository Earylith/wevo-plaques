import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Le balisage minimal autorisé dans le texte des articles.
 *
 *   **gras**            mise en valeur
 *   *italique*          nuance, titres d'œuvres, mots étrangers
 *   [libellé](/lien)    lien interne, ancre, ou adresse externe
 *
 * Volontairement pauvre. Tout ce qui demanderait davantage — un tableau,
 * un encadré, une liste — doit devenir un bloc : c'est ce qui garantit que
 * deux articles écrits à six mois d'écart se ressemblent.
 *
 * Le texte n'est jamais injecté en HTML : il est découpé puis rendu en
 * éléments React. Un article est du contenu, pas du code, et il ne doit
 * pas pouvoir en devenir.
 */

const MOTIF = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;

function Lien({ href, children }: { href: string; children: ReactNode }) {
  const classe =
    "font-medium text-[#A35A38] underline decoration-[#C4714A]/35 decoration-2 underline-offset-[3px] transition-colors hover:text-[#C4714A] hover:decoration-[#C4714A]";

  // Une ancre reste un lien natif : le routeur n'a rien à faire d'un
  // déplacement à l'intérieur de la page déjà affichée.
  if (href.startsWith("#")) {
    return (
      <a href={href} className={classe}>
        {children}
      </a>
    );
  }

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classe}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classe}>
      {children}
    </Link>
  );
}

export function analyser(texte: string): ReactNode[] {
  const morceaux: ReactNode[] = [];
  let curseur = 0;
  let index = 0;

  for (const trouve of texte.matchAll(MOTIF)) {
    const debut = trouve.index ?? 0;
    if (debut > curseur) morceaux.push(texte.slice(curseur, debut));

    const [entier, libelle, href, gras, italique] = trouve;

    if (libelle && href) {
      morceaux.push(
        <Lien key={index++} href={href}>
          {libelle}
        </Lien>,
      );
    } else if (gras) {
      morceaux.push(
        <strong key={index++} className="font-semibold text-[#2A2016]">
          {gras}
        </strong>,
      );
    } else if (italique) {
      morceaux.push(
        <em key={index++} className="italic">
          {italique}
        </em>,
      );
    }

    curseur = debut + entier.length;
  }

  if (curseur < texte.length) morceaux.push(texte.slice(curseur));
  return morceaux;
}

export default function TexteRiche({ texte }: { texte: string }) {
  return <Fragment>{analyser(texte)}</Fragment>;
}
