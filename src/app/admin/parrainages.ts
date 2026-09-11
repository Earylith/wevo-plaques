"use server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/server/admin-auth";
import type { Accommodation } from "@/lib/types/accommodation";

const REFERRALS = "referrals";
const PROFILES = "referral_profiles";
const LEDGER = "referral_reward_ledger";
const ADJUSTMENTS = "referral_invoice_adjustments";
const ACCOMMODATIONS = "accommodations";

export interface AdminReferralRelation {
  id: string;
  sponsorUid: string;
  sponsorName: string;
  sponsorEmail: string;
  sponsorCode: string | null;
  referredUid: string;
  referredName: string;
  referredEmail: string;
  status: string;
  initialOffer: "essential" | "comfort" | null;
  rhythm: "mensuel" | "annuel" | null;
  comfortActive: boolean;
  accommodationIds: string[];
  checkoutSessionId: string | null;
  stripeSubscriptionId: string | null;
  stripePaymentIntentId: string | null;
  lockedAt: number | null;
  paidAt: number | null;
  refundedAt: number | null;
}

export interface AdminReferralReward {
  id: string;
  sponsorUid: string;
  sponsorName: string;
  sponsorEmail: string;
  referredUid: string | null;
  referredName: string;
  type: string;
  status: string;
  amountCents: number | null;
  remainingCents: number | null;
  availableAt: number | null;
  cycleKey: string | null;
  reservedInvoiceId: string | null;
  consumedAt: number | null;
  cancelledAt: number | null;
  createdAt: number | null;
}

export interface AdminReferralAdjustment {
  invoiceId: string;
  subscriptionId: string | null;
  ownerUid: string | null;
  ownerName: string;
  ownerEmail: string;
  referralId: string | null;
  rhythm: "mensuel" | "annuel" | null;
  status: string;
  amountCents: number;
  componentCount: number;
  stripeInvoiceItemId: string | null;
  releaseReason: string | null;
  createdAt: number | null;
  consumedAt: number | null;
  releasedAt: number | null;
}

export interface AdminReferralControlCenter {
  generatedAt: number;
  stats: {
    sponsors: number;
    relations: number;
    checkoutPending: number;
    paid: number;
    refunded: number;
    activeComfort: number;
    welcomePendingCents: number;
    welcomeAvailableCents: number;
    welcomeConsumedCents: number;
    comfortRights: number;
    comfortRightsConsumed: number;
    childMonthsConsumed: number;
    invoiceDiscountsCents: number;
  };
  relations: AdminReferralRelation[];
  rewards: AdminReferralReward[];
  adjustments: AdminReferralAdjustment[];
}

type Identity = { name: string; email: string };

