import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQUAD",
  description: "Decide, spin, and share with your group.",
  manifest: "/manifest.json",
  themeColor: "#0b1020"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
