import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery — Design Showcase",
  description:
    "Browse stunning room designs created with Prism. Get inspired by real customer projects and curated interior concepts.",
  keywords: ["furniture gallery", "interior design gallery", "room designs", "Prism gallery", "3D room showcase"],
  openGraph: {
    title: "Gallery — Prism Design Showcase",
    description: "Browse beautiful room designs crafted using Prism's 3D visualization tools.",
    url: "https://prism-app.vercel.app/gallery",
    images: [
      {
        url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Prism Design Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — Prism Design Showcase",
    description: "Browse stunning room designs created with Prism.",
    images: ["https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop"],
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
