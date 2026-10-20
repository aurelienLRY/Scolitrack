import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  sendWebPushToRole,
  sendWebPushToUserIds,
  type WebPushSendResult,
} from "@/lib/services/web-push.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * POST /api/notification/notify (alias historique : push)
 * Envoie une notification push à un user ou un rôle.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse({
        feedback: "Non authentifié. Veuillez vous connecter.",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const { title, message, target, data, icon, badge, vibrate } =
      await req.json();

    if (!title || !message || !target) {
      return errorResponse({
        feedback: "Données manquantes. Titre, message et cible sont requis.",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const payload = {
      title,
      message,
      icon,
      badge,
      vibrate,
      path: data?.path || "/",
      data: data || {},
    };

    let result: WebPushSendResult;

    if (target.type === "user") {
      result = await sendWebPushToUserIds([target.id], payload);
    } else if (target.type === "role") {
      result = await sendWebPushToRole(target.id, payload);
    } else {
      return errorResponse({
        feedback: `Type de cible invalide: ${target.type}. Utilisez "user" ou "role".`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (result.total === 0) {
      return errorResponse({
        feedback: `Aucun abonnement trouvé pour ${target.type} avec ID: ${target.id}`,
        status: HttpStatus.NOT_FOUND,
        meta: {
          sent: 0,
          failed: 0,
          total: 0,
        },
      });
    }

    const feedback =
      result.sent > 0
        ? `${result.sent} notification(s) envoyée(s) avec succès`
        : "Échec de l'envoi des notifications";

    return successResponse({
      feedback,
      meta: {
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        deleted: result.deleted,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications:", error);
    return handleApiError(
      error,
      "Erreur serveur lors de l'envoi des notifications"
    );
  }
}
