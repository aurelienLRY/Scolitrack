"use server";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withPrivilege } from "@/lib/services/auth.service";
import { educationLevelService } from "@/lib/services/educationLevel.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

export const GET = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const { searchParams } = new URL(req.url);
      const establishmentId = searchParams.get("establishmentId");

      if (!establishmentId) {
        return errorResponse({
          feedback: "L'ID de l'établissement est requis",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const levels =
        await educationLevelService.getEducationLevelsByEstablishment(
          establishmentId
        );

      return successResponse({
        data: levels,
        feedback: "Niveaux d'éducation récupérés avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la récupération des niveaux d'éducation"
      );
    }
  }
);

export const POST = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const body = await req.json();

      try {
        const newLevel = await educationLevelService.createEducationLevel(body);

        return createdResponse({
          data: newLevel,
          feedback: `Niveau d'éducation "${newLevel.name}" créé avec succès`,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erreur de validation inconnue";
        return errorResponse({
          feedback: "Données invalides",
          status: HttpStatus.BAD_REQUEST,
          data: { error: errorMessage },
        });
      }
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la création du niveau d'éducation"
      );
    }
  }
);
