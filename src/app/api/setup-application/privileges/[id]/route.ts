import { NextRequest } from "next/server";
import { withPrivilege } from "@/lib/services/auth.service";
import { privilegeService } from "@/lib/services/privilege.service";
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Récupérer un privilège par son ID
export const GET = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
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
      return handleApiError(
        error,
        "Erreur lors de la récupération du privilège"
      );
    }
  }
);

// Mettre à jour un privilège
export const PUT = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      // Extraire l'ID du privilège de l'URL
      const id = req.url.split("/").pop();

      if (!id) {
        return errorResponse({
          feedback: "ID du privilège manquant",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const data = await req.json();
      const { name, description } = data;

      if (!name) {
        return errorResponse({
          feedback: "Le nom du privilège est requis",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const updatedPrivilege = await privilegeService.updatePrivilege(id, {
        name,
        description,
      });

      if (!updatedPrivilege) {
        return notFoundResponse("Privilège non trouvé");
      }

      return successResponse({
        data: updatedPrivilege,
        feedback: "Privilège mis à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du privilège:", error);
      return handleApiError(
        error,
        "Erreur lors de la mise à jour du privilège"
      );
    }
  }
);

// Supprimer un privilège
export const DELETE = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      // Extraire l'ID du privilège de l'URL
      const id = req.url.split("/").pop();

      if (!id) {
        return errorResponse({
          feedback: "ID du privilège manquant",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const deletedPrivilege = await privilegeService.deletePrivilege(id);

      if (!deletedPrivilege) {
        return notFoundResponse("Privilège non trouvé");
      }

      return successResponse({
        feedback: "Privilège supprimé avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression du privilège:", error);
      return handleApiError(
        error,
        "Erreur lors de la suppression du privilège"
      );
    }
  }
);
