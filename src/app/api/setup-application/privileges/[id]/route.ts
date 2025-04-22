"use server";
import { NextRequest } from "next/server";
import { privilegeService } from "@/lib/services/crud/privilege.service";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/services/api.service";

/**
 * Récupérer un privilège par son ID
 * @param req - La requête HTTP entrante
 * @param args - Les arguments de la requête
 * @returns Réponse de succès avec les données du privilège, ou une erreur appropriée
 * @throws Erreur 404 si le privilège n'est pas trouvé
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const privilege = await privilegeService.getPrivilegeById(id);

    if (!privilege) {
      return notFoundResponse("Privilège non trouvé");
    }

    return successResponse({
      data: privilege,
      feedback: "Privilège récupéré avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du privilège:", error);
    return handleApiError(error, "Erreur lors de la récupération du privilège");
  }
}
