import { NextRequest } from "next/server";
import { CommissionMemberSchema } from "@/schemas/commissionSchema";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import {
  addCommissionMember,
  getUserCommissions,
} from "@/lib/services/crud/commission.service";
import {
  successResponse,
  handleApiError,
  createdResponse,
  notFoundResponse,
} from "@/lib/services/api.service";
import { auth } from "@/lib/auth/auth";

/**
 * GET /api/commissions/members - Récupérer les commissions d'un utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté
    const session = await auth();
    
    if (!session?.user) {
      return notFoundResponse("Utilisateur non authentifié");
    }

    // Récupérer les paramètres de l'URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;
    
    // Récupérer les commissions de l'utilisateur
    const commissions = await getUserCommissions(userId);
    
    return successResponse({
      data: commissions,
      feedback: "Commissions de l'utilisateur récupérées avec succès",
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
 * POST /api/commissions/members - Ajouter un membre à une commission
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_COMMISSIONS,
  async (request: NextRequest) => {
    try {
      // Récupérer les données du corps de la requête
      const data = await request.json();
      
      // Valider les données
      const validatedData = await CommissionMemberSchema.validate(data);

      // Ajouter le membre à la commission
      const member = await addCommissionMember(validatedData);

      // Retourner le membre ajouté
      return createdResponse({
        data: member,
        feedback: "Membre ajouté à la commission avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de l'ajout du membre à la commission"
      );
    }
  }
); 