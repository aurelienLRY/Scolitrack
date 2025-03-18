/// <reference lib="webworker" />

import { DEFAULT_VIBRATE_PATTERN } from "@/config/notification.constants";
import { ExtendedNotificationOptions } from "@/types/notification.type";

declare const self: ServiceWorkerGlobalScope;

/**
 * Gestionnaire d'événement "push"
 *
 * Ce gestionnaire est appelé quand le service de notification push envoie une notification
 * au navigateur. Il analyse les données reçues et affiche la notification.
 */
self.addEventListener("push", (event: PushEvent) => {
  try {
    // Analyse des données de la notification
    const data = JSON.parse(event.data?.text() ?? "{}");
    // Préparation des options de notification avec valeurs par défaut
    const options: ExtendedNotificationOptions = {
      body: data.message,
      icon: data.icon || "/icons/PWA/android/android-launchericon-144-144.png",
      badge: data.badge || "/icons/PWA/android/android-launchericon-48-48.png",
      vibrate: data.vibrate || DEFAULT_VIBRATE_PATTERN,
      data: {
        path: data.data?.path || "/",
        timestamp: Date.now(),
        ...data.data,
      },
      requireInteraction: true,
      lang: "fr",
    };

    // Affichage de la notification
    event.waitUntil(
      self.registration.showNotification(data.title || "Scolitrack", options)
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la notification:", error);
  }
});

/**
 * Gestionnaire d'événement "notificationclick"
 *
 * Ce gestionnaire est appelé quand l'utilisateur clique sur une notification.
 * Il ferme la notification et navigue vers l'URL spécifiée ou exécute l'action demandée.
 */
self.addEventListener("notificationclick", (event) => {
  try {
    event.notification.close();
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          const path = event.notification.data.path;
          // Vérifier s’il y a déjà un onglet sur cette URL
          for (const client of clientList) {
            if (client.url.includes(path) && "focus" in client) {
              return client.focus();
            }
          }
          // Sinon, on ouvre un nouvel onglet
          return self.clients.openWindow(path);
        })
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la notification:", error);
  }
});
