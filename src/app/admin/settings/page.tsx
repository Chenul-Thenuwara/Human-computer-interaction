"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ShieldCheck,
  LogOut,
  User,
  Settings,
  Sofa,
  Home,
  Camera,
  Save,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db, storage } from "@/lib/firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminSettingsPage() {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const navLinks = useMemo(
    () => [
      { href: "/admin/users", label: "Users", icon: User, active: false },
      { href: "/admin/furniture", label: "Furniture", icon: Sofa, active: false },
      { href: "/admin/settings", label: "Settings", icon: Settings, active: true },
    ],
    [],
  );

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      } else {
        setDisplayName(user.displayName || "");
        if (user.photoURL) setPhotoPreview(user.photoURL);
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

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const uploadPhoto = async (file: File) => {
    const storageRef = ref(storage, `profile-photos/${user.uid}_${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileError(null);
    setProfileMessage(null);
    setProfileSaving(true);

    try {
      let photoURL = user.photoURL || null;
      if (photoFile) {
        photoURL = await uploadPhoto(photoFile);
      }

      await updateProfile(user, {
        displayName: displayName.trim() || null,
        photoURL: photoURL ?? undefined,
      });

      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim() || null,
        photoURL: photoURL ?? null,
      });

      setProfileMessage("Profile updated.");
      if (photoURL) setPhotoPreview(photoURL);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update profile.";
      console.error("Profile update error", error);
      setProfileError(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) {
      setPasswordError("Password change requires an email/password account.");
      return;
    }
    setPasswordError(null);
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPasswordMessage("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update password.";
      console.error("Password update error", error);
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex flex-col w-64 flex-shrink-0 h-screen backdrop-blur-xl bg-black/20 border-r border-white/10 overflow-y-auto"
        >
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
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
            <Link
              href="/"
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-[#a8b5b1] hover:text-white hover:bg-white/10 transition-all"
              aria-label="Go to home"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>

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
                <p className="text-[10px] text-white/50 uppercase tracking-wider mt-0.5">Admin</p>
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

        <div className="flex-1 h-screen overflow-y-auto py-8 px-4 md:px-8 lg:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto space-y-8"
          >
            <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="w-14 h-14 mb-3 bg-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                  <Settings className="w-7 h-7 text-[#f3b5a1]" />
                </div>
                <h1 className="text-4xl font-medium tracking-tight text-white" style={{ fontFamily: "var(--font-italiana)" }}>
                  Settings
                </h1>
                <p className="text-white/60 font-light">Update your admin profile and password.</p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-4 h-4 text-[#f3b5a1]" />
                  <h2 className="text-lg font-medium text-white">Profile</h2>
                </div>
                {profileMessage && (
                  <div className="mb-3 p-3 rounded-xl border border-primary/30 bg-primary/10 text-[#8ea37e] text-sm">
                    {profileMessage}
                  </div>
                )}
                {profileError && (
                  <div className="mb-3 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
                    {profileError}
                  </div>
                )}
                <form className="space-y-4 relative z-10" onSubmit={handleProfileSave}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
                      {photoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/60 text-sm">No photo</span>
                      )}
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 cursor-pointer text-sm">
                      <UploadIcon />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPhotoFile(e.target.files[0]);
                            setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/70">Username</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. harindu"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                    />
                    <p className="text-xs text-white/40">Shown instead of email in the dashboard.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {profileSaving ? "Saving..." : "Save profile"}
                  </button>
                </form>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-4 h-4 text-[#f3b5a1]" />
                  <h2 className="text-lg font-medium text-white">Change Password</h2>
                </div>
                {passwordMessage && (
                  <div className="mb-3 p-3 rounded-xl border border-primary/30 bg-primary/10 text-[#8ea37e] text-sm">
                    {passwordMessage}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-3 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
                    {passwordError}
                  </div>
                )}
                <form className="space-y-4 relative z-10" onSubmit={handlePasswordSave}>
                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/70">Current password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/70">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-light text-white/70">Confirm new password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#f3b5a1]/50 focus:border-transparent transition-all font-light"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-[#233529] hover:bg-white/90 transition-all text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {passwordSaving ? "Updating..." : "Update password"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0-8l-3 3m3-3l3 3M12 12V4m0 0L9 7m3-3l3 3" />
    </svg>
  );
}
