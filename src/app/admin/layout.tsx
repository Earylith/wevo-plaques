"use client";

import { usePathname, useRouter } from "next/navigation";
import { House, List, Plus, SignOut } from "@phosphor-icons/react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = () => {
    document.cookie = "admin_auth=; path=/; max-age=0";
    router.push("/admin/login");
    router.refresh();
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2A2016] text-white flex flex-col fixed inset-y-0 left-0">
        <div className="p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white mb-1">
            WEVO Admin
          </h2>
          <p className="text-xs text-white/50 uppercase tracking-widest">Espace Pro</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link 
            href="/admin/hebergements" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === "/admin/hebergements" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <List size={20} />
            <span className="font-medium text-sm">Hébergements</span>
          </Link>
          <Link 
            href="/admin/hebergements/new" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === "/admin/hebergements/new" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Plus size={20} />
            <span className="font-medium text-sm">Nouveau</span>
          </Link>
        </nav>
        
        <div className="p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
          >
            <SignOut size={20} />
            <span className="font-medium text-sm">Déconnexion</span>
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
