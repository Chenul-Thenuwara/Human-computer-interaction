"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  ShieldCheck,
  LogOut,
  Users,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
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
  role: "admin" | "user";
  joinedDate: string;
  status: "active" | "inactive";
}

export default function AdminPage() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");

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

    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  if (loading || !user || !isAdmin || loadingUsers) {
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
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: true,
    },
    { href: "/admin/users", label: "Users", icon: Users, active: false },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: Settings,
      active: false,
    },
  ];

  // Toggle user role
  const toggleUserRole = async (userId: string) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;

    const newRole = userToUpdate.role === "admin" ? "user" : "admin";

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId: string) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;

    const newStatus = userToUpdate.status === "active" ? "inactive" : "active";

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: newStatus,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to update user status");
    }
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

  // Add new user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      joinedDate: new Date().toISOString().split("T")[0],
      status: "active",
    };
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "user" });
    setShowAddUserModal(false);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    activeUsers: users.filter((u) => u.status === "active").length,
  };

  return (
    <div className="min-h-screen bg-[#0e1713] text-white flex">
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-col w-64 min-h-screen border-r border-[#4a5d5a] bg-[#10251f] sticky top-0 h-screen"
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#4a5d5a] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8a9d96]/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#8a9d96]" />
          </div>
          <span
            className="text-lg font-medium tracking-wide text-[#a8b5b1]"
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
                  ? "bg-[#8a9d96]/15 text-[#8a9d96] border border-[#8a9d96]/20"
                  : "text-[#a8b5b1] hover:bg-[#2d3e3c] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-5 border-t border-[#4a5d5a]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#8a9d96]/20 flex items-center justify-center text-[#8a9d96] text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user.displayName || user.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-[#8a9d96] uppercase tracking-wider">
                Admin
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#a8b5b1] hover:text-white hover:bg-[#2d3e3c] transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-h-screen bg-[#10251f] py-8 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#4a5d5a] rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#8a9d96]"
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
            <h1 className="text-5xl font-serif font-normal text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-[#a8b5b1]">
              Manage users and administrative access
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#2d3e3c] rounded-2xl p-6 border border-[#4a5d5a]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a8b5b1] font-medium mb-3">
                    Total Users
                  </p>
                  <p className="text-5xl font-serif text-[#8a9d96]">
                    {stats.total}
                  </p>
                </div>
                <div className="w-14 h-14 bg-[#4a5d5a] rounded-full flex items-center justify-center">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-[#2d3e3c] rounded-2xl p-6 border border-[#4a5d5a]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a8b5b1] font-medium mb-3">
                    Admins
                  </p>
                  <p className="text-5xl font-serif text-[#8a9d96]">
                    {stats.admins}
                  </p>
                </div>
                <div className="w-14 h-14 bg-[#4a5d5a] rounded-full flex items-center justify-center">
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
            </div>

            <div className="bg-[#2d3e3c] rounded-2xl p-6 border border-[#4a5d5a]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#a8b5b1] font-medium mb-3">
                    Active Users
                  </p>
                  <p className="text-5xl font-serif text-[#8a9d96]">
                    {stats.activeUsers}
                  </p>
                </div>
                <div className="w-14 h-14 bg-[#4a5d5a] rounded-full flex items-center justify-center">
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
            </div>
          </div>

          {/* Actions Bar */}
          <div className="bg-[#2d3e3c] rounded-2xl p-6 border border-[#4a5d5a] mb-8">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-11 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96]"
                  />
                  <svg
                    className="w-5 h-5 text-[#7a8984] absolute left-3.5 top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Filter */}
                <select
                  value={filterRole}
                  onChange={(e) =>
                    setFilterRole(e.target.value as "all" | "admin" | "user")
                  }
                  className="px-4 py-3 bg-[#1a2d2a] border-2 border-[#4a5d5a] rounded-xl text-white focus:outline-none focus:border-[#8a9d96] focus:ring-1 focus:ring-[#8a9d96]"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
              </div>

              {/* Add User Button */}
              <button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#8a9d96] text-white rounded-xl hover:bg-[#7a8d86] transition-all font-medium shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#2d3e3c] rounded-2xl border border-[#4a5d5a] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a2d2a] border-b border-[#4a5d5a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#a8b5b1] uppercase tracking-wider">
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
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[#a8b5b1] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4a5d5a]">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#3a4d4a] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#8a9d96] flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-[#a8b5b1]">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-[#8a9d96] text-white"
                              : "bg-[#4a5d5a] text-[#a8b5b1]"
                          }`}
                        >
                          {user.role === "admin" ? "⭐ Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${
                            user.status === "active"
                              ? "bg-[#8a9d96] text-white"
                              : "bg-[#4a5d5a] text-[#a8b5b1]"
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#a8b5b1]">
                        {user.joinedDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleUserRole(user.id)}
                            className="px-3 py-2 text-xs font-medium text-white bg-[#8a9d96] rounded-lg hover:bg-[#7a8d86] transition-colors"
                            title={
                              user.role === "admin"
                                ? "Remove admin"
                                : "Make admin"
                            }
                          >
                            {user.role === "admin"
                              ? "Remove Admin"
                              : "Make Admin"}
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="px-3 py-2 text-xs font-medium text-[#a8b5b1] bg-[#4a5d5a] rounded-lg hover:bg-[#5a6d6a] transition-colors"
                          >
                            {user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="px-3 py-2 text-xs font-medium text-[#a8b5b1] bg-[#4a5d5a] rounded-lg hover:bg-[#5a6d6a] transition-colors"
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-[#4a5d5a] mx-auto mb-4"
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
                <p className="text-[#a8b5b1]">No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-[#2d3e3c] to-[#1a2d2a] rounded-2xl p-8 border-2 border-[#6b7f78] w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Add New User</h2>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-[#7a8984] hover:text-white transition-colors"
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#a8b5b1] mb-3">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#6b7f78] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-2 focus:ring-[#8a9d96] focus:ring-opacity-20 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#a8b5b1] mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#6b7f78] rounded-xl text-white placeholder-[#7a8984] focus:outline-none focus:border-[#8a9d96] focus:ring-2 focus:ring-[#8a9d96] focus:ring-opacity-20 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#a8b5b1] mb-3">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value as "admin" | "user",
                      })
                    }
                    className="w-full px-4 py-3 bg-[#1a2d2a] border-2 border-[#6b7f78] rounded-xl text-white focus:outline-none focus:border-[#8a9d96] focus:ring-2 focus:ring-[#8a9d96] focus:ring-opacity-20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 px-4 py-3 bg-transparent border-2 border-[#6b7f78] text-[#a8b5b1] rounded-xl hover:bg-[#2d3e3c] hover:border-[#8a9d96] hover:text-white transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#8a9d96] text-white rounded-xl hover:bg-[#7a8d86] hover:shadow-lg transition-all font-semibold"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-b from-[#2d3e3c] to-[#1a2d2a] rounded-2xl p-8 border-2 border-[#6b7f78] w-full max-w-md shadow-2xl">
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

              <h2 className="text-2xl font-bold text-white text-center mb-3">
                Delete User
              </h2>
              <p className="text-[#a8b5b1] text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {userToDelete.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-transparent border-2 border-[#6b7f78] text-[#a8b5b1] rounded-xl hover:bg-[#2d3e3c] hover:border-[#8a9d96] hover:text-white transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg transition-all font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
