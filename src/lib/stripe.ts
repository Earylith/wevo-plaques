import Stripe from "stripe";
import { OfferType } from "@/lib/types/accommodation";

/**
 * Client Stripe, côté serveur uniquement.
 *
 * La clé secrète ne doit JAMAIS traverser le navigateur : ce module n'est
 * importé que par des actions serveur et des routes d'API. Il n'expose rien
 * qui puisse finir dans un module client.
 */

/**
 * Instancié à la demande, et non au chargement du module.
 *
 * `next build` évalue les modules pour le prérendu ; avec une instanciation
 * au chargement, une clé absente ferait échouer la compilation au lieu de
 * n'échouer qu'à l'appel. Or l'application doit pouvoir se construire sans
 * secret — en intégration continue, par exemple.
 */
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (client) return client;

  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) {
    throw new Error(
      "STRIPE_SECRET_KEY absente. Ajoutez-la dans .env.local, puis redémarrez le serveur."
    );
  }
  client = new Stripe(cle);
  return client;
}

/** Le paiement est-il configuré ? Permet de masquer ce qui ne marcherait pas. */
export function paiementConfigure(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      (process.env.STRIPE_PRICE_CONFORT || process.env.STRIPE_PRICE_ESSENTIEL)
  );
}

/**
 * Tarifs facturés, selon la formule.
 *
 * L'Essentielle se règle en une fois : une page composée, une plaque, et
 * l'affaire est close. Le Confort ajoute l'abonnement qui maintient le livret
 * en ligne et les modifications illimitées — deux lignes sur la même commande.
 *
 * Stripe accepte un tarif ponctuel dans une session en mode `subscription` :
 * il est simplement porté par la première facture.
 */
export function tarifsFormule(offre: OfferType): {
  ponctuel: string;
  abonnement: string | null;
} {
  if (offre === "essential") {
    const ponctuel = process.env.STRIPE_PRICE_ESSENTIEL;
    if (!ponctuel) {
      throw new Error("STRIPE_PRICE_ESSENTIEL absente. Ajoutez-la dans .env.local.");
    }
    return { ponctuel, abonnement: null };
  }

  const ponctuel = process.env.STRIPE_PRICE_CONFORT;
  if (!ponctuel) {
    throw new Error("STRIPE_PRICE_CONFORT absente. Ajoutez-la dans .env.local.");
  }
  return {
    ponctuel,
    // L'abonnement est facultatif : sans lui, la session bascule en paiement
    // simple plutôt que d'échouer.
    abonnement: process.env.STRIPE_PRICE_ABONNEMENT || null,
  };
}

/**
 * Tarifs de la bascule vers le Confort, APRÈS une Essentielle déjà payée.
 *
 * L'hôte a déjà réglé sa page et sa plaque : on ne lui refacture pas les
 * frais de mise en service. Il paie l'écart entre les deux formules, une
 * fois, et démarre l'abonnement qui maintient ses modifications ouvertes.
 *
 * Cette fonction ne concerne QUE les livrets publiés. Un brouillon Essentiel
 * change de formule sans rien payer : il réglera simplement le Confort au
 * moment de publier.
 */
export function tarifsBascule(): { ponctuel: string; abonnement: string | null } {
  const ponctuel = process.env.STRIPE_PRICE_UPGRADE_CONFORT;
  if (!ponctuel) {
    throw new Error("STRIPE_PRICE_UPGRADE_CONFORT absente. Ajoutez-la dans .env.local.");
  }
  return { ponctuel, abonnement: process.env.STRIPE_PRICE_ABONNEMENT || null };
}
