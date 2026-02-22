import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Prism — Discover The Best Furniture",
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
};
