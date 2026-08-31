"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signInWithGoogle, sendPasswordReset } from "@/lib/firebase/auth";
import Link from "next/link";
import { House, GoogleLogo, ArrowRight } from "@phosphor-icons/react";

type Mode = "login" | "forgot";

export default function ProprietaireLogin() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /*
   * Entrée dans l'espace, une fois l'identité établie.
   *
   * On ne cherche plus le livret ici. Le tableau de bord le retrouve par
   * `ownerUid`, alors que cette page interrogeait `owner.email` : un livret
   * pouvait exister sans que cette recherche le voie, et l'hôte se voyait
   * refuser l'entrée chez lui. L'espace sait déjà accueillir un compte sans
   * livret et proposer de choisir une formule.
   */

  const avecGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/proprietaire/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError("Connexion Google interrompue.");
      } else {
        setError("La connexion Google a échoué. Réessayez.");
      }
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/proprietaire/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/invalid-credential" || firebaseError.code === "auth/wrong-password" || firebaseError.code === "auth/user-not-found") {
        setError("Email ou mot de passe incorrect. Si vous n’avez pas encore de compte, choisissez d’abord votre formule.");
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccess("Un email de réinitialisation a été envoyé à " + email);
    } catch {
      setError("Adresse email introuvable ou invalide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2A2016] mb-4 shadow-lg">
            <House size={28} className="text-[#EDD9A3]" weight="fill" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            {mode === "login" ? "Espace Propriétaire" : "Mot de passe oublié"}
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-2">
            {mode === "login"
              ? "Gérez votre livret d'accueil numérique"
              : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-md border border-[#EDD9A3]/40">
          {mode === "login" ? (
            <>
              <button
                type="button"
                onClick={() => void avecGoogle()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-[#EDD9A3] bg-white text-[#2A2016] font-semibold hover:bg-[#FBF5EC] transition-colors disabled:opacity-60"
              >
                <GoogleLogo size={18} weight="bold" />
                Continuer avec Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <span className="h-px flex-1 bg-[#EDD9A3]" />
                <span className="text-[11px] uppercase tracking-wider text-[#B0A090] font-semibold">ou</span>
                <span className="h-px flex-1 bg-[#EDD9A3]" />
              </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  id="owner-email"
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC] text-[#2A2016] placeholder-[#B0A090]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">
                  Mot de passe
                </label>
                <input
                  id="owner-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC] text-[#2A2016]"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>

              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(""); }}
                className="w-full text-center text-sm text-[#6B5D4E] hover:text-[#C4714A] transition-colors mt-2"
              >
                Mot de passe oublié ?
              </button>
            </form>
            </>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
                  className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC] text-[#2A2016] placeholder-[#B0A090]"
                />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>}
              {success && <p className="text-green-700 text-sm bg-green-50 px-4 py-2.5 rounded-xl">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? "Envoi…" : "Envoyer le lien"}
              </button>

              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className="w-full text-center text-sm text-[#6B5D4E] hover:text-[#C4714A] transition-colors"
              >
                ← Retour à la connexion
              </button>
            </form>
          )}
        </div>

        {mode === "login" && (
          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B5D4E]">Vous n’avez pas encore de livret ?</p>
            <Link
              href="/#offres"
              className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-[#C4714A] hover:text-[#A35A38] transition-colors"
            >
              Choisir ma formule <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
