import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  compiler: {
    /* removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
 */
  },
  experimental: {
    authInterrupts: true,
  },
  // Configuration des en-têtes HTTP
  async headers() {
    return [
      {
        // Appliquer ces en-têtes aux images uploadées
        source: "/img/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "Surrogate-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
  // Configuration de l'optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Empêcher la mise en cache des images
    minimumCacheTTL: 0,
    // Augmenter la taille max des images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
  },
};

export default withPWA({
  dest: "public",
  customWorkerSrc: "src/lib/servicesWorker",
  register: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
