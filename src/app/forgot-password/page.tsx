"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { resetPassword } from "../../lib/firebase";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Failed to send reset email");
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
          src="https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=2000&auto=format&fit=crop"
          alt="Modern interior"
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
          onClick={() => router.push('/login')}
          className="text-white hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
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
            <h1 className="text-4xl font-medium tracking-wide mt-2" style={{ fontFamily: "var(--font-italiana)" }}>Reset Password</h1>
            <p className="text-sm text-white/60 font-light text-center">
              Enter your email and we&apos;ll send you a link to reset your password
            </p>
          </motion.div>

          {success ? (
            <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-full bg-[#f3b5a1]/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-[#f3b5a1]" />
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <p className="text-[15px] text-white/90 text-center font-light leading-relaxed">
                  We&apos;ve sent a password reset link to <br/>
                  <span className="font-medium text-white">{email}</span>
                </p>
              </div>
              
              <Link
                href="/login"
                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all font-medium tracking-wide text-[15px] text-center mt-2 border border-white/10"
              >
                Return to Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/80 uppercase tracking-wider">Email Address</label>
                <Input
                  className="w-full px-4 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl backdrop-blur-md focus-visible:ring-1 focus-visible:ring-[#f3b5a1]/50 focus-visible:border-[#f3b5a1]/50 transition-all hover:bg-white/10 text-base"
                  placeholder="designer@prism.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </motion.div>

              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 text-center mt-2">{error}</motion.p>}
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
