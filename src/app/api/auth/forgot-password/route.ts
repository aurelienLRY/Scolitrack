import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendResetPasswordEmail } from "@/lib/nodemailer/reset-passeword.email";
import {
  successResponse,
  errorResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

/**
 * Gère la requête POST pour la réinitialisation du mot de passe.
 *
 * Cette fonction reçoit une requête contenant un email, vérifie si l'utilisateur existe,
 * génère un token de réinitialisation et envoie un email avec un lien de réinitialisation.
 *
 * @param {Request} request - La requête HTTP contenant l'email de l'utilisateur.
 * @returns {Promise<NextResponse>} La réponse HTTP avec un message de succès ou d'erreur.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return errorResponse({
        feedback: "L'email est requis",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return successResponse({
        feedback: "Si l'email existe, un lien de réinitialisation sera envoyé",
      });
    }

    // Générer un token unique
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Envoyer l'email
    await sendResetPasswordEmail(email, resetToken);

    return successResponse({
      feedback: "Si l'email existe, un lien de réinitialisation sera envoyé",
    });
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    return handleApiError(
      error,
      "Erreur lors de la demande de réinitialisation"
    );
  }
}
