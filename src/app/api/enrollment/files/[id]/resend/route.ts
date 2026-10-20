import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { auth } from "@/lib/auth/auth";

/**
 * POST /api/enrollment/files/[id]/resend - Renvoyer l'email d'invitation du dossier
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return errorResponse({
          feedback: "Non authentifié",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const { id } = await params;
      const existingFile = await enrollmentFileService.getFileById(id);

      if (!existingFile) {
        return notFoundResponse(`Dossier d'inscription avec l'ID ${id} non trouvé`);
      }

      const file = await enrollmentFileService.resendInvitation(id, session.user.id);

      return successResponse({
        data: file,
        feedback: "Invitation renvoyée avec succès",
      });
    } catch (error) {
      return handleApiError(error, "Erreur lors du renvoi de l'invitation");
    }
  }
);

