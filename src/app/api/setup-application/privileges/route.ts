import { NextRequest } from "next/server";
import { withPrivilege } from "@/lib/services/auth.service";
import { privilegeService } from "@/lib/services/privilege.service";
import {
  successResponse,
  createdResponse,
  handleApiError,
  errorResponse,
  HttpStatus,
} from "@/lib/services/api.service";

// Récupérer tous les privilèges
export async function GET() {
  try {
    const privileges = await privilegeService.getAllPrivileges();
    return successResponse({
      data: privileges,
      feedback: "Liste des privilèges récupérée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des privilèges:", error);
    return handleApiError(
      error,
      "Erreur lors de la récupération des privilèges"
    );
  }
}

// Ajouter un nouveau privilège
export const POST = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      const data = await req.json();
      const { name, description } = data;

      if (!name) {
        return errorResponse({
          feedback: "Le nom du privilège est requis",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Créer le privilège avec le service
      const privilege = await privilegeService.createPrivilege({
        name,
        description,
      });

      return createdResponse({
        data: privilege,
        feedback: "Privilège créé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la création du privilège:", error);
      return handleApiError(error, "Erreur lors de la création du privilège");
    }
  }
);
