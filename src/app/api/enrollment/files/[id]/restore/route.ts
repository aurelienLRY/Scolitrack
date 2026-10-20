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
 * POST /api/enrollment/files/[id]/restore - Restaurer un dossier depuis la corbeille
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (
    _request: NextRequest,
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
        return notFoundResponse(
          `Dossier d'inscription avec l'ID ${id} non trouvé`
        );
      }

      const file = await enrollmentFileService.restoreFile(id, session.user.id);

      return successResponse({
        data: file,
        feedback: "Dossier restauré depuis la corbeille",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la restauration du dossier d'inscription"
      );
    }
  }
);
