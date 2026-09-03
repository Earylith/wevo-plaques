"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, X } from "@phosphor-icons/react";
import {
  FINALITES,
  Finalite,
  lireConsentement,
  ecrireConsentement,
} from "@/lib/consentement";

/**
 * Consentement aux traceurs, finalité par finalité.
 *
 * Un bandeau qui ne propose que « accepter » ou « refuser » en bloc ne
 * recueille pas un consentement valable : le RGPD demande un choix par
 * finalité, et la CNIL demande que refuser soit aussi simple qu'accepter.
 *
 * Trois exigences, tenues ici :
 *
 *  1. RIEN n'est déposé avant la réponse. Ce composant ne charge aucun
 *     script ; il enregistre un choix et le publie. Les scripts l'écoutent.
 *  2. Les deux refus sont au même niveau que les deux acceptations — même
 *     rang, même taille. Un « refuser » caché derrière un écran de réglages
 *     est un consentement extorqué.
 *  3. Le choix se détaille, et se retire : le lien reste en pied de page.
 *
 * La mesure des livrets ne passe pas par là : elle est anonyme, sans cookie
 * ni identifiant, et ne compte que des ouvertures. On le dit, parce qu'un
 * hôte qui lit « mesure d'audience » a le droit de savoir ce qu'on mesure.
 */

export default function BandeauCookies() {
  /*
   * L'administration n'est pas un site visité : c'est l'outil interne de
   * Guidz, derrière une authentification. Y demander un consentement n'a
   * aucun sens juridique, et le bandeau recouvrait les lignes du tableau
   * de bord à chaque ouverture.
   */
  const chemin = usePathname();

  /** `"inconnu"` tant que le stockage n'a pas été lu : rien ne s'affiche. */
  const [etat, setEtat] = useState<"inconnu" | "a-demander" | "repondu">("inconnu");
  const [detaille, setDetaille] = useState(false);
  const [choix, setChoix] = useState<Record<Finalite, boolean>>({
    mesure: false,
    publicite: false,
  });

  useEffect(() => {
    /*
     * Lu après le montage : le serveur ignore le choix du visiteur, et rendre
     * le bandeau côté serveur le ferait clignoter chez qui a déjà répondu.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEtat(lireConsentement() ? "repondu" : "a-demander");
  }, []);

  const repondre = (valeurs: Record<Finalite, boolean>) => {
    ecrireConsentement(valeurs);
    setEtat("repondu");
  };

  if (chemin?.startsWith("/admin")) return null;
  if (etat !== "a-demander") return null;

  const bouton =
    "flex-1 rounded-full px-5 py-3 text-[14px] font-semibold transition-all active:scale-[0.99]";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gestion des traceurs"
      className="fixed inset-x-0 bottom-0 z-[150] p-3 sm:p-5"
    >
      <div className="mx-auto max-h-[85vh] max-w-3xl overflow-y-auto rounded-[22px] border border-black/[0.07] bg-white/97 p-5 shadow-[0_8px_40px_-12px_rgba(42,32,22,0.35)] backdrop-blur-xl sm:p-6">
        <p className="text-[15px] font-bold tracking-[-0.01em] text-[#2A2016]">
          Vous choisissez ce que nous mesurons
        </p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6B5D4E]">
          Rien n’est déposé sur votre appareil tant que vous n’avez pas répondu.
          Vous pouvez accepter certaines finalités et en refuser d’autres, et
          revenir sur votre choix à tout moment.
        </p>

        {detaille && (
          <div className="mt-4 space-y-2.5">
            {/*
              Toujours actif, et dit comme tel : prétendre laisser le choix sur
              ce qui est indispensable au fonctionnement serait mentir.
            */}
            <div className="rounded-2xl border border-black/[0.07] bg-[#F6F3ED] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#2A2016]">
                    Fonctionnement du site
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6B5D4E]">
                    Votre session, votre panier de commande, votre choix
                    ci-dessous. Sans eux le site ne fonctionne pas — ils ne
                    servent à rien d’autre et ne sont jamais partagés.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-black/[0.06] px-3 py-1 text-[11.5px] font-semibold text-[#6B5D4E]">
                  Toujours actif
                </span>
              </div>
            </div>

            {(Object.keys(FINALITES) as Finalite[]).map((cle) => {
              const f = FINALITES[cle];
              const actif = choix[cle];
              return (
                <div key={cle} className="rounded-2xl border border-black/[0.07] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#2A2016]">{f.titre}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#6B5D4E]">
                        {f.texte}
                      </p>
                      <p className="mt-1 text-[12px] text-[#A8998A]">{f.exemple}</p>
                    </div>

                    {/*
                      Interrupteur en flexbox, et non en position absolue.
                      Le curseur était placé par `translate` dans un rail sans
                      débordement contenu : il en sortait. Ici il est un
                      élément du rail, poussé d'un bord à l'autre — il ne peut
                      pas s'en échapper, quelle que soit la largeur.
                    */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={actif}
                      aria-label={`${f.titre} : ${actif ? "activée" : "désactivée"}`}
                      onClick={() => setChoix((c) => ({ ...c, [cle]: !c[cle] }))}
                      className={`flex h-7 w-[52px] shrink-0 items-center overflow-hidden rounded-full p-[3px] transition-colors ${
                        actif ? "justify-end bg-[#C4714A]" : "justify-start bg-black/[0.16]"
                      }`}
                    >
                      <span className="block h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/*
          Les deux gestes symétriques d'abord, de même poids. Le détail vient
          après : le proposer en premier ferait du refus le chemin le plus
          long, ce qui vicie le consentement.
        */}
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          {detaille ? (
            <button
              type="button"
              onClick={() => repondre(choix)}
              className={`${bouton} bg-[#2A2016] text-white hover:bg-[#C4714A]`}
            >
              Enregistrer mes choix
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => repondre({ mesure: true, publicite: true })}
                className={`${bouton} inline-flex items-center justify-center gap-1.5 bg-[#2A2016] text-white hover:bg-[#C4714A]`}
              >
                <Check size={15} weight="bold" />
                Tout accepter
              </button>
              <button
                type="button"
                onClick={() => repondre({ mesure: false, publicite: false })}
                className={`${bouton} inline-flex items-center justify-center gap-1.5 border border-black/[0.12] text-[#2A2016] hover:border-black/25`}
              >
                <X size={15} weight="bold" />
                Tout refuser
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setDetaille((v) => !v)}
            className={`${bouton} border border-black/[0.12] text-[#6B5D4E] hover:border-black/25 hover:text-[#2A2016]`}
          >
            {detaille ? "Revenir" : "Personnaliser"}
          </button>
        </div>

        <p className="mt-3.5 text-[12px] leading-relaxed text-[#A8998A]">
          La mesure des livrets, elle, ne dépend pas de ce choix : elle est
          anonyme, sans cookie ni identifiant, et ne compte que des ouvertures.{" "}
          <Link
            href="/confidentialite"
            className="underline decoration-[#EDD9A3] underline-offset-2 hover:text-[#6B5D4E]"
          >
            Notre politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  );
}
