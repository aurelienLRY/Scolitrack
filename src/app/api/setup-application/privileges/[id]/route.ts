import { NextRequest } from "next/server";
import { privilegeService } from "@/lib/services/privilege.service";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Récupérer un privilège par son ID
export async function GET(req: NextRequest) {
  try {
    // Extraire l'ID du privilège de l'URL
    const id = req.url.split("/").pop();

    if (!id) {
      return errorResponse({
        feedback: "ID du privilège manquant",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const privilege = await privilegeService.getPrivilegeById(id);

    if (!privilege) {
      return notFoundResponse("Privilège non trouvé");
    }

    return successResponse({
      data: privilege,
      feedback: "Privilège récupéré avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du privilège:", error);
    return handleApiError(error, "Erreur lors de la récupération du privilège");
  }
}
