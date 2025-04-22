import { NextRequest } from "next/server";
import {
  createEstablishment,
  getAllEstablishments,
  getEstablishmentById,
  updateEstablishment,
} from "@/lib/services/crud/establishment.service";
import * as yup from "yup";
import {
  establishmentSchema,
  establishmentUpdateSchema,
} from "@/schemas/establishmentSchema";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

// Type pour les query params
interface EstablishmentQueryParams {
  id?: string;
}

/**
 * Extrait et type les query params de la requête
 * @param req - La requête HTTP
 * @returns Les query params typés
 */
function getQueryParams(req: NextRequest): EstablishmentQueryParams {
  const { searchParams } = new URL(req.url);
  return {
    id: searchParams.get("id") || undefined,
  };
}

/**
 * Récupérer l'établissement
 * @param req - La requête HTTP entrante
 * @returns Réponse de succès avec les données de l'établissement, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 404 si l'établissement n'est pas trouvé
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export async function GET(req: NextRequest) {
  try {
    // Récupération d'un établissement spécifique par ID
    const params = getQueryParams(req);
    const { id } = params;
    let establishment = null;

    if (id) {
      establishment = await getEstablishmentById(id);

      if (!establishment) {
        return notFoundResponse("Établissement non trouvé");
      }

      return successResponse({
        data: establishment,
        feedback: "Établissement récupéré avec succès",
      });
    } else {
      // Récupération de l'établissement (prendre le premier, car unique par installation)
      const establishments = await getAllEstablishments();
      establishment = establishments.length > 0 ? establishments[0] : null;
    }
    return successResponse({
      data: establishment,
      feedback: establishment
        ? "Établissement récupéré avec succès"
        : "Aucun établissement configuré",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération de l'établissement"
    );
  }
}

/**
 * Créer ou mettre à jour l'établissement
 * @param req - La requête HTTP entrante contenant les données de l'établissement à créer ou mettre à jour
 * @returns Réponse de succès avec les données de l'établissement créé ou mis à jour, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 400 si les données d'entrée sont invalides
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Valider les données d'entrée avec Yup
    try {
      await establishmentSchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const formattedErrors = validationError.inner.reduce((acc, err) => {
          if (err.path) {
            acc[err.path] = err.message;
          }
          return acc;
        }, {} as Record<string, string>);

        return errorResponse({
          feedback: "Données invalides",
          status: HttpStatus.BAD_REQUEST,
          data: { details: formattedErrors },
        });
      }
    }

    // Vérifier s'il existe déjà un établissement
    const establishments = await getAllEstablishments();

    if (establishments.length > 0) {
      // Si un établissement existe déjà, mettre à jour plutôt que créer
      const existingEstablishment = establishments[0];
      const updatedEstablishment = await updateEstablishment(
        existingEstablishment.id,
        body
      );

      return successResponse({
        data: updatedEstablishment,
        feedback: "Établissement mis à jour avec succès",
      });
    } else {
      // Sinon, créer un nouvel établissement
      const newEstablishment = await createEstablishment(body);

      return createdResponse({
        data: newEstablishment,
        feedback: "Établissement créé avec succès",
      });
    }
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la création/mise à jour de l'établissement"
    );
  }
}

/**
 * Mettre à jour l'établissement
 * @param req - La requête HTTP entrante contenant les données de l'établissement à mettre à jour
 * @returns Réponse de succès avec les données de l'établissement mis à jour, ou une erreur appropriée
 * @throws Erreur 401 si l'utilisateur n'est pas authentifié
 * @throws Erreur 400 si les données d'entrée sont invalides
 * @throws Erreur 500 pour les autres erreurs serveur
 */
export async function PUT(req: NextRequest) {
  try {
    const params = getQueryParams(req);
    const { id } = params;

    if (!id) {
      return errorResponse({
        feedback: "ID de l'établissement manquant",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Vérifier si l'établissement existe
    const existingEstablishment = await getEstablishmentById(id);

    if (!existingEstablishment) {
      return notFoundResponse("Établissement non trouvé");
    }

    const body = await req.json();

    // Valider les données d'entrée avec Yup
    try {
      await establishmentUpdateSchema.validate(body, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const formattedErrors = validationError.inner.reduce((acc, err) => {
          if (err.path) {
            acc[err.path] = err.message;
          }
          return acc;
        }, {} as Record<string, string>);

        return errorResponse({
          feedback: "Données invalides",
          status: HttpStatus.BAD_REQUEST,
          data: { details: formattedErrors },
        });
      }
    }

    const updatedEstablishment = await updateEstablishment(id, body);

    return successResponse({
      data: { updatedEstablishment },
      feedback: "Établissement mis à jour avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la mise à jour de l'établissement"
    );
  }
}
