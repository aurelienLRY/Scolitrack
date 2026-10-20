import { NextRequest } from "next/server";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import {
  enrollmentFormPayloadDraftSchema,
  enrollmentFormPayloadSubmitSchema,
  updateEnrollmentFileByTokenSchema,
} from "@/schemas/EnrollmentSchema";

/**
 * GET /api/enrollment/files/token/[token] - Accès public au dossier
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const file = await enrollmentFileService.getFileByToken(token);

    if (!file) {
      return notFoundResponse(
        "Dossier d'inscription non trouvé ou token invalide"
      );
    }

    return successResponse({
      data: file,
      feedback: "Dossier d'inscription récupéré avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération du dossier d'inscription"
    );
  }
}

/**
 * PUT /api/enrollment/files/token/[token] - Enregistrement / soumission du formulaire public
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const existingFile = await enrollmentFileService.getFileByToken(token);

    if (!existingFile) {
      return notFoundResponse(
        "Dossier d'inscription non trouvé ou token invalide"
      );
    }

    if (
      existingFile.status !== "DRAFT" &&
      existingFile.status !== "NEED_INFO"
    ) {
      return errorResponse({
        feedback: "Ce dossier ne peut plus être modifié",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    try {
      await updateEnrollmentFileByTokenSchema.validate(body, {
        abortEarly: false,
      });
    } catch (validationError: unknown) {
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : "Erreur de validation des données";
      return errorResponse({
        feedback: errorMessage,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (!body?.formPayload) {
      return errorResponse({
        feedback: "Le formulaire (formPayload) est requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const isSubmit = body.status === "SUBMITTED";
    try {
      if (isSubmit) {
        await enrollmentFormPayloadSubmitSchema.validate(body.formPayload, {
          abortEarly: false,
        });
      } else {
        await enrollmentFormPayloadDraftSchema.validate(body.formPayload, {
          abortEarly: false,
        });
      }
    } catch (validationError: unknown) {
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : "Formulaire incomplet";
      return errorResponse({
        feedback: errorMessage,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const updatedFile = await enrollmentFileService.savePublicFormByToken(
      token,
      {
        email: typeof body.email === "string" ? body.email : undefined,
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        formPayload: body.formPayload,
      }
    );

    return successResponse({
      data: updatedFile,
      feedback: isSubmit
        ? "Dossier soumis avec succès"
        : "Brouillon enregistré",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la mise à jour du dossier d'inscription"
    );
  }
}
