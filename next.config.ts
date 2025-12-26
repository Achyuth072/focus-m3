import type { NextConfig } from "next";

// Dual Build Strategy: Mobile (Capacitor) vs Web
const isMobile = process.env.NEXT_PUBLIC_IS_CAPACITOR === "true";

const nextConfig: NextConfig = {
  // Static export for Capacitor mobile builds
  output: isMobile ? "export" : undefined,
  images: {
    // Disable image optimization for mobile (no server available)
    unoptimized: isMobile,
  },
};

export default nextConfig;
