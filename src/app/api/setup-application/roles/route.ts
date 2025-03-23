import { NextRequest } from "next/server";
import { roleService } from "@/lib/services/role.service";
import { withPrivilege } from "@/lib/services/auth.service";
import {
  successResponse,
  createdResponse,
  handleApiError,
  errorResponse,
  HttpStatus,
} from "@/lib/services/api.service";

// Obtenir tous les rôles
export const GET = withPrivilege("VIEW_ROLE", async () => {
  try {
    const roles = await roleService.getAllRoles();
    return successResponse({
      data: roles,
      feedback: "Liste des rôles récupérée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    return handleApiError(error, "Erreur lors de la récupération des rôles");
  }
});

// Créer un nouveau rôle
export const POST = withPrivilege("CREATE_ROLE", async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { name, description, privilegeIds } = data;

    if (!name) {
      return errorResponse({
        feedback: "Le nom du rôle est requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const preName = name.toUpperCase().replace(/ /g, "_");

    const role = await roleService.createRole({
      name: preName,
      description,
      privilegeIds,
    });

    return createdResponse({
      data: role,
      feedback: "Rôle créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création du rôle:", error);
    return handleApiError(error, "Erreur lors de la création du rôle");
  }
});
