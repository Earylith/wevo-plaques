import { NextRequest, NextResponse } from "next/server";
import {
  REFERRAL_COOKIE,
  createReferralCookieValue,
  referralCodeExists,
} from "@/lib/server/referrals";
import { normalizeReferralCode } from "@/lib/referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await context.params;
  const code = normalizeReferralCode(rawCode);
  if (!code || !(await referralCodeExists(code))) {
    const response = NextResponse.redirect(new URL("/parrainage", request.url));
    response.cookies.set({ name: REFERRAL_COOKIE, value: "", maxAge: 0, path: "/" });
    return response;
  }

  const response = NextResponse.redirect(new URL("/parrainage", request.url));
  response.cookies.set({
    name: REFERRAL_COOKIE,
    value: createReferralCookieValue(code),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
