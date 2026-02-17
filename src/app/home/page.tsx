"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sofa } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, go directly to design page
        router.push("/design/new");
      } else {
        // User is not logged in, show splash then go to login
        const timer = setTimeout(() => {
          router.push("/login");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl animate-fade-in">
        <div className="p-4 bg-primary/10 rounded-full animate-bounce-slow">
          <Sofa className="w-16 h-16 text-primary" />
        </div>

        <div className="space-y-4 animate-slide-up">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Furniture Visualization App
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome to the new home of the Furniture Visualization App. Start
            designing your dream room today.
          </p>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s both;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
