import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joshua — Selected Work",
  description: "Selected work and design stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
