import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_DURATION_MS,
  createAdminSessionCookie,
} from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clearSession(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  // Neutralise aussi l'ancien mécanisme vulnérable dans les navigateurs déjà utilisés.
  response.cookies.set({
    name: "admin_auth",
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine de la requête refusée." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { idToken?: unknown };
    if (typeof body.idToken !== "string" || body.idToken.length > 10_000) {
      return NextResponse.json({ error: "Jeton Firebase invalide." }, { status: 400 });
    }

    const sessionCookie = await createAdminSessionCookie(body.idToken);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionCookie,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_DURATION_MS / 1000,
      priority: "high",
    });
    response.cookies.set({
      name: "admin_auth",
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connexion administrateur refusée.";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine de la requête refusée." }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  clearSession(response);
  return response;
}
