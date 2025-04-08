"use server";

import { NextRequest } from "next/server";
import { educationLevelService } from "@/lib/services/educationLevel.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Type pour les query params
interface EducationLevelQueryParams {
  establishmentId?: string;
}

/**
 * Extrait et type les query params de la requête
 * @param req - La requête HTTP
 * @returns Les query params typés
 */
function getQueryParams(req: NextRequest): EducationLevelQueryParams {
  const { searchParams } = new URL(req.url);
  return {
    establishmentId: searchParams.get("establishmentId") || undefined,
  };
}

/**
 * Récupérer tous les niveaux d'éducation
 * @param req - La requête HTTP entrante
 * @returns Réponse de succès avec les données des niveaux d'éducation, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 400 si l'ID de l'établissement est manquant
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export async function GET(req: NextRequest) {
  try {
    const params = getQueryParams(req);
    const { establishmentId } = params;

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

/**
 * Créer un nouveau niveau d'éducation
 * @param req - La requête HTTP entrante contenant les données du niveau d'éducation à créer
 * @returns Réponse de succès avec le niveau d'éducation créé, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 400 si les données d'entrée sont invalides
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export async function POST(req: NextRequest) {
  try {
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
