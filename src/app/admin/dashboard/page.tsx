"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { LogOut, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e1713] text-white">
        <p className="text-white/50 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#0e1713] text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#f3b5a1]" />
            <span
              className="text-xl font-medium tracking-wide"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              Prism Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 hidden sm:block">{user.email}</span>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#f3b5a1]/10 border border-[#f3b5a1]/20 flex items-center justify-center">
            <ShieldCheck className="w-9 h-9 text-[#f3b5a1]" />
          </div>
          <h1
            className="text-5xl font-medium tracking-wide"
            style={{ fontFamily: "var(--font-italiana)" }}
          >
            Welcome to Admin Panel
          </h1>
          <p className="text-white/50 text-sm max-w-sm">
            You are signed in as <span className="text-white/80">{user.email}</span>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
