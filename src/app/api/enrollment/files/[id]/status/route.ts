import { NextRequest } from "next/server";
import { withPrivilege, PrivilegeName } from "@/lib/services/auth.service";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { updateEnrollmentStatusSchema } from "@/schemas/EnrollmentSchema";
import { auth } from "@/lib/auth/auth";

/**
 * PUT /api/enrollment/files/[id]/status - Mettre à jour le statut d'un dossier d'inscription
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
          status: HttpStatus.UNAUTHORIZED,
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
        await updateEnrollmentStatusSchema.validate(body);
      } catch (validationError: unknown) {
        const errorMessage = validationError instanceof Error 
          ? validationError.message 
          : "Erreur de validation des données";
          
        return errorResponse({
          feedback: errorMessage,
          status: HttpStatus.BAD_REQUEST,
        });
      }
      
      // Mettre à jour le statut
      const updatedFile = await enrollmentFileService.updateStatus({
        fileId: id,
        newStatus: body.status,
        actorId: session.user.id,
        note: body.note,
      });
      
      return successResponse({
        data: updatedFile,
        feedback: `Statut du dossier d'inscription mis à jour avec succès`,
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la mise à jour du statut du dossier d'inscription"
      );
    }
  }
);
