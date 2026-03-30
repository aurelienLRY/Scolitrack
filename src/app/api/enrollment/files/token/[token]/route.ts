import { NextRequest } from "next/server";
import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * GET /api/enrollment/files/token/[token] - Récupérer un dossier d'inscription par son token (accès public)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    const file = await enrollmentFileService.getFileByToken(token);
    
    if (!file) {
      return notFoundResponse("Dossier d'inscription non trouvé ou token invalide");
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
 * PUT /api/enrollment/files/token/[token] - Mettre à jour un dossier d'inscription par son token (accès public)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    
    // Vérifier si le dossier existe
    const existingFile = await enrollmentFileService.getFileByToken(token);
    
    if (!existingFile) {
      return notFoundResponse("Dossier d'inscription non trouvé ou token invalide");
    }
    
    // Vérifier que le dossier peut être modifié (statut DRAFT ou NEED_INFO)
    if (existingFile.status !== "DRAFT" && existingFile.status !== "NEED_INFO") {
      return errorResponse({
        feedback: "Ce dossier ne peut plus être modifié",
        status: HttpStatus.BAD_REQUEST,
      });
    }
    
    // Mettre à jour le dossier
    const updatedFile = await enrollmentFileService.updateFile(
      existingFile.id,
      body,
      "public" // Utilisateur public
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
