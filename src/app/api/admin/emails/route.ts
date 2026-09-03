import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exempleMessage } from "@/app/admin/emails";
import { CleMessage } from "@/lib/emailsTextes";

/**
 * Aperçu des e-mails transactionnels, réservé à l'administration.
 *
 * Un gabarit d'e-mail ne se relit pas dans le code : les clients de
 * messagerie rendent le HTML chacun à leur façon, et la seule vérification
 * qui vaille est de le regarder. Cette route sert le message tel qu'il
 * partira, avec un jeu de données représentatif.
 *
 * Elle n'envoie rien : c'est une lecture. L'envoi d'essai est une action
 * distincte, explicite, et vers une adresse choisie.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    return NextResponse.json({ error: "Accès réservé." }, { status: 403 });
  }

  const type = (request.nextUrl.searchParams.get("type") || "bienvenue") as CleMessage;
  if (!["bienvenue", "commande", "expedition", "devis", "resiliation"].includes(type)) {
    return NextResponse.json({ error: "Type inconnu." }, { status: 400 });
  }

  // Le texte en vigueur, pas le texte d’origine : l’aperçu doit montrer ce
  // qui partira réellement, modifications de l’administration comprises.
  const message = await exempleMessage(type);

  // La version texte se relit aussi : c'est elle que verront certains.
  if (request.nextUrl.searchParams.get("format") === "texte") {
    return new NextResponse(message.texte, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(message.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
