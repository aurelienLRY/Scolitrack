import {
  DEFAULT_ICONS,
  DEFAULT_VIBRATE_PATTERN,
  DEFAULT_NOTIFICATION_ACTIONS,
} from "@/config/notification.constants";

/**
 * Types de réponses pour les API de notification
 */

/**
 * Réponse standard pour l'envoi de notification
 */
export interface NotificationResponse {
  success: boolean;
  message: string;
  sent: number;
  failed: number;
  total: number;
  errors?: Array<{
    endpoint: string;
    error: string;
  }>;
}

/**
 * Réponse pour l'abonnement aux notifications
 */
export interface SubscribeResponse {
  success: boolean;
  message: string;
  subscription?: {
    endpoint: string;
    p256dh: string;
    auth: string;
  };
}

/**
 * Réponse pour le désabonnement aux notifications
 */
export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

/**
 * Types de requêtes pour les API de notification
 */

/**
 * Format de l'objet PushSubscription reçu du navigateur
 */
export interface PushSubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Format pour désabonner un utilisateur
 */
export interface UnsubscribeRequest {
  endpoint: string;
}

// Exporter les constantes et types partagés
export { DEFAULT_ICONS, DEFAULT_VIBRATE_PATTERN, DEFAULT_NOTIFICATION_ACTIONS };
