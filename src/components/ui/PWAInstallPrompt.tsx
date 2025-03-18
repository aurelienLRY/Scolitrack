"use client";
import { useState, useLayoutEffect, useCallback } from "react";
import Image from "next/image";

import { usePWA } from "@/hooks/usePWA"; // Import du hook PWA
import { pwaConfig } from "@/config/pwa.config"; // Import de la configuration PWA

/**
 * Composant d'invite d'installation PWA
 * @returns {JSX.Element} - Rendu du composant
 */
export function PWAInstallPrompt() {
  const { isInstallable, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Utiliser un layout effect pour éviter le flash
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  // Mémoriser les handlers
  const handleInstall = useCallback(async () => {
    await promptInstall();
  }, [promptInstall]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  if (!isMounted || !isInstallable || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src="/icons/PWA/android/android-launchericon-72-72.png"
            alt="App Icon"
            width={72}
            height={72}
            className="rounded-xl"
            priority
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {pwaConfig.messages.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {pwaConfig.messages.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {pwaConfig.messages.cancelButton}
          </button>
          <button
            onClick={handleInstall}
            style={{
              backgroundColor: pwaConfig.style.primaryColor,
              borderColor: pwaConfig.style.primaryColor,
            }}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center space-x-2"
          >
            <span>{pwaConfig.messages.installButton}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
