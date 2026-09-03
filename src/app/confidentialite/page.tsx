import type { Metadata } from "next";
import Link from "next/link";
import RevenirSurMonChoix from "@/components/ui/RevenirSurMonChoix";

/**
 * Politique de confidentialité.
 *
 * Le bandeau de consentement y renvoyait déjà — le lien menait à une page
 * inexistante, ce qui est à peu près le pire endroit où poser une 404 :
 * quelqu'un qui cherche à comprendre ce qu'on collecte tombait sur rien.
 *
 * Écrite pour être lue, pas pour se couvrir. Chaque donnée citée est une
 * donnée que le code manipule réellement.
 */

export const metadata: Metadata = {
  title: "Confidentialité — Guidz",
  description:
    "Ce que Guidz collecte, pourquoi, combien de temps, et comment revenir sur vos choix.",
};

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em] text-[#2A2016]">
        {titre}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-[#5C3D2E]">{children}</div>
    </section>
  );
}

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#FBF5EC]">
      <div className="mx-auto max-w-2xl px-6 py-16 lg:py-24">
        <Link
          href="/"
          className="text-[13px] font-semibold text-[#6B5D4E] transition-colors hover:text-[#C4714A]"
        >
          ← Retour à l’accueil
        </Link>

        <h1 className="mt-6 font-[family-name:var(--font-display)] text-[38px] font-bold leading-[1.05] tracking-[-0.025em] text-[#2A2016] sm:text-[46px]">
          Confidentialité
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-[#6B5D4E]">
          Ce que nous collectons, pourquoi, et pendant combien de temps. Sans
          détour et sans page de conditions à déplier.
        </p>

        <Section titre="Les livrets sont mesurés sans être pistés">
          <p>
            Quand un voyageur ouvre un livret, nous incrémentons un compteur :
            le nombre d’ouvertures, la rubrique consultée, le jour et la tranche
            horaire. <strong>Aucun identifiant n’est posé</strong> — pas de
            cookie, pas d’adresse IP conservée, rien qui permette de reconnaître
            la même personne d’une visite à l’autre.
          </p>
          <p>
            C’est ce qui permet à un hôte de voir que « Codes &amp; Wi-Fi » est
            sa rubrique la plus lue, sans jamais savoir qui l’a lue. Cette mesure
            ne dépend d’aucun consentement, précisément parce qu’elle ne
            concerne personne en particulier.
          </p>
        </Section>

        <Section titre="Ce que nous conservons sur les hôtes">
          <p>
            Un compte, c’est une adresse e-mail et un mot de passe — que nous ne
            voyons jamais : l’authentification passe par Firebase, qui n’en
            conserve qu’une empreinte.
          </p>
          <p>
            S’y ajoute ce que l’hôte écrit dans son livret, et ce qu’il nous
            confie pour sa commande : nom, adresse de livraison, téléphone. Le
            paiement, lui, ne transite jamais par nos serveurs — Stripe s’en
            charge, et nous n’avons accès à aucun numéro de carte.
          </p>
          <p>
            Un hôte peut supprimer son compte depuis son espace. La suppression
            est immédiate : sa page disparaît, ses statistiques aussi. Seules les
            commandes de plaques déjà produites sont conservées, parce qu’elles
            correspondent à un objet réellement fabriqué et facturé.
          </p>
        </Section>

        <Section titre="Les traceurs, et votre choix">
          <p>
            Nous souhaitons mesurer l’audience du site et l’efficacité de nos
            annonces. Ces deux finalités reposent sur des services tiers, et rien
            n’est déposé sur votre appareil tant que vous n’avez pas répondu.
          </p>
          <p>
            Vous choisissez finalité par finalité, et vous pouvez en accepter une
            sans l’autre. Votre choix est conservé treize mois, après quoi la
            question se repose.
          </p>
          <div id="choix" className="scroll-mt-24">
            <RevenirSurMonChoix />
          </div>
        </Section>

        <Section titre="Vos droits">
          <p>
            Vous pouvez demander l’accès à vos données, leur correction, leur
            suppression, ou vous opposer à leur traitement. Écrivez-nous à{" "}
            <a
              href="mailto:contact@guidzme.fr"
              className="font-semibold underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#C4714A]"
            >
              contact@guidzme.fr
            </a>{" "}
            — nous répondons sous un mois. Si notre réponse ne vous satisfait
            pas, vous pouvez saisir la CNIL.
          </p>
        </Section>

        <Section titre="Signaler un contenu">
          <p>
            Les livrets sont écrits par les hôtes, pas par nous. Chaque page
            porte en bas un lien de signalement : s’il vous paraît illicite ou
            déplacé, dites-le-nous, nous l’examinons.
          </p>
        </Section>
      </div>
    </main>
  );
}
