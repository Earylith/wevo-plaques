"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowClockwise,
  ArrowSquareOut,
  Coins,
  Gift,
  MagnifyingGlass,
  Receipt,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import {
  loadReferralControlCenter,
  type AdminReferralAdjustment,
  type AdminReferralControlCenter,
  type AdminReferralRelation,
  type AdminReferralReward,
} from "../parrainages";
import { Indicateur, Pastille, euros, jour } from "@/components/admin/pilotage";

type View = "relations" | "rewards" | "invoices";

const STATUS_LABELS: Record<string, string> = {
  CHECKOUT_PENDING: "Checkout ouvert",
  PAID: "Payé",
  REFUNDED: "Remboursé",
  PROVISIONAL: "Provisoire",
  PENDING: "En attente",
  AVAILABLE: "Disponible",
  RESERVED: "Réservé",
  APPLIED: "Appliqué",
  CONSUMED: "Consommé",
  CANCELLED: "Annulé",
  RELEASED: "Libéré",
};

const REWARD_LABELS: Record<string, string> = {
  WELCOME_CREDIT: "Crédit de 5 €",
  COMFORT_MONTH: "Mois Confort parrain",
  CHILD_WELCOME_MONTH: "Mois offert filleul",
  COMPENSATION: "Compensation",
};

function statusTone(status: string): "vert" | "ambre" | "rouge" | "bleu" | "gris" {
  if (["PAID", "AVAILABLE", "APPLIED", "CONSUMED"].includes(status)) return "vert";
  if (["PENDING", "CHECKOUT_PENDING", "RESERVED", "PROVISIONAL"].includes(status)) return "ambre";
  if (["REFUNDED", "CANCELLED"].includes(status)) return "rouge";
  if (status === "RELEASED") return "bleu";
  return "gris";
}

function Status({ value }: { value: string }) {
  return <Pastille ton={statusTone(value)}>{STATUS_LABELS[value] || value}</Pastille>;
}

function identity(name: string, email: string, uid: string | null) {
  return (
    <div className="min-w-[150px]">
      <p className="text-[12px] font-semibold text-[#2A2016]">{name || "Compte sans nom"}</p>
      <p className="text-[10px] text-[#6B5D4E]">{email || "E-mail indisponible"}</p>
      {uid && <p className="mt-0.5 max-w-[180px] truncate font-mono text-[9px] text-[#A8998A]" title={uid}>{uid}</p>}
    </div>
  );
}

