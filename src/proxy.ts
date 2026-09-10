import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionCookie,
} from "@/lib/server/admin-auth";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login";
  const isSessionEndpoint = pathname === "/api/admin/session";

  // L'endpoint de connexion vérifie lui-même l'ID token et le rôle avant de
  // créer le cookie. Il doit rester joignable sans session existante.
  if (isSessionEndpoint) return NextResponse.next();

  const rawSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionCookie(rawSession);

  if (isAdminApi && !session) {
    const response = NextResponse.json({ error: "Session administrateur invalide." }, { status: 401 });
    if (rawSession) response.cookies.delete(ADMIN_SESSION_COOKIE);
    response.cookies.delete("admin_auth");
    return response;
  }

  if (isAdminPath && !isLoginPage && !session) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    if (rawSession) response.cookies.delete(ADMIN_SESSION_COOKIE);
    response.cookies.delete("admin_auth");
    return response;
  }

  if (isLoginPage && session) {
    const response = NextResponse.redirect(new URL("/admin/hebergements", request.url));
    response.cookies.delete("admin_auth");
    return response;
  }

  const response = NextResponse.next();
  response.cookies.delete("admin_auth");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
