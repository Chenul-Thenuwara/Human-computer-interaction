import type { Metadata } from "next";
import {
  Abhaya_Libre,
  Italiana,
  Jacques_Francois,
  Italianno,
} from "next/font/google"; // Import specific fonts
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DesignProvider } from "@/lib/design-context";
import { AuthProvider } from "@/lib/auth-context";
import { cn } from "@/components/ui/utils";

const abhayaLibre = Abhaya_Libre({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-abhaya-libre",
});

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italiana",
});

const jacquesFrancois = Jacques_Francois({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jacques-francois",
});

const italianno = Italianno({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-italianno",
});

export const metadata: Metadata = {
  title: "Furniture Visualization App",
  description: "Design your dream room",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "antialiased min-h-screen bg-[#233529] text-white selection:bg-[#f3b5a1] selection:text-[#233529]",
          abhayaLibre.variable,
          italiana.variable,
          jacquesFrancois.variable,
          italianno.variable,
          "font-sans",
        )}
      >
        {/* Global Grid Pattern Background */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-20 z-[-1]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '4rem 100%',
          }}
        />
        <AuthProvider>
          <DesignProvider>
            {children}
            <Toaster />
          </DesignProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