function dateTime(value: number | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stripeUrl(kind: "sessions" | "subscriptions" | "payments" | "invoices", id: string) {
  return `https://dashboard.stripe.com/${kind}/${encodeURIComponent(id)}`;
}

function RelationsTable({ rows }: { rows: AdminReferralRelation[] }) {
  if (!rows.length) return <Empty icon={<UsersThree size={30} />} text="Aucune relation dans cette vue" />;
  return (
    <Table headers={["Parrain", "Filleul", "Offre", "État", "Dates", "Stripe"]}>
      {rows.map((row) => (
        <tr key={row.id} className="align-top hover:bg-gray-50/60">
          <td className="px-5 py-4">
            {identity(row.sponsorName, row.sponsorEmail, row.sponsorUid)}
            {row.sponsorCode && <p className="mt-1 text-[10px] font-bold text-[#C4714A]">Code {row.sponsorCode}</p>}
          </td>
          <td className="px-5 py-4">{identity(row.referredName, row.referredEmail, row.referredUid)}</td>
          <td className="px-5 py-4">
            <p className="text-[12px] font-semibold text-[#2A2016]">
              {row.initialOffer === "comfort" ? "Confort" : row.initialOffer === "essential" ? "Essentielle" : "—"}
            </p>
            <p className="mt-0.5 text-[10px] capitalize text-[#6B5D4E]">{row.rhythm || "—"}</p>
            {row.accommodationIds.length > 0 && <p className="mt-1 text-[10px] text-[#A8998A]">{row.accommodationIds.length} logement(s)</p>}
          </td>
          <td className="px-5 py-4">
            <Status value={row.status} />
            {row.comfortActive && <div className="mt-1.5"><Pastille ton="bleu">Confort actif</Pastille></div>}
          </td>
          <td className="px-5 py-4 text-[10px] leading-5 text-[#6B5D4E]">
            <p>Verrouillé : {jour(row.lockedAt)}</p>
            <p>Payé : {jour(row.paidAt)}</p>
            {row.refundedAt && <p className="text-red-600">Remboursé : {jour(row.refundedAt)}</p>}
          </td>
          <td className="px-5 py-4">
            <div className="flex flex-col items-start gap-1.5">
              {row.checkoutSessionId && <StripeLink href={stripeUrl("sessions", row.checkoutSessionId)} label="Checkout" />}
              {row.stripeSubscriptionId && <StripeLink href={stripeUrl("subscriptions", row.stripeSubscriptionId)} label="Abonnement" />}
              {row.stripePaymentIntentId && <StripeLink href={stripeUrl("payments", row.stripePaymentIntentId)} label="Paiement" />}
              {!row.checkoutSessionId && !row.stripeSubscriptionId && !row.stripePaymentIntentId && <span className="text-xs text-[#A8998A]">—</span>}
            </div>
          </td>
        </tr>
      ))}
    </Table>
  );
}

function RewardsTable({ rows, now }: { rows: AdminReferralReward[]; now: number }) {
  if (!rows.length) return <Empty icon={<Gift size={30} />} text="Aucune récompense dans cette vue" />;
  return (
    <Table headers={["Bénéficiaire", "Récompense", "État", "Montant", "Disponibilité", "Référence"]}>
      {rows.map((row) => {
        const effectiveStatus = row.status === "PENDING" && (row.availableAt || 0) <= now ? "AVAILABLE" : row.status;
        return (
          <tr key={row.id} className="align-top hover:bg-gray-50/60">
            <td className="px-5 py-4">{identity(row.sponsorName, row.sponsorEmail, row.sponsorUid)}</td>
            <td className="px-5 py-4">
              <p className="text-[12px] font-semibold text-[#2A2016]">{REWARD_LABELS[row.type] || row.type}</p>
              {row.referredName && <p className="mt-0.5 text-[10px] text-[#6B5D4E]">Filleul : {row.referredName}</p>}
              {row.cycleKey && <p className="mt-0.5 text-[10px] text-[#6B5D4E]">Cycle : {row.cycleKey}</p>}
            </td>
            <td className="px-5 py-4"><Status value={effectiveStatus} /></td>
            <td className="px-5 py-4 text-[12px] text-[#2A2016]">
              {row.amountCents !== null ? euros(row.amountCents / 100) : "1 mois"}
              {row.remainingCents !== null && <p className="mt-0.5 text-[10px] text-[#6B5D4E]">Reste {euros(row.remainingCents / 100)}</p>}
            </td>
            <td className="px-5 py-4 text-[10px] leading-5 text-[#6B5D4E]">
              {row.availableAt ? dateTime(row.availableAt) : "Immédiate"}
              {row.consumedAt && <p>Consommée : {jour(row.consumedAt)}</p>}
              {row.cancelledAt && <p className="text-red-600">Annulée : {jour(row.cancelledAt)}</p>}
            </td>
            <td className="px-5 py-4">
              <p className="max-w-[210px] truncate font-mono text-[9px] text-[#A8998A]" title={row.id}>{row.id}</p>
              {row.reservedInvoiceId && <StripeLink href={stripeUrl("invoices", row.reservedInvoiceId)} label="Facture réservée" />}
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

function AdjustmentsTable({ rows }: { rows: AdminReferralAdjustment[] }) {
  if (!rows.length) return <Empty icon={<Receipt size={30} />} text="Aucun ajustement de facture dans cette vue" />;
  return (
    <Table headers={["Client", "Facture Stripe", "État", "Remise", "Composition", "Dates"]}>
      {rows.map((row) => (
        <tr key={row.invoiceId} className="align-top hover:bg-gray-50/60">
          <td className="px-5 py-4">{identity(row.ownerName, row.ownerEmail, row.ownerUid)}</td>
          <td className="px-5 py-4">
            <StripeLink href={stripeUrl("invoices", row.invoiceId)} label={row.invoiceId} />
            {row.subscriptionId && <div className="mt-1"><StripeLink href={stripeUrl("subscriptions", row.subscriptionId)} label="Voir l’abonnement" /></div>}
          </td>
          <td className="px-5 py-4">
            <Status value={row.status} />
            {row.releaseReason && <p className="mt-1 text-[10px] text-[#6B5D4E]">{row.releaseReason}</p>}
          </td>
          <td className="px-5 py-4 text-[13px] font-semibold text-[#3F5836]">−{euros(row.amountCents / 100)}</td>
          <td className="px-5 py-4 text-[11px] text-[#6B5D4E]">
            <p>{row.componentCount} avantage(s)</p>
            <p className="capitalize">{row.rhythm || "—"}</p>
          </td>
          <td className="px-5 py-4 text-[10px] leading-5 text-[#6B5D4E]">
            <p>Créé : {dateTime(row.createdAt)}</p>
            {row.consumedAt && <p>Consommé : {dateTime(row.consumedAt)}</p>}
            {row.releasedAt && <p>Libéré : {dateTime(row.releasedAt)}</p>}
          </td>
        </tr>
      ))}
    </Table>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#EDD9A3]/40 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-[#EDD9A3]/40 bg-[#FBF5EC]">
            <tr>{headers.map((header) => <th key={header} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#6B5D4E]">{header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-[#EDD9A3]/20">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function StripeLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[190px] items-center gap-1 truncate text-[10px] font-semibold text-[#2B5F75] hover:text-[#C4714A]">
      <span className="truncate">{label}</span><ArrowSquareOut size={11} className="shrink-0" />
    </a>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white py-16 text-center text-[#C9B99F]">{<span className="mx-auto mb-3 block w-fit">{icon}</span>}<p className="text-sm font-semibold text-[#2A2016]">{text}</p></div>;
}

export default function ReferralAdminPage() {
  const [data, setData] = useState<AdminReferralControlCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("relations");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loadReferralControlCenter());
      setError(null);
    } catch (reason) {
      console.error(reason);
      setError(reason instanceof Error ? reason.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const normalized = query.trim().toLowerCase();
  const relations = useMemo(() => (data?.relations || []).filter((row) => !normalized || [row.sponsorName, row.sponsorEmail, row.referredName, row.referredEmail, row.sponsorCode, row.status, row.checkoutSessionId].some((value) => value?.toLowerCase().includes(normalized))), [data, normalized]);
  const rewards = useMemo(() => (data?.rewards || []).filter((row) => !normalized || [row.sponsorName, row.sponsorEmail, row.referredName, row.type, row.status, row.id].some((value) => value?.toLowerCase().includes(normalized))), [data, normalized]);
  const adjustments = useMemo(() => (data?.adjustments || []).filter((row) => !normalized || [row.ownerName, row.ownerEmail, row.invoiceId, row.subscriptionId, row.status].some((value) => value?.toLowerCase().includes(normalized))), [data, normalized]);

  if (loading && !data) return <div className="flex h-64 flex-col items-center justify-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C4714A]" /><p className="text-xs text-[#6B5D4E]">Lecture du programme de parrainage…</p></div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">Parrainages</h1>
          <p className="mt-1 text-sm text-[#6B5D4E]">Relations, récompenses et remises Stripe depuis un seul écran.</p>
          {data && <p className="mt-1 text-[10px] text-[#A8998A]">Actualisé le {dateTime(data.generatedAt)}</p>}
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#EDD9A3] bg-white px-4 py-2 text-xs font-semibold text-[#6B5D4E] hover:border-[#C4714A] hover:text-[#C4714A] disabled:opacity-50">
          <ArrowClockwise size={14} className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </div>

      {error && <div className="mb-6 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"><Warning size={16} weight="fill" className="mt-0.5 shrink-0" />{error}</div>}

      {data && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Indicateur intitule="Parrains" valeur={data.stats.sponsors} detail={`${data.stats.relations} relation(s)`} />
            <Indicateur intitule="Filleuls payés" valeur={data.stats.paid} detail={`${data.stats.checkoutPending} Checkout en cours`} ton="bien" />
            <Indicateur intitule="Confort actifs" valeur={data.stats.activeComfort} detail={`${data.stats.comfortRightsConsumed}/${data.stats.comfortRights} droits consommés`} ton="bien" />
            <Indicateur intitule="Crédits disponibles" valeur={euros(data.stats.welcomeAvailableCents / 100)} detail={`${euros(data.stats.welcomePendingCents / 100)} en attente`} />
            <Indicateur intitule="Crédits consommés" valeur={euros(data.stats.welcomeConsumedCents / 100)} detail="Crédits d’acquisition" />
            <Indicateur intitule="Remises factures" valeur={euros(data.stats.invoiceDiscountsCents / 100)} detail={`${data.stats.refunded} remboursement(s)`} ton={data.stats.refunded ? "alerte" : "neutre"} />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Tab active={view === "relations"} onClick={() => setView("relations")} icon={<UsersThree size={14} />} label="Relations" count={data.relations.length} />
              <Tab active={view === "rewards"} onClick={() => setView("rewards")} icon={<Coins size={14} />} label="Récompenses" count={data.rewards.length} />
              <Tab active={view === "invoices"} onClick={() => setView("invoices")} icon={<Receipt size={14} />} label="Factures" count={data.adjustments.length} />
            </div>
            <div className="relative">
              <MagnifyingGlass size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A8998A]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, e-mail, code, référence…" className="w-72 rounded-full border border-[#EDD9A3] bg-white py-2 pl-8 pr-3 text-[12px] outline-none focus:border-[#C4714A]" />
            </div>
          </div>

          {view === "relations" && <RelationsTable rows={relations} />}
          {view === "rewards" && <RewardsTable rows={rewards} now={data.generatedAt} />}
          {view === "invoices" && <AdjustmentsTable rows={adjustments} />}
        </>
      )}
    </div>
  );
}

function Tab({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-semibold ${active ? "border-[#C4714A] bg-[#C4714A] text-white" : "border-[#EDD9A3] bg-white text-[#6B5D4E] hover:border-[#C4714A]/50"}`}>{icon}{label}<span className={active ? "text-white/70" : "text-[#A8998A]"}>{count}</span></button>;
}
