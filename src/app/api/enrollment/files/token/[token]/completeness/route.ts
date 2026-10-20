import { NextRequest } from "next/server";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/services/api.service";

/**
 * GET /api/enrollment/files/token/[token]/completeness
 * Checklist publique (parent) pour bloquer la soumission côté UI.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const data = await enrollmentFileService.getCompleteness({ token });
    return successResponse({
      data: {
        docsOk: data.docsOk,
        signaturesOk: data.signaturesOk,
        missingDocs: data.missingDocs,
        missingSignatures: data.missingSignatures,
        blockers: data.blockers,
      },
      feedback: "Checklist dossier récupérée",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("non trouvé")) {
      return notFoundResponse(error.message);
    }
    return handleApiError(error, "Erreur checklist dossier");
  }
}