export async function loadReferralControlCenter(): Promise<AdminReferralControlCenter> {
  await requireAdminSession();

  const [referralsSnap, profilesSnap, rewardsSnap, adjustmentsSnap, accommodationsSnap, users] = await Promise.all([
    adminDb.collection(REFERRALS).get(),
    adminDb.collection(PROFILES).get(),
    adminDb.collection(LEDGER).get(),
    adminDb.collection(ADJUSTMENTS).get(),
    adminDb.collection(ACCOMMODATIONS).get(),
    adminAuth.listUsers(1000),
  ]);

  const identities = new Map<string, Identity>();
  users.users.forEach((user) => identities.set(user.uid, {
    name: user.displayName || "",
    email: user.email || "",
  }));
  accommodationsSnap.docs.forEach((doc) => {
    const accommodation = doc.data() as Accommodation;
    if (!accommodation.ownerUid) return;
    const known = identities.get(accommodation.ownerUid);
    identities.set(accommodation.ownerUid, {
      name: known?.name || accommodation.owner?.name || "",
      email: known?.email || accommodation.owner?.email || "",
    });
  });

  const identity = (uid?: string | null): Identity =>
    (uid && identities.get(uid)) || { name: "", email: "" };
  const codes = new Map<string, string>();
  profilesSnap.docs.forEach((doc) => {
    const code = doc.data()?.code;
    if (typeof code === "string") codes.set(doc.id, code);
  });

  const relations: AdminReferralRelation[] = referralsSnap.docs.map((doc) => {
    const data = doc.data();
    const sponsorUid = typeof data.sponsorUid === "string" ? data.sponsorUid : "";
    const referredUid = typeof data.referredUid === "string" ? data.referredUid : doc.id;
    const sponsor = identity(sponsorUid);
    const referred = identity(referredUid);
    return {
      id: doc.id,
      sponsorUid,
      sponsorName: sponsor.name,
      sponsorEmail: sponsor.email,
      sponsorCode: codes.get(sponsorUid) || null,
      referredUid,
      referredName: referred.name,
      referredEmail: referred.email,
      status: typeof data.status === "string" ? data.status : "UNKNOWN",
      initialOffer: data.initialOffer === "essential" || data.initialOffer === "comfort" ? data.initialOffer : null,
      rhythm: data.rhythm === "mensuel" || data.rhythm === "annuel" ? data.rhythm : null,
      comfortActive: data.comfortActive === true,
      accommodationIds: Array.isArray(data.accommodationIds) ? data.accommodationIds.filter((id): id is string => typeof id === "string") : [],
      checkoutSessionId: typeof data.checkoutSessionId === "string" ? data.checkoutSessionId : null,
      stripeSubscriptionId: typeof data.stripeSubscriptionId === "string" ? data.stripeSubscriptionId : null,
      stripePaymentIntentId: typeof data.stripePaymentIntentId === "string" ? data.stripePaymentIntentId : null,
      lockedAt: typeof data.lockedAt === "number" ? data.lockedAt : null,
      paidAt: typeof data.paidAt === "number" ? data.paidAt : null,
      refundedAt: typeof data.refundedAt === "number" ? data.refundedAt : null,
    };
  }).sort((a, b) => (b.paidAt || b.lockedAt || 0) - (a.paidAt || a.lockedAt || 0));

  const rewards: AdminReferralReward[] = rewardsSnap.docs.map((doc) => {
    const data = doc.data();
    const sponsorUid = typeof data.sponsorUid === "string" ? data.sponsorUid : "";
    const referredUid = typeof data.referredUid === "string" ? data.referredUid : null;
    const sponsor = identity(sponsorUid);
    return {
      id: doc.id,
      sponsorUid,
      sponsorName: sponsor.name,
      sponsorEmail: sponsor.email,
      referredUid,
      referredName: identity(referredUid).name,
      type: typeof data.type === "string" ? data.type : "UNKNOWN",
      status: typeof data.status === "string" ? data.status : "UNKNOWN",
      amountCents: typeof data.amountCents === "number" ? data.amountCents : null,
      remainingCents: typeof data.remainingCents === "number" ? data.remainingCents : null,
      availableAt: typeof data.availableAt === "number" ? data.availableAt : null,
      cycleKey: typeof data.cycleKey === "string" ? data.cycleKey : null,
      reservedInvoiceId: typeof data.reservedInvoiceId === "string" ? data.reservedInvoiceId : null,
      consumedAt: typeof data.consumedAt === "number" ? data.consumedAt : null,
      cancelledAt: typeof data.cancelledAt === "number" ? data.cancelledAt : null,
      createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
    };
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const adjustments: AdminReferralAdjustment[] = adjustmentsSnap.docs.map((doc) => {
    const data = doc.data();
    const ownerUid = typeof data.ownerUid === "string" ? data.ownerUid : null;
    const owner = identity(ownerUid);
    return {
      invoiceId: doc.id,
      subscriptionId: typeof data.subscriptionId === "string" ? data.subscriptionId : null,
      ownerUid,
      ownerName: owner.name,
      ownerEmail: owner.email,
      referralId: typeof data.referralId === "string" ? data.referralId : null,
      rhythm: data.rhythm === "mensuel" || data.rhythm === "annuel" ? data.rhythm : null,
      status: typeof data.status === "string" ? data.status : "UNKNOWN",
      amountCents: typeof data.amountCents === "number" ? data.amountCents : 0,
      componentCount: Array.isArray(data.components) ? data.components.length : 0,
      stripeInvoiceItemId: typeof data.stripeInvoiceItemId === "string" ? data.stripeInvoiceItemId : null,
      releaseReason: typeof data.releaseReason === "string" ? data.releaseReason : null,
      createdAt: typeof data.createdAt === "number" ? data.createdAt : null,
      consumedAt: typeof data.consumedAt === "number" ? data.consumedAt : null,
      releasedAt: typeof data.releasedAt === "number" ? data.releasedAt : null,
    };
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const welcomeRewards = rewards.filter((reward) => reward.type === "WELCOME_CREDIT");
  const now = Date.now();
  const welcomePendingCents = welcomeRewards
    .filter((reward) => reward.status === "PENDING" && (reward.availableAt || 0) > now)
    .reduce((sum, reward) => sum + (reward.remainingCents || 0), 0);
  const welcomeAvailableCents = welcomeRewards
    .filter((reward) => reward.status === "AVAILABLE" || (reward.status === "PENDING" && (reward.availableAt || 0) <= now))
    .reduce((sum, reward) => sum + (reward.remainingCents || 0), 0);
  const welcomeConsumedCents = welcomeRewards.reduce(
    (sum, reward) => sum + Math.max(0, (reward.amountCents || 0) - (reward.remainingCents || 0)),
    0
  );
  const comfortRewards = rewards.filter((reward) => reward.type === "COMFORT_MONTH");

  return {
    generatedAt: now,
    stats: {
      sponsors: new Set(relations.map((relation) => relation.sponsorUid).filter(Boolean)).size,
      relations: relations.length,
      checkoutPending: relations.filter((relation) => relation.status === "CHECKOUT_PENDING").length,
      paid: relations.filter((relation) => relation.status === "PAID").length,
      refunded: relations.filter((relation) => relation.status === "REFUNDED").length,
      activeComfort: relations.filter((relation) => relation.comfortActive).length,
      welcomePendingCents,
      welcomeAvailableCents,
      welcomeConsumedCents,
      comfortRights: comfortRewards.length,
      comfortRightsConsumed: comfortRewards.filter((reward) => reward.status === "CONSUMED").length,
      childMonthsConsumed: rewards.filter((reward) => reward.type === "CHILD_WELCOME_MONTH" && reward.status === "CONSUMED").length,
      invoiceDiscountsCents: adjustments
        .filter((adjustment) => adjustment.status === "APPLIED" || adjustment.status === "CONSUMED")
        .reduce((sum, adjustment) => sum + adjustment.amountCents, 0),
    },
    relations,
    rewards,
    adjustments,
  };
}
