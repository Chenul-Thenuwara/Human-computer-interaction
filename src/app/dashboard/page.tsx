"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DesignerDashboard from "./DesignerDashboard";
import UserDashboard from "./UserDashboard";

export default function DashboardPage() {
  const { user, loading, isAdmin, isDesigner } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (isAdmin) {
        router.replace("/admin/dashboard");
      }
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0e1713]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-[#f3b5a1] border-white/10" />
      </div>
    );
  }

  // Render the appropriate dashboard based on role
  if (isDesigner) {
    return <DesignerDashboard />;
  }

  return <UserDashboard />;
}