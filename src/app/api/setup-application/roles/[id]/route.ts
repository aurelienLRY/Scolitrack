"use server";
import { NextRequest } from "next/server";
import { roleService } from "@/lib/services/crud/role.service";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * Récupérer un rôle par son ID
 * @param req - La requête HTTP entrante contenant l'ID du rôle dans l'URL
 * @returns Réponse de succès avec les données du rôle, ou une erreur appropriée
 * @throws Erreur 400 si l'ID du rôle est manquant
 * @throws Erreur 404 si le rôle n'est pas trouvé
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extraire l'ID des paramètres de l'URL
    const { id } = await context.params;

    if (!id) {
      return errorResponse({
        feedback: "ID de rôle manquant",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const role = await roleService.getRoleById(id);

    if (!role) {
      return notFoundResponse("Rôle introuvable");
    }

    return successResponse({
      data: role,
      feedback: "Rôle récupéré avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return handleApiError(error, "Erreur lors de la récupération du rôle");
  }
}

/**
 * Mettre à jour un rôle existant
 * @param req - La requête HTTP entrante contenant les données du rôle à mettre à jour
 * @returns Réponse de succès avec le rôle mis à jour, ou une erreur appropriée
 * @throws Erreur 400 si l'ID du rôle est manquant
 * @throws Erreur 404 si le rôle n'est pas trouvé
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export const PUT = withPrivilege<unknown, { params: Promise<{ id: string }> }>(
  PrivilegeName.UPDATE_DATA,
  async (req: NextRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      // Extraire l'ID des paramètres de l'URL
      const { id } = await context.params;

      if (!id) {
        return errorResponse({
          feedback: "ID de rôle manquant",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const data = await req.json();
      const { name, description, privilegeIds } = data;

      const updatedRole = await roleService.updateRole(id, {
        name,
        description,
        privilegeIds,
      });

      return successResponse({
        data: updatedRole,
        feedback: "Rôle mis à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      return handleApiError(error, "Erreur lors de la mise à jour du rôle");
    }
  }
);

/**
 * Supprimer un rôle existant
 * @param req - La requête HTTP entrante
 * @returns Réponse de succès si le rôle est supprimé, ou une erreur appropriée
 * @throws Erreur 400 si l'ID du rôle est manquant
 * @throws Erreur 403 si le rôle est permanent et ne peut pas être supprimé
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export const DELETE = withPrivilege(
  PrivilegeName.DELETE_DATA,
  async (req: NextRequest) => {
    console.log("delete role ");
    try {
      // Extraire l'ID des paramètres de l'URL
      const id = req.nextUrl.pathname.split("/").pop();

      if (!id) {
        return errorResponse({
          feedback: "ID de rôle manquant",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      await roleService.deleteRole(id);

      return successResponse({
        feedback: "Rôle supprimé avec succès",
        status: HttpStatus.OK,
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du rôle:", error);

      // Gestion spéciale pour les rôles permanents
      if (error instanceof Error && error.message.includes("permanent")) {
        return errorResponse({
          feedback: error.message,
          status: HttpStatus.FORBIDDEN,
        });
      }

      return handleApiError(error, "Erreur lors de la suppression du rôle");
    }
  }
);
