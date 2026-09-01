"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PencilSimple, Copy, Check, ArrowSquareOut, ArrowRight, Lock,
  Eye, QrCode, Package, Warning, Sparkle, House,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { chargerEspaceClient, EspaceClient } from "@/app/espace-actions";
import { ouvrirBasculeConfort } from "@/app/paiement-actions";
import PartagerLivret from "@/components/proprietaire/PartagerLivret";
import { rankedModules, buildInsights, HOUR_LABELS } from "@/lib/stats";
import { ORDER_STATUS_LABELS } from "@/lib/types/accommodation";

/**
 * Espace client.
 *
 * Ce que l'hôte vient y chercher, dans cet ordre : son lien de partage, la
 * main sur son contenu, et ce que ses voyageurs consultent vraiment. La page
 * suit cet ordre-là plutôt que celui de nos tables.
 *
 * Le Confort ouvre l'édition sans limite. L'Essentielle est une page composée
 * UNE FOIS : l'hôte l'écrit lui-même tant qu'elle est en brouillon, puis
 * l'édition se ferme à la publication et les retouches passent par Guidz. On
 * le dit franchement à ce moment-là, plutôt que d'offrir un bouton qui
 * refuserait de fonctionner.
 */

/* ─────────────────────────── Éléments de surface ─────────────────────────── */

/**
 * La surface commune à tout l'écran.
 *
 * Une seule ombre, très basse, et une bordure presque invisible : la
 * hiérarchie doit venir de l'espace et de la typographie, pas d'un empilement
 * de cadres qui finirait par ressembler à un tableur.
 */
function Surface({
  children,
  className = "",
  delai = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delai?: number;
}) {
  return (
    <section
      className={`guidz-apparait rounded-[26px] border border-black/[0.055] bg-white shadow-[0_1px_2px_rgba(42,32,22,0.04),0_12px_32px_-16px_rgba(42,32,22,0.14)] ${className}`}
      style={{ animationDelay: `${delai}ms` }}
    >
      {children}
    </section>
  );
}

/** Intitulé de section : discret, en petites capitales espacées. */
function Intitule({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#A8998A]">
      {children}
    </p>
  );
}

/** Pastille d'état, déclinée en trois tonalités. */
function Pastille({
  ton,
  children,
}: {
  ton: "accent" | "neutre" | "vert" | "ambre";
  children: React.ReactNode;
}) {
  const tons = {
    accent: "bg-[#C4714A]/10 text-[#A35A38]",
    neutre: "bg-black/[0.045] text-[#6B5D4E]",
    vert: "bg-emerald-500/10 text-emerald-700",
    ambre: "bg-amber-500/12 text-amber-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tons[ton]}`}>
      {children}
    </span>
  );
}

/** Un chiffre, présenté grand et calme. */
function Chiffre({
  valeur,
  intitule,
  Icone,
}: {
  valeur: string | number;
  intitule: string;
  Icone: React.ComponentType<{ size?: number; weight?: "bold"; className?: string }>;
}) {
  return (
    <div className="flex-1 px-5 py-4 sm:px-6 sm:py-5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.11em] text-[#A8998A]">
        <Icone size={12} weight="bold" />
        {intitule}
      </p>
      <p className="mt-1.5 text-[34px] font-semibold leading-none tracking-[-0.035em] tabular-nums text-[#2A2016] sm:text-[40px]">
        {valeur}
      </p>
    </div>
  );
}

/* ──────────────────────────────── Données ──────────────────────────────── */

/**
 * Les quatorze derniers jours, y compris ceux à zéro.
 *
 * Les clés sont formées comme le compteur les écrit — en UTC. Les relire en
 * heure locale décalerait tout le graphique d'un jour selon l'heure à
 * laquelle l'hôte consulte son espace.
 */
