import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { PlaqueOrder } from "@/lib/types/accommodation";
import QRCode from "qrcode";
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

  /*
   * Le QR seul, en image.
   *
   * Il sert quand la plaque n'est pas en jeu : une étiquette, un livret
   * papier, un visuel à glisser dans un e-mail. Le fichier de gravure, lui,
   * ne s'ouvre qu'avec un logiciel de découpe.
   *
   * Il encode la MÊME adresse permanente que la plaque, et se fabrique avec
   * le même encodeur : les deux ne peuvent pas mener à des endroits
   * différents. Correction « Q » plutôt que « M » ici : une image imprimée
   * puis photographiée pardonne moins qu'une gravure nette.
   */
  if (request.nextUrl.searchParams.get("format") === "qr") {
    try {
      const png = await QRCode.toBuffer(commande.permanentUrl, {
        errorCorrectionLevel: "Q",
        margin: 2,
        width: 1200,
        color: { dark: "#2A2016FF", light: "#FFFFFFFF" },
      });
      return new NextResponse(new Uint8Array(png), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${commande.reference}-qr.png"`,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      console.error("[qr]", error);
      return NextResponse.json({ error: "QR non généré." }, { status: 500 });
    }
  }

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
