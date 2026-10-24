import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Default only allows quality=75; the work grid asks for 90 for crisper thumbnails.
    qualities: [75, 90],
  },
  async headers() {
    return [
      {
        // The service worker must never be served from a stale cache.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        // Private inbox: keep it out of search and shared caches.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
