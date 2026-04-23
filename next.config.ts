import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  sassOptions: {
    loadPaths: ["./src"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [240, 480, 768, 1024, 1280, 1920, 3072, 4480],
    imageSizes: [],
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
