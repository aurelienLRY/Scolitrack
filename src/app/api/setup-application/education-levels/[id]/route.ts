"use server";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withPrivilege } from "@/lib/services/auth.service";
import { educationLevelService } from "@/lib/services/educationLevel.service";
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

// Fonction pour mettre à jour un niveau d'éducation
export const PUT = withPrivilege(
  "UPDATE_DATA",
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

      // Vérifier si le niveau existe
      const existingLevel = await educationLevelService.getEducationLevelById(
        id
      );

      if (!existingLevel) {
        return notFoundResponse("Niveau d'éducation non trouvé");
      }

      const body = await req.json();

      try {
        const updatedLevel = await educationLevelService.updateEducationLevel(
          id,
          body
        );

        return successResponse({
          data: updatedLevel,
          feedback: `Niveau d'éducation "${updatedLevel.name}" mis à jour avec succès`,
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
        "Erreur lors de la mise à jour du niveau d'éducation"
      );
    }
  }
);

// Fonction pour supprimer un niveau d'éducation
export const DELETE = withPrivilege(
  "DELETE_DATA",
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

      // Vérifier si le niveau existe
      const existingLevel = await educationLevelService.getEducationLevelById(
        id
      );

      if (!existingLevel) {
        return notFoundResponse("Niveau d'éducation non trouvé");
      }

      // Supprimer le niveau
      const deletedLevel = await educationLevelService.deleteEducationLevel(id);

      return successResponse({
        data: deletedLevel,
        feedback: `Niveau d'éducation "${deletedLevel.name}" supprimé avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la suppression du niveau d'éducation"
      );
    }
  }
);
