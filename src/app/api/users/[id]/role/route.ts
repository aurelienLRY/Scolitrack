import { NextRequest, NextResponse } from "next/server";
import { withPrivilege } from "@/lib/auth/authMiddleware";
import { roleService } from "@/lib/services/role.service";

/**
 * Mise à jour du rôle d'un utilisateur
 */
export const PUT = withPrivilege(async (req: NextRequest) => {
  try {
    // Extraire l'ID de l'utilisateur des paramètres de l'URL
    const pathSegments = req.nextUrl.pathname.split("/");
    const userId = pathSegments[pathSegments.indexOf("users") + 1];

    if (!userId) {
      return NextResponse.json(
        { error: "ID d'utilisateur manquant" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { roleName } = data;

    if (!roleName) {
      return NextResponse.json(
        { error: "Le nom du rôle est requis" },
        { status: 400 }
      );
    }

    // Assigner le rôle à l'utilisateur
    const updatedUser = await roleService.assignRoleToUser(userId, roleName);

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        roleName: updatedUser.roleName,
      },
    });
  } catch (error: unknown) {
    console.error("Erreur lors de l'attribution du rôle:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur lors de l'attribution du rôle";

    // Déterminer le code d'état HTTP approprié
    let statusCode = 500;
    if (error instanceof Error) {
      if (error.message.includes("n'existe pas")) {
        statusCode = 404; // Rôle non trouvé
      } else if (error.message.includes("Utilisateur introuvable")) {
        statusCode = 404; // Utilisateur non trouvé
      } else if (error.message.includes("SUPER_ADMIN")) {
        statusCode = 409; // Conflit - Un seul SUPER_ADMIN autorisé
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}, "ASSIGN_ROLE");
