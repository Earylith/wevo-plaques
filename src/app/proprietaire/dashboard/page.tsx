"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  House, PencilSimple, Copy, Check, ArrowSquareOut, ArrowRight, Lock,
  ChartLineUp, Eye, QrCode, CreditCard, Package, Warning, SignOut,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { chargerEspaceClient, EspaceClient } from "@/app/espace-actions";
import { rankedModules, buildInsights } from "@/lib/stats";
import { ORDER_STATUS_LABELS } from "@/lib/types/accommodation";

/**
 * Espace client.
 *
 * Ce que l'hôte vient y chercher : où en est sa commande, où est son lien de
 * partage, et ce que ses voyageurs consultent. L'édition n'y figure que pour
 * la formule Confort — l'Essentielle est une page composée une fois, dont les
 * retouches passent par Guidz. On le lui dit ici plutôt que de lui offrir un
 * bouton qui refuserait de fonctionner.
 */

function Carte({
  titre,
  Icone,
  children,
  action,
}: {
  titre: string;
  Icone: React.ComponentType<{ size?: number; weight?: "bold" | "fill" | "duotone"; className?: string }>;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-3xl border border-[#EDD9A3]/50 shadow-sm p-5 sm:p-6">
      <header className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#2A2016]">
          <Icone size={17} weight="duotone" className="text-[#C4714A]" />
          {titre}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export default function EspaceClientPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [espace, setEspace] = useState<EspaceClient | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);

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
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Chargement de votre espace…</p>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white border border-red-200 rounded-3xl p-6 text-center shadow-sm">
        <Warning size={26} weight="fill" className="text-red-500 mx-auto mb-3" />
        <p className="text-sm text-[#6B5D4E]">{erreur}</p>
      </div>
    );
  }

  /* Aucun livret : l'hôte n'a pas encore commencé. */
  if (!espace?.livret) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white border border-[#EDD9A3]/50 rounded-3xl p-8 text-center shadow-sm">
        <House size={28} weight="duotone" className="text-[#C4714A] mx-auto mb-4" />
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2A2016]">
          Aucun livret pour l’instant
        </h1>
        <p className="text-sm text-[#6B5D4E] mt-2 leading-relaxed">
          Choisissez votre formule pour composer votre page d’accueil.
        </p>
        <Link
          href="/#offres"
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-sm font-bold transition-colors"
        >
          Voir les formules <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    );
  }

  const { livret, stats, commande, abonnement } = espace;
  const estConfort = livret.formule === "comfort";
  const origine = typeof window !== "undefined" ? window.location.origin : "";
  const lienPartage = `${origine}/h/${livret.slug}`;

  const ouvertures = stats.opens || 0;
  const scans = stats.qrScans || 0;
  const classement = rankedModules(stats).slice(0, 4);
  const conseils = buildInsights(stats);

  const copierLien = () => {
    navigator.clipboard?.writeText(lienPartage);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* ── En-tête ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-[#2A2016] truncate">
            {livret.nom}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                estConfort
                  ? "bg-[#F7EBE4] text-[#A35A38] border-[#EDD9A3]"
                  : "bg-gray-100 text-[#6B5D4E] border-gray-200"
              }`}
            >
              Formule {estConfort ? "Confort" : "Essentielle"}
            </span>
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                livret.enLigne
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {livret.enLigne ? "En ligne" : "Brouillon"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut().then(() => router.replace("/proprietaire/login"))}
          className="flex items-center gap-1.5 text-[11px] font-bold text-[#A8998A] hover:text-[#C4714A] transition-colors shrink-0"
        >
          <SignOut size={14} weight="bold" /> Se déconnecter
        </button>
      </div>

      {/* ── Le lien de partage ── */}
      <Carte titre="Le lien de votre livret" Icone={QrCode}>
        <div className="flex gap-2">
          <input
            readOnly
            value={lienPartage}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] text-[11px] font-mono outline-none"
          />
          <button
            type="button"
            onClick={copierLien}
            className="px-3.5 py-2.5 rounded-xl border border-[#EDD9A3] hover:border-[#C4714A] text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {copie ? <Check size={14} weight="bold" className="text-emerald-600" /> : <Copy size={14} />}
            {copie ? "Copié" : "Copier"}
          </button>
          <a
            href={lienPartage}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl border border-[#EDD9A3] hover:border-[#C4714A] text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <ArrowSquareOut size={14} weight="bold" /> Ouvrir
          </a>
        </div>
        {livret.permanentId && (
          <p className="text-[10px] text-[#A8998A] mt-2.5 leading-relaxed">
            Le QR de votre plaque pointe vers une adresse permanente. Ce lien-ci
            peut changer sans casser les plaques déjà gravées.
          </p>
        )}
      </Carte>

      {/* ── Modifier, ou passer au Confort ── */}
      {estConfort ? (
        <Carte titre="Votre livret" Icone={PencilSimple}>
          <p className="text-xs text-[#6B5D4E] leading-relaxed mb-3.5">
            Modifiez votre contenu autant de fois que vous le souhaitez. Les
            changements sont visibles immédiatement.
          </p>
          <Link
            href={`/proprietaire/dashboard/${livret.id}/edit`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-sm font-bold transition-colors"
          >
            <PencilSimple size={15} weight="bold" /> Modifier mon livret
          </Link>
        </Carte>
      ) : (
        <Carte titre="Modifier votre page" Icone={Lock}>
          <p className="text-xs text-[#6B5D4E] leading-relaxed">
            Votre formule Essentielle comprend une page composée une fois.
            Écrivez-nous pour toute retouche, ou passez au Confort pour
            reprendre la main quand vous voulez.
          </p>
          <div className="mt-4 rounded-2xl border border-[#EDD9A3] bg-[#FDF9F2] p-4">
            <p className="text-xs font-bold text-[#2A2016] mb-1.5">
              Ce que le Confort ajoute
            </p>
            <ul className="text-[11px] text-[#6B5D4E] leading-relaxed space-y-1 mb-3.5">
              <li>· Modifications illimitées, depuis cet espace</li>
              <li>· Bonnes adresses, équipements, questions fréquentes</li>
              <li>· Page multilingue, traduite automatiquement</li>
              <li>· Couleurs et photos à vos couleurs</li>
            </ul>
            <Link
              href="/commencer?offre=confort"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold transition-colors"
            >
              Passer au Confort <ArrowRight size={13} weight="bold" />
            </Link>
          </div>
        </Carte>
      )}

      {/* ── Consultations ── */}
      <Carte titre="Consultations" Icone={ChartLineUp}>
        {ouvertures === 0 ? (
          <p className="text-xs text-[#6B5D4E] leading-relaxed">
            Aucune consultation pour l’instant. Les chiffres apparaîtront dès
            que vos voyageurs ouvriront votre livret.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="rounded-2xl border border-[#EDD9A3]/50 p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">
                  <Eye size={12} weight="bold" /> Ouvertures
                </p>
                <p className="text-2xl font-extrabold text-[#2A2016] tabular-nums mt-1">{ouvertures}</p>
              </div>
              <div className="rounded-2xl border border-[#EDD9A3]/50 p-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">
                  <QrCode size={12} weight="bold" /> Via la plaque
                </p>
                <p className="text-2xl font-extrabold text-[#2A2016] tabular-nums mt-1">{scans}</p>
              </div>
            </div>

            {classement.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">
                  Rubriques les plus ouvertes
                </p>
                {classement.map((m) => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <span className="w-32 shrink-0 text-[11px] text-[#5C3D2E] truncate">{m.name}</span>
                    <span className="flex-1 h-2 rounded-full bg-[#EDD9A3]/40 overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-[#C4714A]"
                        style={{ width: `${Math.max(4, (m.count / classement[0].count) * 100)}%` }}
                      />
                    </span>
                    <span className="w-8 text-right text-[11px] font-bold text-[#A35A38] tabular-nums">
                      {m.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {conseils.length > 0 && (
              <div className="rounded-2xl border border-[#EDD9A3] bg-[#FDF9F2] p-3.5 space-y-1.5">
                {conseils.map((c, i) => (
                  <p key={i} className="text-[11px] text-[#5C3D2E] leading-relaxed">
                    {c.text}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
        <p className="text-[10px] text-[#A8998A] mt-3 leading-relaxed">
          Mesure anonyme : on compte des ouvertures, jamais des personnes.
        </p>
      </Carte>

      {/* ── Commande et abonnement ── */}
      <div className="grid sm:grid-cols-2 gap-5">
        {commande && (
          <Carte titre="Votre plaque" Icone={Package}>
            <p className="text-sm font-bold text-[#2A2016]">{commande.reference}</p>
            <p className="text-[11px] text-[#6B5D4E] mt-0.5">
              Commandée le {new Date(commande.date).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            <span className="inline-block mt-2.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FDF3DC] text-[#A35A38] border border-[#EDD9A3]">
              {ORDER_STATUS_LABELS[commande.statut]}
            </span>
          </Carte>
        )}

        {abonnement && (
          <Carte titre="Votre abonnement" Icone={CreditCard}>
            <span
              className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                abonnement.actif
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {abonnement.etat}
            </span>
            {abonnement.prochaineEcheance && (
              <p className="text-[11px] text-[#6B5D4E] mt-2.5 leading-relaxed">
                {abonnement.finProgrammee ? "Se termine le " : "Prochaine échéance le "}
                {new Date(abonnement.prochaineEcheance).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            )}
            <p className="text-[10px] text-[#A8998A] mt-2 leading-relaxed">
              Pour toute question de facturation, écrivez-nous.
            </p>
          </Carte>
        )}
      </div>
    </div>
  );
}
