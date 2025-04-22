"use server";
import { NextRequest } from "next/server";
import { classRoomService } from "@/lib/services/crud/classroom.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Type pour les query params
interface ClassRoomQueryParams {
  establishmentId?: string;
  id?: string;
}

/**
 * Extrait et type les query params de la requête
 * @param req - La requête HTTP
 * @returns Les query params typés
 */
function getQueryParams(req: NextRequest): ClassRoomQueryParams {
  const { searchParams } = new URL(req.url);
  return {
    establishmentId: searchParams.get("establishmentId") || undefined,
    id: searchParams.get("id") || undefined,
  };
}

/**
 * Récupérer les classes
 * @param req - La requête HTTP entrante
 * @returns Réponse de succès avec les classes récupérées, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 */
export async function GET(req: NextRequest) {
  try {
    const params = getQueryParams(req);
    const { establishmentId, id: classRoomId } = params;

    // Si un ID de classe est fourni, récupérer cette classe spécifique
    if (classRoomId) {
      const classRoom = await classRoomService.getClassRoomById(classRoomId);

      if (!classRoom) {
        return errorResponse({
          feedback: "Classe non trouvée",
          status: HttpStatus.NOT_FOUND,
        });
      }

      return successResponse({
        data: classRoom,
        feedback: "Classe récupérée avec succès",
      });
    }

    // Si un ID d'établissement est fourni, récupérer toutes les classes de cet établissement
    if (establishmentId) {
      const classRooms = await classRoomService.getClassRoomsByEstablishment(
        establishmentId
      );

      return successResponse({
        data: classRooms,
        feedback: "Classes récupérées avec succès",
      });
    }

    // Si aucun paramètre n'est fourni
    return errorResponse({
      feedback: "L'ID de l'établissement est requis",
      status: HttpStatus.BAD_REQUEST,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération des classes");
  }
}

/**
 * Créer une classe
 * @param req - La requête HTTP entrante
 * @returns Réponse de succès avec la classe créée, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    try {
      // La validation est maintenant gérée dans le service
      const newClassRoom = await classRoomService.createClassRoom(body);

      // TODO: Journaliser l'action (audit)
      // await activityLogService.logActivity({
      //   userId: session.user.id,
      //   action: "CREATE_CLASSROOM",
      //   details: JSON.stringify({ classRoomId: newClassRoom.id, className: newClassRoom.name }),
      // });

      return createdResponse({
        data: newClassRoom,
        feedback: `Classe "${newClassRoom.name}" créée avec succès`,
      });
    } catch (error) {
      // Gérer les erreurs de validation
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
    return handleApiError(error, "Erreur lors de la création de la classe");
  }
}
