import { NextRequest, NextResponse } from "next/server";
import { ActivateAccountSchema } from "@/schemas/UserSchema";
import { activateAccount } from "@/lib/auth/user.service";

/**
 * POST /api/users/activate - Activer un compte utilisateur et définir son mot de passe
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const body = await request.json();

    // Valider les données
    const validatedData = await ActivateAccountSchema.validate(body);

    // Activer le compte
    const user = await activateAccount(
      validatedData.token,
      validatedData.password
    );

    // Retourner la confirmation
    return NextResponse.json({
      message: "Compte activé avec succès",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur lors de l'activation du compte:", error);

    // Traiter les erreurs de validation Yup
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Traiter les erreurs connues
    if (
      error instanceof Error &&
      error.message === "Token invalide ou expiré"
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Erreur générique
    return NextResponse.json(
      { error: "Erreur lors de l'activation du compte" },
      { status: 500 }
    );
  }
}
