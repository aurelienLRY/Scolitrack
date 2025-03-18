import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import {
  PushSubscriptionRequest,
  SubscribeResponse,
} from "@/types/notification.type";

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
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié. Veuillez vous connecter.",
        },
        { status: 401 }
      );
    }

    // 2. Extraction et validation des données
    const subscription = (await request.json()) as PushSubscriptionRequest;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Données de souscription incomplètes. Endpoint, p256dh et auth sont requis.",
        },
        { status: 400 }
      );
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
      return NextResponse.json(response);
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'abonnement:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de l'enregistrement de l'abonnement",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
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
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié. Veuillez vous connecter.",
        },
        { status: 401 }
      );
    }

    // 2. Extraction et validation des données
    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return NextResponse.json(
        {
          success: false,
          message: "Endpoint manquant. L'endpoint de l'abonnement est requis.",
        },
        { status: 400 }
      );
    }

    // 3. Suppression de l'abonnement
    await prisma.pushSubscription.delete({
      where: { endpoint: subscription.endpoint },
    });

    // 4. Préparation de la réponse
    return NextResponse.json({
      success: true,
      message: "Abonnement supprimé avec succès",
    });
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
