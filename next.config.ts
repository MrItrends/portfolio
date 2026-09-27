import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Default only allows quality=75; the work grid asks for 90 for crisper thumbnails.
    qualities: [75, 90],
  },
};

export default nextConfig;
