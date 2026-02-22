"use client";

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { signIn, getUserRole, signOut, signInWithGoogle, createUserProfile } from "../../lib/firebase";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, ShieldCheck } from "lucide-react";

export default function Login() {
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    // Only auto-redirect if the user was already logged in before visiting this page
    // (not during an active form submission)
    if (!authLoading && user && !submitting) {
      router.replace(isAdmin ? "/admin/dashboard" : "/dashboard");
    }
  }, [user, authLoading, router, submitting, isAdmin]);

  function handleTabSwitch(tab: "user" | "admin") {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSubmitting(true);

    try {
      const credential = await signIn(email, password);
      localStorage.setItem("loginTime", Date.now().toString());

      if (activeTab === "admin") {
        let role: string | null = null;
        try {
          role = await getUserRole(credential.user.uid);
        } catch {
          // Firestore permission error — treat as non-admin
        }
        if (role !== "admin") {
          await signOut();
          localStorage.removeItem("loginTime");
          setError("Access denied. This account does not have admin privileges.");
          setLoading(false);
          return;
        }
        router.push("/admin/users");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    setSubmitting(true);
    try {
      const credential = await signInWithGoogle();
      localStorage.setItem("loginTime", Date.now().toString());

      // Check role to determine where to redirect
      let role = await getUserRole(credential.user.uid);
      if (role === null) {
        // First-time Google sign-in — create profile
        try {
          await createUserProfile(credential.user.uid, credential.user.email ?? "", "user", credential.user.displayName ?? undefined);
        } catch { /* rules may not be deployed yet */ }
        role = "user";
      }

      router.push(role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Google Sign-in failed");
    } finally {
      setLoading(false);
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

  const isAdminTab = activeTab === "admin";

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

      {/* Decorative gradient orbs */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/15 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Back Button */}
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
          className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 md:p-10 relative overflow-hidden"
        >
          {/* Subtle highlight inside card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/5 blur-3xl rounded-full pointer-events-none" />

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 relative z-10">
            <h1
              className="text-4xl font-medium tracking-wide mt-2"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              Welcome Back
            </h1>
            <p className="text-sm text-white/60 font-light">Sign in to Prism Designer</p>
          </motion.div>

          {/* Role Tabs */}
          <motion.div
            variants={fadeUp}
            className="mt-6 flex rounded-xl bg-white/5 border border-white/10 p-1 gap-1 relative z-10"
          >
            <button
              type="button"
              onClick={() => handleTabSwitch("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${!isAdminTab
                ? "bg-white text-[#233529] shadow"
                : "text-white/60 hover:text-white"
                }`}
            >
              <User className="w-4 h-4" />
              User Login
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isAdminTab
                ? "bg-white text-[#233529] shadow"
                : "text-white/60 hover:text-white"
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Login
            </button>
          </motion.div>

          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-5 relative z-10"
          >
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80 uppercase tracking-wider">
                Email
              </label>
              <Input
                className="w-full px-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-[#f3b5a1]/50 focus-visible:border-[#f3b5a1]/50 transition-all hover:bg-white/10 text-base"
                placeholder={isAdminTab ? "admin@prism.com" : "designer@prism.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-white/80 uppercase tracking-wider">
                  Password
                </label>
                {!isAdminTab && (
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#f3b5a1]/80 hover:text-[#f3b5a1] hover:underline transition-all"
                  >
                    Forgot Password?
                  </Link>
                )}
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

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
              <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all font-medium tracking-wide text-[15px]"
                disabled={loading}
              >
                {loading ? "Signing In..." : isAdminTab ? "Sign In as Admin" : "Sign In"}
              </Button>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 text-center mt-2"
              >
                {error}
              </motion.p>
            )}

            {!isAdminTab && (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex-1 border-b border-white/10"></span>
                  <span className="text-xs text-white/50 uppercase">or continue with</span>
                  <span className="flex-1 border-b border-white/10"></span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continue with Google
                </button>

                <p className="mt-2 text-center text-sm text-white/60 font-light">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-white hover:text-[#f3b5a1] transition-all font-medium ml-1">
                    Sign up
                  </Link>
                </p>
              </>
            )}
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
