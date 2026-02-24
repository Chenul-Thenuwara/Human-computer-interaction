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
  metadataBase: new URL("https://prism-app.vercel.app"),
  title: {
    default: "Prism — Discover The Best Furniture",
    template: "%s — Prism",
  },
  description:
    "Prism is a premium furniture visualization studio. Explore curated collections, design your dream room in 3D, and experience furniture before you buy it.",
  keywords: ["furniture", "interior design", "3D room design", "Prism", "home decor", "furniture visualization"],
  openGraph: {
    title: "Prism — Discover The Best Furniture",
    description:
      "Design your dream room with Prism. Visualize furniture in your space before committing — in stunning 3D.",
    url: "https://prism-app.vercel.app",
    siteName: "Prism",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Prism — Premium Furniture Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prism — Discover The Best Furniture",
    description: "Design your dream room in 3D with Prism.",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
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
