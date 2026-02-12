import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SQUAD SWIPE",
  description: "Group decision making with swipe-like voting",
  manifest: "/manifest.json",
  themeColor: "#0b1020"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
