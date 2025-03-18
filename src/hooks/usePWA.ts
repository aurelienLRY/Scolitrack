import { useState, useEffect } from "react";
import { pwaConfig } from "@/config/pwa.config";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  promptCount: number;
  lastPromptTime: number | null;
}

const PWA_STORAGE_KEY = "pwa-status";

const getInitialState = (): PWAStatus => ({
  isInstallable: false,
  isInstalled: false,
  deferredPrompt: null,
  promptCount: 0,
  lastPromptTime: null,
});

// Ajouter cette fonction avant le hook usePWA
const checkPromptConditions = (status: PWAStatus): boolean => {
  if (!pwaConfig.customInstallPrompt) return false;

  const now = Date.now();
  const timeSinceLastPrompt = status.lastPromptTime
    ? now - status.lastPromptTime
    : Infinity;

  // Vérifier si on a dépassé le nombre maximum de prompts
  if (status.promptCount >= pwaConfig.maxPrompts) {
    return false;
  }

  // Vérifier si assez de temps s'est écoulé depuis le dernier prompt
  if (timeSinceLastPrompt < pwaConfig.promptInterval) {
    return false;
  }

  return true;
};

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>(getInitialState());
  const [isClient, setIsClient] = useState(false);

  // Effet pour l'initialisation côté client
  useEffect(() => {
    setIsClient(true);

    // Charger l'état depuis le localStorage
    const savedStatus = localStorage.getItem(PWA_STORAGE_KEY);
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        setStatus((prev) => ({
          ...prev,
          promptCount: parsed.promptCount || 0,
          lastPromptTime: parsed.lastPromptTime || null,
        }));
      } catch (error) {
        console.error("Erreur lors du chargement de l'état PWA:", error);
      }
    }
  }, []);

  // Effet séparé pour la gestion des événements PWA
  useEffect(() => {
    if (!isClient || !pwaConfig.customInstallPrompt) return;

    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;

    // Mettre à jour l'état installé sans déclencher de re-render en boucle
    if (isInstalled && !status.isInstalled) {
      setStatus((prev) => ({ ...prev, isInstalled }));
    }

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (checkPromptConditions(status)) {
        setTimeout(() => {
          setStatus((prev) => ({
            ...prev,
            isInstallable: true,
            deferredPrompt: e as BeforeInstallPromptEvent,
          }));
        }, pwaConfig.promptDelay);
      }
    };

    const handleAppInstalled = () => {
      setStatus((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Dépendance uniquement sur isClient

  // Effet séparé pour la sauvegarde dans le localStorage
  useEffect(() => {
    if (!isClient) return;

    const stateToSave = {
      promptCount: status.promptCount,
      lastPromptTime: status.lastPromptTime,
    };
    localStorage.setItem(PWA_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [isClient, status.promptCount, status.lastPromptTime]);

  const promptInstall = async () => {
    if (!status.deferredPrompt) return;

    // Mettre à jour le compteur et l'horodatage
    setStatus((prev) => ({
      ...prev,
      promptCount: prev.promptCount + 1,
      lastPromptTime: Date.now(),
    }));

    status.deferredPrompt.prompt();
    const { outcome } = await status.deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setStatus((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    }
  };

  return {
    isInstallable: isClient && status.isInstallable,
    isInstalled: isClient && status.isInstalled,
    promptInstall,
  };
}
