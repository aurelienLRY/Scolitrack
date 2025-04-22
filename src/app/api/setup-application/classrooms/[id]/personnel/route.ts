"use server";
import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { classRoomService } from "@/lib/services/crud/classroom.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * Récupérer le personnel d'une classe
 * @param req - La requête HTTP entrante
 * @param args - Les arguments de la requête
 * @returns Réponse de succès avec le personnel de la classe récupéré, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Vérifier si la classe existe
    const classRoom = await classRoomService.getClassRoomById(id);

    if (!classRoom) {
      return notFoundResponse("Classe non trouvée");
    }

    // Récupérer le personnel de la classe
    const personnel = classRoom.classPersonnel;

    return successResponse({
      data: personnel,
      feedback: "Personnel de la classe récupéré avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération du personnel de la classe"
    );
  }
}

/**
 * Attribuer un membre du personnel à une classe
 * @param req - La requête HTTP entrante
 * @param args - Les arguments de la requête
 * @returns Réponse de succès avec le membre du personnel attribué à la classe, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Vérifier si la classe existe
    const classRoom = await classRoomService.getClassRoomById(id);

    if (!classRoom) {
      return notFoundResponse("Classe non trouvée");
    }

    const body = await req.json();

    try {
      // La validation est maintenant gérée dans le service
      const result = await classRoomService.assignPersonnelToClassRoom(
        id,
        body
      );

      // TODO: Journaliser l'action (audit)
      // await activityLogService.logActivity({
      //   userId: session.user.id,
      //   action: "ASSIGN_PERSONNEL_TO_CLASSROOM",
      //   details: JSON.stringify({ classRoomId, userId: body.userId, role: body.roleInClass }),
      // });

      return createdResponse({
        data: result,
        feedback: `Membre du personnel attribué à la classe "${classRoom.name}" avec succès`,
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
      "Erreur lors de l'attribution du membre du personnel à la classe"
    );
  }
}

/**
 * Supprimer un membre du personnel d'une classe
 * @param req - La requête HTTP entrante
 * @param args - Les arguments de la requête
 * @returns Réponse de succès avec le membre du personnel supprimé de la classe, ou une erreur appropriée
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
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");

      if (!userId) {
        return errorResponse({
          feedback: "L'ID de l'utilisateur est requis",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Vérifier si la classe existe
      const classRoom = await classRoomService.getClassRoomById(id);

      if (!classRoom) {
        return notFoundResponse("Classe non trouvée");
      }

      // Supprimer le membre du personnel de la classe
      const result = await classRoomService.removePersonnelFromClassRoom(
        id,
        userId
      );

      // TODO: Journaliser l'action (audit)
      // await activityLogService.logActivity({
      //   userId: session.user.id,
      //   action: "REMOVE_PERSONNEL_FROM_CLASSROOM",
      //   details: JSON.stringify({ classRoomId, userId }),
      // });

      return successResponse({
        data: result,
        feedback: `Membre du personnel retiré de la classe "${classRoom.name}" avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors du retrait du membre du personnel de la classe"
      );
    }
  }
);
