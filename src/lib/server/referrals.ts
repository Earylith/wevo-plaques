import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type Stripe from "stripe";
import { FieldValue, type DocumentSnapshot } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {
  REFERRAL_COOKIE,
  REFERRAL_MAX_WELCOME_CREDITS,
  REFERRAL_PENDING_DAYS,
  REFERRAL_WELCOME_CREDIT_CENTS,
  REFERRAL_WELCOME_MONTHS,
  ReferralBillingRhythm,
  ReferralInitialOffer,
  annualRewardCents,
  normalizeReferralCode,
  referralCycle,
  usableAnnualRights,
} from "@/lib/referral";
import { stripe } from "@/lib/stripe";

const PROFILES = "referral_profiles";
const CODES = "referral_codes";
const REFERRALS = "referrals";
const LEDGER = "referral_reward_ledger";
const ADJUSTMENTS = "referral_invoice_adjustments";
const COUPON_CONSUMPTIONS = "referral_coupon_consumptions";
const SLOTS = "referral_welcome_slots";
const ACCOMMODATIONS = "accommodations";

type RewardStatus = "PROVISIONAL" | "PENDING" | "AVAILABLE" | "RESERVED" | "CONSUMED" | "CANCELLED";

interface RewardRecord {
  sponsorUid: string;
  referredUid?: string;
  referralId?: string;
  type: "WELCOME_CREDIT" | "COMFORT_MONTH" | "CHILD_WELCOME_MONTH" | "COMPENSATION";
  status: RewardStatus;
  amountCents?: number;
  remainingCents?: number;
  availableAt?: number;
  cycleKey?: string;
  reservedInvoiceId?: string;
  createdAt: number;
  updatedAt: number;
}

interface AdjustmentComponent {
  rewardId: string;
  kind: RewardRecord["type"];
  amountCents: number;
}

export interface ReferralCheckoutContext {
  referralId: string;
  sponsorUid: string;
  attemptId: string;
  offer: ReferralInitialOffer;
  rhythm: ReferralBillingRhythm;
}

export interface ReferralDashboard {
  eligible: boolean;
  code: string | null;
  referralCount: number;
  activeComfortCount: number;
  welcomeCreditPendingCents: number;
  welcomeCreditAvailableCents: number;
  comfortRightsCurrentCycle: number;
  comfortRightsUsedCurrentCycle: number;
}

function cookieSecret(): string {
  const value = process.env.REFERRAL_COOKIE_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!value) throw new Error("REFERRAL_COOKIE_SECRET ou STRIPE_WEBHOOK_SECRET doit être configuré.");
  return value;
}

function sign(value: string): string {
  return createHmac("sha256", cookieSecret()).update(value).digest("base64url");
}

export function createReferralCookieValue(code: string): string {
  const normalized = normalizeReferralCode(code);
  return `${normalized}.${sign(normalized)}`;
}

export function readReferralCookieValue(value: string | undefined): string | null {
  if (!value) return null;
  const [rawCode, rawSignature, extra] = value.split(".");
  if (!rawCode || !rawSignature || extra) return null;
  const code = normalizeReferralCode(rawCode);
  if (code !== rawCode) return null;
  const expected = Buffer.from(sign(code));
  const actual = Buffer.from(rawSignature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return code;
}

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export async function referralCodeExists(code: string): Promise<boolean> {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return false;
  const codeDoc = await adminDb.collection(CODES).doc(normalized).get();
  const sponsorUid = codeDoc.data()?.sponsorUid;
  return typeof sponsorUid === "string" && await accountHasPaidOrder(sponsorUid);
}

export async function ensureReferralCode(uid: string): Promise<string> {
  const profileRef = adminDb.collection(PROFILES).doc(uid);
  const existing = await profileRef.get();
  if (existing.exists && typeof existing.data()?.code === "string") return existing.data()!.code;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateCode();
    const codeRef = adminDb.collection(CODES).doc(code);
    const created = await adminDb.runTransaction(async (tx) => {
      const [profile, codeDoc] = await Promise.all([tx.get(profileRef), tx.get(codeRef)]);
      if (profile.exists && typeof profile.data()?.code === "string") return profile.data()!.code as string;
      if (codeDoc.exists) return null;
      const now = Date.now();
      tx.create(codeRef, { code, sponsorUid: uid, createdAt: now });
      tx.set(profileRef, { code, createdAt: now, updatedAt: now }, { merge: true });
      return code;
    });
    if (created) return created;
  }
  throw new Error("Impossible de générer un code de parrainage unique.");
}

async function accountHasPaidOrder(uid: string): Promise<boolean> {
  const owned = await adminDb.collection(ACCOMMODATIONS).where("ownerUid", "==", uid).get();
  return owned.docs.some((doc) => {
    const data = doc.data();
    return data.isActive === true || typeof data.paidAt === "number";
  });
}

