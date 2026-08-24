import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASCEND — by Agora Systems",
  description:
    "ASCEND: the Global Youth Development Intelligence Platform. Football Quest turns training into an adventure — every child becomes the hero of their own story.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-kingdom-slate">{children}</body>
    </html>
  );
}
