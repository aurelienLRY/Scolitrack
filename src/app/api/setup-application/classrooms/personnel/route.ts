"use server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { withPrivilege } from "@/lib/services/auth.service";
import { classRoomService } from "@/lib/services/classroom.service";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  createdResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import * as yup from "yup";

// Schéma de validation pour l'attribution d'un membre du personnel à une classe
const personnelAssignSchema = yup.object({
  userId: yup.string().required("L'ID de l'utilisateur est requis"),
  roleInClass: yup.string().nullable(),
});

// Type d'interface pour les paramètres
interface Params {
  params: {
    id: string;
  };
}

// Fonction pour récupérer le personnel d'une classe
export const GET = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();
      const context = args[0] as Params;

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const classId = context.params.id;

      // Vérifier si la classe existe
      const classData = await classRoomService.getClassRoomById(classId);

      if (!classData) {
        return notFoundResponse("Classe non trouvée");
      }

      // Récupérer le personnel de la classe
      const personnel = await classRoomService.getClassRoomPersonnel(classId);

      return successResponse({
        data: personnel,
        feedback: "Personnel de la classe récupéré avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la récupération du personnel de la classe"
      );
    }
  }
);

// Fonction pour attribuer un membre du personnel à une classe
export const POST = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();
      const context = args[0] as Params;

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const classId = context.params.id;

      // Vérifier si la classe existe
      const classData = await classRoomService.getClassRoomById(classId);

      if (!classData) {
        return notFoundResponse("Classe non trouvée");
      }

      const body = await req.json();

      // Valider les données
      try {
        await personnelAssignSchema.validate(body, { abortEarly: false });
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

      // Attribuer le membre du personnel à la classe
      const result = await classRoomService.assignPersonnelToClassRoom(
        classId,
        body
      );

      // Journaliser l'action (audit)
      // await activityLogService.logActivity({
      //   userId: session.user.id,
      //   action: "ASSIGN_PERSONNEL_TO_CLASS",
      //   details: JSON.stringify({ classId, userId: body.userId, role: body.roleInClass }),
      // });

      return createdResponse({
        data: result,
        feedback: "Membre du personnel attribué à la classe avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de l'attribution du membre du personnel à la classe"
      );
    }
  }
);

// Fonction pour supprimer un membre du personnel d'une classe
export const DELETE = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();
      const context = args[0] as Params;

      if (!session?.user) {
        return errorResponse({
          feedback: "Non autorisé",
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const classId = context.params.id;
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");

      if (!userId) {
        return errorResponse({
          feedback: "L'ID de l'utilisateur est requis",
          status: HttpStatus.BAD_REQUEST,
        });
      }

      // Vérifier si la classe existe
      const classData = await classRoomService.getClassRoomById(classId);

      if (!classData) {
        return notFoundResponse("Classe non trouvée");
      }

      // Supprimer le membre du personnel de la classe
      const result = await classRoomService.removePersonnelFromClassRoom(
        classId,
        userId
      );

      // Journaliser l'action (audit)
      // await activityLogService.logActivity({
      //   userId: session.user.id,
      //   action: "REMOVE_PERSONNEL_FROM_CLASS",
      //   details: JSON.stringify({ classId, userId }),
      // });

      return successResponse({
        data: result,
        feedback: "Membre du personnel retiré de la classe avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors du retrait du membre du personnel de la classe"
      );
    }
  }
);
