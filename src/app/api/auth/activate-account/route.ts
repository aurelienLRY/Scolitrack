"use server";
import { NextRequest } from "next/server";
import { ActivateAccountSchema } from "@/schemas/UserSchema";
import { activateAccount } from "@/lib/services/user.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * POST /api/users/activate - Activer un compte utilisateur et définir son mot de passe
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const body = await request.json();

    // Valider les données
    const validatedData = await ActivateAccountSchema.validate(body);

    // Activer le compte
    const user = await activateAccount(
      validatedData.token,
      validatedData.password
    );

    // Retourner la confirmation
    return successResponse({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: user.roleName,
      },
      feedback: "Compte activé avec succès",
    });
  } catch (error: unknown) {
    console.error("Erreur lors de l'activation du compte:", error);

    // Traiter les erreurs de validation Yup
    if (error instanceof Error && error.name === "ValidationError") {
      return errorResponse({
        feedback: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Traiter les erreurs connues
    if (
      error instanceof Error &&
      error.message === "Token invalide ou expiré"
    ) {
      return errorResponse({
        feedback: error.message,
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // Erreur générique
    return handleApiError(error, "Erreur lors de l'activation du compte");
  }
}
