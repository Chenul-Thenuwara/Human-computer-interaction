import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Forgot your Prism password? Enter your email address to receive a secure password reset link.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