export async function prepareReferralCheckout(params: {
  referredUid: string;
  cookieValue?: string;
  offer: ReferralInitialOffer;
  rhythm: ReferralBillingRhythm;
  accommodationIds: string[];
}): Promise<ReferralCheckoutContext | null> {
  const code = readReferralCookieValue(params.cookieValue);
  if (!code || await accountHasPaidOrder(params.referredUid)) return null;

  const codeDoc = await adminDb.collection(CODES).doc(code).get();
  if (!codeDoc.exists) return null;
  const sponsorUid = codeDoc.data()?.sponsorUid;
  if (
    typeof sponsorUid !== "string" ||
    sponsorUid === params.referredUid ||
    !(await accountHasPaidOrder(sponsorUid))
  ) return null;

  const referralRef = adminDb.collection(REFERRALS).doc(params.referredUid);
  const attemptId = randomBytes(12).toString("hex");
  const accepted = await adminDb.runTransaction(async (tx) => {
    const current = await tx.get(referralRef);
    if (current.exists) {
      const data = current.data()!;
      if (data.sponsorUid !== sponsorUid || data.status === "PAID" || data.status === "REFUNDED") return false;
    }
    const childRefs = params.offer === "comfort"
      ? Array.from({ length: REFERRAL_WELCOME_MONTHS }, (_, index) =>
          adminDb.collection(LEDGER).doc(`child_${params.referredUid}_${index + 1}`))
      : [];
    const childDocs = await Promise.all(childRefs.map((ref) => tx.get(ref)));
    const now = Date.now();
    tx.set(referralRef, {
      referredUid: params.referredUid,
      sponsorUid,
      code,
      status: "CHECKOUT_PENDING",
      initialOffer: params.offer,
      rhythm: params.rhythm,
      accommodationIds: params.accommodationIds,
      checkoutAttemptId: attemptId,
      lockedAt: current.data()?.lockedAt || now,
      updatedAt: now,
    }, { merge: true });

    if (params.offer === "comfort") {
      childRefs.forEach((rewardRef, index) => {
        if (childDocs[index].exists) return;
        tx.create(rewardRef, {
          sponsorUid: params.referredUid,
          referredUid: params.referredUid,
          referralId: params.referredUid,
          type: "CHILD_WELCOME_MONTH",
          status: "AVAILABLE",
          checkoutAttemptId: attemptId,
          sequence: index + 1,
          createdAt: now,
          updatedAt: now,
        });
      });
    }
    return true;
  });

  return accepted ? {
    referralId: params.referredUid,
    sponsorUid,
    attemptId,
    offer: params.offer,
    rhythm: params.rhythm,
  } : null;
}

export async function attachCheckoutSession(context: ReferralCheckoutContext, sessionId: string): Promise<void> {
  await adminDb.collection(REFERRALS).doc(context.referralId).set({
    checkoutSessionId: sessionId,
    updatedAt: Date.now(),
  }, { merge: true });
}

export function referralMetadata(context: ReferralCheckoutContext | null, ownerUid: string) {
  return {
    ownerUid,
    referralId: context?.referralId || "",
    referralSponsorUid: context?.sponsorUid || "",
    referralAttemptId: context?.attemptId || "",
    referralOffer: context?.offer || "",
    referralRhythm: context?.rhythm || "",
  };
}

export async function essentialReferralCouponId(): Promise<string> {
  const id = "guidz-referral-essential-500-eur-v1";
  try {
    await stripe().coupons.retrieve(id);
    return id;
  } catch (error) {
    if ((error as { code?: string }).code !== "resource_missing") throw error;
  }
  try {
    await stripe().coupons.create({
      id,
      amount_off: REFERRAL_WELCOME_CREDIT_CENTS,
      currency: "eur",
      duration: "once",
      name: "Avantage filleul Guidz - 5 EUR",
      metadata: { purpose: "referral_essential_welcome", version: "1.1" },
    });
  } catch (error) {
    if ((error as { code?: string }).code !== "resource_already_exists") throw error;
  }
  return id;
}

/**
 * Coupon interne visible dès le Checkout du filleul Confort.
 *
 * Le montant fixe ne réduit qu'une unité, même lorsque plusieurs logements
 * utilisent le même produit récurrent. `applies_to` empêche aussi Stripe de
 * déduire la remise du prix ponctuel de la plaque.
 */
