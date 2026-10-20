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
import type { SignatureBatchItemInput } from "@/lib/services/enrollment/signature.service";

/**
 * POST /api/enrollment/signatures/batch
 * Body: { fileToken, email, items: [{ subjectKey, scopeRef?, childName? }] }
 * Un seul email + un lien pour toutes les clauses.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fileToken = typeof body?.fileToken === "string" ? body.fileToken : "";
    const email = typeof body?.email === "string" ? body.email : "";
    const rawItems = Array.isArray(body?.items) ? body.items : [];

    if (!fileToken || !email) {
      return errorResponse({
        feedback: "fileToken et email sont requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const items: SignatureBatchItemInput[] = [];
    for (const raw of rawItems) {
      const subjectKey =
        typeof raw?.subjectKey === "string" ? raw.subjectKey : "";
      if (!getSignatureSubject(subjectKey)) {
        return errorResponse({
          feedback: `subjectKey inconnu : ${subjectKey}`,
          status: HttpStatus.BAD_REQUEST,
        });
      }
      items.push({
        subjectKey: subjectKey as EnrollmentSignatureSubjectKey,
        scopeRef: typeof raw?.scopeRef === "string" ? raw.scopeRef : "",
        childName:
          typeof raw?.childName === "string" ? raw.childName : undefined,
      });
    }

    if (items.length === 0) {
      return errorResponse({
        feedback: "Au moins une clause est requise",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const result = await enrollmentSignatureService.requestSignatureBatch({
      fileToken,
      email,
      items,
    });

    if (result.alreadyFullySigned) {
      return successResponse({
        data: result,
        feedback: "Toutes ces signatures sont déjà enregistrées",
      });
    }

    return successResponse({
      data: result,
      feedback: `Un email avec le lien de signatures a été envoyé à ${email}`,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la demande groupée");
  }
}
