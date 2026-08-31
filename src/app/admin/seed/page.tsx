"use client";

import { useState } from "react";
import { seedDemos } from "@/app/admin/actions";
import Link from "next/link";
import { CheckCircle, ExternalLink, Sparkles } from "lucide-react";

const demosList = [
  { name: "Le Clos des Oliviers (Lourmarin)", slug: "demo-essentielle", tag: "Essentielle" },
  { name: "Villa L'Écrin d'Or (Cannes)", slug: "demo-confort", tag: "Confort Classic" },
  { name: "Bienvenue à Marseille (Penthouse)", slug: "demo-confort2", tag: "Cléo" },
  { name: "Le Loft Haussmannien (Paris)", slug: "demo-paris", tag: "Ville — Cléo" },
  { name: "La Villa Bleue Ocean (Biarritz)", slug: "demo-biarritz", tag: "Plage — Cléo" },
  { name: "Le Chalet Altitude 2000 (Chamonix)", slug: "demo-chamonix", tag: "Montagne — Cléo" },
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setDone(false);
    try {
      await seedDemos();
      setDone(true);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération des démos: " + String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Générer & Réinitialiser les Démos
        </h1>
        <p className="text-sm text-[#6B5D4E] mt-1">
          Cette action injecte ou réinitialise l&apos;intégralité des 6 livrets de démonstration dans Firestore.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#EDD9A3]/40 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg text-[#2A2016]">Catalogue des Démos (6 livrets)</h2>
            <p className="text-xs text-[#6B5D4E]">Accessible en ligne, sur l&apos;admin et en fallback statique</p>
          </div>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#C4714A] hover:bg-[#A35A38] text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles size={18} />
            {loading ? "Génération en cours..." : "Générer tout le jeu de données Firestore"}
          </button>
        </div>

        {done && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 text-sm font-semibold">
            <CheckCircle size={20} />
            Les 6 livrets de démonstration ont été créés et réinitialisés dans Firestore !
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {demosList.map((demo) => (
            <div key={demo.slug} className="p-4 rounded-2xl bg-[#FBF5EC] border border-[#EDD9A3]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#2A2016] text-sm">{demo.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDD9A3]/40 text-[#6B5D4E]">
                    {demo.tag}
                  </span>
                </div>
                <p className="text-xs text-[#6B5D4E] font-mono mb-3">/h/{demo.slug}</p>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-[#EDD9A3]/20">
                <Link
                  href={`/h/${demo.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 text-xs font-semibold text-[#C4714A] hover:underline"
                >
                  Aperçu public <ExternalLink size={12} />
                </Link>
                <Link
                  href={`/admin/hebergements/${demo.slug}`}
                  className="flex items-center gap-1 text-xs font-semibold text-[#2B5F75] hover:underline"
                >
                  Éditer dans l&apos;admin
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

