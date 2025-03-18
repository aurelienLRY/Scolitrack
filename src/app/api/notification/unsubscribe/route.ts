import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { UnsubscribeResponse } from "@/types/notification.type";

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
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié. Veuillez vous connecter.",
        },
        { status: 401 }
      );
    }

    // 2. Extraction et validation des données
    const body = await request.json();

    if (!body.endpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Endpoint manquant. L'endpoint de l'abonnement est requis.",
        },
        { status: 400 }
      );
    }

    // 3. Vérification de l'existence de l'abonnement
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint: body.endpoint },
    });

    if (!existingSubscription) {
      return NextResponse.json({
        success: false,
        message: "Abonnement non trouvé",
      });
    }

    // 4. Vérification des permissions
    if (existingSubscription.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Vous n'êtes pas autorisé à supprimer cet abonnement",
        },
        { status: 403 }
      );
    }

    // 5. Suppression de l'abonnement
    await prisma.pushSubscription.delete({
      where: { endpoint: body.endpoint },
    });

    // 6. Préparation de la réponse
    const response: UnsubscribeResponse = {
      success: true,
      message: "Abonnement supprimé avec succès",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonnement:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la suppression de l'abonnement",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
