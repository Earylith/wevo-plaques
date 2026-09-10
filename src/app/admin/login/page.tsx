"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/lib/firebase/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credential = await signIn(email, password);

      // Le serveur vérifie la signature Firebase, la fraîcheur du login et le
      // custom claim administrateur avant de créer un cookie HttpOnly signé.
      const idToken = await credential.user.getIdToken(true);
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        await signOut();
        throw new Error(body?.error || "Accès administrateur refusé.");
      }

      router.replace("/admin/hebergements");
      router.refresh();

    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password") {
        setError("Identifiants incorrects.");
      } else {
        setError(e.message || "Erreur de connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 shadow-md border border-[#EDD9A3]/40 w-full max-w-md text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016] mb-2">
          Espace Administrateur
        </h1>
        <p className="text-sm text-[#6B5D4E] mb-8">Accès strictement réservé</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Adresse email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Mot de passe"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            />
          </div>
          {error && <p className="text-red-500 text-xs text-left">{error}</p>}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2A2016] text-white font-semibold hover:bg-[#C4714A] transition-colors disabled:opacity-50"
          >
            {loading ? "Vérification..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
