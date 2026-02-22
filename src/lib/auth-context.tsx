"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, signOut, getUserRole, createUserProfile } from "./firebase";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      localStorage.removeItem("loginTime");
      setUser(null);
      setIsAdmin(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // User is signed in
        const loginTime = localStorage.getItem("loginTime");
        const now = Date.now();

        if (loginTime) {
          const timeDiff = now - parseInt(loginTime);
          const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

          if (timeDiff > sevenDays) {
            // Session expired after 7 days
            handleLogout();
            return;
          }
        } else {
          // Set login time if not already set
          localStorage.setItem("loginTime", now.toString());
        }

        // Fetch role from Firestore
        let role = await getUserRole(user.uid);

        // Auto-create a profile for existing users who signed up before the
        // role system was introduced (role will be null if no doc exists).
        // Wrapped in try/catch so a Firestore permission error never blocks login.
        if (role === null) {
          try {
            await createUserProfile(
              user.uid,
              user.email ?? "",
              "user",
              user.displayName ?? undefined
            );
          } catch (e) {
            console.warn("Could not create user profile in Firestore:", e);
          }
          role = "user";
        }

        setIsAdmin(role === "admin");
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem("loginTime");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [handleLogout]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
