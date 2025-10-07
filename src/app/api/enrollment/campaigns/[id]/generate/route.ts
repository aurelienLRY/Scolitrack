import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import { enrollmentCampaignService } from "@/lib/services/enrollment/campaign.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { generateEnrollmentFilesSchema } from "@/schemas/EnrollmentSchema";
import { auth } from "@/lib/auth/auth";

/**
 * POST /api/enrollment/campaigns/[id]/generate - Générer des dossiers d'inscription pour une liste d'emails
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_CAMPAIGNS,
  async (
    request: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    try {
      const session = await auth();
      
      if (!session || !session.user) {
        return errorResponse({
          feedback: "Non authentifié",
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      
      const { id } = params;
      const body = await request.json();
      
      // Vérifier si la campagne existe
      const campaign = await enrollmentCampaignService.getCampaignById(id);
      
      if (!campaign) {
        return notFoundResponse("Campagne d'inscription non trouvée");
      }
      
      // Valider les données
      try {
        await generateEnrollmentFilesSchema.validate(body);
      } catch (validationError: unknown) {
        const errorMessage = validationError instanceof Error 
          ? validationError.message 
          : "Erreur de validation des données";
          
        return errorResponse({
          feedback: errorMessage,
          status: HttpStatus.BAD_REQUEST,
        });
      }
      
      // Générer les dossiers
      const createdFiles = await enrollmentFileService.generateFilesForEmails(
        id,
        body.emails,
        session.user.id
      );
      
      return successResponse({
        data: {
          campaignId: id,
          campaignName: campaign.name,
          generatedCount: createdFiles.length,
          files: createdFiles,
        },
        feedback: `${createdFiles.length} dossiers d'inscription générés avec succès pour la campagne "${campaign.name}"`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la génération des dossiers d'inscription"
      );
    }
  }
);