function derniersJours(byDay: Record<string, number> | undefined) {
  const jours: { cle: string; date: Date; valeur: number }[] = [];
  const maintenant = Date.now();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(maintenant - i * 86400000);
    const cle = d.toISOString().slice(0, 10);
    jours.push({ cle, date: d, valeur: byDay?.[cle] || 0 });
  }
  return jours;
}

/* ──────────────────────────────── L'écran ──────────────────────────────── */

export default function EspaceClientPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [espace, setEspace] = useState<EspaceClient | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);
  const [bascule, setBascule] = useState(false);
  const [erreurBascule, setErreurBascule] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/proprietaire/login");
      return;
    }

    let annule = false;
    user
      .getIdToken()
      .then((jeton) => chargerEspaceClient(jeton))
      .then((donnees) => {
        if (annule) return;
        setEspace(donnees);
        setChargement(false);
      })
      .catch((e) => {
        console.error(e);
        if (annule) return;
        setErreur(e instanceof Error ? e.message : "Chargement impossible.");
        setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [user, loading, router]);

  if (loading || chargement) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <span className="h-5 w-5 rounded-full border-2 border-[#2A2016]/15 border-t-[#C4714A] animate-spin" />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="mx-auto mt-24 max-w-md px-6 text-center">
        <Warning size={24} weight="fill" className="mx-auto mb-3 text-[#C4714A]" />
        <p className="text-[15px] leading-relaxed text-[#6B5D4E]">{erreur}</p>
      </div>
    );
  }

  /* Aucun livret : le compte existe, la formule reste à choisir. */
  if (!espace?.livret) {
    return (
      <div className="mx-auto mt-24 max-w-md px-6 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-white shadow-[0_1px_2px_rgba(42,32,22,0.05),0_12px_28px_-14px_rgba(42,32,22,0.2)]">
          <House size={24} weight="duotone" className="text-[#C4714A]" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[30px] font-bold tracking-[-0.02em] text-[#2A2016]">
          Aucun livret pour l’instant
        </h1>
        <p className="mx-auto mt-2.5 max-w-sm text-[15px] leading-relaxed text-[#6B5D4E]">
          Choisissez votre formule, et votre page d’accueil se compose dans la foulée.
        </p>
        <Link
          href="/#offres"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2A2016] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98]"
        >
          Voir les formules <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    );
  }

  const { livret, stats, commande, abonnement } = espace;
  const estConfort = livret.formule === "comfort";
  /*
   * Qui peut modifier, et quand.
   *
   * Le Confort ouvre l'édition sans limite. L'Essentielle est une page
   * composée UNE FOIS : l'hôte l'écrit lui-même tant qu'elle est en
   * brouillon, et ce sont les retouches d'après publication qui passent par
   * Guidz. Verrouiller dès le départ reviendrait à lui vendre une page qu'il
   * n'aurait jamais eu le droit d'écrire.
   */
  const peutEditer = estConfort || !livret.enLigne;
  const origine = typeof window !== "undefined" ? window.location.origin : "";
  const lienPartage = `${origine}/h/${livret.slug}`;

  const ouvertures = stats.opens || 0;
  const scans = stats.qrScans || 0;
  const classement = rankedModules(stats).slice(0, 5);
  const conseils = buildInsights(stats);
  const jours = derniersJours(stats.byDay);
  const sommet = Math.max(1, ...jours.map((j) => j.valeur));
  const surQuinzaine = jours.reduce((a, j) => a + j.valeur, 0);
  const moyenne = Math.round((surQuinzaine / 14) * 10) / 10;

  const heures = Object.entries(stats.byHour || {})
    .filter(([, v]) => (v || 0) > 0)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const totalHeures = heures.reduce((a, [, v]) => a + (v || 0), 0);

  /*
   * Bascule vers le Confort, pour une Essentielle déjà payée.
   *
   * On n'écrit rien ici : la formule ne change qu'une fois l'encaissement
   * confirmé par Stripe, dans le webhook. Un client qui abandonnerait le
   * paiement ne doit pas se retrouver avec un Confort qu'il n'a pas réglé.
   */
  const basculer = async () => {
    setBascule(true);
    setErreurBascule(null);
    try {
      const jeton = await user?.getIdToken();
      const { url } = await ouvrirBasculeConfort(livret.id, window.location.origin, jeton);
      window.location.assign(url);
    } catch (e) {
      console.error(e);
      setErreurBascule(
        e instanceof Error ? e.message : "Le paiement n’a pas pu être ouvert."
      );
      setBascule(false);
    }
  };

  const copierLien = () => {
    navigator.clipboard?.writeText(lienPartage);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const dateLongue = (ms: number) =>
    new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      {/* ── Identité ─────────────────────────────────────────────────────── */}
      <header className="guidz-apparait mb-9">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Pastille ton={estConfort ? "accent" : "neutre"}>
            Formule {estConfort ? "Confort" : "Essentielle"}
          </Pastille>
          <Pastille ton={livret.enLigne ? "vert" : "ambre"}>
            {livret.enLigne ? "En ligne" : "Brouillon"}
          </Pastille>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[40px] font-bold leading-[1.05] tracking-[-0.025em] text-[#2A2016] sm:text-[54px]">
          {livret.nom}
        </h1>
      </header>

      {/* ── Le lien de partage ───────────────────────────────────────────── */}
      <Surface className="mb-4 overflow-hidden" delai={40}>
        <div className="px-5 pt-5 sm:px-7 sm:pt-6">
          <Intitule>Le lien de votre livret</Intitule>
        </div>

        <div className="flex flex-col gap-2.5 px-5 py-4 sm:flex-row sm:items-center sm:px-7 sm:py-5">
          <button
            type="button"
            onClick={copierLien}
            title="Copier le lien"
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#F6F3ED] px-4 py-3 text-left transition-colors hover:bg-[#F1ECE3]"
          >
            <span className="truncate font-mono text-[13px] text-[#5C3D2E]">
              {lienPartage.replace(/^https?:\/\//, "")}
            </span>
            <span className="ml-auto shrink-0 text-[#A8998A] transition-colors group-hover:text-[#C4714A]">
              {copie ? (
                <Check size={15} weight="bold" className="text-emerald-600" />
              ) : (
                <Copy size={15} weight="bold" />
              )}
            </span>
          </button>

          <div className="flex shrink-0 gap-2.5">
            <button
              type="button"
              onClick={copierLien}
              className="h-11 flex-1 rounded-full bg-[#2A2016] px-5 text-[13.5px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98] sm:flex-none"
            >
              {copie ? "Copié" : "Copier"}
            </button>
            <a
              href={lienPartage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-black/[0.08] px-5 text-[13.5px] font-semibold text-[#6B5D4E] transition-all hover:border-black/20 hover:text-[#2A2016] active:scale-[0.98] sm:flex-none"
            >
              <ArrowSquareOut size={14} weight="bold" /> Ouvrir
            </a>
          </div>
        </div>

        {/*
          Envoyer le livret est le geste qui suit immédiatement le fait de
          l'avoir : il a sa place ici, sous le lien, et non dans un écran à
          part.
        */}
        <PartagerLivret
          livretId={livret.id}
          lien={lienPartage}
          messageInitial={livret.messagePartage}
          jeton={async () => user?.getIdToken()}
        />

        {livret.permanentId && (
          <p className="border-t border-black/[0.05] px-5 py-3.5 text-[12.5px] leading-relaxed text-[#A8998A] sm:px-7">
            Le QR de votre plaque pointe vers une adresse permanente. Ce lien-ci
            peut changer sans casser les plaques déjà gravées.
          </p>
        )}
      </Surface>

      {/* ── Reprendre la main, ou passer au Confort ───────────────────────── */}
      {peutEditer ? (
        <Surface className="mb-4 overflow-hidden" delai={80}>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="min-w-0">
              <h2 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.015em] text-[#2A2016]">
                {estConfort ? "Votre livret" : "Composez votre page"}
              </h2>
              <p className="mt-1.5 max-w-md text-[14.5px] leading-relaxed text-[#6B5D4E]">
                {estConfort
                  ? "Modifiez votre contenu autant de fois que vous le souhaitez. Les changements sont visibles immédiatement."
                  : "Renseignez votre livret, puis publiez-le avec votre plaque. Votre formule Essentielle comprend une page composée une fois : après publication, les retouches passeront par nous."}
              </p>
            </div>
            <Link
              href={`/proprietaire/dashboard/${livret.id}/edit`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#2A2016] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98]"
            >
              <PencilSimple size={15} weight="bold" />
              {estConfort ? "Modifier" : "Composer mon livret"}
            </Link>
          </div>
        </Surface>
      ) : (
        <Surface className="mb-4 overflow-hidden" delai={80}>
          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-2 text-[#A8998A]">
              <Lock size={14} weight="bold" />
              <Intitule>Modifier votre page</Intitule>
            </div>
            <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-[#6B5D4E]">
              Votre formule Essentielle comprend une page composée une fois.
              Une retouche se règle <strong>5 € la session</strong> : vous
              reprenez la main sur la page entière, le temps de la session.
              Pour modifier aussi souvent que vous le voulez, le Confort ouvre
              l’édition en permanence.
            </p>
          </div>

          {/*
           * L'invitation au Confort a droit à sa propre surface, chaude et
           * distincte : c'est une proposition, pas une consigne.
           */}
          <div className="border-t border-black/[0.05] bg-gradient-to-br from-[#FDF8F0] to-[#F9EFE2] p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <Sparkle size={15} weight="fill" className="text-[#C4714A]" />
              <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#2A2016]">
                Ce que le Confort ajoute
              </h3>
            </div>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {[
                "Modifications illimitées, depuis cet espace",
                "Bonnes adresses, équipements, questions fréquentes",
                "Page multilingue, traduite automatiquement",
                "Vos couleurs et vos photos",
              ].map((ligne) => (
                <li key={ligne} className="flex items-start gap-2.5 text-[14px] leading-snug text-[#5C3D2E]">
                  <Check size={14} weight="bold" className="mt-0.5 shrink-0 text-[#C4714A]" />
                  {ligne}
                </li>
              ))}
            </ul>
            {/*
              Le prix est annoncé AVANT le clic. Envoyer vers Stripe sans
              l'avoir dit ferait découvrir le montant sur la page de paiement,
              c'est-à-dire trop tard.
            */}
            <p className="mt-5 text-[14px] text-[#5C3D2E]">
              <span className="font-semibold text-[#2A2016]">20 € une fois</span>
              {" "}+ 1,99 €/mois. Votre page et votre plaque sont déjà payées :
              vous ne réglez que l’écart entre les deux formules.
            </p>

            <button
              type="button"
              onClick={() => void basculer()}
              disabled={bascule}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C4714A] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#A35A38] active:scale-[0.98] disabled:opacity-60"
            >
              {bascule ? (
                "Ouverture du paiement…"
              ) : (
                <>
                  Passer au Confort <ArrowRight size={15} weight="bold" />
                </>
              )}
            </button>

            {erreurBascule && (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-[13.5px] leading-relaxed text-red-700">
                {erreurBascule}
              </p>
            )}
          </div>
        </Surface>
      )}

      {/* ── Consultations ────────────────────────────────────────────────── */}
      <Surface className="mb-4 overflow-hidden" delai={120}>
        <div className="px-5 pt-5 sm:px-7 sm:pt-6">
          <Intitule>Consultations</Intitule>
        </div>

        {ouvertures === 0 ? (
          <p className="px-5 py-6 text-[14.5px] leading-relaxed text-[#6B5D4E] sm:px-7">
            Aucune consultation pour l’instant. Les chiffres apparaîtront dès que
            vos voyageurs ouvriront votre livret.
          </p>
        ) : (
          <>
            {/* Les trois chiffres, séparés par de simples filets. */}
            <div className="flex flex-col divide-y divide-black/[0.05] sm:flex-row sm:divide-x sm:divide-y-0">
              <Chiffre valeur={ouvertures} intitule="Ouvertures" Icone={Eye} />
              <Chiffre valeur={scans} intitule="Via la plaque" Icone={QrCode} />
              <Chiffre
                valeur={moyenne.toLocaleString("fr-FR")}
                intitule="Par jour"
                Icone={Sparkle}
              />
            </div>

            {/* Quatorze jours. Le relief se lit d'un coup d'œil. */}
            <div className="border-t border-black/[0.05] px-5 py-5 sm:px-7 sm:py-6">
              <div className="mb-4 flex items-baseline justify-between">
                <Intitule>Ces quatorze jours</Intitule>
                <span className="text-[12.5px] tabular-nums text-[#A8998A]">
                  {surQuinzaine} ouverture{surQuinzaine > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex h-24 items-end gap-[3px]">
                {jours.map((j) => (
                  <div
                    key={j.cle}
                    title={`${j.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} — ${j.valeur}`}
                    className="group flex-1 rounded-t-[4px] bg-[#C4714A]/85 transition-colors hover:bg-[#C4714A]"
                    style={{
                      // Un filet reste visible à zéro : une colonne absente se
                      // lirait comme une donnée manquante, pas comme un zéro.
                      height: `${Math.max(3, (j.valeur / sommet) * 100)}%`,
                      opacity: j.valeur === 0 ? 0.18 : 1,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-[#BBAE9E]">
                <span>
                  {jours[0].date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
                <span>Aujourd’hui</span>
              </div>
            </div>

            {classement.length > 0 && (
              <div className="border-t border-black/[0.05] px-5 py-5 sm:px-7 sm:py-6">
                <Intitule>Rubriques les plus ouvertes</Intitule>
                <div className="mt-4 space-y-3">
                  {classement.map((m) => (
                    <div key={m.id} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 truncate text-[13.5px] text-[#5C3D2E] sm:w-36">
                        {m.name}
                      </span>
                      <span className="h-[7px] flex-1 overflow-hidden rounded-full bg-black/[0.055]">
                        <span
                          className="block h-full rounded-full bg-[#2A2016]"
                          style={{ width: `${Math.max(3, (m.count / classement[0].count) * 100)}%` }}
                        />
                      </span>
                      <span className="w-9 shrink-0 text-right text-[13px] font-semibold tabular-nums text-[#2A2016]">
                        {m.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalHeures > 0 && (
              <div className="border-t border-black/[0.05] px-5 py-5 sm:px-7 sm:py-6">
                <Intitule>À quels moments</Intitule>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {heures.map(([cle, valeur]) => (
                    <span
                      key={cle}
                      className="rounded-full bg-[#F6F3ED] px-3.5 py-1.5 text-[13px] text-[#5C3D2E]"
                    >
                      {HOUR_LABELS[cle] || cle}
                      <span className="ml-1.5 font-semibold tabular-nums text-[#A35A38]">
                        {Math.round(((valeur || 0) / totalHeures) * 100)}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {conseils.length > 0 && (
              <div className="space-y-2.5 border-t border-black/[0.05] bg-[#FDFBF7] px-5 py-5 sm:px-7 sm:py-6">
                {conseils.map((c, i) => (
                  <p
                    key={i}
                    className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#5C3D2E]"
                  >
                    <Sparkle size={13} weight="fill" className="mt-1 shrink-0 text-[#C4714A]" />
                    {c.text}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        <p className="border-t border-black/[0.05] px-5 py-3.5 text-[12.5px] text-[#A8998A] sm:px-7">
          Mesure anonyme : on compte des ouvertures, jamais des personnes.
        </p>
      </Surface>

      {/* ── Plaque et abonnement ─────────────────────────────────────────── */}
      {/* Une carte seule ne reste pas orpheline sur une moitié de page. */}
      {(commande || abonnement) && (
        <div className={`grid gap-4 ${commande && abonnement ? "sm:grid-cols-2" : "grid-cols-1"}`}>
          {commande && (
            <Surface className="p-5 sm:p-6" delai={160}>
              <div className="flex items-center gap-2 text-[#A8998A]">
                <Package size={14} weight="bold" />
                <Intitule>Votre plaque</Intitule>
              </div>
              <p className="mt-3 font-mono text-[17px] font-semibold tracking-[-0.01em] text-[#2A2016]">
                {commande.reference}
              </p>
              <p className="mt-1 text-[13.5px] text-[#6B5D4E]">
                Commandée le {dateLongue(commande.date)}
              </p>
              <div className="mt-3.5">
                <Pastille ton={commande.statut === "expediee" ? "vert" : "accent"}>
                  {ORDER_STATUS_LABELS[commande.statut]}
                </Pastille>
              </div>

              {/*
                L'acheminement, dès que Guidz l'a renseigné. C'est la seule
                chose que l'hôte vient chercher une fois qu'il a payé : sans
                nouvelles, il écrit ; avec un suivi, il attend.
              */}
              {(commande.lienSuivi || commande.transporteur || commande.motDeGuidz) && (
                <div className="mt-4 rounded-2xl bg-[#F6F3ED] p-4">
                  {commande.expedieeLe && (
                    <p className="text-[13.5px] font-semibold text-[#2A2016]">
                      Expédiée le {dateLongue(commande.expedieeLe)}
                    </p>
                  )}
                  {commande.transporteur && (
                    <p className="mt-0.5 text-[13px] text-[#6B5D4E]">
                      {commande.transporteur}
                      {commande.numeroSuivi && (
                        <span className="font-mono text-[12px]"> · {commande.numeroSuivi}</span>
                      )}
                    </p>
                  )}
                  {commande.livraisonPrevue && (
                    <p className="mt-0.5 text-[13px] text-[#6B5D4E]">
                      Livraison prévue le {dateLongue(commande.livraisonPrevue)}
                    </p>
                  )}
                  {commande.motDeGuidz && (
                    <p className="mt-2 text-[13px] leading-relaxed text-[#5C3D2E]">
                      {commande.motDeGuidz}
                    </p>
                  )}
                  {commande.lienSuivi && (
                    <a
                      href={commande.lienSuivi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#2A2016] px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98]"
                    >
                      Suivre mon colis <ArrowSquareOut size={13} weight="bold" />
                    </a>
                  )}
                </div>
              )}
            </Surface>
          )}

          {abonnement && (
            <Surface className="p-5 sm:p-6" delai={200}>
              <div className="flex items-center gap-2 text-[#A8998A]">
                <Sparkle size={14} weight="bold" />
                <Intitule>Votre abonnement</Intitule>
              </div>
              <div className="mt-3">
                <Pastille ton={abonnement.actif ? "vert" : "ambre"}>{abonnement.etat}</Pastille>
              </div>
              {abonnement.prochaineEcheance && (
                <p className="mt-3 text-[13.5px] leading-relaxed text-[#6B5D4E]">
                  {abonnement.finProgrammee ? "Se termine le " : "Prochaine échéance le "}
                  {dateLongue(abonnement.prochaineEcheance)}
                </p>
              )}
              <p className="mt-2 text-[12.5px] leading-relaxed text-[#A8998A]">
                Pour toute question de facturation, écrivez-nous.
              </p>
            </Surface>
          )}
        </div>
      )}
    </div>
  );
}
