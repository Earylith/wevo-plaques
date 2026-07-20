"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Leaf } from "lucide-react";

const navLinks = [
  { label: "Concept", href: "#concept" },
  { label: "Démo", href: "#demo" },
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Formules", href: "#offres" },
  { label: "Pro", href: "#pro" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-b border-gray-100/50"
          : "bg-white/50 backdrop-blur-md border-b border-white/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-700 ${scrolled ? "h-16" : "h-24"}`}>
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#2A2016] flex items-center justify-center shadow-md transition-transform duration-500 group-hover:scale-105">
              <Leaf size={16} className="text-[#EDD9A3]" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016] tracking-tight">
              Guidz<span className="text-[#C4714A]">.</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium tracking-[0.08em] text-[#2A2016]/70 uppercase hover:text-[#C4714A] transition-all duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-2 left-1/2 w-1 h-1 bg-[#C4714A] rounded-full opacity-0 -translate-x-1/2 group-hover:opacity-100 transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-5">
            <a
              href="#offres"
              className="hidden sm:inline-flex items-center px-7 py-3 rounded-full bg-[#2A2016] text-white text-[12px] font-semibold tracking-wider uppercase hover:bg-[#C4714A] transition-all duration-500 shadow-[0_4px_20px_rgba(42,32,22,0.15)] hover:shadow-[0_8px_30px_rgba(196,113,74,0.3)] hover:-translate-y-0.5"
            >
              Commander
            </a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-[#2A2016] hover:text-[#C4714A] transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 overflow-hidden"
          >
            <nav className="px-6 py-8 space-y-6 flex flex-col items-center">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium tracking-[0.1em] uppercase text-[#2A2016]/80 hover:text-[#C4714A] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 w-full">
                <a
                  href="#offres"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full px-6 py-4 rounded-full bg-[#2A2016] text-white text-[13px] font-semibold tracking-wider uppercase hover:bg-[#C4714A] transition-all"
                >
                  Commander mon Guidz
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
