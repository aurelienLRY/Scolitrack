import { NextRequest, NextResponse } from "next/server";
import { withPrivilege } from "@/lib/auth/authMiddleware";
import { privilegeService } from "@/lib/services/privilege.service";

// Récupérer tous les privilèges
export const GET = withPrivilege(async () => {
  try {
    const privileges = await privilegeService.getAllPrivileges();
    return NextResponse.json(privileges);
  } catch (error) {
    console.error("Erreur lors de la récupération des privilèges:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des privilèges" },
      { status: 500 }
    );
  }
}, "SETUP_APPLICATION");

// Ajouter un nouveau privilège
export const POST = withPrivilege(async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom du privilège est requis" },
        { status: 400 }
      );
    }

    // Créer le privilège avec le service
    const privilege = await privilegeService.createPrivilege({
      name,
      description,
    });

    return NextResponse.json(privilege, { status: 201 });
  } catch (error: unknown) {
    console.error("Erreur lors de la création du privilège:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur lors de la création du privilège";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}, "SETUP_APPLICATION");
