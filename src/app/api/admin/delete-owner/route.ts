import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "true";
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { uid } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: "UID requis" }, { status: 400 });
    }

    await adminAuth.deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };

    if (firebaseError.code === "auth/user-not-found") {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    console.error("Erreur suppression utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du compte" },
      { status: 500 }
    );
  }
}
