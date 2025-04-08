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
          {
            key: "Content-Type",
            value: "image/:type*",
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
