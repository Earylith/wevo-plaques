"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { referralDashboard, ReferralDashboard } from "@/lib/server/referrals";

export async function chargerParrainage(jetonHote: string): Promise<ReferralDashboard> {
  if (!jetonHote) throw new Error("Connectez-vous pour consulter votre parrainage.");
  const token = await adminAuth.verifyIdToken(jetonHote, true);
  return referralDashboard(token.uid);
}
