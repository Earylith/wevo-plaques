import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export const ADMIN_SESSION_COOKIE = "__Host-admin_session";
export const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const MAX_LOGIN_AGE_SECONDS = 5 * 60;

/**
 * Le rôle ne vient jamais du navigateur : il doit être porté par les custom
 * claims Firebase de l'utilisateur (`admin: true` ou `role: "admin"`).
 */
export function hasAdminRole(token: DecodedIdToken): boolean {
  return token.admin === true || token.role === "admin";
}

/** Vérifie une session Firebase signée, son éventuelle révocation et le rôle. */
export async function verifyAdminSessionCookie(
  sessionCookie: string | undefined
): Promise<DecodedIdToken | null> {
  if (!sessionCookie) return null;

  try {
    const token = await adminAuth.verifySessionCookie(sessionCookie, true);
    return hasAdminRole(token) ? token : null;
  } catch {
    return null;
  }
}

/** Lit et vérifie la session de la requête en cours. */
export async function getAdminSession(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  return verifyAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function hasValidAdminSession(): Promise<boolean> {
  return Boolean(await getAdminSession());
}

/** Garde obligatoire pour chaque Server Action ou accès de données admin. */
export async function requireAdminSession(): Promise<DecodedIdToken> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Accès refusé. Une session administrateur valide est requise.");
  }
  return session;
}

/**
 * Transforme un ID token Firebase fraîchement obtenu en cookie de session.
 * Le contrôle du rôle est effectué avant toute création de cookie.
 */
export async function createAdminSessionCookie(idToken: string): Promise<string> {
  const token = await adminAuth.verifyIdToken(idToken, true);

  if (!hasAdminRole(token)) {
    throw new Error("Accès refusé. Ce compte ne possède pas le rôle administrateur.");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!token.auth_time || nowSeconds - token.auth_time > MAX_LOGIN_AGE_SECONDS) {
    throw new Error("Connexion trop ancienne. Veuillez vous authentifier de nouveau.");
  }

  return adminAuth.createSessionCookie(idToken, {
    expiresIn: ADMIN_SESSION_DURATION_MS,
  });
}
