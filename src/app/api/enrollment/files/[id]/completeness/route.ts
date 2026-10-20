import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/services/api.service";

/**
 * GET /api/enrollment/files/[id]/completeness
 * Checklist documents + signatures (staff).
 */
export const GET = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const data = await enrollmentFileService.getCompleteness({ id });
      return successResponse({
        data,
        feedback: "Checklist dossier récupérée",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("non trouvé")
      ) {
        return notFoundResponse(error.message);
      }
      return handleApiError(error, "Erreur checklist dossier");
    }
  }
);
