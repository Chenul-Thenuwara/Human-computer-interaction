import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reset Password — Prism",
    description: "Forgot your Prism password? Enter your email address to receive a secure password reset link.",
    robots: { index: false, follow: false },
    openGraph: {
        title: "Reset Password — Prism",
        description: "Reset your Prism account password securely.",
        url: "https://prism-app.vercel.app/forgot-password",
        siteName: "Prism",
        type: "website",
    },
};
