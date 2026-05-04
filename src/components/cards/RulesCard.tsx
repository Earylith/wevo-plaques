"use client";

import { BookOpen, CheckCircle } from "@phosphor-icons/react";

interface RulesCardProps {
  rules: string[];
}

export default function RulesCard({ rules }: RulesCardProps) {
  if (!rules || rules.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#EBF0E6] flex items-center justify-center shrink-0">
          <BookOpen size={24} weight="duotone" color="#5A7A4E" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2A2016]">Règles du logement</h3>
          <p className="text-sm text-[#6B5D4E]">Pour un séjour réussi</p>
        </div>
      </div>

      <ul className="space-y-3">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle size={18} className="text-[#5A7A4E] shrink-0 mt-0.5" />
            <span className="text-sm text-[#2A2016]">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
