"use client";

import { useState, useEffect } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";

interface MobileAccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function MobileAccordion({ title, icon, children, defaultOpen = false }: MobileAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/30 mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FDF5E6] flex items-center justify-center shrink-0 text-[#C4714A]">
            {icon}
          </div>
          <h3 className="font-semibold text-[#2A2016] text-lg">{title}</h3>
        </div>
        <div className="text-[#6B5D4E]">
          {isOpen ? <CaretUp size={20} /> : <CaretDown size={20} />}
        </div>
      </button>
      
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-[#EDD9A3]/30">
          {children}
        </div>
      )}
    </div>
  );
}
