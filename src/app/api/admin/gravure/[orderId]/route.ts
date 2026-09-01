import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { PlaqueOrder } from "@/lib/types/accommodation";
import { fabriquerGravure } from "@/lib/server/gravure";
import { configPlaqueComplete } from "@/lib/plaque";

/**
 * Fichier de gravure d'une commande.
 *
 * Réservé à l'administration : le fichier porte l'adresse permanente gravée,
 * et rien n'oblige à l'exposer publiquement.
 *
 * Il est fabriqué à la demande, à partir de la configuration FIGÉE dans la
 * commande — jamais de l'état courant du livret. Une plaque déjà produite ne
 * doit pas changer parce que l'hôte a modifié sa phrase entre-temps.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    return NextResponse.json({ error: "Accès réservé." }, { status: 403 });
  }

  const { orderId } = await params;
  const doc = await adminDb.collection("orders").doc(orderId).get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }
  const commande = doc.data() as PlaqueOrder;

  try {
    const plaque = configPlaqueComplete(commande.plaque);
    const resultat = await fabriquerGravure({
      urlPermanente: commande.permanentUrl,
      phrase: plaque.engravedTagline || "",
      reference: commande.reference,
    });

    // `inspect` renvoie les mesures sans le fichier : de quoi vérifier une
    // production sans télécharger ni ouvrir un logiciel de découpe.
    if (request.nextUrl.searchParams.get("inspect") === "1") {
      return NextResponse.json({
        reference: commande.reference,
        urlGravee: commande.permanentUrl,
        phrase: plaque.engravedTagline,
        largeurMm: resultat.largeurMm,
        hauteurMm: resultat.hauteurMm,
        compte: resultat.compte,
        phraseReduite: resultat.phraseReduite,
        octetsDxf: Buffer.byteLength(resultat.dxf, "utf8"),
        octetsSvg: Buffer.byteLength(resultat.svg, "utf8"),
      });
    }

    /*
     * Les deux formats sortent des mêmes polylignes. Le SVG sert aux ateliers
     * qui le préfèrent et se regarde d'un clic ; le DXF reste le format de
     * référence des machines de découpe.
     */
    const svg = request.nextUrl.searchParams.get("format") === "svg";

    return new NextResponse(svg ? resultat.svg : resultat.dxf, {
      headers: {
        "Content-Type": svg ? "image/svg+xml" : "application/dxf",
        "Content-Disposition": `attachment; filename="${commande.reference}-gravure.${svg ? "svg" : "dxf"}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[gravure]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fabrication impossible." },
      { status: 500 }
    );
  }
}
