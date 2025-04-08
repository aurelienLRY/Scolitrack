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
  // Configuration pour servir correctement les fichiers statiques
  async headers() {
    return [
      {
        // Pour tous les fichiers dans /img/uploads
        source: "/img/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
      // Configuration spécifique pour les fichiers webp
      {
        source: "/img/uploads/:path*.webp",
        headers: [
          {
            key: "Content-Type",
            value: "image/webp",
          },
        ],
      },
      // Configuration pour les autres types d'images
      {
        source: "/img/uploads/:path*.jpg",
        headers: [
          {
            key: "Content-Type",
            value: "image/jpeg",
          },
        ],
      },
      {
        source: "/img/uploads/:path*.png",
        headers: [
          {
            key: "Content-Type",
            value: "image/png",
          },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  customWorkerSrc: "src/lib/servicesWorker",
  register: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
