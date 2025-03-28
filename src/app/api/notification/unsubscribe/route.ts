import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { auth } from "@/lib/auth/auth";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * API de désabonnement aux notifications push
 *
 * Cette route permet de supprimer l'abonnement d'un utilisateur aux
 * notifications push de la base de données.
 *
 * @route POST /api/notification/unsubscribe
 *
 * @param request.body.endpoint - URL unique de l'endpoint de l'abonnement à supprimer
 *
 * @returns {Object} Informations sur le statut de l'opération
 * @returns {boolean} success - Succès de l'opération
 * @returns {string} message - Message descriptif
 * @returns {string} [error] - Message d'erreur détaillé (si applicable)
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
    const body = await request.json();

    if (!body.endpoint) {
      return errorResponse({
        feedback: "Endpoint manquant. L'endpoint de l'abonnement est requis.",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 3. Vérification de l'existence de l'abonnement
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint: body.endpoint },
    });

    if (!existingSubscription) {
      return errorResponse({
        feedback: "Abonnement non trouvé",
        status: HttpStatus.NOT_FOUND,
      });
    }

    // 4. Vérification des permissions
    if (existingSubscription.userId !== session.user.id) {
      return errorResponse({
        feedback: "Vous n'êtes pas autorisé à supprimer cet abonnement",
        status: HttpStatus.FORBIDDEN,
      });
    }

    // 5. Suppression de l'abonnement
    await prisma.pushSubscription.delete({
      where: { endpoint: body.endpoint },
    });

    // 6. Préparation de la réponse
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
