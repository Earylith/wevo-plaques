import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

// Protection basique : vérifier le cookie admin
async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_auth")?.value === "true";
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || undefined,
      emailVerified: false,
    });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    
    if (firebaseError.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    console.error("Erreur création utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
