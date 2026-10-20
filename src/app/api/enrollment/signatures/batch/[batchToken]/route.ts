import { NextRequest } from "next/server";
import { enrollmentSignatureService } from "@/lib/services/enrollment/signature.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

type Ctx = { params: Promise<{ batchToken: string }> };

/**
 * GET — contenu du lot de signatures.
 */
export async function GET(_request: NextRequest, context: Ctx) {
  try {
    const { batchToken } = await context.params;
    const batch =
      await enrollmentSignatureService.getBatchByToken(batchToken);

    if (!batch) {
      return notFoundResponse("Lien de signatures invalide");
    }

    return successResponse({
      data: batch,
      feedback: "Lot de signatures récupéré",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération du lot");
  }
}

/**
 * POST — valider toutes les décisions.
 * Body: { decisions: [{ id, accepted: boolean }] }
 */
export async function POST(request: NextRequest, context: Ctx) {
  try {
    const { batchToken } = await context.params;
    const body = await request.json().catch(() => ({}));
    const decisions = Array.isArray(body?.decisions) ? body.decisions : [];

    if (decisions.length === 0) {
      return errorResponse({
        feedback: "Décisions manquantes",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const normalized = decisions.map(
      (d: { id?: unknown; accepted?: unknown }) => ({
        id: typeof d?.id === "string" ? d.id : "",
        accepted: d?.accepted === true,
      })
    );

    if (normalized.some((d: { id: string }) => !d.id)) {
      return errorResponse({
        feedback: "Chaque décision doit avoir un id",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent");

    const batch = await enrollmentSignatureService.confirmBatch({
      batchToken,
      decisions: normalized,
      ip,
      userAgent,
    });

    return successResponse({
      data: batch,
      feedback: "Signatures enregistrées",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la validation du lot");
  }
}
