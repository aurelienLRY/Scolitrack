import { prisma } from "@/lib/prisma/prisma";
import bcrypt from "bcryptjs";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * Gère la requête POST pour la réinitialisation du mot de passe.
 *
 * Cette fonction reçoit une requête contenant un token et un mot de passe,
 * vérifie si le token est valide et si le mot de passe est correct,
 * met à jour le mot de passe et efface le token.
 *
 * @param {Request} request - La requête HTTP contenant le token et le mot de passe.
 * @returns {Promise<NextResponse>} La réponse HTTP avec un message de succès ou d'erreur.
 */
export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return errorResponse({
        feedback: "Token et mot de passe requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Trouver l'utilisateur avec le token valide
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return errorResponse({
        feedback: "Lien de réinitialisation invalide ou expiré",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe et effacer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return successResponse({
      feedback: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    return handleApiError(error, "Erreur lors de la réinitialisation");
  }
}
