import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parcourirSvg, lireTrace, appliquer } from "@/lib/server/gravure/svg";
import { contoursTexte } from "@/lib/server/gravure/police";

/**
 * Sondage du gabarit, réservé à l'administration.
 *
 * Mesurer la géométrie AVEC le code qui produira les fichiers, et non avec une
 * copie approchante : une plaque mal cotée part au rebut, et un script
 * parallèle finirait tôt ou tard par diverger de ce qui grave réellement.
 *
 * Route de diagnostic : elle ne modifie rien et ne sert qu'à vérifier le
 * calage du gabarit après une modification du fichier source.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    return NextResponse.json({ error: "Accès réservé." }, { status: 403 });
  }

  const source = readFileSync(
    path.join(process.cwd(), "public", "images", "plaques", "plaque-base.svg"),
    "utf8"
  );

  const elements = parcourirSvg(source);
  const dessinables = elements.filter(
    (e) => !e.dansDefinitions && (e.nom === "path" || e.nom === "rect" || e.nom === "image" || e.nom === "text")
  );

  const mesures = dessinables.map((e) => {
    const points: { x: number; y: number }[] = [];

    if (e.nom === "path" && e.attributs.d) {
      for (const st of lireTrace(e.attributs.d)) points.push(...st.points);
    } else if (e.nom === "rect" || e.nom === "image") {
      const x = Number(e.attributs.x || 0);
      const y = Number(e.attributs.y || 0);
      const w = Number(e.attributs.width || 0);
      const h = Number(e.attributs.height || 0);
      points.push({ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h });
    } else if (e.nom === "text") {
      points.push({ x: Number(e.attributs.x || 0), y: Number(e.attributs.y || 0) });
    }

    const transformes = points.map((p) => appliquer(e.matrice, p));
    const xs = transformes.map((p) => p.x);
    const ys = transformes.map((p) => p.y);

    return {
      nom: e.nom,
      id: e.attributs.id || null,
      ancetres: e.ancetres.slice(-3),
      points: transformes.length,
      cadre: transformes.length
        ? {
            x0: +Math.min(...xs).toFixed(2),
            y0: +Math.min(...ys).toFixed(2),
            x1: +Math.max(...xs).toFixed(2),
            y1: +Math.max(...ys).toFixed(2),
          }
        : null,
    };
  });

  const vectoriels = mesures.filter((m) => m.cadre && m.nom !== "image");
  const cadres = vectoriels.map((m) => m.cadre!);

  // La phrase par défaut, vectorisée : de quoi vérifier que la police est lue.
  const phrase = contoursTexte("Profitez pleinement de votre séjour !", 10);

  return NextResponse.json({
    viewBox: source.match(/viewBox="([^"]+)"/)?.[1] ?? null,
    elements: mesures.length,
    silhouette: mesures.find((m) => m.id === "path6")?.cadre ?? null,
    etendueVectorielle: cadres.length
      ? {
          x0: +Math.min(...cadres.map((c) => c.x0)).toFixed(2),
          y0: +Math.min(...cadres.map((c) => c.y0)).toFixed(2),
          x1: +Math.max(...cadres.map((c) => c.x1)).toFixed(2),
          y1: +Math.max(...cadres.map((c) => c.y1)).toFixed(2),
        }
      : null,
    police: {
      contours: phrase.traces.length,
      largeurPourDixMm: +phrase.largeur.toFixed(2),
      premiersPoints: phrase.traces[0]?.points.slice(0, 3).map((p) => ({
        x: +p.x.toFixed(2),
        y: +p.y.toFixed(2),
      })),
    },
    detail: mesures,
  });
}
