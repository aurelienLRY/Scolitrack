import { NextRequest, NextResponse } from "next/server";
import { CreateUserSchema } from "@/schemas/UserSchema";
import { isAdmin } from "@/lib/auth/auth.middleware";
import { createUser, getUsers } from "@/lib/auth/user.service";

/**
 * GET /api/users - Récupérer la liste des utilisateurs (admin seulement)
 */
export async function GET(request: NextRequest) {
  // Vérifier les autorisations
  const authError = await isAdmin();
  if (authError) return authError;

  // Récupérer les paramètres de pagination de l'URL
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    // Récupérer les utilisateurs
    const result = await getUsers(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Créer un nouvel utilisateur (admin seulement)
 */
export async function POST(request: NextRequest) {
  // Vérifier les autorisations
  const authError = await isAdmin();
  if (authError) return authError;

  try {
    // Récupérer les données du corps de la requête
    const body = await request.json();

    // Valider les données
    const validatedData = await CreateUserSchema.validate(body);

    // Créer l'utilisateur
    const user = await createUser(validatedData);

    // Retourner l'utilisateur créé
    return NextResponse.json(
      {
        message: "Utilisateur créé avec succès",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de la création d'un utilisateur:", error);

    // Traiter les erreurs de validation Yup
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Traiter les erreurs connues
    if (
      error instanceof Error &&
      error.message === "Cet email est déjà utilisé"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    // Erreur générique
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
