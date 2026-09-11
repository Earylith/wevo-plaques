"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PencilSimple, Copy, Check, ArrowSquareOut, ArrowRight, Lock,
  Eye, QrCode, Package, Warning, Sparkle, House, Plus, X, CreditCard,
  ShoppingCart,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { chargerEspaceClient, creerNouveauLivret, EspaceClient } from "@/app/espace-actions";
import { ouvrirBasculeConfort, ouvrirSessionModification } from "@/app/paiement-actions";
import { RythmeAbonnement } from "@/lib/stripe";
import { OfferType } from "@/lib/types/accommodation";
import PartagerLivret from "@/components/proprietaire/PartagerLivret";
import GererAbonnement from "@/components/proprietaire/GererAbonnement";
import PanierCommande from "@/components/proprietaire/PanierCommande";
import ParrainageCard from "@/components/proprietaire/ParrainageCard";
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
  /*
   * Rythme de facturation choisi pour la bascule.
   *
   * L'annuel revient moins cher, le mensuel engage moins. Aucun des deux
   * n'est « le bon » : on présente les deux, et le mensuel est
   * présélectionné parce qu'il est le moins engageant.
   */
  const [rythme, setRythme] = useState<RythmeAbonnement>("mensuel");
  const [sessionEnCours, setSessionEnCours] = useState(false);

  /* Multi-livrets */
  const [livretIdCible, setLivretIdCible] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("livret");
    }
    return null;
  });
  const [rechargementLivret, setRechargementLivret] = useState(false);
  const [modaleNouveauLivret, setModaleNouveauLivret] = useState(false);
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouvelleFormule, setNouvelleFormule] = useState<OfferType>("comfort");
  const [creationEnCours, setCreationEnCours] = useState(false);
  const [erreurCreation, setErreurCreation] = useState<string | null>(null);

  const [panierOuvert, setPanierOuvert] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("panier") === "1";
    }
    return false;
  });
  const [notificationPanier, setNotificationPanier] = useState<string | null>(null);

  const chargerPourId = async (idCible?: string) => {
    if (!user) return;
    const jeton = await user.getIdToken();
    const donnees = await chargerEspaceClient(jeton, idCible);
    setEspace(donnees);
  };

  const changerDeLivret = async (id: string) => {
    setLivretIdCible(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("livret", id);
      window.history.pushState({}, "", url.toString());
    }
    setRechargementLivret(true);
    try {
      await chargerPourId(id);
    } catch (e) {
      console.error(e);
    } finally {
      setRechargementLivret(false);
    }
  };

  const handleCreerNouveauLivret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const nom = nouveauNom.trim();
    if (!nom) {
      setErreurCreation("Veuillez indiquer le nom de votre hébergement.");
      return;
    }
    setCreationEnCours(true);
    setErreurCreation(null);
    try {
      const jeton = await user.getIdToken();
      const nouveau = await creerNouveauLivret(jeton, nom, nouvelleFormule);
      setModaleNouveauLivret(false);
      setNouveauNom("");
      await chargerPourId(nouveau.id);
      setNotificationPanier(`Nouveau livret « ${nom} » ajouté à votre panier de commande !`);
      setPanierOuvert(true);
    } catch (err) {
      console.error(err);
      setErreurCreation(
        err instanceof Error ? err.message : "La création du livret a échoué."
      );
    } finally {
      setCreationEnCours(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/proprietaire/login");
      return;
    }

    let annule = false;
    user
      .getIdToken()
      .then((jeton) => chargerEspaceClient(jeton, livretIdCible || undefined))
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
  const tousLesLivrets = espace.tousLesLivrets || [];
  const brouillons = tousLesLivrets.filter((l) => !l.enLigne);
  const nombreBrouillons = brouillons.length;
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
  const peutEditer = estConfort || !livret.enLigne || Boolean(livret.editionJusquA);
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
      const { url } = await ouvrirBasculeConfort(livret.id, window.location.origin, jeton, rythme);
      window.location.assign(url);
    } catch (e) {
      console.error(e);
      setErreurBascule(
        e instanceof Error ? e.message : "Le paiement n’a pas pu être ouvert."
      );
      setBascule(false);
    }
  };

  /** Jeton Firebase de l'hôte, redemandé à chaque geste. */
  const jetonHote = async () => user?.getIdToken();

  /*
   * Session de modification, pour une Essentielle publiée.
   *
   * Rien n'est ouvert ici : c'est le webhook qui accorde la session une fois
   * l'encaissement confirmé. Le client revient sur cet écran, et le bouton
   * « Modifier » y est apparu.
   */
  const ouvrirSession = async () => {
    setSessionEnCours(true);
    setErreurBascule(null);
    try {
      const { url } = await ouvrirSessionModification(
        livret.id,
        window.location.origin,
        await jetonHote()
      );
      window.location.assign(url);
    } catch (e) {
      console.error(e);
      setErreurBascule(e instanceof Error ? e.message : "Le paiement n’a pas pu être ouvert.");
      setSessionEnCours(false);
    }
  };

  const dateLongue = (ms: number) =>
    new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const copierLien = () => {
    navigator.clipboard?.writeText(lienPartage);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  /*
   * Le prénom seul, tiré du nom du compte.
   *
   * On ne saisit pas prénom et nom séparément : demander deux champs pour
   * accueillir quelqu'un serait une formalité de plus à l'inscription. Le
   * premier mot suffit, et se trompe rarement.
   */
  const prenomCompte = (user?.displayName || "").trim().split(/\s+/)[0] || "";
  const prenom = prenomCompte.length > 1 ? prenomCompte : "";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-7 sm:px-8 sm:pt-10">
      {/* ── Identité et action principale ───────────────────────────────── */}
      <header className="guidz-apparait mb-5 overflow-hidden rounded-[28px] border border-black/[0.055] bg-[#2A2016] text-white shadow-[0_18px_50px_-28px_rgba(42,32,22,0.65)]">
        <div className="relative p-5 sm:p-7 lg:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#C4714A]/30 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              {prenom && (
                <p className="mb-2 text-[14px] text-white/60">Bonjour {prenom},</p>
              )}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full py-1 pr-3 text-[11.5px] font-semibold ring-1 ${estConfort ? "bg-[#C4714A]/25 pl-1 text-[#FFE0B0] ring-[#E8BE72]/30" : "bg-white/10 pl-2.5 text-white/85 ring-white/10"}`}>
                  {estConfort && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8BE72] text-[#2A2016] shadow-[0_0_16px_rgba(232,190,114,.3)]">
                      <Sparkle size={13} weight="fill" />
                    </span>
                  )}
                  Formule {estConfort ? "Confort" : "Essentielle"}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold ${livret.enLigne ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-100"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${livret.enLigne ? "bg-emerald-300" : "bg-amber-300"}`} />
                  {livret.enLigne ? "En ligne" : "Brouillon"}
                </span>
              </div>
              <h1 className="truncate font-[family-name:var(--font-display)] text-[36px] font-bold leading-[1.05] tracking-[-0.025em] sm:text-[48px]">
                {livret.nom}
              </h1>
              <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-white/60 sm:text-[15px]">
                {livret.enLigne
                  ? "Votre livret est prêt à être partagé avec vos voyageurs."
                  : "Terminez votre livret, puis commandez sa plaque pour le mettre en ligne."}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2.5">
              {peutEditer && (
                <Link
                  href={`/proprietaire/dashboard/${livret.id}/edit`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-semibold text-[#2A2016] transition-all hover:bg-[#F5EDE4] active:scale-[0.98]"
                >
                  <PencilSimple size={15} weight="bold" />
                  {livret.enLigne ? "Modifier le livret" : "Continuer le livret"}
                </Link>
              )}
              <a
                href={lienPartage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-[13.5px] font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <Eye size={15} weight="bold" /> Aperçu
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Sélecteur multi-hébergements & Accès Panier ──────────────────── */}
      <div className="mb-5 flex flex-col gap-2 rounded-[22px] border border-black/[0.05] bg-white/75 p-2 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-2.5">
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pb-0">
          <span className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-[#A8998A]">
            Hébergements {tousLesLivrets.length > 1 ? `(${tousLesLivrets.length})` : ""}
          </span>
          {tousLesLivrets.map((item) => {
            const estActif = item.id === livret.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changerDeLivret(item.id)}
                disabled={rechargementLivret}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all cursor-pointer ${
                  estActif
                    ? "bg-white text-[#2A2016] shadow-xs ring-1 ring-black/[0.04]"
                    : "text-[#6B5D4E] hover:bg-white/60 hover:text-[#2A2016]"
                }`}
              >
                <span className="truncate max-w-[140px] sm:max-w-[180px]">{item.nom}</span>
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    item.enLigne ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  title={item.enLigne ? "En ligne" : "Brouillon au panier"}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          {/* Bouton Panier */}
          <button
            type="button"
            onClick={() => {
              setNotificationPanier(null);
              setPanierOuvert(true);
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#C4714A]/35 bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#2A2016] hover:border-[#C4714A] hover:bg-[#FFFBF5] transition-all cursor-pointer shadow-2xs sm:flex-none"
            title="Ouvrir le panier de commande"
          >
            <ShoppingCart size={16} weight="duotone" className="text-[#C4714A]" />
            <span>Panier</span>
            {nombreBrouillons > 0 && (
              <span className="rounded-full bg-[#C4714A] px-2 py-0.2 text-[10.5px] font-bold text-white">
                {nombreBrouillons}
              </span>
            )}
          </button>

          {/* Bouton Nouveau livret */}
          <button
            type="button"
            onClick={() => {
              setNouveauNom("");
              setErreurCreation(null);
              setModaleNouveauLivret(true);
            }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-[12px] font-semibold text-[#5C3D2E] transition-all hover:border-[#C4714A] hover:text-[#C4714A] active:scale-[0.98] cursor-pointer shadow-2xs sm:flex-none"
          >
            <Plus size={13} weight="bold" />
            <span>Nouveau livret</span>
          </button>
        </div>
      </div>

      {/* ── Bandeau pour livret en cours de création (brouillon) ──────────── */}
      {!livret.enLigne && (
        <div className="mb-5 rounded-[22px] border border-amber-500/25 bg-[#FFF9EB] p-4 sm:p-5">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800">
                <Package size={20} weight="duotone" />
              </div>
              <div>
                <p className="font-semibold text-amber-950 text-[14.5px]">
                  Prochaine étape : finaliser ce livret
                </p>
                <p className="mt-0.5 text-[13px] text-amber-900/80 leading-relaxed max-w-lg">
                  Personnalisez son contenu, puis validez {nombreBrouillons > 1 ? `vos ${nombreBrouillons} livrets ensemble` : "sa plaque artisanale"} depuis le panier.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNotificationPanier(null);
                  setPanierOuvert(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#C4714A] bg-white px-4 py-2.5 text-[12.5px] font-bold text-[#C4714A] hover:bg-[#FFFBF5] transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
              >
                <ShoppingCart size={15} weight="duotone" />
                <span>Ouvrir le panier ({nombreBrouillons})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={peutEditer ? "grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]" : ""}>
      {/* ── Le lien de partage ───────────────────────────────────────────── */}
      <Surface className="mb-4 overflow-hidden" delai={40}>
        <div className="px-5 pt-5 sm:px-7 sm:pt-6">
          <Intitule>Partager le livret</Intitule>
          <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.015em] text-[#2A2016]">
            Prêt à envoyer aux voyageurs
          </h2>
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
          nom={livret.nom}
          formule={livret.formule}
          imageCouverture={livret.imageCouverture}
          ville={livret.ville}
          messageInitial={livret.messagePartage}
          jeton={jetonHote}
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
        <Surface className="mb-4 h-fit overflow-hidden" delai={80}>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7 lg:flex-col lg:items-stretch">
            <div className="min-w-0">
              <h2 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.015em] text-[#2A2016]">
                {estConfort
                  ? "Votre livret"
                  : livret.editionJusquA
                    ? "Session de modification ouverte"
                    : "Composez votre page"}
              </h2>
              <p className="mt-1.5 max-w-md text-[14.5px] leading-relaxed text-[#6B5D4E]">
                {estConfort
                  ? "Modifiez votre contenu autant de fois que vous le souhaitez. Les changements sont visibles immédiatement."
                  : livret.editionJusquA
                    ? `Votre session est ouverte jusqu’au ${dateLongue(livret.editionJusquA)}. Modifiez ce que vous voulez d’ici là, autant de fois que nécessaire.`
                    : "Renseignez votre livret, puis publiez-le avec votre plaque. Votre formule Essentielle comprend une page composée une fois : après publication, les retouches se règlent 5 € la session."}
              </p>
            </div>
            <Link
              href={`/proprietaire/dashboard/${livret.id}/edit`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#2A2016] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98] lg:w-full"
            >
              <PencilSimple size={15} weight="bold" />
              {estConfort || livret.editionJusquA ? "Modifier" : "Composer mon livret"}
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
              <span className="font-semibold text-[#2A2016]">20 € une fois</span>, puis
              l’abonnement au rythme qui vous convient. Votre page et votre
              plaque sont déjà payées : vous ne réglez que l’écart entre les
              deux formules.
            </p>

            {/*
              Le rythme se choisit AVANT d'arriver chez Stripe. Le découvrir
              sur la page de paiement, c'est devoir revenir en arrière pour
              changer d'avis — et beaucoup ne reviennent pas.
            */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {([
                { cle: "mensuel" as const, titre: "1,99 €/mois", detail: "Sans engagement, arrêtable à tout moment" },
                { cle: "annuel" as const, titre: "19 €/an", detail: "Deux mois offerts par rapport au mensuel" },
              ]).map((choix) => (
                <button
                  key={choix.cle}
                  type="button"
                  onClick={() => setRythme(choix.cle)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    rythme === choix.cle
                      ? "border-[#C4714A] bg-white"
                      : "border-black/[0.08] bg-white/60 hover:border-black/20"
                  }`}
                >
                  <span className="block text-[15px] font-bold text-[#2A2016]">{choix.titre}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-[#6B5D4E]">
                    {choix.detail}
                  </span>
                </button>
              ))}
            </div>

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

          {/*
            La session de modification, pour qui ne veut pas s'abonner.
            Beaucoup d'hôtes changent une ligne par an : leur imposer un
            abonnement pour cela reviendrait à ne rien leur vendre du tout.
          */}
          <div className="border-t border-black/[0.05] p-5 sm:p-7">
            <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#2A2016]">
              Juste une correction à faire ?
            </h3>
            <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-[#6B5D4E]">
              Ouvrez une session de modification à <strong>5 €</strong> : vous
              reprenez la main sur votre page entière pendant sept jours, autant
              de fois que nécessaire dans ce délai.
            </p>
            <button
              type="button"
              onClick={() => void ouvrirSession()}
              disabled={sessionEnCours}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[0.1] px-5 py-3 text-[13.5px] font-semibold text-[#2A2016] transition-all hover:border-[#C4714A] hover:text-[#C4714A] active:scale-[0.98] disabled:opacity-60"
            >
              {sessionEnCours ? "Ouverture du paiement…" : "Ouvrir une session — 5 €"}
            </button>
          </div>
        </Surface>
      )}
      </div>

      {/* ── Nouveau livret & Plaque supplémentaire (Multi-hébergements) ──── */}
      {estConfort && (
        <Surface className="mb-4 overflow-hidden border-[#C4714A]/25 bg-gradient-to-br from-white via-[#FCF9F5] to-[#F8EFE2]/60" delai={100}>
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C4714A]/12 text-[#C4714A]">
                  <Sparkle size={16} weight="fill" />
                </span>
                <Intitule>Multi-hébergements</Intitule>
              </div>
              <span className="rounded-full bg-[#C4714A]/10 px-3 py-1 text-[11.5px] font-bold text-[#A35A38]">
                Nouveau logement
              </span>
            </div>

            <div className="mt-3.5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.015em] text-[#2A2016]">
                  Ajouter un hébergement
                </h2>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#6B5D4E]">
                  Créez sa page et son QR code maintenant. La plaque pourra être commandée avec les autres livrets de votre panier.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setNouveauNom("");
                    setErreurCreation(null);
                    setModaleNouveauLivret(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2A2016] px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98] sm:w-auto cursor-pointer shadow-sm"
                >
                  <Plus size={16} weight="bold" />
                  <span>Ajouter un hébergement</span>
                </button>
              </div>
            </div>
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

      <ParrainageCard />

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
                  {abonnement.finProgrammee || livret.resiliationDemandee ? "Se termine le " : "Prochaine échéance le "}
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

      {/*
        Résiliation et suppression, tout en bas et sans emphase.
        Ce sont des sorties : elles doivent être trouvables sans être
        proposées. Les mettre en avant reviendrait à les suggérer.
      */}
      <GererAbonnement
        livretId={livret.id}
        nom={livret.nom}
        aUnAbonnement={Boolean(abonnement)}
        resiliationDemandee={livret.resiliationDemandee}
        finLe={abonnement?.prochaineEcheance ?? null}
        jeton={jetonHote}
      />

      {/* ── Modale de création d'un nouveau livret ───────────────────────── */}
      {modaleNouveauLivret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8 border border-black/[0.06]">
            <button
              type="button"
              onClick={() => !creationEnCours && setModaleNouveauLivret(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#A8998A] transition-colors hover:bg-black/[0.05] hover:text-[#2A2016] cursor-pointer"
            >
              <X size={18} weight="bold" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C4714A]/10 text-[#C4714A]">
              <House size={26} weight="duotone" />
            </div>

            <h3 className="mt-4 font-[family-name:var(--font-display)] text-[24px] font-bold tracking-tight text-[#2A2016]">
              Créer un nouveau livret
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#6B5D4E]">
              Configurez votre nouveau logement dans l’éditeur. Vous pourrez commander sa plaque artisanale en noyer et mettre sa page en ligne au moment de publier.
            </p>

            <form onSubmit={handleCreerNouveauLivret} className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A8998A] mb-1.5">
                  Nom de l&apos;hébergement
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex : Villa Miramar, Chalet des Cimes…"
                  value={nouveauNom}
                  onChange={(e) => setNouveauNom(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-[#F6F3ED]/70 px-4 py-3 text-[15px] font-medium text-[#2A2016] placeholder-[#A8998A] outline-none transition-all focus:border-[#C4714A] focus:bg-white focus:ring-2 focus:ring-[#C4714A]/20"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#A8998A] mb-1.5">
                  Formule souhaitée
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setNouvelleFormule("comfort")}
                    className={`rounded-2xl p-3.5 text-left border transition-all cursor-pointer ${
                      nouvelleFormule === "comfort"
                        ? "border-[#C4714A] bg-[#C4714A]/5 ring-1 ring-[#C4714A]"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-bold text-[#2A2016]">Confort</span>
                      <span className="rounded-full bg-[#C4714A]/15 px-2 py-0.5 text-[10.5px] font-bold text-[#C4714A]">
                        Recommandé
                      </span>
                    </div>
                    <p className="mt-1 text-[12.5px] font-semibold text-[#5C3D2E]">69 € à la commande</p>
                    <p className="text-[11px] text-[#A8998A]">+ abonnement au choix</p>
                    <p className="mt-1.5 text-[11px] text-[#6B5D4E] leading-snug">
                      Plaque noyer offerte, modifications illimitées & multi-langues.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNouvelleFormule("essential")}
                    className={`rounded-2xl p-3.5 text-left border transition-all cursor-pointer ${
                      nouvelleFormule === "essential"
                        ? "border-[#C4714A] bg-[#C4714A]/5 ring-1 ring-[#C4714A]"
                        : "border-black/10 bg-white hover:border-black/20"
                    }`}
                  >
                    <span className="text-[13.5px] font-bold text-[#2A2016]">Essentielle</span>
                    <p className="mt-1 text-[12.5px] font-semibold text-[#5C3D2E]">49 € paiement unique</p>
                    <p className="text-[11px] text-[#A8998A]">Sans abonnement</p>
                    <p className="mt-1.5 text-[11px] text-[#6B5D4E] leading-snug">
                      Plaque noyer incluse. Arrivée, départ, règles du logement & contacts.
                    </p>
                  </button>
                </div>
              </div>

              {/* Rappel Stripe */}
              <div className="rounded-2xl bg-[#F6F3ED] p-3.5 text-[12px] leading-relaxed text-[#6B5D4E]">
                <p className="font-semibold text-[#2A2016] flex items-center gap-1.5">
                  <CreditCard size={14} weight="bold" className="text-[#C4714A]" />
                  <span>Aucun débit immédiat</span>
                </p>
                <p className="mt-1">
                  Votre livret est créé gratuitement et ajouté à votre panier. Vous pourrez le personnaliser dans l&apos;éditeur et/ou le commander avec vos autres livrets. Le paiement sécurisé Stripe n&apos;intervient qu&apos;à la validation du panier.
                </p>
              </div>

              {erreurCreation && (
                <p className="text-[13px] font-medium text-rose-600">{erreurCreation}</p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={creationEnCours}
                  onClick={() => setModaleNouveauLivret(false)}
                  className="rounded-full px-5 py-3 text-[13.5px] font-semibold text-[#6B5D4E] hover:bg-black/[0.04] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creationEnCours}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2A2016] px-6 py-3 text-[13.5px] font-semibold text-white hover:bg-[#C4714A] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {creationEnCours ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Création du livret…</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={15} weight="duotone" />
                      <span>Créer et ajouter au panier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tiroir Panier de Commande Multi-Livrets ───────────────────────── */}
      <PanierCommande
        ouvert={panierOuvert}
        onFermer={() => {
          setPanierOuvert(false);
          setNotificationPanier(null);
        }}
        livrets={tousLesLivrets}
        onLivretsChange={async () => {
          await chargerPourId(livret.id);
        }}
        jetonHote={jetonHote}
        notificationMessage={notificationPanier}
      />
    </div>
  );
}
