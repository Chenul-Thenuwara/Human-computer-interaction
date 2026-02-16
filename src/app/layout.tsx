import type { Metadata } from "next";
import { Abhaya_Libre, Italiana, Jacques_Francois } from "next/font/google"; // Import specific fonts
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DesignProvider } from "@/lib/design-context";
import { cn } from "@/components/ui/utils";

const abhayaLibre = Abhaya_Libre({ 
  weight: ['400', '500', '600', '700'],
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
          "antialiased min-h-screen",
          abhayaLibre.variable,
          italiana.variable,
          jacquesFrancois.variable
        )}
      >
        <DesignProvider>
          {children}
          <Toaster />
        </DesignProvider>
      </body>
    </html>
  );
}
