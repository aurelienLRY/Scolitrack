"use server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withPrivilege } from "@/lib/services/auth.service";
import { classRoomService } from "@/lib/services/classroom.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Route GET pour récupérer les classes
export const GET = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const { searchParams } = new URL(req.url);
      const establishmentId = searchParams.get("establishmentId");
      const classRoomId = searchParams.get("id");

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
      return handleApiError(
        error,
        "Erreur lors de la récupération des classes"
      );
    }
  }
);

// Route POST pour créer une classe
export const POST = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

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
);
