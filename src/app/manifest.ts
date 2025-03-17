import { MetadataRoute } from "next";
import { appConfig } from "@/config/app.config";

/**
 * Configuration du manifeste de l'application
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata
 * Modifier le manifeste de l'application à partir de @/config/app.config.ts
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appConfig.name,
    short_name: appConfig.shortName,
    description: appConfig.description,
    start_url: appConfig.url,
    scope: appConfig.scope,
    display: appConfig.display,
    orientation: appConfig.orientation,
    background_color: appConfig.colors.background,
    theme_color: appConfig.colors.theme,
    dir: appConfig.dir,
    lang: appConfig.lang,
    categories: [...appConfig.categories],
    prefer_related_applications: appConfig.preferRelatedApplications,
    related_applications: [...appConfig.related_applications],
    screenshots: [...appConfig.screenshots],
    shortcuts: appConfig.shortcuts.map((shortcut) => ({
      ...shortcut,
      icons: [...(shortcut.icons || [])],
    })),
    icons: [
      // Android Icons
      {
        src: "/icons/PWA/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/PWA/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/PWA/android/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/PWA/android/android-launchericon-96-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/PWA/android/android-launchericon-72-72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/PWA/android/android-launchericon-48-48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "maskable",
      },
      // iOS Icons
      {
        src: "/icons/PWA/ios/192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/PWA/ios/512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/PWA/ios/180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/PWA/ios/152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/PWA/ios/144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/PWA/ios/120.png",
        sizes: "120x120",
        type: "image/png",
        purpose: "any",
      },
      // Windows Icons
      {
        src: "/icons/PWA/windows11/Square150x150Logo.scale-100.png",
        sizes: "150x150",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/PWA/windows11/Square44x44Logo.scale-100.png",
        sizes: "44x44",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/PWA/windows11/StoreLogo.scale-100.png",
        sizes: "50x50",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
