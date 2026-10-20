import { NextRequest } from "next/server";
import { enrollmentSignatureService } from "@/lib/services/enrollment/signature.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * GET /api/enrollment/signatures/confirm/[confirmToken]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ confirmToken: string }> }
) {
  try {
    const { confirmToken } = await params;
    const signature =
      await enrollmentSignatureService.getByConfirmToken(confirmToken);

    if (!signature) {
      return notFoundResponse("Lien de signature invalide");
    }

    return successResponse({
      data: {
        id: signature.id,
        status: signature.status,
        subjectKey: signature.subjectKey,
        subjectLabel: signature.subjectLabel,
        acceptanceText: signature.acceptanceText,
        email: signature.email,
        confirmedAt: signature.confirmedAt,
        campaign: signature.campaign,
        linkExpiresAt: signature.linkExpiresAt,
      },
      feedback: "Signature récupérée",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération de la signature");
  }
}

/**
 * POST /api/enrollment/signatures/confirm/[confirmToken]
 * Body: { accepted: true }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ confirmToken: string }> }
) {
  try {
    const { confirmToken } = await params;
    const body = await request.json().catch(() => ({}));

    if (body?.accepted !== true) {
      return errorResponse({
        feedback: "Vous devez cocher l'acceptation pour valider",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent");

    const signature = await enrollmentSignatureService.confirmSignature({
      confirmToken,
      accepted: true,
      ip,
      userAgent,
    });

    return successResponse({
      data: signature,
      feedback: "Signature enregistrée",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la confirmation de signature");
  }
}
