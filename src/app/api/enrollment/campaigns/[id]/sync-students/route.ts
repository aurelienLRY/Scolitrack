import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentCampaignService } from "@/lib/services/enrollment/campaign.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/services/api.service";
import { auth } from "@/lib/auth/auth";

/**
 * POST /api/enrollment/campaigns/[id]/sync-students
 * Crée des dossiers pour les familles déjà scolarisées.
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_CAMPAIGNS,
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return errorResponse({
          feedback: "Non authentifié",
          status: 401,
        });
      }

      const { id } = await params;
      const result =
        await enrollmentCampaignService.generateFilesForExistingStudents(
          id,
          session.user.id
        );

      return successResponse({
        data: result,
        feedback: `${result.created} dossier(s) créé(s) pour les élèves existants`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la synchronisation des élèves"
      );
    }
  }
);