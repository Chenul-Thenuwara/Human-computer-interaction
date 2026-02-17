"use client";

import Image from "next/image";
import { useState, FormEvent, useEffect } from "react";
import { signIn } from "../../lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="login-card rounded-2xl p-8 md:p-10">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-white/6 p-4">
              <Image src="/sofa-icon.svg" alt="logo" width={48} height={48} />
            </div>
            <h1 className="text-3xl font-semibold">Welcome Back</h1>
            <p className="text-sm small-muted">Sign in to Prism Designer</p>
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
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-blue-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-accent rounded-md py-3 text-sm font-medium mt-2"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {error && <p className="text-xs text-red-300">{error}</p>}

            <p className="mt-3 text-center text-xs small-muted">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
