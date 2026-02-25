"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDesign, Design } from "@/lib/design-context";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Visualization3D } from "@/components/design/Visualization3D";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ViewDesignPage() {
  const router = useRouter();
  const { currentDesign, setCurrentDesign } = useDesign();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesign = async () => {
      const params = new URLSearchParams(window.location.search);
      const designId = params.get("id");

      if (!designId) {
        toast.error("No design ID found");
        router.push("/dashboard");
        return;
      }

      try {
        const docRef = doc(db, "designs", designId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedDesign = docSnap.data() as Design;
          // Ensure we inject the fetched ID
          setCurrentDesign({ ...fetchedDesign, id: docSnap.id });
        } else {
          toast.error("Design not found");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching design:", error);
        toast.error("Failed to load design");
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [router, setCurrentDesign]);

  if (loading || !currentDesign) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f3b5a1]/30 border-t-[#f3b5a1] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-white overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-card/70 border-b border-white/20 absolute top-0 left-0 right-0 z-20 shadow-lg shadow-black/10"
        >
          <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex items-center justify-center sm:justify-start gap-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium hidden sm:inline">Dashboard</span>
              </button>
              <div className="h-6 w-px bg-white/20 hidden sm:block" />
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-white truncate">
                  {currentDesign.name}
                </h1>
                {currentDesign.customerName && (
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Specially designed for: {currentDesign.customerName}
                  </p>
                )}
              </div>
            </div>
            {user && (
              <div className="hidden sm:flex flex-col items-end gap-0.5">
                <span className="text-sm font-medium text-white">{user.displayName || user.email?.split('@')[0]}</span>
                <span className="text-xs text-[#f3b5a1]">Client Viewer</span>
              </div>
            )}
          </div>
        </motion.header>

        {/* 3D Content Overlaying the Screen */}
        <div className="flex-1 w-full h-full relative">
          <Visualization3D />
        </div>
      </div>
    </ProtectedRoute>
  );
}
