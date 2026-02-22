import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Design",
  description: "Create a new 3D room design with Prism. Set up your room dimensions, choose your furniture, and visualize your perfect space.",
  robots: { index: false, follow: false },
};

export default function NewDesignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
