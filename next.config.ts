import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },
  experimental: {
    authInterrupts: true,
  },
};

export default withPWA({
  dest: "public",
  customWorkerSrc: "src/lib/servicesWorker/worker",
  register: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
