

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import * as bcrypt from "bcryptjs";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";
import { updateUserProfileSchema } from "@/schemas/UserSchema";

/**
 * GET /api/users/[id] - Récupérer les détails d'un utilisateur
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier si l'utilisateur est autorisé à accéder à ces informations
    const { id } = await context.params;
    
    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return errorResponse({
        feedback: "Utilisateur non trouvé",
        status: HttpStatus.NOT_FOUND,
      });
    }

    // Ne pas renvoyer le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _ , ...userData } = user;

    return successResponse({ 
      data: userData,
      feedback: "Détails de l'utilisateur récupérés avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des détails de l'utilisateur"
    );
  }
}

/**
 * PATCH /api/users/[id] - Mettre à jour les informations d'un utilisateur
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Récupérer les données à mettre à jour
    const data = await req.json();
    
    // Valider les données
    try {
      await updateUserProfileSchema.validate(data, { abortEarly: false });
    } catch (validationError) {
      const errors = validationError instanceof Error && 'errors' in validationError 
        ? (validationError as { errors: string[] }).errors 
        : ['Erreur de validation'];
        
      return errorResponse({
        feedback: "Données invalides",
        meta: {
          errors,
        },
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name: data.name,
        firstName: data.firstName,
        gender: data.gender,
        parentType: data.parentType,
        socialSecurityNum: data.socialSecurityNum,
        phoneNumber: data.phoneNumber,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        profession: data.profession,
        maritalStatus: data.maritalStatus,
        bio: data.bio,
        skills: data.skills,
        isHousekeeping: data.isHousekeeping,
        isDaycare: data.isDaycare,
        isCanteen: data.isCanteen,
      },
    });

    // Ne pas renvoyer le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _ , ...userData } = updatedUser;

    return successResponse({
      data: userData,
      feedback: "Informations utilisateur mises à jour avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la mise à jour des informations utilisateur"
    );
  }
}

/**
 * PUT /api/users/[id]/password - Changer le mot de passe d'un utilisateur
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    // Vérifier si l'utilisateur est autorisé
    const session = await auth();
    
    // L'utilisateur ne peut changer que son propre mot de passe
    if (!session || session.user.id !== id) {
      return errorResponse({
        feedback: "Non autorisé",
        status: HttpStatus.FORBIDDEN,
      });
    }

    // Récupérer les données
    const { currentPassword, newPassword } = await req.json();
    
    if (!currentPassword || !newPassword) {
      return errorResponse({
        feedback: "Mot de passe actuel et nouveau mot de passe requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user || !user.password) {
      return errorResponse({
        feedback: "Utilisateur non trouvé ou compte non activé",
        status: HttpStatus.NOT_FOUND,
      });
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return errorResponse({
        feedback: "Mot de passe actuel incorrect",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: id },
      data: { password: hashedPassword },
    });

    return successResponse({
      feedback: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la mise à jour du mot de passe"
    );
  }
} 