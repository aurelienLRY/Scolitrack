import { NextRequest } from "next/server";
import { enrollmentSignatureService } from "@/lib/services/enrollment/signature.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { getSignatureSubject } from "@/config/enrollment-signatures.config";
import type { EnrollmentSignatureSubjectKey } from "@/config/enrollment-signatures.config";

/**
 * GET /api/enrollment/signatures?fileToken=...
 * Liste des signatures d'un dossier (accès public via token dossier).
 */
export async function GET(request: NextRequest) {
  try {
    const fileToken = request.nextUrl.searchParams.get("fileToken");
    if (!fileToken) {
      return errorResponse({
        feedback: "fileToken requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const signatures =
      await enrollmentSignatureService.listByFileToken(fileToken);

    return successResponse({
      data: signatures,
      feedback: "Signatures récupérées",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération des signatures");
  }
}

/**
 * POST /api/enrollment/signatures
 * Demande d'envoi d'un email de signature.
 * Body: { fileToken, email, subjectKey, scopeRef?, childName? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fileToken = typeof body?.fileToken === "string" ? body.fileToken : "";
    const email = typeof body?.email === "string" ? body.email : "";
    const subjectKey =
      typeof body?.subjectKey === "string" ? body.subjectKey : "";
    const scopeRef =
      typeof body?.scopeRef === "string" ? body.scopeRef : "";
    const childName =
      typeof body?.childName === "string" ? body.childName : undefined;

    if (!fileToken || !email || !subjectKey) {
      return errorResponse({
        feedback: "fileToken, email et subjectKey sont requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (!getSignatureSubject(subjectKey)) {
      return errorResponse({
        feedback: "subjectKey inconnu",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const result = await enrollmentSignatureService.requestSignature({
      fileToken,
      email,
      subjectKey: subjectKey as EnrollmentSignatureSubjectKey,
      scopeRef,
      childName,
    });

    if (result.alreadySigned) {
      return successResponse({
        data: result.signature,
        feedback: "Cette signature est déjà enregistrée pour cette campagne",
      });
    }

    return successResponse({
      data: result.signature,
      feedback: `Email de signature envoyé à ${email}`,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la demande de signature");
  }
}
