"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "wevo2026") { // MVP hardcoded password
      document.cookie = "admin_auth=true; path=/; max-age=86400"; // 24h
      router.push("/admin/hebergements");
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5EC] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 shadow-md border border-[#EDD9A3]/40 w-full max-w-md text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016] mb-2">
          Espace Administrateur
        </h1>
        <p className="text-sm text-[#6B5D4E] mb-8">Veuillez vous identifier</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password" 
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full px-4 py-3 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/50 bg-[#FBF5EC]"
            />
            {error && <p className="text-red-500 text-xs mt-2 text-left">Mot de passe incorrect</p>}
          </div>
          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
