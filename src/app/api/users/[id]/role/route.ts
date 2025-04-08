import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { roleService } from "@/lib/services/role.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * Mise à jour du rôle d'un utilisateur
 */
export const PUT = withPrivilege(
  PrivilegeName.UPDATE_DATA,
  async (req: NextRequest) => {
    try {
      // Extraire l'ID de l'utilisateur des paramètres de l'URL
      const pathSegments = req.nextUrl.pathname.split("/");
      const userId = pathSegments[pathSegments.indexOf("users") + 1];

      if (!userId) {
        return errorResponse({
          feedback: "ID d'utilisateur manquant",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const data = await req.json();
      const { roleName } = data;

      if (!roleName) {
        return errorResponse({
          feedback: "Le nom du rôle est requis",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Assigner le rôle à l'utilisateur
      const updatedUser = await roleService.assignRoleToUser(userId, roleName);

      return successResponse({
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          roleName: updatedUser.roleName,
        },
        feedback: `Rôle '${roleName}' attribué avec succès à l'utilisateur`,
      });
    } catch (error) {
      console.error("Erreur lors de l'attribution du rôle:", error);

      // Gestion des erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes("n'existe pas")) {
          return errorResponse({
            feedback: error.message,
            status: HttpStatus.NOT_FOUND,
          });
        } else if (error.message.includes("Utilisateur introuvable")) {
          return errorResponse({
            feedback: error.message,
            status: HttpStatus.NOT_FOUND,
          });
        } else if (error.message.includes("SUPER_ADMIN")) {
          return errorResponse({
            feedback: error.message,
            status: HttpStatus.CONFLICT,
          });
        }
      }

      return handleApiError(error, "Erreur lors de l'attribution du rôle");
    }
  }
);
