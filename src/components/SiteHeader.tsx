"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Menu, X } from "lucide-react";

interface SiteHeaderProps {
  delay?: number;
  duration?: number;
  className?: string;
}

export function SiteHeader({ delay = 0, duration = 0.8, className = "" }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Active state underlines the text with a primary brand color
  const getLinkClasses = (path: string) => {
    return isActive(path)
      ? "text-[#f3b5a1] relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] auto after:bg-[#f3b5a1]"
      : "hover:text-[#f3b5a1] transition-colors";
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay }}
        className={`relative z-50 flex justify-between items-center px-6 md:px-12 py-6 max-w-[1400px] mx-auto w-full ${className}`}
      >
        <div 
          className="text-3xl font-medium tracking-wide cursor-pointer" 
          style={{ fontFamily: "var(--font-italiana)" }} 
          onClick={() => router.push('/')}
        >
          Prism
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10 text-[15px] font-light tracking-wide font-sans">
          <Link href="/" className={getLinkClasses('/')}>Home</Link>
          <Link href="/gallery" className={getLinkClasses('/gallery')}>Gallery</Link>
          <Link href="/about" className={getLinkClasses('/about')}>About</Link>
          <Link href="/contact" className={getLinkClasses('/contact')}>Contact</Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-6 items-center">
          {user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 rounded-full border border-white/30 hover:bg-white hover:text-[#233529] transition-all font-light tracking-wide text-sm flex items-center gap-2"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 rounded-full bg-white text-[#233529] hover:bg-white/90 transition-all font-medium tracking-wide text-sm"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-white hover:text-[#f3b5a1] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-x-0 top-[88px] z-40 bg-[#0a0f0d]/95 backdrop-blur-3xl border-b border-white/10 px-6 py-8 flex flex-col gap-8 shadow-2xl overflow-hidden"
          >
            <nav className="flex flex-col gap-6 text-xl font-light tracking-wide font-sans">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/')}>Home</Link>
              <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/gallery')}>Gallery</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/about')}>About</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={getLinkClasses('/contact')}>Contact</Link>
            </nav>
            <div className="pt-6 border-t border-white/10">
              {user ? (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); router.push('/dashboard'); }}
                  className="w-full py-3 rounded-full border border-white/30 hover:bg-white hover:text-[#233529] transition-all font-medium tracking-wide text-lg text-center"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}
                  className="w-full py-3 rounded-full bg-white text-[#233529] hover:bg-white/90 transition-all font-medium tracking-wide text-lg text-center"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
