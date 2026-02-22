"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Home, Settings, Camera, Save, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { db, storage } from "@/lib/firebase";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function DesignerSettingsPage() {
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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (isAdmin) {
        router.replace("/admin/dashboard");
      } else {
        setDisplayName(user.displayName || "");
        if (user.photoURL) setPhotoPreview(user.photoURL);
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || isAdmin) {
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
    } catch (error: any) {
      console.error("Profile update error", error);
      setProfileError(error?.message || "Failed to update profile.");
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
    } catch (error: any) {
      console.error("Password update error", error);
      setPasswordError(error?.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative text-white selection:bg-[#f3b5a1] selection:text-[#233529] overflow-hidden">
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#f3b5a1]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#f3b5a1]" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest">Designer</p>
                <h1 className="text-2xl font-medium" style={{ fontFamily: "var(--font-italiana)" }}>
                  Settings
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[#f3b5a1]/80 hover:text-[#f3b5a1] hover:bg-[#f3b5a1]/10 border border-white/10"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-6 lg:grid-cols-2"
          >
            <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
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
                  <p className="text-xs text-white/40">Shown instead of email across the dashboard.</p>
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
            </motion.div>

            <motion.div variants={fadeUp} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
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
            </motion.div>
          </motion.div>
        </main>
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
