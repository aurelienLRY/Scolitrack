import { NextRequest } from "next/server";
import { CreateUserSchema } from "@/schemas/UserSchema";
import { withPrivilege } from "@/lib/services/auth.service";
import { createUser, getUsers } from "@/lib/services/user.service";
import {
  successResponse,
  handleApiError,
  createdResponse,
} from "@/lib/services/api.service";

/**
 * GET /api/users - Récupérer la liste des utilisateurs (admin seulement)
 */
export async function GET(request: NextRequest) {
  // Récupérer les paramètres de pagination de l'URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    // Récupérer les utilisateurs
    const result = await getUsers(page, limit);
    return successResponse({
      data: result.users,
      feedback: "Liste des utilisateurs récupérée avec succès",
      meta: result.pagination,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return handleApiError(
      error,
      "Erreur lors de la récupération des utilisateurs"
    );
  }
}

/**
 * POST /api/users - Créer un nouvel utilisateur
 */
export const POST = withPrivilege(
  "MANAGE_USERS",
  async (request: NextRequest) => {
    try {
      // Récupérer les données du corps de la requête
      const body = await request.json();
      console.log(body);

      // Valider les données
      const validatedData = await CreateUserSchema.validate(body);

      // Créer l'utilisateur
      const user = await createUser(validatedData);

      // Retourner l'utilisateur créé avec le format standard
      return createdResponse({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          roleName: user.roleName,
          createdAt: user.createdAt,
        },
        feedback: "Utilisateur créé avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la création de l'utilisateur"
      );
    }
  }
);
