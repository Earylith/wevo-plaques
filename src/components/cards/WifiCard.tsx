"use client";

import { WifiHigh, Copy, Check } from "@phosphor-icons/react";
import { useState } from "react";

interface WifiCardProps {
  ssid: string;
  password?: string;
}

export default function WifiCard({ ssid, password }: WifiCardProps) {
  const [ssidCopied, setSsidCopied] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySsid = () => {
    navigator.clipboard.writeText(ssid);
    setSsidCopied(true);
    setTimeout(() => setSsidCopied(false), 3000);
  };

  const handleCopy = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E4EEF3] flex items-center justify-center shrink-0">
          <WifiHigh size={24} weight="duotone" color="#2B5F75" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2A2016]">Réseau Wi-Fi</h3>
          <p className="text-sm text-[#6B5D4E]">Connectez-vous facilement</p>
        </div>
      </div>

      <div className="bg-[#FBF5EC] rounded-2xl p-4">
        <div className="mb-4">
          <span className="text-xs text-[#6B5D4E] uppercase tracking-wider font-medium">Réseau</span>
          <div className="flex items-center justify-between mt-0.5 gap-2">
            <p className="font-semibold text-[#2A2016] truncate">{ssid}</p>
            <button 
              onClick={handleCopySsid}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm border border-[#EDD9A3]/40 hover:bg-[#F7EBE4] transition-colors"
              title="Copier le nom du réseau"
            >
              {ssidCopied ? <Check size={16} color="#5A7A4E" /> : <Copy size={16} color="#C4714A" />}
            </button>
          </div>
        </div>
        
        {password && (
            <div className="flex flex-col gap-3 mt-3">
              <div className="flex items-center justify-between gap-2 bg-white px-4 py-3 rounded-xl border border-[#EDD9A3]/30">
                <p className="font-mono text-sm text-[#2A2016] truncate">{password}</p>
                {copied && (
                  <span className="text-[10px] font-bold text-[#5A7A4E] whitespace-nowrap animate-pulse">
                    Mot de passe copié !
                  </span>
                )}
              </div>
              
              <button 
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-sm border border-[#EDD9A3]/40 hover:bg-[#F7EBE4] transition-all active:scale-95 group"
              >
                {copied ? (
                  <>
                    <Check size={18} weight="bold" className="text-[#5A7A4E]" />
                    <span className="text-sm font-bold text-[#5A7A4E]">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy size={18} className="text-[#C4714A] group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-[#2A2016]">Copier le mot de passe</span>
                  </>
                )}
              </button>
            </div>
        )}
      </div>
    </div>
  );
}
