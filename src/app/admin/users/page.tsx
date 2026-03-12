// User Management Page
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  LogOut,
  User,
  Settings,
  Sofa,
  Home,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "designer" | "user";
  joinedDate: string;
  status: "active" | "inactive";
}

export default function AdminPage() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null);
  const [userToChangeStatus, setUserToChangeStatus] = useState<User | null>(
    null,
  );

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, isAdmin, router]);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);

        const fetchedUsers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.displayName || data.email?.split("@")[0] || "Unknown",
            email: data.email || "",
            role: data.role || "user",
            joinedDate:
              data.createdAt?.toDate?.().toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0],
            status: data.status || "active",
            uid: data.uid || doc.id,
          };
        });

        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    // Wait until auth has resolved, then fetch
    if (!loading && user) {
      fetchUsers();
    }
  }, [user, loading]);

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
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: false,
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: User,
      active: true,
    },
    {
      href: "/admin/furniture",
      label: "Furniture",
      icon: Sofa,
      active: false,
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: false,
    },
  ];

  // Toggle user role
  const handleRoleClick = (user: User) => {
    setUserToChangeRole(user);
    setShowRoleModal(true);
  };

  const confirmRoleChange = async (newRole: "admin" | "designer" | "user") => {
    if (!userToChangeRole) return;

    try {
      const userRef = doc(db, "users", userToChangeRole.id);
      await updateDoc(userRef, {
        role: newRole,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userToChangeRole.id ? { ...user, role: newRole } : user,
        ),
      );
      setShowRoleModal(false);
      setUserToChangeRole(null);
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const cancelRoleChange = () => {
    setShowRoleModal(false);
    setUserToChangeRole(null);
  };

  // Toggle user status
  const handleStatusClick = (user: User) => {
    setUserToChangeStatus(user);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!userToChangeStatus) return;

    const newStatus =
      userToChangeStatus.status === "active" ? "inactive" : "active";

    try {
      const userRef = doc(db, "users", userToChangeStatus.id);
      await updateDoc(userRef, {
        status: newStatus,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userToChangeStatus.id
            ? { ...user, status: newStatus }
            : user,
        ),
      );
      setShowStatusModal(false);
      setUserToChangeStatus(null);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
  };

  const cancelStatusChange = () => {
    setShowStatusModal(false);
    setUserToChangeStatus(null);
  };

  // Delete user
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const userRef = doc(db, "users", userToDelete.id);
      await deleteDoc(userRef);

      // Update local state
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    activeUsers: users.filter((u) => u.status === "active").length,
  };

  // All users sorted by join date (newest first)
  const sortedUsers = [...users].sort((a, b) =>
    new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
  );

  // Framer Motion Animation Variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
      {/* Decorative gradient orbs for ambient lighting (Matches Gallery & Design Studio) */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* ── Sidebar ── */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex flex-col w-64 flex-shrink-0 h-screen backdrop-blur-xl bg-black/20 border-r border-white/10 overflow-y-auto"
        >
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#f3b5a1]" />
            </div>
            <span
              className="text-lg font-medium tracking-wide text-white"
              style={{ fontFamily: "var(--font-italiana)" }}
            >
              Prism Admin
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navLinks.map(({ href, label, icon: Icon, active }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all ${
                  active
                    ? "bg-white/10 text-[#f3b5a1] border border-white/10"
                    : "text-[#a8b5b1] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>

          {/* User info at bottom */}
          <div className="px-4 py-5 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#f3b5a1]/20 border border-[#f3b5a1]/30 flex items-center justify-center text-[#f3b5a1] text-sm font-medium overflow-hidden">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (user.displayName || user.email)?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {user.displayName || user.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">
                  Admin
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#a8b5b1] hover:text-white hover:bg-white/5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </motion.aside>

        {/* ── Main Content ── */}
        <div className="flex-1 h-screen overflow-y-auto py-8 px-4 md:px-8 lg:px-12">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <motion.div variants={fadeUp} className="mb-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                <svg
                  className="w-8 h-8 text-[#f3b5a1]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h1 className="text-5xl font-medium tracking-tight text-white mb-2" style={{ fontFamily: "var(--font-italiana)" }}>
                User Management
              </h1>
              <p className="text-lg text-white/60 font-light">
                Manage users and their permissions
              </p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div variants={fadeUp} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/50 font-medium mb-3">
                      Total Users
                    </p>
                    <p className="text-5xl text-[#f3b5a1]" style={{ fontFamily: "var(--font-italiana)" }}>
                      {stats.total}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                    <svg
                      className="w-7 h-7 text-[#f3b5a1]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50 font-medium mb-3">
                    Admins
                  </p>
                  <p className="text-5xl text-[#f3b5a1]" style={{ fontFamily: "var(--font-italiana)" }}>
                    {stats.admins}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <svg
                    className="w-7 h-7 text-[#8a9d96]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50 font-medium mb-3">
                    Active Users
                  </p>
                  <p className="text-5xl text-[#f3b5a1]" style={{ fontFamily: "var(--font-italiana)" }}>
                    {stats.activeUsers}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                  <svg
                    className="w-7 h-7 text-[#8a9d96]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Users Table */}
            <motion.div variants={fadeUp} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/20 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#a8b5b1] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#a8b5b1] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#a8b5b1] uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/50 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loadingUsers ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-32"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-16"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-white/10 rounded w-24 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : sortedUsers.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-white/40">No users found</td></tr>
                  ) : sortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-[#f3b5a1] font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-white/50">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-white/10 text-[#f3b5a1] border-[#f3b5a1]/30"
                              : user.role === "designer"
                              ? "bg-[#8ea37e]/10 text-[#8ea37e] border-[#8ea37e]/30"
                              : "bg-white/5 text-white/70 border-white/10"
                          }`}
                        >
                          {user.role === "admin" ? "⭐ Admin" : user.role === "designer" ? "🎨 Designer" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${
                            user.status === "active"
                              ? "bg-primary/20 text-[#8ea37e] border-primary/30"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/50 font-light">
                        {user.joinedDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRoleClick(user)}
                            className="px-3 py-2 text-xs font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            title="Change Role"
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => handleStatusClick(user)}
                            className="px-3 py-2 text-xs font-medium text-white bg-transparent border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            {user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="px-3 py-2 text-xs font-medium text-red-400 bg-transparent border border-white/10 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedUsers.length === 0 && !loadingUsers && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-white/20 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-white/50">No users found</p>
              </div>
            )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#10251f]/90 rounded-2xl p-8 border border-white/10 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-3 font-serif" style={{ fontFamily: "var(--font-italiana)" }}>
              Delete User
            </h2>
            <p className="text-white/60 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {userToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-3 bg-transparent border border-white/20 text-white/70 rounded-xl hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Confirmation Modal */}
      {showRoleModal && userToChangeRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#10251f]/90 rounded-2xl p-8 border border-white/10 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-[#f3b5a1]" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-3 font-serif" style={{ fontFamily: "var(--font-italiana)" }}>
              Change User Role
            </h2>
            <p className="text-white/60 text-center mb-6">
              Select a new role for{" "}
              <span className="font-semibold text-white">
                {userToChangeRole.name}
              </span>
              . Current role: <span className="capitalize">{userToChangeRole.role}</span>.
            </p>

            <div className="flex flex-col gap-3">
              {(["admin", "designer", "user"] as const).map((r) => (
                <button
                  key={r}
                  disabled={userToChangeRole.role === r}
                  onClick={() => confirmRoleChange(r)}
                  className={`px-4 py-3 rounded-xl transition-all font-medium capitalize ${
                    userToChangeRole.role === r 
                      ? "bg-white/5 text-white/30 cursor-not-allowed" 
                      : "bg-white/10 text-white border border-white/20 hover:bg-[#f3b5a1] hover:text-[#233529] hover:border-[#f3b5a1]"
                  }`}
                >
                  Make {r}
                </button>
              ))}
              <button
                onClick={cancelRoleChange}
                className="mt-2 px-4 py-3 bg-transparent border border-white/20 text-white/70 rounded-xl hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {showStatusModal && userToChangeStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#10251f]/90 rounded-2xl p-8 border border-white/10 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center border border-white/10 ${
                  userToChangeStatus.status === "active"
                    ? "bg-orange-500/10"
                    : "bg-primary/10"
                }`}
              >
                <svg
                  className={`w-8 h-8 ${
                    userToChangeStatus.status === "active"
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {userToChangeStatus.status === "active" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-3 font-serif" style={{ fontFamily: "var(--font-italiana)" }}>
              {userToChangeStatus.status === "active"
                ? "Deactivate User"
                : "Activate User"}
            </h2>
            <p className="text-white/60 text-center mb-6">
              Are you sure you want to{" "}
              {userToChangeStatus.status === "active"
                ? "deactivate"
                : "activate"}{" "}
              <span className="font-semibold text-white">
                {userToChangeStatus.name}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelStatusChange}
                className="flex-1 px-4 py-3 bg-transparent border border-white/20 text-white/70 rounded-xl hover:bg-white/5 hover:text-white transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 px-4 py-3 text-white rounded-xl shadow-lg transition-all font-medium ${
                  userToChangeStatus.status === "active"
                    ? "bg-orange-500/80 hover:bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                    : "bg-[#8ea37e] hover:bg-[#9eb38e] shadow-[0_0_20px_rgba(142,163,126,0.2)]"
                }`}
              >
                {userToChangeStatus.status === "active"
                  ? "Deactivate"
                  : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
