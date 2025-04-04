import { NextRequest } from "next/server";
import {
  createEstablishment,
  getAllEstablishments,
  getEstablishmentById,
  updateEstablishment,
} from "@/lib/services/establishment.service";
import { auth } from "@/lib/auth/auth";
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

// Récupérer l'établissement
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return errorResponse({
        feedback: "Non autorisé",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // Récupération d'un établissement spécifique par ID
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
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

// Créer ou mettre à jour l'établissement
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return errorResponse({
        feedback: "Non autorisé",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

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

// Mettre à jour l'établissement
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return errorResponse({
        feedback: "Non autorisé",
        status: HttpStatus.UNAUTHORIZED,
      });
    }
    console.log("req", req);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    console.log("id", id);

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

    console.log("body", body);

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
