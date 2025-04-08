"use server";
import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { classRoomService } from "@/lib/services/classroom.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * Récupérer une classe spécifique
 * @param req - La requête HTTP entrante
 * @param args - Les arguments de la requête
 * @returns Réponse de succès avec la classe récupérée, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 404 si la classe n'est pas trouvée
 */
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;

    const classRoom = await classRoomService.getClassRoomById(id);

    if (!classRoom) {
      return notFoundResponse("Classe non trouvée");
    }

    return successResponse({
      data: classRoom,
      feedback: `Classe "${classRoom.name}" récupérée avec succès`,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération de la classe");
  }
}

/**
 * Mettre à jour une classe
 * @param req - La requête HTTP entrante
 * @param args - Les arguments de la requête
 * @returns Réponse de succès avec la classe mise à jour, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 */
export const PUT = withPrivilege<unknown, { params: Promise<{ id: string }> }>(
  PrivilegeName.UPDATE_DATA,
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;

      // Vérifier si la classe existe
      const existingClassRoom = await classRoomService.getClassRoomById(id);

      if (!existingClassRoom) {
        return notFoundResponse("Classe non trouvée");
      }

      const body = await req.json();

      try {
        // La validation est maintenant gérée dans le service
        const updatedClassRoom = await classRoomService.updateClassRoom(
          id,
          body
        );

        // TODO: Journaliser l'action (audit)
        // await activityLogService.logActivity({
        //   userId: session.user.id,
        //   action: "UPDATE_CLASSROOM",
        //   details: JSON.stringify({ classRoomId: id, className: updatedClassRoom.name }),
        // });

        return successResponse({
          data: updatedClassRoom,
          feedback: `Classe "${updatedClassRoom.name}" mise à jour avec succès`,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur de validation inconnue";
        return errorResponse({
          feedback: "Données invalides",
          status: HttpStatus.BAD_REQUEST,
          data: { error: errorMessage },
        });
      }
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la mise à jour de la classe"
      );
    }
  }
);

/**
 * Supprimer une classe
 * @param req - La requête HTTP entrante
 * @param args - Les arguments de la requête
 * @returns Réponse de succès avec la classe supprimée, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 */
export const DELETE = withPrivilege<
  unknown,
  { params: Promise<{ id: string }> }
>(
  PrivilegeName.DELETE_DATA,
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await context.params;

      // Vérifier si la classe existe
      const existingClassRoom = await classRoomService.getClassRoomById(id);

      if (!existingClassRoom) {
        return notFoundResponse("Classe non trouvée");
      }

      // Supprimer la classe
      const deletedClassRoom = await classRoomService.deleteClassRoom(id);

      // TODO: Journaliser l'action (audit)
      // await activityLogService.logActivity({
      //   userId: session.user.id,
      //   action: "DELETE_CLASSROOM",
      //   details: JSON.stringify({ classRoomId: id, className: deletedClassRoom.name }),
      // });

      return successResponse({
        data: deletedClassRoom,
        feedback: `Classe "${deletedClassRoom.name}" supprimée avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la suppression de la classe"
      );
    }
  }
);
