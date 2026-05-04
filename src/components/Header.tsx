"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Leaf } from "lucide-react";

const navLinks = [
  { label: "Concept", href: "#concept" },
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Offres", href: "#offres" },
  { label: "Pro", href: "#pro" },
  { label: "Contact", href: "#contact" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#FBF5EC]/92 backdrop-blur-lg shadow-sm border-b border-[#EDD9A3]/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C4714A] to-[#A35A38] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#2A2016] tracking-tight">
              WEVO{" "}
              <span className="text-[#C4714A] font-light">×</span>{" "}
              <span className="text-[#5A7A4E]">CRÉART</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#6B5D4E] hover:text-[#C4714A] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C4714A] group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-4">
            <a
              href="#offres"
              className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full bg-[#C4714A] text-white text-sm font-medium hover:bg-[#A35A38] transition-all btn-press shadow-sm hover:shadow-md"
            >
              Précommander
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
            className="lg:hidden bg-[#FBF5EC]/97 backdrop-blur-lg border-b border-[#EDD9A3]/50 overflow-hidden"
          >
            <nav className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium text-[#2A2016] hover:text-[#C4714A] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#offres"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-5 py-3 rounded-full bg-[#C4714A] text-white font-medium hover:bg-[#A35A38] transition-all btn-press"
              >
                Précommander
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
