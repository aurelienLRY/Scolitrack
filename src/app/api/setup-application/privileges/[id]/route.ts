import { NextRequest, NextResponse } from "next/server";
import { withPrivilege } from "@/lib/auth/authMiddleware";
import { privilegeService } from "@/lib/services/privilege.service";

// Récupérer un privilège par son ID
export const GET = withPrivilege(async (req: NextRequest) => {
  try {
    // Extraire l'ID du privilège de l'URL
    const id = req.url.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "ID du privilège manquant" },
        { status: 400 }
      );
    }

    const privilege = await privilegeService.getPrivilegeById(id);

    if (!privilege) {
      return NextResponse.json(
        { error: "Privilège non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(privilege);
  } catch (error) {
    console.error("Erreur lors de la récupération du privilège:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du privilège" },
      { status: 500 }
    );
  }
}, "SETUP_APPLICATION");

// Mettre à jour un privilège
export const PUT = withPrivilege(async (req: NextRequest) => {
  try {
    // Extraire l'ID du privilège de l'URL
    const id = req.url.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "ID du privilège manquant" },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du privilège est requis" },
        { status: 400 }
      );
    }

    const updatedPrivilege = await privilegeService.updatePrivilege(id, {
      name,
      description,
    });

    if (!updatedPrivilege) {
      return NextResponse.json(
        { error: "Privilège non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPrivilege);
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour du privilège:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur lors de la mise à jour du privilège";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}, "SETUP_APPLICATION");

// Supprimer un privilège
export const DELETE = withPrivilege(async (req: NextRequest) => {
  try {
    // Extraire l'ID du privilège de l'URL
    const id = req.url.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "ID du privilège manquant" },
        { status: 400 }
      );
    }

    const deletedPrivilege = await privilegeService.deletePrivilege(id);

    if (!deletedPrivilege) {
      return NextResponse.json(
        { error: "Privilège non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Privilège supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du privilège:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du privilège" },
      { status: 500 }
    );
  }
}, "SETUP_APPLICATION");
