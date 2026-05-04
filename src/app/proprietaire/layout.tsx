"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { House, SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { signOut } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ProprietaireLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPage = pathname === "/proprietaire/login" || pathname === "/proprietaire/change-password";

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.replace("/proprietaire/login");
    }
  }, [user, loading, isPublicPage, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/proprietaire/login");
  };

  // Pages sans layout (login, change-password)
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C4714A]" />
      </div>
    );
  }

  // Non connecté — redirection en cours
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2A2016] text-white flex flex-col fixed inset-y-0 left-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EDD9A3]/20 flex items-center justify-center">
              <House size={18} className="text-[#EDD9A3]" weight="fill" />
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
              Mon Livret
            </h2>
          </div>
          <p className="text-xs text-white/40 uppercase tracking-widest ml-11">Espace Propriétaire</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link
            href="/proprietaire/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
              pathname === "/proprietaire/dashboard"
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <House size={18} />
            Mon hébergement
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-colors w-full text-left text-sm"
          >
            <SignOut size={18} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
