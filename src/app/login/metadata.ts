import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login — Prism",
    description: "Sign in to your Prism account to access your room designs and continue creating your dream space.",
    robots: { index: false, follow: false },
    openGraph: {
        title: "Login — Prism",
        description: "Sign in to Prism to manage and create beautiful room designs.",
        url: "https://prism-app.vercel.app/login",
        siteName: "Prism",
        type: "website",
    },
};
