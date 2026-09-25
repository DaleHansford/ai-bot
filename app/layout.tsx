import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coach Dale Command Centre",
  description: "Private AI operating interface",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
