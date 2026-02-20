"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { resetPassword } from "../../lib/firebase";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="login-card rounded-2xl p-8 md:p-10"
        >
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-white/6 p-4">
              <Image src="/sofa-icon.svg" alt="logo" width={48} height={48} />
            </div>
            <h1 className="text-3xl font-semibold">Reset Password</h1>
            <p className="text-sm small-muted text-center">
              Enter your email and we&apos;ll send you a link to reset your
              password
            </p>
          </motion.div>

          {success ? (
            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
                <p className="text-sm text-green-300 text-center">
                  Password reset email sent! Check your inbox and follow the
                  link to reset your password.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="btn-accent rounded-md py-3 text-sm font-medium text-center mt-2 block w-full transition-all"
                >
                  Back to Sign In
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <label className="text-sm">Email</label>
              <input
                className="input-ghost rounded-md px-4 py-3 text-sm placeholder:text-white/40 transition-colors focus:outline-none focus:border-white/20 focus:bg-white/5"
                placeholder="designer@prism.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-accent rounded-md py-3 text-sm font-medium mt-2 transition-all"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>

              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-300">{error}</motion.p>}

              <Link
                href="/login"
                className="mt-3 text-center text-xs small-muted hover:text-white/80 transition-all"
              >
                ← Back to Sign In
              </Link>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
