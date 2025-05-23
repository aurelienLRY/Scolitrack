"use server";
import { NextRequest } from "next/server";
import { roleService } from "@/lib/services/crud/role.service";
import {
  successResponse,
  createdResponse,
  handleApiError,
  errorResponse,
  HttpStatus,
} from "@/lib/services/api.service";
// Obtenir tous les rôles
export async function GET() {
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
}

// Créer un nouveau rôle
export async function POST(req: NextRequest) {
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
}
