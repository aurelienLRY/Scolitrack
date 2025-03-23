import { NextResponse } from "next/server";

/**
 * Interface pour une réponse API standardisée
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  feedback?: string;
  meta?: Record<string, unknown>;
}

/**
 * Codes HTTP standards pour les réponses API
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Crée une réponse API standardisée
 * @param success Indique si la requête a réussi
 * @param data Données de la réponse (optionnel)
 * @param feedback Message de retour pour l'utilisateur (optionnel)
 * @param status Code HTTP de la réponse (défaut: 200)
 * @param meta Métadonnées supplémentaires (optionnel)
 * @returns NextResponse avec un format standardisé
 */
export function apiResponse<T>({
  success,
  data,
  feedback,
  status = HttpStatus.OK,
  meta,
}: {
  success: boolean;
  data?: T;
  feedback?: string;
  status?: number;
  meta?: Record<string, unknown>;
}): NextResponse {
  const responseBody: ApiResponse<T> = {
    success,
    ...(data !== undefined && { data }),
    ...(feedback !== undefined && { feedback }),
    ...(meta !== undefined && { meta }),
  };

  return NextResponse.json(responseBody, { status });
}

/**
 * Crée une réponse de succès
 * @param data Données à retourner
 * @param feedback Message de succès (optionnel)
 * @param status Code HTTP (défaut: 200)
 * @param meta Métadonnées (optionnel)
 */
export function successResponse<T>({
  data,
  feedback,
  status = HttpStatus.OK,
  meta,
}: {
  data?: T;
  feedback?: string;
  status?: number;
  meta?: Record<string, unknown>;
}): NextResponse {
  return apiResponse({ success: true, data, feedback, status, meta });
}

/**
 * Crée une réponse d'erreur
 * @param feedback Message d'erreur
 * @param status Code HTTP (défaut: 400)
 * @param meta Métadonnées (optionnel)
 * @param data Données supplémentaires (optionnel)
 */
export function errorResponse<T>({
  feedback,
  status = HttpStatus.BAD_REQUEST,
  meta,
  data,
}: {
  feedback: string;
  status?: number;
  meta?: Record<string, unknown>;
  data?: T;
}): NextResponse {
  return apiResponse({ success: false, feedback, status, meta, data });
}

/**
 * Crée une réponse pour la création d'une ressource
 * @param data Données de la ressource créée
 * @param feedback Message de succès (optionnel)
 * @param meta Métadonnées (optionnel)
 */
export function createdResponse<T>({
  data,
  feedback,
  meta,
}: {
  data: T;
  feedback?: string;
  meta?: Record<string, unknown>;
}): NextResponse {
  return successResponse({
    data,
    feedback: feedback || "Ressource créée avec succès",
    status: HttpStatus.CREATED,
    meta,
  });
}

/**
 * Crée une réponse pour une ressource non trouvée
 * @param feedback Message d'erreur (optionnel)
 */
export function notFoundResponse(feedback?: string): NextResponse {
  return errorResponse({
    feedback: feedback || "Ressource non trouvée",
    status: HttpStatus.NOT_FOUND,
  });
}

/**
 * Gère une erreur et retourne une réponse API appropriée
 * @param error Erreur à gérer
 * @param defaultMessage Message par défaut en cas d'erreur générique
 */
export function handleApiError(
  error: unknown,
  defaultMessage = "Une erreur est survenue"
): NextResponse {
  console.error(error);

  if (error instanceof Error) {
    // Gestion des erreurs de validation
    if (error.name === "ValidationError") {
      return errorResponse({
        feedback: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Gestion des erreurs de conflit (ex: ressource existe déjà)
    if (
      error.message.includes("existe déjà") ||
      error.message.includes("already exists") ||
      error.message.includes("duplicate")
    ) {
      return errorResponse({
        feedback: error.message,
        status: HttpStatus.CONFLICT,
      });
    }

    // Autres erreurs avec message explicite
    return errorResponse({
      feedback: error.message,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }

  // Erreur générique
  return errorResponse({
    feedback: defaultMessage,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  });
}
