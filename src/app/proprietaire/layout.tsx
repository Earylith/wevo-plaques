"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SignOut } from "@phosphor-icons/react";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/hooks/useAuth";

/**
 * Châssis de l'espace propriétaire.
 *
 * L'hôte n'administre pas un parc : il a un livret. Une barre latérale de
 * navigation n'aurait qu'une seule entrée — elle occuperait un quart de
 * l'écran pour ne rien dire, et donnerait à son espace l'allure d'un back
 * office. On lui laisse donc toute la page, et le peu de chrome nécessaire
 * tient dans une barre haute qui s'efface derrière le contenu.
 */
export default function ProprietaireLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const pagePublique = pathname === "/proprietaire/login";

  useEffect(() => {
    if (!loading && !user && !pagePublique) {
      router.replace("/proprietaire/login");
    }
  }, [user, loading, pagePublique, router]);

  const seDeconnecter = async () => {
    await signOut();
    router.push("/proprietaire/login");
  };

  if (pagePublique) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3ED] flex items-center justify-center">
        <span className="h-5 w-5 rounded-full border-2 border-[#2A2016]/15 border-t-[#C4714A] animate-spin" />
      </div>
    );
  }

  // Non connecté : la redirection est en cours, on n'affiche rien entre-temps.
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#2A2016]">
      {/*
       * Un halo très pâle en haut de page : il donne de la profondeur au fond
       * sans jamais entrer en concurrence avec le contenu.
       */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px] opacity-70"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,0.95) 0%, rgba(246,243,237,0) 70%)",
        }}
      />

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#F6F3ED]/75 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-[19px] font-bold tracking-[-0.01em] text-[#2A2016] transition-opacity hover:opacity-60"
          >
            Guidzme<span className="text-[#C4714A]">.</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-[#8A7D6E] sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={() => void seDeconnecter()}
              aria-label="Se déconnecter"
              className="flex h-8 items-center gap-1.5 rounded-full border border-black/[0.07] bg-white/70 px-3 text-[12px] font-semibold text-[#6B5D4E] transition-all hover:border-black/15 hover:text-[#2A2016] active:scale-[0.97]"
            >
              <SignOut size={13} weight="bold" />
              <span className="hidden sm:inline">Se déconnecter</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative">{children}</main>
    </div>
  );
}
