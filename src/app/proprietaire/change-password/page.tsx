"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/lib/firebase/auth";
import { getAccommodationByOwnerEmail } from "@/lib/firebase/firestore";
import { updateAccommodation } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { KeyReturn, Eye, EyeSlash } from "@phosphor-icons/react";

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  if (!user) {
    router.replace("/proprietaire/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(newPassword);
      // Mettre à jour le flag mustChangePassword
      const acc = await getAccommodationByOwnerEmail(user.email!);
      if (acc?.id) {
        await updateAccommodation(acc.id, { mustChangePassword: false });
      }
      router.push("/proprietaire/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/requires-recent-login") {
        setError("Session expirée. Veuillez vous reconnecter.");
        router.push("/proprietaire/login");
      } else {
        setError("Erreur lors du changement de mot de passe.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2A2016] mb-4 shadow-lg">
            <KeyReturn size={28} className="text-[#EDD9A3]" weight="fill" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            Bienvenue !
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-2">
            Pour votre sécurité, veuillez définir un nouveau mot de passe avant de continuer.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-md border border-[#EDD9A3]/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  required
                  placeholder="Au moins 8 caractères"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC] text-[#2A2016]"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D4E] hover:text-[#2A2016]"
                >
                  {showNew ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  required
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC] text-[#2A2016]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D4E] hover:text-[#2A2016]"
                >
                  {showConfirm ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm disabled:opacity-60"
            >
              {submitting ? "Enregistrement…" : "Définir mon mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
