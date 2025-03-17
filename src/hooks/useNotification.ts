/**
 * Hook de gestion des notifications push
 *
 * Ce hook permet de gérer les notifications push dans une application Next.js PWA.
 * Il offre des fonctionnalités pour:
 * - Vérifier la compatibilité du navigateur avec les notifications push
 * - S'abonner aux notifications push
 * - Se désabonner des notifications push
 * - Envoyer des notifications push
 *
 * @returns {Object} Fonctions et états pour gérer les notifications
 */
"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { NotificationContent } from "@/types/notificationContent.type";

type PushSubscriptionJSON = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export const useNotification = () => {
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub) {
        const subscriptionData = sub.toJSON() as PushSubscriptionJSON;
        setSubscription(subscriptionData);
        setIsSubscribed(true);

        // Vérifier si la souscription existe déjà dans la base de données
        const response = await fetch("/api/notification/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscriptionData),
        });

        if (!response.ok) {
          console.error("Erreur lors de la vérification de la souscription");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async () => {
    try {
      if (isSubscribed) return;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const subscriptionData = sub.toJSON() as PushSubscriptionJSON;
      setSubscription(subscriptionData);
      setIsSubscribed(true);

      const response = await fetch("/api/notification/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de la souscription");
      }

      toast.success("Notifications activées");
    } catch (error) {
      console.error("Erreur lors de l'abonnement:", error);
      toast.error("Erreur lors de l'activation des notifications");
    }
  };

  const unsubscribe = async () => {
    try {
      if (!subscription || !isSubscribed) return;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();

      if (sub) {
        await sub.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);

        const response = await fetch("/api/notification/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression de la souscription");
        }

        toast.success("Notifications désactivées");
      }
    } catch (error) {
      console.error("Erreur lors de la désinscription:", error);
      toast.error("Erreur lors de la désactivation des notifications");
    }
  };

  /**
   * Envoie une notification push à un utilisateur ou un groupe
   *
   * @param {NotificationContent} notification - Contenu de la notification
   * @returns {Promise<boolean>} Succès ou échec de l'envoi
   */
  const pushMessage = async (notification: NotificationContent) => {
    try {
      const response = await fetch("/api/notification/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notification),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de l'envoi de la notification"
        );
      }

      toast.success(`Notification envoyée (${data.sent}/${data.total})`);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      toast.error("Échec de l'envoi de la notification");
      return false;
    }
  };

  return {
    subscription,
    isLoading,
    isSubscribed,
    subscribe,
    unsubscribe,
    pushMessage,
  };
};
