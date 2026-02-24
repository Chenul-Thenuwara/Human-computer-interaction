import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard — Prism",
    description: "Your Prism designer dashboard. Manage your room designs, track your portfolio, and create new interior projects.",
    robots: { index: false, follow: false },
    openGraph: {
        title: "Dashboard — Prism",
        description: "Access your Prism design portfolio and create new room projects.",
        url: "https://prism-app.vercel.app/dashboard",
        siteName: "Prism",
        type: "website",
    },
};
