"use server";
import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentCampaignService } from "@/lib/services/enrollment/campaign.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { updateEnrollmentCampaignSchema } from "@/schemas/EnrollmentSchema";
import { auth } from "@/lib/auth/auth";

/**
 * GET /api/enrollment/campaigns/[id] - Récupérer une campagne d'inscription spécifique
 * 
 * @param request La requête entrante
 * @param context Le contexte contenant les paramètres de route
 * @returns La campagne d'inscription
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    const campaign = await enrollmentCampaignService.getCampaignById(id);
    
    if (!campaign) {
      return notFoundResponse("Campagne d'inscription non trouvée");
    }
    
    return successResponse({
      data: campaign,
      feedback: `Campagne d'inscription "${campaign.name}" récupérée avec succès`,
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération de la campagne d'inscription"
    );
  }
}

/**
 * PUT /api/enrollment/campaigns/[id] - Mettre à jour une campagne d'inscription
 * 
 * @param request La requête entrante
 * @param context Le contexte contenant les paramètres de route
 * @returns La campagne d'inscription mise à jour
 */
export const PUT = withPrivilege(
  PrivilegeName.MANAGE_CAMPAIGNS,
  async (
    request: NextRequest,
    context: { params: { id: string } }
  ) => {
    try {
      const session = await auth();
      
      if (!session || !session.user) {
        return errorResponse({
          feedback: "Non authentifié",
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      
      const { id } = context.params;
      const body = await request.json();
      
      // Valider les données
      try {
        await updateEnrollmentCampaignSchema.validate(body);
      } catch (validationError: unknown) {
        const errorMessage = validationError instanceof Error 
          ? validationError.message 
          : "Erreur de validation des données";
          
        return errorResponse({
          feedback: errorMessage,
          status: HttpStatus.BAD_REQUEST,
        });
      }
      
      // Vérifier si la campagne existe
      const existingCampaign = await enrollmentCampaignService.getCampaignById(id);
      
      if (!existingCampaign) {
        return notFoundResponse("Campagne d'inscription non trouvée");
      }
      
      // Mettre à jour la campagne
      const campaign = await enrollmentCampaignService.updateCampaign(
        id,
        body,
        session.user.id
      );
      
      return successResponse({
        data: campaign,
        feedback: `Campagne d'inscription "${campaign.name}" mise à jour avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la mise à jour de la campagne d'inscription"
      );
    }
  }
);

/**
 * DELETE /api/enrollment/campaigns/[id] - Supprimer une campagne d'inscription
 * 
 * @param request La requête entrante
 * @param context Le contexte contenant les paramètres de route
 * @returns Confirmation de suppression
 */
export const DELETE = withPrivilege(
  PrivilegeName.MANAGE_CAMPAIGNS,
  async (
    request: NextRequest,
    context: { params: { id: string } }
  ) => {
    try {
      const session = await auth();
      
      if (!session || !session.user) {
        return errorResponse({
          feedback: "Non authentifié",
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      
      const { id } = context.params;
      
      // Vérifier si la campagne existe
      const existingCampaign = await enrollmentCampaignService.getCampaignById(id);
      
      if (!existingCampaign) {
        return notFoundResponse("Campagne d'inscription non trouvée");
      }
      
      // Supprimer la campagne
      await enrollmentCampaignService.deleteCampaign(id, session.user.id);
      
      return successResponse({
        feedback: `Campagne d'inscription "${existingCampaign.name}" supprimée avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la suppression de la campagne d'inscription"
      );
    }
  }
); 