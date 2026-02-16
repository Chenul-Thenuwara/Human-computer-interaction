"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { signUp } from "../../lib/firebase";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const resp = await signUp(email, password);
      alert("Account created: " + (resp.user?.email ?? "(no-email)"));
      // You can redirect to login or dashboard here
    } catch (err: any) {
      setError(err?.message ?? "Sign up failed");
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
