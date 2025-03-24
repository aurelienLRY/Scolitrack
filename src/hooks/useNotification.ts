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
import {
  NotificationContent,
  PushSubscriptionRequest,
} from "@/types/notification.type";

export const useNotification = () => {
  const [subscription, setSubscription] =
    useState<PushSubscriptionRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      checkSubscription();
    } else {
      setIsLoading(false);
      toast.error(
        "Les notifications push ne sont pas supportées par votre navigateur"
      );
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const subscriptionData =
          subscription.toJSON() as PushSubscriptionRequest;
        setSubscription(subscriptionData);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error);
      toast.error("Erreur lors de la vérification de l'abonnement");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const subscriptionData = subscription.toJSON() as PushSubscriptionRequest;

      const response = await fetch("/api/notification/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      }).then((res) => res.json());

      if (!response.success) throw new Error(response.feedback);

      setSubscription(subscriptionData);
      setIsSubscribed(true);
      toast.success("Notifications activées avec succès");
    } catch (error) {
      console.error("Erreur lors de l'abonnement:", error);
      toast.error("Erreur lors de l'activation des notifications");
    }
  };

  const unsubscribe = async () => {
    try {
      if (!subscription) return;

      const registration = await navigator.serviceWorker.ready;
      const currentSubscription =
        await registration.pushManager.getSubscription();
      if (currentSubscription) {
        await currentSubscription.unsubscribe();
      }

      const response = await fetch("/api/notification/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      }).then((res) => res.json());

      if (!response.success) {
        throw new Error(response.feedback);
      }
      setSubscription(null);
      setIsSubscribed(false);
      toast.success("Notifications désactivées avec succès");
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
      const response = await fetch("/api/notification/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notification),
      }).then((res) => res.json());

      if (!response.success) throw new Error(response.feedback);
      toast.success(
        `Notification envoyée à ${response.meta?.sent} destinataire(s)`
      );
      return response;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      toast.error("Erreur lors de l'envoi de la notification");
    }
  };

  return {
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    pushMessage,
  };
};
