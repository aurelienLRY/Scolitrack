"use server";
import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentCampaignService } from "@/lib/services/enrollment/campaign.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { createEnrollmentCampaignSchema } from "@/schemas/EnrollmentSchema";
import { auth } from "@/lib/auth/auth";

/**
 * GET /api/enrollment/campaigns - Récupérer les campagnes d'inscription
 * Paramètres de requête optionnels:
 * - status: "active" | "upcoming" | "past" | "all" (défaut: "all")
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    
    let campaigns;
    
    switch (status) {
      case "active":
        campaigns = await enrollmentCampaignService.getActiveCampaigns();
        break;
      case "upcoming":
        campaigns = await enrollmentCampaignService.getUpcomingCampaigns();
        break;
      default:
        campaigns = await enrollmentCampaignService.getAllCampaigns();
        break;
    }
    
    return successResponse({
      data: campaigns,
      feedback: "Campagnes d'inscription récupérées avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des campagnes d'inscription"
    );
  }
}

/**
 * POST /api/enrollment/campaigns - Créer une nouvelle campagne d'inscription
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_CAMPAIGNS,
  async (request: NextRequest) => {
    try {
      const session = await auth();
      const body = await request.json();
      
      // Valider les données
      try {
        await createEnrollmentCampaignSchema.validate(body);
        /* TODO: une fois le campagne ouvert , recuperer tous les student    */






      } catch (validationError: unknown) {
        const errorMessage = validationError instanceof Error 
          ? validationError.message 
          : "Erreur de validation des données";
          
        return errorResponse({
          feedback: errorMessage,
          status: HttpStatus.BAD_REQUEST,
        });
      }
      
      // Créer la campagne
      const campaign = await enrollmentCampaignService.createCampaign(
        body,
        session?.user?.id ?? "NO_USER_ID"
      );
      
      return createdResponse({
        data: campaign,
        feedback: `Campagne d'inscription "${campaign.name}" créée avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la création de la campagne d'inscription"
      );
    }
  }
); 