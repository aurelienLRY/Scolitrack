import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

import {
  DEFAULT_ICONS,
  DEFAULT_VIBRATE_PATTERN,
} from "@/config/notification.constants";

import { NotificationResponse } from "@/types/notification.type";

/**
 * Configuration des clés VAPID pour Web Push
 * @see https://www.npmjs.com/package/web-push
 */
webpush.setVapidDetails(
  `mailto:${process.env.WEB_PUSH_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Étendre l'interface NotificationResponse pour inclure le nombre d'abonnements supprimés
interface ExtendedNotificationResponse extends NotificationResponse {
  deleted?: number;
}

// Type pour les résultats rejetés avec un index
interface IndexedRejectedResult extends PromiseRejectedResult {
  index: number;
}

/**
 * Route pour envoyer une notification push aux utilisateurs abonnés
 *
 * Cette API permet d'envoyer une notification push à un utilisateur spécifique
 * ou à tous les utilisateurs ayant un rôle particulier.
 *
 * @route POST /api/notification/push
 *
 * @param req.body.title - Titre de la notification
 * @param req.body.message - Message de la notification
 * @param req.body.target - Cible de la notification (user ou role)
 * @param req.body.target.type - Type de cible ("user" ou "role")
 * @param req.body.target.id - ID de l'utilisateur ou du rôle
 * @param req.body.data - Données supplémentaires à envoyer
 * @param req.body.data.path - Chemin de redirection après clic
 * @param req.body.icon - URL de l'icône (facultatif)
 * @param req.body.badge - URL du badge (facultatif)
 * @param req.body.vibrate - Schéma de vibration (facultatif)
 * @param req.body.actions - Actions possibles (facultatif)
 *
 * @returns {Object} Informations sur le statut de l'envoi
 * @returns {boolean} success - Succès de l'opération
 * @returns {string} message - Message descriptif
 * @returns {number} sent - Nombre de notifications envoyées avec succès
 * @returns {number} failed - Nombre de notifications ayant échoué
 * @returns {number} total - Nombre total de tentatives d'envoi
 * @returns {Array} [errors] - Détails des erreurs (si applicable)
 * @returns {number} [deleted] - Nombre d'abonnements invalides supprimés

 */
export async function POST(req: NextRequest) {
  try {
    // 1. Vérification de l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié. Veuillez vous connecter.",
        },
        { status: 401 }
      );
    }

    // 2. Extraction et validation des données
    const { title, message, target, data, icon, badge, vibrate } =
      await req.json();

    if (!title || !message || !target) {
      return NextResponse.json(
        {
          success: false,
          message: "Données manquantes. Titre, message et cible sont requis.",
        },
        { status: 400 }
      );
    }

    // 3. Récupération des abonnements selon la cible
    let subscriptions;

    if (target.type === "user") {
      // Notification pour un utilisateur spécifique
      subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: target.id },
      });
    } else if (target.type === "role") {
      // Notification pour tous les utilisateurs d'un rôle
      subscriptions = await prisma.pushSubscription.findMany({
        where: {
          user: {
            role: target.id,
          },
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Type de cible invalide: ${target.type}. Utilisez "user" ou "role".`,
        },
        { status: 400 }
      );
    }

    // 4. Vérification de l'existence d'abonnements
    if (!subscriptions.length) {
      return NextResponse.json(
        {
          success: false,
          message: `Aucun abonnement trouvé pour ${target.type} avec ID: ${target.id}`,
          sent: 0,
          failed: 0,
          total: 0,
        },
        { status: 404 }
      );
    }

    // 5. Préparation des options de notification
    // Important: Ces options doivent correspondre à celles attendues par le service worker
    const notificationOptions = {
      title,
      message,
      icon: icon || DEFAULT_ICONS.ICON,
      badge: badge || DEFAULT_ICONS.BADGE,
      vibrate: vibrate || DEFAULT_VIBRATE_PATTERN,
      data: {
        ...(data || {}),
        path: data?.path || "/",
        timestamp: Date.now(),
      },
    };

    // 6. Envoi des notifications
    const results = await Promise.allSettled(
      subscriptions.map((sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        return webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationOptions)
        );
      })
    );

    // 7. Analyse des résultats
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Extraire les erreurs et identifier les abonnements à supprimer
    const invalidSubscriptions: string[] = [];
    const errors = results
      .filter((r, idx): r is IndexedRejectedResult => {
        const isRejected = r.status === "rejected";
        if (isRejected) {
          // Ajouter l'index pour référencer l'abonnement correspondant
          (r as IndexedRejectedResult).index = idx;
        }
        return isRejected;
      })
      .map((r) => {
        const subscription = subscriptions[r.index];
        const errorMessage =
          r.reason instanceof Error ? r.reason.message : String(r.reason);

        // Vérifier si l'erreur indique que l'abonnement est invalide
        // Les erreurs courantes pour les abonnements invalides incluent 404, 410, etc.
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("410") ||
          errorMessage.includes("invalid") ||
          errorMessage.includes("expired") ||
          errorMessage.includes("unsubscribed") ||
          errorMessage.includes("Received unexpected response code") ||
          errorMessage.includes("not found") ||
          errorMessage.includes("gone")
        ) {
          invalidSubscriptions.push(subscription.id);
        }

        return {
          endpoint: subscription.endpoint,
          error: errorMessage,
          subscriptionId: subscription.id,
        };
      });

    // 8. Supprimer les abonnements invalides
    let deleted = 0;
    if (invalidSubscriptions.length > 0) {
      try {
        const deleteResult = await prisma.pushSubscription.deleteMany({
          where: {
            id: {
              in: invalidSubscriptions,
            },
          },
        });
        deleted = deleteResult.count;
        console.log(
          `${deleted} abonnements invalides supprimés de la base de données.`
        );
      } catch (deleteError) {
        console.error(
          "Erreur lors de la suppression des abonnements invalides:",
          deleteError
        );
      }
    }

    // 9. Préparation de la réponse
    const response: ExtendedNotificationResponse = {
      success: succeeded > 0,
      message:
        succeeded > 0
          ? `${succeeded} notification(s) envoyée(s) avec succès`
          : "Échec de l'envoi des notifications",
      sent: succeeded,
      failed,
      total: subscriptions.length,
      deleted, // Ajout du nombre d'abonnements supprimés
      ...(errors.length > 0 && { errors }),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de l'envoi des notifications",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
