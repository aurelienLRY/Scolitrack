import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
} from "@/lib/services/api.service";
import { updateEnrollmentFileSchema } from "@/schemas/EnrollmentSchema";
import { auth } from "@/lib/auth/auth";
import { ENROLLMENT_SOFT_DELETE_RETENTION_DAYS } from "@/lib/enrollment/soft-delete";

/**
 * GET /api/enrollment/files/[id] - Récupérer un dossier d'inscription par son ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const file = await enrollmentFileService.getFileById(id);

    if (!file) {
      return notFoundResponse(`Dossier d'inscription avec l'ID ${id} non trouvé`);
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
 * PUT /api/enrollment/files/[id] - Mettre à jour un dossier d'inscription
 */
export const PUT = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const session = await auth();
      
      if (!session || !session.user) {
        return errorResponse({
          feedback: "Non authentifié",
          status: 401,
        });
      }
      
      const { id } = await params;
      const body = await request.json();
      
      // Vérifier si le dossier existe
      const existingFile = await enrollmentFileService.getFileById(id);
      
      if (!existingFile) {
        return notFoundResponse(`Dossier d'inscription avec l'ID ${id} non trouvé`);
      }
      
      // Valider les données
      try {
        await updateEnrollmentFileSchema.validate(body);
      } catch (validationError: unknown) {
        const errorMessage = validationError instanceof Error 
          ? validationError.message 
          : "Erreur de validation des données";
          
        return errorResponse({
          feedback: errorMessage,
          status: 400,
        });
      }
      
      // Mettre à jour le dossier
      const updatedFile = await enrollmentFileService.updateFile(
        id,
        body,
        session.user.id
      );
      
      return successResponse({
        data: updatedFile,
        feedback: "Dossier d'inscription mis à jour avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la mise à jour du dossier d'inscription"
      );
    }
  }
);

/**
 * DELETE /api/enrollment/files/[id] - Supprimer un dossier d'inscription
 */
export const DELETE = withPrivilege(
  PrivilegeName.MANAGE_ENROLLMENTS,
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const session = await auth();
      
      if (!session || !session.user) {
        return errorResponse({
          feedback: "Non authentifié",
          status: 401,
        });
      }
      
      const { id } = await params;
      
      // Vérifier si le dossier existe
      const existingFile = await enrollmentFileService.getFileById(id);
      
      if (!existingFile) {
        return notFoundResponse(`Dossier d'inscription avec l'ID ${id} non trouvé`);
      }
      
      // Soft-delete : corbeille puis purge après le délai de rétention
      const file = await enrollmentFileService.deleteFile(id, session.user.id);

      return successResponse({
        data: file,
        feedback: `Dossier mis en corbeille. Suppression définitive dans ${ENROLLMENT_SOFT_DELETE_RETENTION_DAYS} jours.`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la suppression du dossier d'inscription"
      );
    }
  }
); 