import { NextRequest } from "next/server";
import { roleService } from "@/lib/services/role.service";
import { withPrivilege } from "@/lib/services/auth.service";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Récupérer un rôle par son ID
export async function GET(req: NextRequest) {
  try {
    // Extraire l'ID des paramètres de l'URL
    const id = req.nextUrl.pathname.split("/").pop();

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

// Mettre à jour un rôle
export const PUT = withPrivilege("UPDATE_DATA", async (req: NextRequest) => {
  try {
    // Extraire l'ID des paramètres de l'URL
    const id = req.nextUrl.pathname.split("/").pop();

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
});

// Supprimer un rôle
export const DELETE = withPrivilege("DELETE_DATA", async (req: NextRequest) => {
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
});
