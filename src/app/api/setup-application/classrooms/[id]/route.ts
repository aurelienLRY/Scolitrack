"use server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withPrivilege } from "@/lib/services/auth.service";
import { classRoomService } from "@/lib/services/classroom.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Type d'interface pour les paramètres
interface Params {
  params: {
    id: string;
  };
}

// Fonction pour récupérer une classe spécifique
export const GET = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();
      const context = args[0] as Params;

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const id = context.params.id;

      const classRoom = await classRoomService.getClassRoomById(id);

      if (!classRoom) {
        return notFoundResponse("Classe non trouvée");
      }

      return successResponse({
        data: classRoom,
        feedback: `Classe "${classRoom.name}" récupérée avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la récupération de la classe"
      );
    }
  }
);

// Fonction pour mettre à jour une classe
export const PUT = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();
      const context = args[0] as Params;

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const id = context.params.id;

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

// Fonction pour supprimer une classe
export const DELETE = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();
      const context = args[0] as Params;

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const id = context.params.id;

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
