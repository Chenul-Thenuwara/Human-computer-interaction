"use client";

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { signIn } from "../../lib/firebase";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to design page
    if (!authLoading && user) {
      router.push("/design/new");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      // Set login timestamp in localStorage
      localStorage.setItem("loginTime", Date.now().toString());
      // Redirect to design page after successful login
      router.push("/design/new");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop"
          alt="Modern interior design"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#0e1713]/70 pointer-events-none" />
      </div>

      {/* Decorative gradient orbs for ambient lighting */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      
      {/* Back Button */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-8 left-8 md:left-12 z-20"
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
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
          className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 md:p-10 relative overflow-hidden"
        >
          {/* Subtle highlight inside card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none"></div>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 relative z-10">
            <h1 className="text-4xl font-medium tracking-wide mt-2" style={{ fontFamily: "var(--font-italiana)" }}>Welcome Back</h1>
            <p className="text-sm text-white/60 font-light">Sign in to Prism Designer</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wider">Email</label>
              <Input
                className="w-full px-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-[#f3b5a1]/50 focus-visible:border-[#f3b5a1]/50 transition-all hover:bg-white/10 text-base"
                placeholder="designer@prism.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-white/80 uppercase tracking-wider">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#f3b5a1]/80 hover:text-[#f3b5a1] hover:underline transition-all"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                className="w-full px-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-[#f3b5a1]/50 focus-visible:border-[#f3b5a1]/50 transition-all hover:bg-white/10 text-base"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4"
            >
              <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all font-medium tracking-wide text-[15px]"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </motion.div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 text-center mt-2">{error}</motion.p>}

            <p className="mt-6 text-center text-sm text-white/60 font-light">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-white hover:text-[#f3b5a1] transition-all font-medium ml-1">
                Sign up
              </Link>
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
