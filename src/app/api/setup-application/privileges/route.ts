"use server";
import { privilegeService } from "@/lib/services/crud/privilege.service";
import { successResponse, handleApiError } from "@/lib/services/api.service";

/**
 * Récupérer tous les privilèges disponibles dans l'application
 * @returns Réponse de succès avec la liste des privilèges, ou une erreur appropriée
 * @throws Erreur 500 pour les erreurs serveur
 */
export async function GET() {
  try {
    const privileges = await privilegeService.getAllPrivileges();
    return successResponse({
      data: privileges,
      feedback: "Liste des privilèges récupérée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des privilèges:", error);
    return handleApiError(
      error,
      "Erreur lors de la récupération des privilèges"
    );
  }
}
