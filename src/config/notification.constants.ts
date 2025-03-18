/**
 * Constants partagées pour le système de notification
 *
 * Ces constantes sont utilisées à la fois par l'API et le service worker
 * pour assurer la cohérence dans le traitement des notifications.
 */

/**
 * Chemin vers les icônes par défaut
 * Ces icônes sont utilisées lorsque aucune icône n'est fournie dans la notification
 */
export const DEFAULT_ICONS = {
  /** Icône principale affichée dans la notification */
  ICON: "/icons/PWA/android/android-launchericon-144-144.png",
  /** Badge affiché dans la zone de notification */
  BADGE: "/icons/PWA/android/android-launchericon-48-48.png",
};

/**
 * Motif de vibration par défaut [200ms, 100ms, 200ms]
 * Format: [vibration, pause, vibration, ...]
 */
export const DEFAULT_VIBRATE_PATTERN = [400, 100, 200];

/**
 * Actions par défaut pour les notifications
 * Ces actions sont ajoutées lorsqu'aucune action n'est fournie
 */
export const DEFAULT_NOTIFICATION_ACTIONS = [
  {
    action: "open",
    title: "Ouvrir",
  },
  {
    action: "close",
    title: "Fermer",
  },
];
