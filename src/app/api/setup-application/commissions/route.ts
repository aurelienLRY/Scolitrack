import { NextRequest } from "next/server";
import { CommissionSchema } from "@/schemas/commissionSchema";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import {
  createCommission,
  getAllCommissions,
  getCommissionsByEstablishment,
} from "@/lib/services/crud/commission.service";
import {
  successResponse,
  handleApiError,
  createdResponse,
} from "@/lib/services/api.service";

/**
 * GET /api/commissions - Récupérer la liste des commissions
 */
export async function GET(request: NextRequest) {
  // Récupérer les paramètres de l'URL
  const { searchParams } = new URL(request.url);
  const establishmentId = searchParams.get("establishmentId");

  try {
    let result;
    
    if (establishmentId) {
      // Récupérer les commissions d'un établissement spécifique
      result = await getCommissionsByEstablishment(establishmentId);
    } else {
      // Récupérer toutes les commissions
      result = await getAllCommissions();
    }
    
    return successResponse({
      data: result,
      feedback: "Liste des commissions récupérée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commissions:", error);
    return handleApiError(
      error,
      "Erreur lors de la récupération des commissions"
    );
  }
}

/**
 * POST /api/commissions - Créer une nouvelle commission
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_COMMISSIONS,
  async (request: NextRequest) => {
    try {
      // Récupérer les données du corps de la requête
      const data = await request.json();
      
      // Valider les données
      const validatedData = await CommissionSchema.validate(data);

      // Créer la commission
      const commission = await createCommission(validatedData);

      // Retourner la commission créée avec le format standard
      return createdResponse({
        data: commission,
        feedback: "Commission créée avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la création de la commission"
      );
    }
  }
); 