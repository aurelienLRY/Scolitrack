import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { auth } from "@/lib/auth/auth";
import {
  PushSubscriptionRequest,
  SubscribeResponse,
} from "@/types/notification.type";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * API d'abonnement aux notifications push
 *
 * Cette route permet d'enregistrer les abonnements des utilisateurs aux
 * notifications push dans la base de données.
 *
 * @route POST /api/notification/subscribe
 *
 * @param request.body - Objet de souscription fourni par le navigateur
 * @param request.body.endpoint - URL unique de l'endpoint pour cet abonnement
 * @param request.body.keys.p256dh - Clé publique pour le chiffrement des messages
 * @param request.body.keys.auth - Clé d'authentification
 *
 * @returns {Object} Informations sur le statut de l'opération
 * @returns {boolean} success - Succès de l'opération
 * @returns {string} message - Message descriptif
 * @returns {Object} [subscription] - Détails de l'abonnement (si existant)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Vérification de l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse({
        feedback: "Non authentifié. Veuillez vous connecter.",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // 2. Extraction et validation des données
    const subscription = (await request.json()) as PushSubscriptionRequest;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return errorResponse({
        feedback:
          "Données de souscription incomplètes. Endpoint, p256dh et auth sont requis.",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 3. Vérification des doublons
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existingSubscription) {
      const response: SubscribeResponse = {
        success: true,
        message: "Abonnement déjà existant",
        subscription: {
          endpoint: existingSubscription.endpoint,
          p256dh: existingSubscription.p256dh,
          auth: existingSubscription.auth,
        },
      };
      return successResponse({
        feedback: response.message,
        data: response.subscription,
      });
    }

    // 4. Création de l'abonnement en base de données
    const newSubscription = await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    // 5. Préparation de la réponse
    const response: SubscribeResponse = {
      success: true,
      message: "Abonnement enregistré avec succès",
      subscription: {
        endpoint: newSubscription.endpoint,
        p256dh: newSubscription.p256dh,
        auth: newSubscription.auth,
      },
    };

    return successResponse({
      feedback: response.message,
      data: response.subscription,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'abonnement:", error);
    return handleApiError(
      error,
      "Erreur serveur lors de l'enregistrement de l'abonnement"
    );
  }
}

/**
 * API de désabonnement aux notifications push
 *
 * @deprecated Utilisez plutôt la route /api/notification/unsubscribe
 * Cette méthode est maintenue pour compatibilité
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Vérification de l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse({
        feedback: "Non authentifié. Veuillez vous connecter.",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // 2. Extraction et validation des données
    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return errorResponse({
        feedback: "Endpoint manquant. L'endpoint de l'abonnement est requis.",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 3. Suppression de l'abonnement
    await prisma.pushSubscription.delete({
      where: { endpoint: subscription.endpoint },
    });

    // 4. Préparation de la réponse
    return successResponse({
      feedback: "Abonnement supprimé avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur serveur lors de la suppression de l'abonnement"
    );
  }
}
