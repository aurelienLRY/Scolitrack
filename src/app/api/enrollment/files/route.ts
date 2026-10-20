import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { createEnrollmentFileSchema } from "@/schemas/EnrollmentSchema";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/enrollment/files - Récupérer les dossiers d'inscription
 * Paramètres de requête optionnels:
 * - status: statut du dossier (DRAFT, SUBMITTED, NEED_INFO, APPROVED, REJECTED)
 * - campaignId: ID de la campagne
 * - familyId: ID de la famille
 * - email: email du contact
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: Record<string, string> = {};

    if (searchParams.has("status")) {
      filters.status = searchParams.get("status") as string;
    }

    if (searchParams.has("campaignId")) {
      filters.campaignId = searchParams.get("campaignId") as string;
    }

    if (searchParams.has("familyId")) {
      filters.familyId = searchParams.get("familyId") as string;
    }

    if (searchParams.has("email")) {
      filters.email = searchParams.get("email") as string;
    }

    const files = await enrollmentFileService.getAllFiles(filters);

    const response = successResponse({
      data: files,
      feedback: "Dossiers d'inscription récupérés avec succès",
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des dossiers d'inscription"
    );
  }
}

/**
 * POST /api/enrollment/files - Créer un nouveau dossier d'inscription
 */
export const POST = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (request: NextRequest) => {
    try {
      const session = await auth();
      
      if (!session || !session.user) {
        return errorResponse({
          feedback: "Non authentifié",
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      
      const body = await request.json();
      
      // Valider les données
      try {
        await createEnrollmentFileSchema.validate(body);
      } catch (validationError: unknown) {
        const errorMessage = validationError instanceof Error 
          ? validationError.message 
          : "Erreur de validation des données";
          
        return errorResponse({
          feedback: errorMessage,
          status: HttpStatus.BAD_REQUEST,
        });
      }
      
      // Créer le dossier
      const file = await enrollmentFileService.createFile(
        body,
        session.user.id
      );
      
      return createdResponse({
        data: file,
        feedback: `Dossier d'inscription créé avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la création du dossier d'inscription"
      );
    }
  }
); 