"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowClockwise, ArrowSquareOut, CaretDown, EnvelopeSimple,
  MagnifyingGlass, Receipt, ShoppingCart, Warning,
} from "@phosphor-icons/react";
import {
  loadCartControlCenter,
  sendCartReminder,
  type AdminCart,
  type AdminCartCenter,
  type AdminCartCheckout,
  type AdminCartStatus,
} from "../paniers";
import { Filtre, Indicateur, Pastille, depuis, euros, jour } from "@/components/admin/pilotage";

type Filter = "current" | "abandoned" | "checkout" | "completed" | "all";

const STATUS: Record<AdminCartStatus, { label: string; tone: "vert" | "ambre" | "rouge" | "bleu" | "gris" }> = {
  ACTIVE: { label: "En cours", tone: "bleu" },
  ABANDONED: { label: "À relancer", tone: "rouge" },
  CHECKOUT_OPEN: { label: "Paiement ouvert", tone: "ambre" },
  COMPLETED: { label: "Commandé", tone: "vert" },
};

function CartCard({ cart }: { cart: AdminCart }) {
  const status = STATUS[cart.status];
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; detail: string } | null>(null);
  const reminderRecent = !cart.canRemind;

  const sendReminder = async () => {
    if (!window.confirm(`Envoyer maintenant la relance « Panier abandonné » à ${cart.ownerEmail} ?`)) return;
    setSending(true);
    setSendResult(null);
    try { setSendResult(await sendCartReminder(cart.ownerUid)); }
    catch (reason) { setSendResult({ ok: false, detail: reason instanceof Error ? reason.message : "Envoi impossible." }); }
    finally { setSending(false); }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-[#EDD9A3]/45 bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.8fr_0.8fr_auto] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-[#2A2016]">{cart.ownerName || "Compte sans nom"}</h2>
            <Pastille ton={status.tone}>{status.label}</Pastille>
          </div>
          <p className="mt-1 text-xs text-[#6B5D4E]">{cart.ownerEmail || "E-mail indisponible"}</p>
          {cart.ownerPhone && <p className="mt-0.5 text-[10px] text-[#A8998A]">{cart.ownerPhone}</p>}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#A8998A]">Contenu actuel</p>
          <p className="mt-1 text-sm font-semibold text-[#2A2016]">{cart.itemCount} livret{cart.itemCount > 1 ? "s" : ""}</p>
          <p className="text-[10px] text-[#6B5D4E]">{cart.comfortCount} Confort · {cart.essentialCount} Essentielle</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#A8998A]">Valeur estimée</p>
          <p className="mt-1 text-lg font-bold text-[#3F5836]">{euros(cart.estimatedTotalCents / 100)}</p>
          {cart.recurringCents > 0 && <p className="text-[10px] text-[#6B5D4E]">dont {euros(cart.recurringCents / 100)} / {cart.rhythm === "annuel" ? "an" : "mois"}</p>}
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {cart.ownerEmail && cart.itemCount > 0 && <button type="button" onClick={() => void sendReminder()} disabled={sending || reminderRecent || sendResult?.ok === true} title={reminderRecent ? "Une relance a déjà été envoyée dans les dernières 24 heures" : undefined} className="inline-flex items-center gap-1.5 rounded-full bg-[#2A2016] px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-[#C4714A] disabled:cursor-not-allowed disabled:opacity-45"><EnvelopeSimple size={14} /> {sending ? "Envoi…" : reminderRecent || sendResult?.ok ? "Relance envoyée" : "Envoyer la relance"}</button>}
          {cart.lastCheckoutSessionId && <a href={`https://dashboard.stripe.com/checkout/sessions/${encodeURIComponent(cart.lastCheckoutSessionId)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#EDD9A3] px-3.5 py-2 text-[11px] font-semibold text-[#6B5D4E] hover:border-[#C4714A]"><ArrowSquareOut size={13} /> Stripe</a>}
        </div>
      </div>
      {sendResult && <p className={`border-t px-5 py-3 text-[11px] font-semibold ${sendResult.ok ? "border-[#5A7A4E]/20 bg-[#EBF0E6] text-[#3F5836]" : "border-red-200 bg-red-50 text-red-700"}`}>{sendResult.detail}</p>}

      <details className="group border-t border-[#EDD9A3]/35">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-[#FBF5EC]/70 px-5 py-3 text-[11px] font-semibold text-[#6B5D4E]">
          <span>Voir le contenu et l’activité</span><CaretDown size={14} className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-6 p-5 xl:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            {cart.items.length === 0 ? <p className="rounded-2xl border border-dashed border-[#EDD9A3] p-5 text-xs text-[#A8998A]">Les éléments ont été commandés et ne sont plus des brouillons.</p> : cart.items.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-2xl border border-[#EDD9A3]/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-[#2A2016]">{item.name}</p><Pastille ton={item.offerType === "comfort" ? "bleu" : "gris"}>{item.offerType === "comfort" ? "Confort" : "Essentielle"}</Pastille></div>
                  <p className="mt-1 text-[10px] text-[#6B5D4E]">{item.city || "Ville non renseignée"} · Plaque {item.plaqueWood}{item.plaqueTagline ? ` · « ${item.plaqueTagline} »` : ""}</p>
                  <p className="mt-1 text-[9px] text-[#A8998A]">Modifié {depuis(item.updatedAt || item.createdAt)}</p>
                </div>
                <Link href={`/admin/hebergements/${item.id}`} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2B5F75] hover:text-[#C4714A]">Ouvrir le livret <ArrowSquareOut size={11} /></Link>
              </div>
            ))}
          </div>
          <dl className="grid content-start gap-3 text-[11px] text-[#6B5D4E]">
            <Activity label="Première détection" value={jour(cart.firstSeenAt)} />
            <Activity label="Dernière activité" value={`${jour(cart.lastActivityAt)} · ${depuis(cart.lastActivityAt)}`} />
            <Activity label="Dernière vue panier" value={cart.lastViewedAt ? `${jour(cart.lastViewedAt)} · ${cart.viewCount} vue(s)` : "Jamais mesurée"} />
            <Activity label="Dernier Checkout" value={cart.lastCheckoutAt ? `${jour(cart.lastCheckoutAt)} · ${cart.checkoutCount} tentative(s)` : "Jamais ouvert"} />
            <Activity label="Dernière relance" value={cart.lastReminderAt ? `${jour(cart.lastReminderAt)} · ${cart.reminderCount} envoi(s)` : "Aucune"} />
            <Activity label="UID" value={cart.ownerUid} mono />
          </dl>
        </div>
      </details>
    </article>
  );
}

function Activity({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="rounded-xl bg-[#FBF5EC] px-3 py-2"><dt className="text-[9px] font-bold uppercase tracking-wider text-[#A8998A]">{label}</dt><dd className={`mt-0.5 break-all ${mono ? "font-mono text-[9px]" : "font-medium text-[#2A2016]"}`}>{value}</dd></div>;
}

function CheckoutTable({ rows }: { rows: AdminCartCheckout[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#EDD9A3]/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-[#EDD9A3]/40 bg-[#FBF5EC]"><tr>{["Client", "Contenu figé", "Montant", "État", "Date", "Stripe"].map((header) => <th key={header} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#6B5D4E]">{header}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#EDD9A3]/25">
            {rows.map((row) => <tr key={row.sessionId} className="align-top hover:bg-gray-50/60">
              <td className="px-5 py-4"><p className="text-xs font-semibold text-[#2A2016]">{row.ownerName || "Compte sans nom"}</p><p className="text-[10px] text-[#6B5D4E]">{row.ownerEmail || "—"}</p></td>
              <td className="px-5 py-4"><p className="text-[11px] font-semibold text-[#2A2016]">{row.items.length} livret(s)</p>{row.items.map((item) => <p key={item.id} className="mt-0.5 text-[10px] text-[#6B5D4E]">{item.name} · {item.offerType === "comfort" ? "Confort" : "Essentielle"}</p>)}</td>
              <td className="px-5 py-4"><p className="text-xs font-bold text-[#2A2016]">{euros(row.amountTotalCents / 100)}</p>{row.discountCents > 0 && <p className="text-[10px] text-[#3F5836]">−{euros(row.discountCents / 100)} de remise</p>}</td>
              <td className="px-5 py-4"><Pastille ton={row.status === "COMPLETED" ? "vert" : row.status === "EXPIRED" ? "gris" : "ambre"}>{row.status === "COMPLETED" ? "Payé" : row.status === "EXPIRED" ? "Expiré" : "Ouvert"}</Pastille><p className="mt-1 text-[9px] text-[#A8998A]">{row.paymentStatus}</p></td>
              <td className="px-5 py-4 text-[10px] text-[#6B5D4E]">{jour(row.createdAt)}<p>{depuis(row.createdAt)}</p></td>
              <td className="px-5 py-4"><a href={`https://dashboard.stripe.com/checkout/sessions/${encodeURIComponent(row.sessionId)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#2B5F75] hover:text-[#C4714A]">Voir la session <ArrowSquareOut size={11} /></a></td>
            </tr>)}
            {rows.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-[#A8998A]">Aucune tentative de paiement enregistrée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CartsAdminPage() {
  const [data, setData] = useState<AdminCartCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("current");
  const [query, setQuery] = useState("");
  const [showCheckouts, setShowCheckouts] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await loadCartControlCenter()); setError(null); }
    catch (reason) { console.error(reason); setError(reason instanceof Error ? reason.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const counts = useMemo(() => ({
    current: data?.carts.filter((cart) => cart.itemCount > 0).length || 0,
    abandoned: data?.carts.filter((cart) => cart.status === "ABANDONED").length || 0,
    checkout: data?.carts.filter((cart) => cart.status === "CHECKOUT_OPEN").length || 0,
    completed: data?.carts.filter((cart) => cart.status === "COMPLETED").length || 0,
    all: data?.carts.length || 0,
  }), [data]);

  const carts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.carts || []).filter((cart) => {
      if (filter === "current" && cart.itemCount === 0) return false;
      if (filter === "abandoned" && cart.status !== "ABANDONED") return false;
      if (filter === "checkout" && cart.status !== "CHECKOUT_OPEN") return false;
      if (filter === "completed" && cart.status !== "COMPLETED") return false;
      return !normalized || [cart.ownerName, cart.ownerEmail, cart.ownerPhone, ...cart.items.flatMap((item) => [item.name, item.city, item.slug])].some((value) => value.toLowerCase().includes(normalized));
    });
  }, [data, filter, query]);

  if (loading && !data) return <div className="flex h-64 flex-col items-center justify-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C4714A]" /><p className="text-xs text-[#6B5D4E]">Lecture des paniers…</p></div>;

  return <div>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">Paniers</h1><p className="mt-1 text-sm text-[#6B5D4E]">Contenu, intention d’achat et tentatives de paiement.</p>{data && <p className="mt-1 text-[10px] text-[#A8998A]">Actualisé le {new Date(data.generatedAt).toLocaleString("fr-FR")}</p>}</div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#EDD9A3] bg-white px-4 py-2 text-xs font-semibold text-[#6B5D4E] hover:border-[#C4714A] hover:text-[#C4714A] disabled:opacity-50"><ArrowClockwise size={14} className={loading ? "animate-spin" : ""} /> Actualiser</button>
    </div>

    {error && <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"><Warning size={16} weight="fill" className="mt-0.5 shrink-0" />{error}</div>}
    {data && <>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Indicateur intitule="Paniers actuels" valeur={data.stats.current} detail={`${data.stats.currentItems} livret(s)`} />
        <Indicateur intitule="Valeur potentielle" valeur={euros(data.stats.currentValueCents / 100)} detail="Avant remises éventuelles" ton="bien" />
        <Indicateur intitule="À relancer" valeur={data.stats.abandoned} detail="Inactifs depuis 3 jours" ton={data.stats.abandoned ? "alerte" : "bien"} />
        <Indicateur intitule="Paiement ouvert" valeur={data.stats.checkoutOpen} detail="Checkout créé depuis moins de 24 h" />
        <Indicateur intitule="Commandés" valeur={data.stats.completed} detail="Depuis l’activation du suivi" ton="bien" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowCheckouts(false)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${!showCheckouts ? "border-[#2A2016] bg-[#2A2016] text-white" : "border-[#EDD9A3] bg-white text-[#6B5D4E]"}`}><ShoppingCart size={14} /> Paniers</button>
          <button type="button" onClick={() => setShowCheckouts(true)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${showCheckouts ? "border-[#2A2016] bg-[#2A2016] text-white" : "border-[#EDD9A3] bg-white text-[#6B5D4E]"}`}><Receipt size={14} /> Tentatives Stripe <span className="opacity-60">{data.checkouts.length}</span></button>
        </div>
        <div className="relative"><MagnifyingGlass size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8998A]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Client, e-mail, logement…" className="w-72 rounded-full border border-[#EDD9A3] bg-white py-2 pl-8 pr-3 text-[12px] outline-none focus:border-[#C4714A]" /></div>
      </div>

      {!showCheckouts ? <>
        <div className="mb-4 flex flex-wrap gap-2"><Filtre libelle="Actuels" nombre={counts.current} actif={filter === "current"} onClick={() => setFilter("current")} /><Filtre libelle="À relancer" nombre={counts.abandoned} actif={filter === "abandoned"} onClick={() => setFilter("abandoned")} /><Filtre libelle="Paiement ouvert" nombre={counts.checkout} actif={filter === "checkout"} onClick={() => setFilter("checkout")} /><Filtre libelle="Commandés" nombre={counts.completed} actif={filter === "completed"} onClick={() => setFilter("completed")} /><Filtre libelle="Tous" nombre={counts.all} actif={filter === "all"} onClick={() => setFilter("all")} /></div>
        <div className="space-y-3">{carts.map((cart) => <CartCard key={cart.ownerUid} cart={cart} />)}{carts.length === 0 && <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white py-16 text-center"><ShoppingCart size={30} className="mx-auto text-[#C9B99F]" /><p className="mt-3 text-sm font-semibold text-[#2A2016]">Aucun panier dans cette vue</p></div>}</div>
      </> : <CheckoutTable rows={data.checkouts.filter((row) => !query.trim() || [row.ownerName, row.ownerEmail, row.sessionId, ...row.items.map((item) => item.name)].some((value) => value.toLowerCase().includes(query.trim().toLowerCase())))} />}
    </>}
  </div>;
}
