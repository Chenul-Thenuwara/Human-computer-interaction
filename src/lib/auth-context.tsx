"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, signOut } from "./firebase";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      localStorage.removeItem("loginTime");
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router]);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((user) => {
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

        setUser(user);
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem("loginTime");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [handleLogout]);

  return (
    <AuthContext.Provider value={{ user, loading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
