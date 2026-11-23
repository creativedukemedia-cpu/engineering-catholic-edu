import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The sandbox forwards the preview from this host. Without it, dev assets
  // such as the live-reload endpoint are blocked as cross-origin.
  allowedDevOrigins: ["3000-ivkh1nq9lgeadtgk1k2zh-d0158350.us5.manus.computer"],
  images: {
    qualities: [75, 80],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
