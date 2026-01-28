import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable:
    process.env.NODE_ENV === "development" && process.env.ENABLE_PWA !== "true",
});

// Dual Build Strategy: Mobile (Capacitor) vs Web
const isMobile = process.env.NEXT_PUBLIC_IS_CAPACITOR === "true";

// Turbopack detection - skip Serwist wrapper for faster dev builds
const isTurbopack = process.env.TURBOPACK === "1";

const nextConfig: NextConfig = {
  // Static export for Capacitor mobile builds
  output: isMobile ? "export" : undefined,
  images: {
    // Disable image optimization for mobile (no server available)
    unoptimized: isMobile,
  },
  // Empty turbopack config to silence webpack warning
  turbopack: {},
};

// Only wrap with Serwist when using Webpack (dev:pwa, build)
export default isTurbopack ? nextConfig : withSerwist(nextConfig);
