/**
 * =========================================
 * TYPES COMMUNS (CLIENT ET SERVEUR)
 * =========================================
 */

/**
 * Cible d'une notification
 */
export type NotificationTarget = {
  /** Type de cible (utilisateur spécifique ou rôle) */
  type: "user" | "role";
  /** Identifiant de l'utilisateur ou du rôle */
  id: string;
};

/**
 * Priorité de la notification
 */
export type NotificationPriority = "high" | "normal" | "low";

/**
 * Action possible sur une notification
 */
export interface NotificationAction {
  /** Identifiant unique de l'action */
  action: string;
  /** Texte affiché sur le bouton d'action */
  title: string;
  /** URL optionnelle de l'icône du bouton */
  icon?: string;
}

/**
 * Données supplémentaires d'une notification
 */
export type NotificationData = {
  /** Chemin de redirection après clic */
  path: string;
  /** Type de la notification */
  type?: string;
  /** Priorité de la notification */
  priority?: NotificationPriority;
  /** Horodatage de création */
  timestamp?: number;
  /** Autres données dynamiques */
  [key: string]: string | number | boolean | undefined;
};

/**
 * Options étendues pour les notifications
 */
export interface ExtendedNotificationOptions extends NotificationOptions {
  /** Modèle de vibration */
  vibrate?: number[];
  /** Ré-afficher la notification si elle est déjà ouverte */
  renotify?: boolean;
  /** Actions possibles sur la notification */
  actions?: NotificationAction[];
}

/**
 * =========================================
 * TYPES CÔTÉ SERVEUR (API)
 * =========================================
 */

/**
 * Réponse standard pour l'envoi de notification
 */
export interface NotificationResponse {
  /** Succès de l'opération */
  success: boolean;
  /** Message descriptif */
  message: string;
  /** Nombre de notifications envoyées avec succès */
  sent: number;
  /** Nombre de notifications ayant échoué */
  failed: number;
  /** Nombre total de tentatives d'envoi */
  total: number;
  /** Détails des erreurs éventuelles */
  errors?: Array<{
    endpoint: string;
    error: string;
  }>;
}

/**
 * Réponse pour l'abonnement aux notifications
 */
export interface SubscribeResponse {
  /** Succès de l'opération */
  success: boolean;
  /** Message descriptif */
  message: string;
  /** Détails de l'abonnement */
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
  /** Succès de l'opération */
  success: boolean;
  /** Message descriptif */
  message: string;
}

/**
 * =========================================
 * TYPES CÔTÉ CLIENT (NAVIGATEUR)
 * =========================================
 */

/**
 * Format de l'objet PushSubscription reçu du navigateur
 */
export interface PushSubscriptionRequest {
  /** URL unique du service de push pour cet abonnement */
  endpoint: string;
  /** Clés de chiffrement */
  keys: {
    /** Clé publique pour le chiffrement (P-256) */
    p256dh: string;
    /** Clé d'authentification */
    auth: string;
  };
}

/**
 * Format pour désabonner un utilisateur
 */
export interface UnsubscribeRequest {
  /** URL unique du service de push pour cet abonnement */
  endpoint: string;
}

/**
 * Format pour le contenu des notifications
 */
export interface NotificationContent {
  title: string;
  message: string;
  target: {
    type: "user" | "role";
    id: string;
  };
  data: {
    path: string;
    icon?: string;
    timestamp: number;
  };
}
