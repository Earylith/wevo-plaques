"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Le sujet sélectionné dans le journal, partagé entre l'en-tête et la grille.
 *
 * Les pastilles de sujets vivent en haut de page, la grille d'articles tout
 * en bas : elles ne peuvent pas partager un `useState` local. D'où ce
 * contexte, dont le fournisseur enveloppe la page.
 *
 * Le fournisseur est un composant client, mais la page qui l'utilise reste un
 * composant serveur : ses enfants lui sont passés déjà rendus. C'est ce qui
 * permet de garder l'index du journal statique — donc instantané et
 * indexable — tout en rendant les pastilles réellement cliquables.
 *
 * Les pastilles étaient des `<span>`. Elles avaient l'allure de boutons, la
 * bordure et l'arrondi d'un bouton, et ne faisaient rien : le lecteur cliquait
 * et concluait que le site était cassé.
 */

interface Filtre {
  sujet: string | null;
  choisir: (sujet: string) => void;
  effacer: () => void;
}

const Contexte = createContext<Filtre>({
  sujet: null,
  choisir: () => {},
  effacer: () => {},
});

/** L'ancre vers laquelle on emmène le lecteur quand il choisit un sujet. */
export const ANCRE_GRILLE = "journal-articles";

export function FiltreJournal({ children }: { children: React.ReactNode }) {
  const [sujet, setSujet] = useState<string | null>(null);

  const choisir = useCallback((demande: string) => {
    /*
     * Re-cliquer le sujet actif l'annule : c'est le geste attendu, et cela
     * évite d'avoir à chercher un bouton « tout afficher » séparé.
     */
    setSujet((actuel) => (actuel === demande ? null : demande));

    /*
     * Puis on descend jusqu'à la grille. Sans ce défilement, le lecteur
     * clique en haut de page et ne voit rien changer — le résultat est à
     * deux écrans de là.
     */
    if (typeof document !== "undefined") {
      document.getElementById(ANCRE_GRILLE)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  const effacer = useCallback(() => setSujet(null), []);

  const valeur = useMemo(() => ({ sujet, choisir, effacer }), [sujet, choisir, effacer]);

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useFiltreJournal(): Filtre {
  return useContext(Contexte);
}
