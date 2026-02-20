"use client";

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { signUp, signInWithGoogle } from "../../lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      // Set login timestamp in localStorage
      localStorage.setItem("loginTime", Date.now().toString());
      // Redirect to design page after successful signup
      router.push("/design/new");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // Set login timestamp in localStorage
      localStorage.setItem("loginTime", Date.now().toString());
      // Redirect to design page after successful signup
      router.push("/design/new");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Google Sign-up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="login-card rounded-2xl p-8 md:p-10">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-white/6 p-4">
              <Image src="/sofa-icon.svg" alt="logo" width={48} height={48} />
            </div>
            <h1 className="text-3xl font-semibold">Create Account</h1>
            <p className="text-sm small-muted">Join Prism Designer today</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <label className="text-sm">Email</label>
            <input
              className="input-ghost rounded-md px-4 py-3 text-sm placeholder:text-white/40"
              placeholder="designer@prism.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />

            <label className="text-sm">Password</label>
            <input
              className="input-ghost rounded-md px-4 py-3 text-sm placeholder:text-white/40"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
            />

            <label className="text-sm">Confirm Password</label>
            <input
              className="input-ghost rounded-md px-4 py-3 text-sm placeholder:text-white/40"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              minLength={6}
            />

            <button
              type="submit"
              className="btn-accent rounded-md py-3 text-sm font-medium mt-2"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            {error && <p className="text-xs text-red-300">{error}</p>}

            <div className="mt-4 flex items-center justify-between">
              <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
              <span className="text-xs text-center text-white/50 uppercase">or continue with</span>
              <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </button>

            <p className="mt-3 text-center text-xs small-muted">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-white/80 hover:text-white underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
