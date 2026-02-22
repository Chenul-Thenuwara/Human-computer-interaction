import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Prism — Designed with Intention",
    description:
        "Learn the story behind Prism — a spatial design studio born from the belief that everyone deserves to see their dream space before committing to it.",
    keywords: ["about Prism", "interior design studio", "furniture design team", "3D visualization studio"],
    openGraph: {
        title: "About Prism — Designed with Intention",
        description:
            "The story, mission, and team behind Prism — a premium furniture visualization experience.",
        url: "https://prism-app.vercel.app/about",
        siteName: "Prism",
        type: "website",
        images: [
            {
                url: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=1200&auto=format&fit=crop",
                width: 1200,
                height: 630,
                alt: "Elegant interior curated by Prism",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "About Prism — Designed with Intention",
        description: "The story, mission, and team behind Prism.",
        images: ["https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=1200&auto=format&fit=crop"],
    },
};
