import { NextRequest } from "next/server";
import { enrollmentDocumentService } from "@/lib/services/enrollment/document.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
  createdResponse,
} from "@/lib/services/api.service";
import { getDocumentCategoryMeta } from "@/config/enrollment-documents.config";
import type { EnrollmentDocumentCategory } from "@prisma/client";

type RouteContext = { params: Promise<{ token: string }> };

/**
 * GET — liste des documents du dossier (accès public via token).
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    if (!token) {
      return errorResponse({
        feedback: "Token requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const documents =
      await enrollmentDocumentService.listByFileToken(token);

    return successResponse({
      data: documents,
      feedback: "Documents récupérés",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la liste des documents");
  }
}

/**
 * POST multipart — dépôt d'un document.
 * formData: file, category, scopeRef?
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    if (!token) {
      return errorResponse({
        feedback: "Token requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const categoryRaw = String(formData.get("category") ?? "");
    const scopeRef = String(formData.get("scopeRef") ?? "");

    if (!getDocumentCategoryMeta(categoryRaw)) {
      return errorResponse({
        feedback: "Catégorie de document invalide",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (!file || !(file instanceof Blob)) {
      return errorResponse({
        feedback: "Fichier requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName =
      typeof (file as File).name === "string" && (file as File).name
        ? (file as File).name
        : "document";
    const mimeType = file.type || "application/octet-stream";

    const document = await enrollmentDocumentService.upload({
      fileToken: token,
      category: categoryRaw as EnrollmentDocumentCategory,
      scopeRef,
      uploadedBy: "PARENT",
      fileName,
      mimeType,
      buffer,
    });

    return createdResponse({
      data: document,
      feedback: "Document déposé",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors du dépôt du document");
  }
}
