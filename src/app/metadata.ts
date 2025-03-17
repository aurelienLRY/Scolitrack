import type { Metadata, Viewport } from "next";
import { appConfig } from "@/config/app.config";
/**
 * Configuration des métadonnées de l'application
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata
 * Modifier les métadonnées de l'application à partir de @/config/app.config.ts
 */
export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
  manifest: "/manifest.json",
  applicationName: appConfig.name,
  appleWebApp: {
    ...appConfig.appleWebApp,
    title: appConfig.name,
    startupImage: [
      {
        url: "/icons/PWA/ios/180.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/PWA/ios/152.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/icons/PWA/ios/120.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  formatDetection: appConfig.formatDetection,
  icons: {
    icon: [
      {
        url: "/icons/PWA/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/PWA/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "/icons/PWA/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/icons/PWA/ios/180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/PWA/ios/152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/PWA/ios/120.png", sizes: "120x120", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/PWA/ios/180.png",
      },
    ],
  },
  authors: [
    {
      name: appConfig.author.name,
      url: appConfig.author.url,
    },
  ],
};

export const viewport: Viewport = {
  ...appConfig.viewport,
  themeColor: appConfig.colors.theme,
};
