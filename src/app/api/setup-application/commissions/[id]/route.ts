import { NextRequest } from "next/server";
import { CommissionUpdateSchema } from "@/schemas/commissionSchema";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import {
  getCommissionById,
  updateCommission,
  deleteCommission,
} from "@/lib/services/crud/commission.service";
import {
  successResponse,
  handleApiError,
  notFoundResponse,
} from "@/lib/services/api.service";

/**
 * GET /api/commissions/[id] - Récupérer une commission par son ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const commission = await getCommissionById(id);
    
    if (!commission) {
      return notFoundResponse("Commission non trouvée");
    }
    
    return successResponse({
      data: commission,
      feedback: "Commission récupérée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la commission:", error);
    return handleApiError(
      error,
      "Erreur lors de la récupération de la commission"
    );
  }
}

/**
 * PUT /api/commissions/[id] - Mettre à jour une commission
 */
export const PUT = withPrivilege(
  PrivilegeName.UPDATE_DATA,
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;

      // Vérifier si la commission existe
      const existingCommission = await getCommissionById(id);
      
      if (!existingCommission) {
        return notFoundResponse("Commission non trouvée");
      }
      
      // Récupérer les données du corps de la requête
      const data = await request.json();
      
      // Valider les données
      const validatedData = await CommissionUpdateSchema.validate(data);

      // Mettre à jour la commission
      const updatedCommission = await updateCommission(id, validatedData);

      // Retourner la commission mise à jour
      return successResponse({
        data: updatedCommission,
        feedback: "Commission mise à jour avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la mise à jour de la commission"
      );
    }
  }
);

/**
 * DELETE /api/commissions/[id] - Supprimer une commission
 */
export const DELETE = withPrivilege(
  PrivilegeName.DELETE_DATA,
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await context.params;

      // Vérifier si la commission existe
      const existingCommission = await getCommissionById(id);
      
      if (!existingCommission) {
        return notFoundResponse("Commission non trouvée");
      }
      
      // Supprimer la commission
      await deleteCommission(id);

      // Retourner une réponse de succès
      return successResponse({
        feedback: "Commission supprimée avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la suppression de la commission"
      );
    }
  }
); 