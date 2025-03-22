import { NextRequest, NextResponse } from "next/server";
import { roleService } from "@/lib/services/role.service";
import { withPrivilege } from "@/lib/auth/authMiddleware";

// Récupérer un rôle par son ID
export const GET = withPrivilege(async (req: NextRequest) => {
  try {
    // Extraire l'ID des paramètres de l'URL
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "ID de rôle manquant" },
        { status: 400 }
      );
    }

    const role = await roleService.getRoleById(id);

    if (!role) {
      return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du rôle" },
      { status: 500 }
    );
  }
}, "VIEW_ROLE");

// Mettre à jour un rôle
export const PUT = withPrivilege(async (req: NextRequest) => {
  try {
    // Extraire l'ID des paramètres de l'URL
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "ID de rôle manquant" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { name, description, privilegeIds } = data;

    const updatedRole = await roleService.updateRole(id, {
      name,
      description,
      privilegeIds,
    });

    return NextResponse.json(updatedRole);
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour du rôle:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur lors de la mise à jour du rôle";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}, "UPDATE_ROLE");

// Supprimer un rôle
export const DELETE = withPrivilege(async (req: NextRequest) => {
  try {
    // Extraire l'ID des paramètres de l'URL
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "ID de rôle manquant" },
        { status: 400 }
      );
    }

    await roleService.deleteRole(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression du rôle:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur lors de la suppression du rôle";

    return NextResponse.json(
      { error: errorMessage },
      {
        status:
          error instanceof Error && error.message.includes("permanent")
            ? 403
            : 500,
      }
    );
  }
}, "DELETE_ROLE");
