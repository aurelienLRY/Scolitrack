/// <reference lib="webworker" />

import {
  DEFAULT_ICONS,
  DEFAULT_VIBRATE_PATTERN,
  DEFAULT_NOTIFICATION_ACTIONS,
} from "@/config/notification.constants";
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
    console.log("Notification recu", event);
    // Analyse des données de la notification
    const data = JSON.parse(event.data?.text() ?? "{}");

    // Préparation des options de notification avec valeurs par défaut
    const options: ExtendedNotificationOptions = {
      body: data.message,
      icon: data.icon || DEFAULT_ICONS.ICON,
      badge: data.badge || DEFAULT_ICONS.BADGE,
      vibrate: data.vibrate || DEFAULT_VIBRATE_PATTERN,
      data: {
        path: data.data?.path || "/",
        timestamp: Date.now(),
        ...data.data,
      },
      actions: data.actions || DEFAULT_NOTIFICATION_ACTIONS,
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
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  // Fermer la notification
  event.notification.close();

  // Récupérer le chemin de redirection
  const path = event.notification.data?.path || "/";

  // Vérifier s'il y a une action spécifique
  if (event.action) {
    console.log("Action notification cliquée:", event.action);

    switch (event.action) {
      case "open":
        // Ouvrir le chemin spécifié
        return event.waitUntil(navigateToUrl(path));

      case "close":
        // Juste fermer la notification, sans navigation
        return;

      default:
        // Pour les actions personnalisées, on peut ajouter d'autres cas ici
        console.log("Action personnalisée:", event.action);
        return event.waitUntil(navigateToUrl(path));
    }
  }

  // Si pas d'action spécifique (clic général sur la notification)
  // => redirection vers le chemin spécifié
  event.waitUntil(navigateToUrl(path));
});

/**
 * Fonction utilitaire pour naviguer vers une URL
 * Réutilisable dans le gestionnaire d'événements
 */
function navigateToUrl(url: string) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      // Si une fenêtre est déjà ouverte, la focus et naviguer
      if (clientList.length > 0) {
        const focusedClient =
          clientList.find((client) => client.focused) || clientList[0];
        return focusedClient.focus().then(() => {
          if ("navigate" in focusedClient) {
            return (focusedClient as WindowClient).navigate(url);
          }
        });
      }
      // Sinon, ouvrir une nouvelle fenêtre
      return self.clients.openWindow(url);
    });
}
