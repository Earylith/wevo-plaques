import { redirect, notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Accommodation } from "@/lib/types/accommodation";

/**
 * Destination des QR codes gravés.
 *
 * Cette route est le CONTRAT avec le bois : une plaque livrée pointe ici pour
 * toujours. Elle ne doit jamais changer de forme, jamais disparaître, et
 * toujours rediriger vers le livret courant — même si son adresse lisible a
 * été modifiée entre-temps.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ code: string }>;
}

export default async function PermanentRedirectPage({ params }: Props) {
  const { code } = await params;

  const snapshot = await adminDb
    .collection("accommodations")
    .where("permanentId", "==", code.toLowerCase())
    .limit(1)
    .get();

  if (snapshot.empty) {
    // Aucun livret sous cet identifiant : plaque d'un compte supprimé, ou
    // code mal recopié. On ne redirige pas au hasard.
    return notFound();
  }

  const livret = { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Accommodation;
  redirect(`/h/${livret.slug}`);
}
