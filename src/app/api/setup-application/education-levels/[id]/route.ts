"use server";

import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { educationLevelService } from "@/lib/services/educationLevel.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * Type sécifique pour les paramètres de cette route
 */
type EducationLevelParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Fonction pour mettre à jour un niveau d'éducation
 * @param req - La requête HTTP entrante
 * @param context - Le contexte contenant les paramètres de route
 * @returns Réponse de succès avec le niveau d'éducation mis à jour, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 404 si le niveau d'éducation n'est pas trouvé
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export const PUT = withPrivilege<unknown, EducationLevelParams>(
  PrivilegeName.UPDATE_DATA,
  async (req: NextRequest, context: EducationLevelParams) => {
    try {
      const { id } = await context.params;

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

/**
 * Fonction pour supprimer un niveau d'éducation
 * @param req - La requête HTTP entrante
 * @param context - Le contexte contenant les paramètres de route
 * @returns Réponse de succès avec le niveau d'éducation supprimé, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 404 si le niveau d'éducation n'est pas trouvé
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export const DELETE = withPrivilege<unknown, EducationLevelParams>(
  PrivilegeName.DELETE_DATA,
  async (req: NextRequest, context: EducationLevelParams) => {
    try {
      const { id } = await context.params;

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
