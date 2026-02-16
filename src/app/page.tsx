"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { signIn } from "../lib/firebase";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await signIn(email, password);
      // simple success feedback — you can redirect here
      alert("Signed in: " + (resp.user?.email ?? "(no-email)"));
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message ?? "Sign in failed");
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
            <h1 className="text-3xl font-semibold">Prism Designer</h1>
            <p className="text-sm small-muted">
              Access your furniture design portfolio
            </p>
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

            <div className="flex items-center justify-between">
              <label className="text-sm">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-white/60 hover:text-white/80"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              className="input-ghost rounded-md px-4 py-3 text-sm placeholder:text-white/40"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />

            <button
              type="submit"
              className="btn-accent rounded-md py-3 text-sm font-medium mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {error && <p className="text-xs text-red-300">{error}</p>}

            <p className="mt-3 text-center text-xs small-muted">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-white/80 hover:text-white underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
