import type { Metadata } from "next";
import Intro from "@/components/Intro";
import "./globals.css";

export const metadata: Metadata = {
  title: "Joshua Jumbo — Selected Work",
  description: "Selected work and design stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/PPMori-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PPMori-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Intro>{children}</Intro>
      </body>
    </html>
  );
}
