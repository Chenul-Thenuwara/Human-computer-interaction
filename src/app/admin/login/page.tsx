"use client";

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { signIn, getUserRole, signOut } from "../../../lib/firebase";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!authLoading && user && !submitting && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [user, authLoading, router, submitting, isAdmin]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSubmitting(true);

    try {
      const credential = await signIn(email, password);

      let role: string | null = null;
      try {
        role = await getUserRole(credential.user.uid);
      } catch {
        // null
      }

      if (role !== "admin") {
        await signOut();
        localStorage.removeItem("loginTime");
        setError("Access denied. This account does not have admin privileges.");
        setLoading(false);
        setSubmitting(false);
        return;
      }

      localStorage.setItem("loginTime", Date.now().toString());
      router.replace("/admin/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Login failed");
    } finally {
      if (!error) setLoading(false);
      setSubmitting(false);
    }
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
          alt="Modern interior design"
          fill
          className="object-cover grayscale brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-black/80 pointer-events-none" />
      </div>

      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-red-800/10 rounded-full blur-3xl pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-8 left-8 md:left-12 z-20"
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Home
        </Button>
      </motion.div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="backdrop-blur-xl bg-black/50 border border-white/5 shadow-2xl rounded-2xl p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none" />

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-red-300" />
            </div>
            <h1
              className="text-4xl font-medium tracking-wide mt-2 text-white/90"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              System Admin
            </h1>
            <p className="text-sm text-white/40 font-light">Secure Administrator Access</p>
          </motion.div>

          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-5 relative z-10"
          >
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Email
              </label>
              <Input
                className="w-full px-4 py-6 bg-black/50 border-white/10 text-white placeholder:text-white/30 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-red-400 focus-visible:border-red-400 transition-all hover:bg-black/60 text-base"
                placeholder="admin@prism.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                 Password
              </label>
              <Input
                className="w-full px-4 py-6 bg-black/50 border-white/10 text-white placeholder:text-white/30 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-red-400 focus-visible:border-red-400 transition-all hover:bg-black/60 text-base"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
              <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black transition-all font-medium tracking-wide text-[15px]"
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Login"}
              </Button>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 text-center mt-2"
              >
                {error}
              </motion.p>
            )}
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
