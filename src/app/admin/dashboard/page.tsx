"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, LogOut, Users, LayoutDashboard, Settings, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminDashboard() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        // Non-admins get booted back to the user dashboard
        router.push("/dashboard");
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e1713]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-t-[#f3b5a1] border-white/10"
        />
      </div>
    );
  }

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
    { href: "/admin/users", label: "Users", icon: Users, active: false },
    { href: "/admin/settings", label: "Settings", icon: Settings, active: false },
  ];

  const stats = [
    { label: "Total Users", value: "—", icon: Users, color: "text-[#f3b5a1]", bg: "bg-[#f3b5a1]/10" },
    { label: "Total Designs", value: "—", icon: LayoutDashboard, color: "text-[#9fbda9]", bg: "bg-[#9fbda9]/10" },
    { label: "Growth", value: "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Active Sessions", value: "1", icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-400/10" },
  ];

  return (
    <div className="min-h-screen bg-[#0e1713] text-white flex">
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col w-64 min-h-screen border-r border-white/10 bg-white/[0.02] sticky top-0 h-screen"
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f3b5a1]/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#f3b5a1]" />
          </div>
          <span className="text-lg font-medium tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>
            Prism Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navLinks.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all ${active
                  ? "bg-[#f3b5a1]/15 text-[#f3b5a1] border border-[#f3b5a1]/20"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-5 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#f3b5a1]/20 flex items-center justify-center text-[#f3b5a1] text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.displayName || user.email?.split("@")[0]}</p>
              <p className="text-[10px] text-[#f3b5a1] uppercase tracking-wider">Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-b border-white/10 bg-white/[0.02] backdrop-blur-md sticky top-0 z-20"
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium tracking-wide" style={{ fontFamily: "var(--font-italiana)" }}>
                Dashboard
              </h1>
              <p className="text-xs text-white/40 mt-0.5">Overview of your Prism platform</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 hidden sm:block">{user.email}</span>
              <div className="w-8 h-8 rounded-full bg-[#f3b5a1]/20 flex items-center justify-center text-[#f3b5a1] text-sm font-medium">
                {user.email?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page content */}
        <main className="flex-1 p-6 md:p-10 space-y-10">
          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className={`text-3xl font-medium ${stat.color}`} style={{ fontFamily: "var(--font-italiana)" }}>
                  {stat.value}
                </p>
                <p className="text-xs text-white/40 mt-1 uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Role Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl font-medium mb-6" style={{ fontFamily: "var(--font-jacques-francois)" }}>
              Role Permissions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* User role */}
              <div className="rounded-xl border border-[#9fbda9]/20 bg-[#9fbda9]/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#9fbda9]/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#9fbda9]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#9fbda9]">User</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Default role</p>
                  </div>
                </div>
                <ul className="text-xs text-white/60 space-y-1.5 font-light">
                  <li>✓ View and create room designs</li>
                  <li>✓ Save up to 10 designs</li>
                  <li>✓ Access furniture gallery</li>
                  <li>✗ Cannot access admin panel</li>
                  <li>✗ Cannot manage other users</li>
                </ul>
              </div>

              {/* Admin role */}
              <div className="rounded-xl border border-[#f3b5a1]/20 bg-[#f3b5a1]/5 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#f3b5a1]/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#f3b5a1]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f3b5a1]">Admin</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Elevated role</p>
                  </div>
                </div>
                <ul className="text-xs text-white/60 space-y-1.5 font-light">
                  <li>✓ All user permissions</li>
                  <li>✓ Access admin dashboard</li>
                  <li>✓ View all users and designs</li>
                  <li>✓ Manage user roles</li>
                  <li>✓ Unlimited designs</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* How to assign admin role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-xl font-medium mb-4" style={{ fontFamily: "var(--font-jacques-francois)" }}>
              Assigning the Admin Role
            </h2>
            <p className="text-sm text-white/50 font-light mb-5">
              New users always receive the <span className="text-[#9fbda9]">user</span> role automatically when they sign up. To promote a user to admin, update their Firestore document:
            </p>
            <div className="bg-black/30 rounded-xl p-4 text-xs font-mono text-white/70 space-y-1 border border-white/10">
              <p className="text-white/40">{`// Firestore > users > {uid}`}</p>
              <p><span className="text-[#f3b5a1]">role</span>: <span className="text-[#9fbda9]">&quot;admin&quot;</span></p>
            </div>
            <p className="text-xs text-white/30 mt-3 font-light">
              Changes take effect the next time the user logs in.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
