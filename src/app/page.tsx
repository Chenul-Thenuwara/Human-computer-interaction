"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, go directly to design page
        router.push("/design/new");
      } else {
        // User is not logged in, show splash screen
        router.push("/home");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  return null;
}
