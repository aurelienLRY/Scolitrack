import { NextRequest } from "next/server";
import { enrollmentDocumentService } from "@/lib/services/enrollment/document.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { isSensitiveDocumentCategory } from "@/config/enrollment-documents.config";
import { auth } from "@/lib/auth/auth";
import { hasPrivilege, PrivilegeName } from "@/config/privileges.config";
import { activityLogService } from "@/lib/services/crud/activity-log.service";

type RouteContext = { params: Promise<{ accessToken: string }> };

/**
 * GET — téléchargement d'un document via accessToken.
 * Query : fileToken (parent) OU session staff avec privilèges.
 * Docs sensibles (santé) : MANAGE_MEDICAL_INFORMATIONS ou MANAGE_ENROLLMENTS côté staff.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { accessToken } = await context.params;
    const fileToken = request.nextUrl.searchParams.get("fileToken");
    const inline =
      request.nextUrl.searchParams.get("view") === "1" ||
      request.nextUrl.searchParams.get("disposition") === "inline";

    const doc =
      await enrollmentDocumentService.getByAccessToken(accessToken);

    if (!doc) {
      return errorResponse({
        feedback: "Document introuvable",
        status: HttpStatus.NOT_FOUND,
      });
    }

    const session = await auth();
    const privilegeNames: string[] = Array.isArray(session?.user?.privileges)
      ? (session!.user!.privileges as string[])
      : [];
    const privilegeObjs = privilegeNames.map((name) => ({ name }));
    const isStaff =
      !!session?.user &&
      hasPrivilege(privilegeObjs, PrivilegeName.MANAGE_ENROLLMENTS);

    const tokenOk = Boolean(fileToken && doc.fileToken === fileToken);

    if (!tokenOk && !isStaff) {
      return errorResponse({
        feedback: "Accès non autorisé",
        status: HttpStatus.FORBIDDEN,
      });
    }

    if (fileToken && doc.fileToken !== fileToken && !isStaff) {
      return errorResponse({
        feedback: "Accès non autorisé",
        status: HttpStatus.FORBIDDEN,
      });
    }

    if (isSensitiveDocumentCategory(doc.category) && isStaff && !tokenOk) {
      const canMedical =
        hasPrivilege(
          privilegeObjs,
          PrivilegeName.MANAGE_MEDICAL_INFORMATIONS
        ) || hasPrivilege(privilegeObjs, PrivilegeName.MANAGE_ENROLLMENTS);
      if (!canMedical) {
        return errorResponse({
          feedback: "Privilège insuffisant pour un document de santé",
          status: HttpStatus.FORBIDDEN,
        });
      }
    }

    const buffer = await enrollmentDocumentService.readFileBuffer(
      doc.storagePath
    );

    if (isStaff && session?.user?.id) {
      await activityLogService.logActivity({
        userId: session.user.id,
        action: "VIEW_ENROLLMENT_DOCUMENT",
        details: `Accès document ${doc.category} #${doc.id} (sensible=${isSensitiveDocumentCategory(doc.category)})`,
      });
    }

    const safeName = doc.originalName.replace(/"/g, "");
    const disposition = inline
      ? `inline; filename="${safeName}"`
      : `attachment; filename="${safeName}"`;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType || "application/octet-stream",
        "Content-Length": String(doc.sizeBytes),
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors du téléchargement");
  }
}

/**
 * DELETE — suppression (dossier encore modifiable).
 * Query : fileToken (obligatoire).
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { accessToken } = await context.params;
    const fileToken = request.nextUrl.searchParams.get("fileToken");

    if (!fileToken) {
      return errorResponse({
        feedback: "fileToken requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const result = await enrollmentDocumentService.deleteByAccessToken(
      accessToken,
      fileToken
    );

    return successResponse({
      data: result,
      feedback: "Document supprimé",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la suppression");
  }
}
