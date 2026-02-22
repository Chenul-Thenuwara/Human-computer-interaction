import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join Prism for free. Start designing and visualizing your dream room in beautiful 3D — no commitment required.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
