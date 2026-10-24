import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Chat inbox",
  robots: { index: false, follow: false },
  manifest: "/admin-manifest.json",
  icons: { apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Inbox", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
