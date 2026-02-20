"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col relative bg-background text-foreground">
      {/* Background grid pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-white"
            style={{ left: `${(i + 1) * 10}%` }}
          />
        ))}
      </div>

      {/* Decorative gradient orbs */}
      <div className="fixed top-0 left-0 w-150 h-150 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-125 h-125 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/70 border-b border-white/20 sticky top-0 z-20 shadow-lg shadow-black/10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">Prism</h1>
              <span className="text-muted-foreground">
                Furniture Designer Studio
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                yashiradesilva@gmail.com
              </span>
              <Button
                onClick={() => router.push("/logout")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-3 gap-6 w-full px-8 py-12">
          <div className="bg-card/70 backdrop-blur-md p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-primary">Total Designs</h2>
            <p className="text-4xl font-bold text-primary">0</p>
          </div>
          <div className="bg-card/70 backdrop-blur-md p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-primary">This Month</h2>
            <p className="text-4xl font-bold text-primary">0</p>
          </div>
          <div className="bg-card/70 backdrop-blur-md p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-primary">Quick Action</h2>
            <Button
              onClick={() => router.push("/design/new")}
              className="mt-4 bg-primary hover:bg-primary/90 text-white"
            >
              + New Design
            </Button>
          </div>
        </div>

        <div className="w-full px-8">
          <h2 className="text-2xl font-bold text-primary">Design Portfolio</h2>
          <div className="mt-6 flex flex-col items-center justify-center bg-card/70 backdrop-blur-md p-12 rounded-lg shadow-md">
            <div className="text-primary text-6xl mb-4">🛋️</div>
            <h3 className="text-lg font-semibold text-primary">No designs yet</h3>
            <p className="text-muted-foreground mt-2">
              Create your first room design to get started
            </p>
            <Button
              onClick={() => router.push("/design/new")}
              className="mt-6 bg-primary hover:bg-primary/90 text-white"
            >
              + Create First Design
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}