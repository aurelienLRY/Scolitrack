import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
      return NextResponse.json(
        { message: "Token et mot de passe requis" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { message: "Lien de réinitialisation invalide ou expiré" },
        { status: 400 }
      );
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

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
