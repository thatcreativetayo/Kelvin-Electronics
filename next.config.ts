import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this package; without this it walks up to the
  // user's home directory when a lockfile exists there.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920],
    localPatterns: [{ pathname: "/**", search: "" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
