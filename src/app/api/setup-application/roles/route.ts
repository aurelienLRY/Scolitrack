import { NextRequest, NextResponse } from "next/server";
import { roleService } from "@/lib/services/role.service";
import { withPrivilege } from "@/lib/auth/authMiddleware";

// Obtenir tous les rôles
export const GET = withPrivilege(async () => {
  try {
    const roles = await roleService.getAllRoles();
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des rôles" },
      { status: 500 }
    );
  }
}, "VIEW_ROLE");

// Créer un nouveau rôle
export const POST = withPrivilege(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { name, description, privilegeIds } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du rôle est requis" },
        { status: 400 }
      );
    }
    const preName = name.toUpperCase().replace(/ /g, "_");

    const role = await roleService.createRole({
      name: preName,
      description,
      privilegeIds,
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: unknown) {
    console.error("Erreur lors de la création du rôle:", error);
    // Si l'erreur est une instance d'Error, utiliser son message
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur lors de la création du rôle";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}, "CREATE_ROLE");
