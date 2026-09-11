export const REFERRAL_COOKIE = "guidz_referral";
export const REFERRAL_PENDING_DAYS = 7;
export const REFERRAL_WELCOME_CREDIT_CENTS = 500;
export const REFERRAL_WELCOME_MONTHS = 6;
export const REFERRAL_MAX_WELCOME_CREDITS = 4;

export type ReferralBillingRhythm = "mensuel" | "annuel";
export type ReferralInitialOffer = "essential" | "comfort";

export function normalizeReferralCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
}

/** Ajoute des mois calendaires sans transformer six mois en 180 jours. */
export function addCalendarMonths(timestamp: number, months: number): number {
  const source = new Date(timestamp);
  const day = source.getUTCDate();
  const result = new Date(Date.UTC(
    source.getUTCFullYear(),
    source.getUTCMonth() + months,
    1,
    source.getUTCHours(),
    source.getUTCMinutes(),
    source.getUTCSeconds(),
    source.getUTCMilliseconds()
  ));
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result.getTime();
}

export function referralCycle(anchorTimestamp: number, now = Date.now()): {
  key: string;
  startsAt: number;
  endsAt: number;
} {
  let startsAt = anchorTimestamp;
  let endsAt = addCalendarMonths(startsAt, 12);
  while (now >= endsAt) {
    startsAt = endsAt;
    endsAt = addCalendarMonths(startsAt, 12);
  }
  while (now < startsAt) {
    endsAt = startsAt;
    startsAt = addCalendarMonths(startsAt, -12);
  }
  return {
    key: new Date(startsAt).toISOString().slice(0, 10),
    startsAt,
    endsAt,
  };
}

export function annualRewardCents(unitAnnualCents: number, rights: number): number {
  return Math.round((unitAnnualCents * rights) / 12);
}

export function usableAnnualRights(activeReferrals: number, comfortUnits: number): number {
  return Math.max(0, Math.min(activeReferrals, comfortUnits * 12));
}