export async function comfortReferralCouponId(
  rhythm: ReferralBillingRhythm,
  recurringPriceId: string
): Promise<string> {
  const recurringPrice = await stripe().prices.retrieve(recurringPriceId);
  const productId = typeof recurringPrice.product === "string"
    ? recurringPrice.product
    : recurringPrice.product.id;
  const unitCents = recurringPrice.unit_amount;
  if (!unitCents || recurringPrice.currency.toLowerCase() !== "eur") {
    throw new Error("Le tarif Confort doit avoir un montant fixe en euros pour appliquer le parrainage.");
  }

  const amountOff = rhythm === "annuel"
    ? annualRewardCents(unitCents, REFERRAL_WELCOME_MONTHS)
    : unitCents;
  const fingerprint = createHash("sha256")
    .update(`${recurringPrice.id}:${productId}:${amountOff}:${rhythm}`)
    .digest("hex")
    .slice(0, 12);
  const id = `guidz-referral-comfort-${rhythm}-${fingerprint}`;

  try {
    await stripe().coupons.retrieve(id);
    return id;
  } catch (error) {
    if ((error as { code?: string }).code !== "resource_missing") throw error;
  }

  try {
    await stripe().coupons.create({
      id,
      amount_off: amountOff,
      currency: "eur",
      duration: rhythm === "annuel" ? "once" : "repeating",
      duration_in_months: rhythm === "mensuel" ? REFERRAL_WELCOME_MONTHS : undefined,
      applies_to: { products: [productId] },
      name: rhythm === "annuel"
        ? "Avantage filleul Guidz - 6 mois"
        : "Avantage filleul Guidz - 6 mensualites",
      metadata: {
        purpose: "referral_comfort_welcome",
        rhythm,
        recurringPriceId,
        version: "1.1",
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code !== "resource_already_exists") throw error;
  }
  return id;
}

export async function confirmReferralCheckout(session: Stripe.Checkout.Session): Promise<void> {
  const referralId = session.metadata?.referralId;
  const sponsorUid = session.metadata?.referralSponsorUid;
  const attemptId = session.metadata?.referralAttemptId;
  if (!referralId || !sponsorUid || !attemptId) return;

  const referralRef = adminDb.collection(REFERRALS).doc(referralId);
  await adminDb.runTransaction(async (tx) => {
    const referral = await tx.get(referralRef);
    if (!referral.exists) return;
    const data = referral.data()!;
    if (data.sponsorUid !== sponsorUid || data.checkoutAttemptId !== attemptId) return;
    if (data.status === "PAID") return;

    const now = Date.now();
    const rewardRef = adminDb.collection(LEDGER).doc(`welcome_${referralId}`);
    const existingReward = await tx.get(rewardRef);
    const slotDocs = [];
    for (let slot = 1; slot <= REFERRAL_MAX_WELCOME_CREDITS; slot += 1) {
      const slotRef = adminDb.collection(SLOTS).doc(`${sponsorUid}_${slot}`);
      slotDocs.push(await tx.get(slotRef));
    }
    const selectedSlot = existingReward.exists ? 0 : slotDocs.findIndex((slot) => !slot.exists) + 1;

    tx.set(referralRef, {
      status: "PAID",
      paidAt: now,
      checkoutSessionId: session.id,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
      stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripeInitialInvoiceId: typeof session.invoice === "string" ? session.invoice : session.invoice?.id || null,
      updatedAt: now,
    }, { merge: true });

    if (existingReward.exists || !selectedSlot) return;

    const slotRef = adminDb.collection(SLOTS).doc(`${sponsorUid}_${selectedSlot}`);
    tx.create(slotRef, { sponsorUid, referralId, slot: selectedSlot, createdAt: now });
    tx.create(rewardRef, {
      sponsorUid,
      referredUid: referralId,
      referralId,
      type: "WELCOME_CREDIT",
      status: "PENDING",
      amountCents: REFERRAL_WELCOME_CREDIT_CENTS,
      remainingCents: REFERRAL_WELCOME_CREDIT_CENTS,
      availableAt: now + REFERRAL_PENDING_DAYS * 86400000,
      slot: selectedSlot,
      createdAt: now,
      updatedAt: now,
    });
  });
}

function invoiceSubscription(invoice: Stripe.Invoice): { id: string; metadata: Stripe.Metadata | null } | null {
  const details = invoice.parent?.subscription_details;
  if (!details) return null;
  const subscription = details.subscription;
  return {
    id: typeof subscription === "string" ? subscription : subscription.id,
    metadata: details.metadata,
  };
}

function linePriceId(line: Stripe.InvoiceLineItem): string | null {
  const price = line.pricing?.price_details?.price;
  return typeof price === "string" ? price : price?.id || null;
}

function recurringLine(invoice: Stripe.Invoice, rhythm: ReferralBillingRhythm): {
  unitCents: number;
  quantity: number;
  subtotalCents: number;
} | null {
  const expected = rhythm === "annuel"
    ? process.env.STRIPE_PRICE_ABONNEMENT_ANNUEL
    : process.env.STRIPE_PRICE_ABONNEMENT;
  const line = invoice.lines.data.find((candidate) => expected && linePriceId(candidate) === expected);
  if (!line) return null;
  const quantity = Math.max(1, line.quantity || 1);
  const parsedUnit = Number(line.pricing?.unit_amount_decimal || "0");
  const unitCents = Number.isFinite(parsedUnit) && parsedUnit > 0
    ? Math.round(parsedUnit)
    : Math.round(line.subtotal / quantity);
  return { unitCents, quantity, subtotalCents: Math.max(0, line.subtotal) };
}

function allocateAnnualAmounts(unitCents: number, rights: number): number[] {
  if (rights <= 0) return [];
  const total = annualRewardCents(unitCents, rights);
  const base = Math.floor(total / rights);
  const remainder = total - base * rights;
  return Array.from({ length: rights }, (_, index) => base + (index < remainder ? 1 : 0));
}

async function resolveOwnerUid(subscriptionId: string, metadata: Stripe.Metadata | null): Promise<string | null> {
  if (metadata?.ownerUid) return metadata.ownerUid;
  const matches = await adminDb.collection(ACCOMMODATIONS).where("stripeSubscriptionId", "==", subscriptionId).get();
  for (const doc of matches.docs) {
    if (typeof doc.data().ownerUid === "string") return doc.data().ownerUid;
  }
  return null;
}

async function ensureComfortCycle(ownerUid: string, now: number): Promise<{ key: string; startsAt: number; endsAt: number }> {
  const profileRef = adminDb.collection(PROFILES).doc(ownerUid);
  const profile = await profileRef.get();
  const anchor = typeof profile.data()?.comfortCycleAnchorAt === "number"
    ? profile.data()!.comfortCycleAnchorAt
    : now;
  if (!profile.exists || typeof profile.data()?.comfortCycleAnchorAt !== "number") {
    await profileRef.set({ comfortCycleAnchorAt: anchor, updatedAt: now }, { merge: true });
  }
  return referralCycle(anchor, now);
}

async function materializeComfortRights(ownerUid: string, cycleKey: string, now: number): Promise<string[]> {
  const referrals = await adminDb.collection(REFERRALS).where("sponsorUid", "==", ownerUid).get();
  const active = referrals.docs.filter((doc) => doc.data().comfortActive === true);
  if (!active.length) return [];
  const ids: string[] = [];
  for (const referral of active) {
    const id = `comfort_${ownerUid}_${cycleKey}_${referral.id}`;
    ids.push(id);
  }
  await adminDb.runTransaction(async (tx) => {
    const refs = ids.map((id) => adminDb.collection(LEDGER).doc(id));
    const docs = await Promise.all(refs.map((ref) => tx.get(ref)));
    docs.forEach((doc, index) => {
      if (doc.exists) return;
      tx.create(refs[index], {
        sponsorUid: ownerUid,
        referredUid: active[index].id,
        referralId: active[index].id,
        type: "COMFORT_MONTH",
        status: "AVAILABLE",
        cycleKey,
        createdAt: now,
        updatedAt: now,
      });
    });
  });
  return ids;
}

export async function applyReferralInvoiceAdjustment(invoice: Stripe.Invoice): Promise<void> {
  if (invoice.status !== "draft" || invoice.currency.toLowerCase() !== "eur") return;
  const subscription = invoiceSubscription(invoice);
  if (!subscription) return;
  const metadata = subscription.metadata || {};
  const rhythm: ReferralBillingRhythm = metadata.referralRhythm === "annuel" || metadata.rhythm === "annuel"
    ? "annuel"
    : "mensuel";
  const recurring = recurringLine(invoice, rhythm);
  if (!recurring) return;

  const ownerUid = await resolveOwnerUid(subscription.id, metadata);
  const referralId = metadata.referralId || "";
  if (!ownerUid && !referralId) return;
  const now = Date.now();
  const adjustmentRef = adminDb.collection(ADJUSTMENTS).doc(invoice.id);
  if ((await adjustmentRef.get()).exists) return;

  let comfortRewardIds: string[] = [];
  let cycleKey = "";
  if (ownerUid) {
    const cycle = await ensureComfortCycle(ownerUid, now);
    cycleKey = cycle.key;
    comfortRewardIds = await materializeComfortRights(ownerUid, cycle.key, now);
  }

  const adjustment = await adminDb.runTransaction(async (tx) => {
    if ((await tx.get(adjustmentRef)).exists) return null;
    const childRefs = referralId && metadata.referralOffer === "comfort" && metadata.referralBenefitSource !== "stripe_coupon"
      ? Array.from({ length: REFERRAL_WELCOME_MONTHS }, (_, index) =>
          adminDb.collection(LEDGER).doc(`child_${referralId}_${index + 1}`))
      : [];
    const comfortRefs = comfortRewardIds.map((rewardId) => adminDb.collection(LEDGER).doc(rewardId));
    const childDocs = await Promise.all(childRefs.map((ref) => tx.get(ref)));
    const comfortDocs = await Promise.all(comfortRefs.map((ref) => tx.get(ref)));
    const credits = ownerUid
      ? await tx.get(adminDb.collection(LEDGER).where("sponsorUid", "==", ownerUid))
      : null;

    const components: AdjustmentComponent[] = [];
    let remainingInvoiceCents = recurring.subtotalCents;

    if (referralId && metadata.referralOffer === "comfort") {
      const wanted = rhythm === "annuel" ? REFERRAL_WELCOME_MONTHS : 1;
      const eligibleChildren = childDocs
        .map((reward, index) => ({ reward, rewardRef: childRefs[index] }))
        .filter(({ reward }) => reward.exists && reward.data()?.status === "AVAILABLE")
        .slice(0, wanted);
      const amounts = rhythm === "annuel"
        ? allocateAnnualAmounts(recurring.unitCents, eligibleChildren.length)
        : eligibleChildren.map(() => recurring.unitCents);
      for (let index = 0; index < eligibleChildren.length; index += 1) {
        const { rewardRef } = eligibleChildren[index];
        const rewardId = rewardRef.id;
        const amount = amounts[index];
        if (amount <= 0 || amount > remainingInvoiceCents) break;
        tx.update(rewardRef, { status: "RESERVED", reservedInvoiceId: invoice.id, updatedAt: now });
        components.push({ rewardId, kind: "CHILD_WELCOME_MONTH", amountCents: amount });
        remainingInvoiceCents -= amount;
      }
    }

    if (ownerUid && remainingInvoiceCents > 0) {
      const maxRights = rhythm === "annuel" ? recurring.quantity * 12 : recurring.quantity;
      const availableComfort = comfortDocs.filter((reward) => reward.exists && reward.data()?.status === "AVAILABLE");
      const capped = usableAnnualRights(availableComfort.length, recurring.quantity);
      const affordable = rhythm === "annuel"
        ? Math.floor((remainingInvoiceCents * 12) / recurring.unitCents)
        : Math.floor(remainingInvoiceCents / recurring.unitCents);
      const selectedComfort = availableComfort.slice(0, Math.min(maxRights, capped, affordable));
      const amounts = rhythm === "annuel"
        ? allocateAnnualAmounts(recurring.unitCents, selectedComfort.length)
        : selectedComfort.map(() => recurring.unitCents);
      for (let index = 0; index < selectedComfort.length; index += 1) {
        const reward = selectedComfort[index];
        const rewardRef = reward.ref;
        const rewardId = reward.id;
        const amount = amounts[index];
        if (amount <= 0 || amount > remainingInvoiceCents) break;
        tx.update(rewardRef, { status: "RESERVED", reservedInvoiceId: invoice.id, updatedAt: now });
        components.push({ rewardId, kind: "COMFORT_MONTH", amountCents: amount });
        remainingInvoiceCents -= amount;
      }

      let creditBudgetCents = metadata.referralCreditScope === "upgrade"
        ? Math.max(0, invoice.subtotal - components.reduce((sum, component) => sum + component.amountCents, 0))
        : remainingInvoiceCents;
      const creditDocs = (credits?.docs || [])
        .filter((doc) => doc.data().type === "WELCOME_CREDIT")
        .sort((a, b) => (a.data().createdAt || 0) - (b.data().createdAt || 0));
      for (const credit of creditDocs) {
        if (creditBudgetCents <= 0) break;
        const data = credit.data() as RewardRecord;
        const available = data.status === "AVAILABLE" || (data.status === "PENDING" && (data.availableAt || 0) <= now);
        if (!available || (data.remainingCents || 0) <= 0) continue;
        const amount = Math.min(data.remainingCents || 0, creditBudgetCents);
        const newRemaining = (data.remainingCents || 0) - amount;
        tx.update(credit.ref, {
          status: newRemaining === 0 ? "RESERVED" : "AVAILABLE",
          remainingCents: newRemaining,
          reservedInvoiceId: invoice.id,
          reservedCents: FieldValue.increment(amount),
          updatedAt: now,
        });
        components.push({ rewardId: credit.id, kind: "WELCOME_CREDIT", amountCents: amount });
        creditBudgetCents -= amount;
        remainingInvoiceCents = Math.max(0, remainingInvoiceCents - amount);
      }
    }

    const amountCents = components.reduce((total, component) => total + component.amountCents, 0);
    if (amountCents <= 0) return null;
    const record = {
      invoiceId: invoice.id,
      subscriptionId: subscription.id,
      ownerUid: ownerUid || null,
      referralId: referralId || null,
      rhythm,
      cycleKey: cycleKey || null,
      status: "RESERVED",
      amountCents,
      components,
      createdAt: now,
      updatedAt: now,
    };
    tx.create(adjustmentRef, record);
    return record;
  });

  if (!adjustment) return;
  try {
    const customer = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (!customer) throw new Error(`Facture ${invoice.id} sans client Stripe.`);
    const item = await stripe().invoiceItems.create({
      customer,
      invoice: invoice.id,
      subscription: subscription.id,
      amount: -adjustment.amountCents,
      currency: invoice.currency,
      description: "Avantages parrainage Guidz",
      discountable: false,
      metadata: { guidzAdjustmentId: invoice.id },
    }, { idempotencyKey: `guidz-referral-invoice-${invoice.id}` });
    await adjustmentRef.update({ status: "APPLIED", stripeInvoiceItemId: item.id, updatedAt: Date.now() });
  } catch (error) {
    await releaseInvoiceAdjustment(invoice.id, "STRIPE_ERROR");
    throw error;
  }
}

export async function consumeInvoiceAdjustment(invoice: Stripe.Invoice): Promise<void> {
  const adjustmentRef = adminDb.collection(ADJUSTMENTS).doc(invoice.id);
  await adminDb.runTransaction(async (tx) => {
    const adjustment = await tx.get(adjustmentRef);
    if (!adjustment.exists || adjustment.data()?.status === "CONSUMED") return;
    const components = (adjustment.data()?.components || []) as AdjustmentComponent[];
    const rewardRefs = components.map((component) => adminDb.collection(LEDGER).doc(component.rewardId));
    const rewards = await Promise.all(rewardRefs.map((ref) => tx.get(ref)));
    const now = Date.now();
    for (let index = 0; index < components.length; index += 1) {
      const component = components[index];
      const rewardRef = rewardRefs[index];
      const reward = rewards[index];
      if (!reward.exists) continue;
      if (component.kind === "WELCOME_CREDIT") {
        const reservedCents = Math.max(0, (reward.data()?.reservedCents || 0) - component.amountCents);
        const remainingCents = reward.data()?.remainingCents || 0;
        tx.update(rewardRef, {
          status: remainingCents === 0 && reservedCents === 0 ? "CONSUMED" : "AVAILABLE",
          reservedCents,
          reservedInvoiceId: FieldValue.delete(),
          consumedAt: remainingCents === 0 && reservedCents === 0 ? now : FieldValue.delete(),
          updatedAt: now,
        });
      } else {
        tx.update(rewardRef, {
          status: "CONSUMED",
          reservedInvoiceId: FieldValue.delete(),
          consumedAt: now,
          updatedAt: now,
        });
      }
    }
    tx.update(adjustmentRef, { status: "CONSUMED", consumedAt: now, updatedAt: now });
  });

  const subscription = invoiceSubscription(invoice);
  const metadata = subscription?.metadata || {};
  const referralId = metadata.referralId;
  if (!referralId || metadata.referralOffer !== "comfort") return;
  const couponWelcomeConsumed = metadata.referralBenefitSource === "stripe_coupon"
    ? await consumeCheckoutCouponBenefit(invoice, referralId, metadata.referralRhythm === "annuel" ? "annuel" : "mensuel")
    : false;
  const referralRef = adminDb.collection(REFERRALS).doc(referralId);
  const childRewards = await Promise.all(Array.from({ length: REFERRAL_WELCOME_MONTHS }, (_, index) =>
    adminDb.collection(LEDGER).doc(`child_${referralId}_${index + 1}`).get()
  ));
  const allConsumed = childRewards.every((reward) => reward.data()?.status === "CONSUMED");
  const currentAdjustment = await adjustmentRef.get();
  const includedWelcome = couponWelcomeConsumed || ((currentAdjustment.data()?.components || []) as AdjustmentComponent[])
    .some((component) => component.kind === "CHILD_WELCOME_MONTH");
  const rhythm = metadata.referralRhythm === "annuel" ? "annuel" : "mensuel";
  if ((rhythm === "annuel" && invoice.amount_paid > 0) || (rhythm === "mensuel" && allConsumed && !includedWelcome && invoice.amount_paid > 0)) {
    await referralRef.set({ comfortActive: true, comfortActiveAt: Date.now(), updatedAt: Date.now() }, { merge: true });
  }
}

/** Enregistre une seule fois les mois effectivement couverts par le coupon Checkout. */
async function consumeCheckoutCouponBenefit(
  invoice: Stripe.Invoice,
  referralId: string,
  rhythm: ReferralBillingRhythm
): Promise<boolean> {
  const discountedCents = (invoice.total_discount_amounts || [])
    .reduce((total, discount) => total + discount.amount, 0);
  if (discountedCents <= 0) return false;

  const consumptionRef = adminDb.collection(COUPON_CONSUMPTIONS).doc(invoice.id);
  const rewardRefs = Array.from({ length: REFERRAL_WELCOME_MONTHS }, (_, index) =>
    adminDb.collection(LEDGER).doc(`child_${referralId}_${index + 1}`)
  );
  return adminDb.runTransaction(async (tx) => {
    const [consumption, ...rewards] = await Promise.all([
      tx.get(consumptionRef),
      ...rewardRefs.map((ref) => tx.get(ref)),
    ]);
    if (consumption.exists) return (consumption.data()?.rewardIds || []).length > 0;

    const wanted = rhythm === "annuel" ? REFERRAL_WELCOME_MONTHS : 1;
    const selected = rewards
      .map((reward, index) => ({ reward, ref: rewardRefs[index] }))
      .filter(({ reward }) => reward.exists && reward.data()?.status === "AVAILABLE")
      .slice(0, wanted);
    if (!selected.length) return false;

    const now = Date.now();
    selected.forEach(({ ref }) => tx.update(ref, {
      status: "CONSUMED",
      consumedInvoiceId: invoice.id,
      consumedAt: now,
      updatedAt: now,
    }));
    tx.create(consumptionRef, {
      invoiceId: invoice.id,
      referralId,
      rhythm,
      rewardIds: selected.map(({ ref }) => ref.id),
      discountedCents,
      createdAt: now,
    });
    return true;
  });
}

export async function releaseInvoiceAdjustment(invoiceId: string, reason: string): Promise<void> {
  const adjustmentRef = adminDb.collection(ADJUSTMENTS).doc(invoiceId);
  await adminDb.runTransaction(async (tx) => {
    const adjustment = await tx.get(adjustmentRef);
    if (!adjustment.exists || ["RELEASED", "CONSUMED"].includes(adjustment.data()?.status)) return;
    const components = (adjustment.data()?.components || []) as AdjustmentComponent[];
    const rewardRefs = components.map((component) => adminDb.collection(LEDGER).doc(component.rewardId));
    const rewards = await Promise.all(rewardRefs.map((ref) => tx.get(ref)));
    const now = Date.now();
    for (let index = 0; index < components.length; index += 1) {
      const component = components[index];
      const rewardRef = rewardRefs[index];
      const reward = rewards[index];
      if (!reward.exists) continue;
      if (component.kind === "WELCOME_CREDIT") {
        tx.update(rewardRef, {
          status: "AVAILABLE",
          remainingCents: FieldValue.increment(component.amountCents),
          reservedCents: FieldValue.increment(-component.amountCents),
          reservedInvoiceId: FieldValue.delete(),
          updatedAt: now,
        });
      } else {
        tx.update(rewardRef, { status: "AVAILABLE", reservedInvoiceId: FieldValue.delete(), updatedAt: now });
      }
    }
    if (reason === "STRIPE_ERROR") tx.delete(adjustmentRef);
    else tx.update(adjustmentRef, { status: "RELEASED", releaseReason: reason, releasedAt: now, updatedAt: now });
  });
}

export async function deactivateReferredSubscription(subscriptionId: string): Promise<void> {
  const referrals = await adminDb.collection(REFERRALS).where("stripeSubscriptionId", "==", subscriptionId).get();
  const batch = adminDb.batch();
  const now = Date.now();
  referrals.docs.forEach((doc) => batch.update(doc.ref, { comfortActive: false, comfortInactiveAt: now, updatedAt: now }));
  if (!referrals.empty) await batch.commit();
}

export async function reverseReferralAcquisition(chargeId: string, paymentIntentId?: string | null): Promise<void> {
  if (!paymentIntentId) return;
  const byPaymentIntent = await adminDb.collection(REFERRALS).where("stripePaymentIntentId", "==", paymentIntentId).get();
  const referralDocs: DocumentSnapshot[] = [...byPaymentIntent.docs];
  if (referralDocs.length === 0) {
    const sessions = await stripe().checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
    const referralId = sessions.data[0]?.metadata?.referralId;
    if (referralId) {
      const direct = await adminDb.collection(REFERRALS).doc(referralId).get();
      if (direct.exists) referralDocs.push(direct);
    }
  }
  for (const referral of referralDocs) {
    const rewardRef = adminDb.collection(LEDGER).doc(`welcome_${referral.id}`);
    await adminDb.runTransaction(async (tx) => {
      const [relation, reward] = await Promise.all([tx.get(referral.ref), tx.get(rewardRef)]);
      if (!relation.exists) return;
      const now = Date.now();
      tx.update(referral.ref, { status: "REFUNDED", comfortActive: false, refundedAt: now, refundChargeId: chargeId, updatedAt: now });
      if (!reward.exists || reward.data()?.status === "CANCELLED") return;
      const data = reward.data() as RewardRecord & { slot?: number };
      const originalAmount = data.amountCents || REFERRAL_WELCOME_CREDIT_CENTS;
      const remaining = data.remainingCents || 0;
      const reserved = reward.data()?.reservedCents || 0;
      const alreadyCommitted = Math.max(0, originalAmount - remaining);
      tx.update(rewardRef, {
        status: "CANCELLED",
        remainingCents: 0,
        cancelledAt: now,
        updatedAt: now,
      });
      if (alreadyCommitted === 0 && ["PENDING", "AVAILABLE"].includes(data.status)) {
        if (data.slot) tx.delete(adminDb.collection(SLOTS).doc(`${data.sponsorUid}_${data.slot}`));
      } else {
        const compensationRef = adminDb.collection(LEDGER).doc(`compensation_${referral.id}_${chargeId}`);
        tx.set(compensationRef, {
          sponsorUid: data.sponsorUid,
          referredUid: referral.id,
          referralId: referral.id,
          type: "COMPENSATION",
          status: "CONSUMED",
          amountCents: -Math.max(alreadyCommitted, reserved),
          reason: "REFUND_OR_DISPUTE",
          sourceRewardId: reward.id,
          stripeChargeId: chargeId,
          createdAt: now,
          updatedAt: now,
        }, { merge: false });
      }
    });
  }
}

export async function referralDashboard(uid: string): Promise<ReferralDashboard> {
  const eligible = await accountHasPaidOrder(uid);
  if (!eligible) {
    return {
      eligible: false,
      code: null,
      referralCount: 0,
      activeComfortCount: 0,
      welcomeCreditPendingCents: 0,
      welcomeCreditAvailableCents: 0,
      comfortRightsCurrentCycle: 0,
      comfortRightsUsedCurrentCycle: 0,
    };
  }

  const code = await ensureReferralCode(uid);
  const [referrals, rewards, profile] = await Promise.all([
    adminDb.collection(REFERRALS).where("sponsorUid", "==", uid).get(),
    adminDb.collection(LEDGER).where("sponsorUid", "==", uid).get(),
    adminDb.collection(PROFILES).doc(uid).get(),
  ]);
  const now = Date.now();
  const anchor = typeof profile.data()?.comfortCycleAnchorAt === "number" ? profile.data()!.comfortCycleAnchorAt : now;
  const cycle = referralCycle(anchor, now);
  let pending = 0;
  let available = 0;
  let rights = 0;
  let used = 0;
  for (const reward of rewards.docs) {
    const data = reward.data() as RewardRecord;
    if (data.type === "WELCOME_CREDIT") {
      const remaining = data.remainingCents || 0;
      if (data.status === "PENDING" && (data.availableAt || 0) > now) pending += remaining;
      else if (["PENDING", "AVAILABLE", "RESERVED"].includes(data.status)) available += remaining;
    }
    if (data.type === "COMFORT_MONTH" && data.cycleKey === cycle.key) {
      rights += 1;
      if (data.status === "CONSUMED") used += 1;
    }
  }
  return {
    eligible: true,
    code,
    referralCount: referrals.size,
    activeComfortCount: referrals.docs.filter((doc) => doc.data().comfortActive === true).length,
    welcomeCreditPendingCents: pending,
    welcomeCreditAvailableCents: available,
    comfortRightsCurrentCycle: rights,
    comfortRightsUsedCurrentCycle: used,
  };
}

export async function hasUsableReferralBenefits(uid: string): Promise<boolean> {
  const [referrals, rewards] = await Promise.all([
    adminDb.collection(REFERRALS).where("sponsorUid", "==", uid).get(),
    adminDb.collection(LEDGER).where("sponsorUid", "==", uid).get(),
  ]);
  if (referrals.docs.some((doc) => doc.data().comfortActive === true)) return true;
  const now = Date.now();
  return rewards.docs.some((doc) => {
    const data = doc.data() as RewardRecord;
    if (data.type !== "WELCOME_CREDIT" || (data.remainingCents || 0) <= 0) return false;
    return data.status === "AVAILABLE" || (data.status === "PENDING" && (data.availableAt || 0) <= now);
  });
}

export { REFERRAL_COOKIE };
