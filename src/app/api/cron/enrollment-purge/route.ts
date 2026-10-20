import { NextRequest } from "next/server";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { ENROLLMENT_SOFT_DELETE_RETENTION_DAYS } from "@/lib/enrollment/soft-delete";

/**
 * GET /api/cron/enrollment-purge
 * Purge définitive des dossiers en corbeille depuis ≥ le délai de rétention.
 * Protégé par Authorization: Bearer <CRON_SECRET>.
 *
 * Déclenché depuis cPanel via cron/enrollment-purge.js (voir cron/README.md).
 */
export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return errorResponse({
        feedback: "CRON_SECRET non configuré",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }

    const authHeader = request.headers.get("authorization");
    const bearer =
      authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (bearer !== secret) {
      return errorResponse({
        feedback: "Non autorisé",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const result = await enrollmentFileService.purgeSoftDeletedFiles(
      ENROLLMENT_SOFT_DELETE_RETENTION_DAYS
    );

    return successResponse({
      data: result,
      feedback:
        result.purged === 0
          ? "Aucun dossier à purger"
          : `${result.purged} dossier(s) purgé(s) définitivement`,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la purge des dossiers");
  }
}
