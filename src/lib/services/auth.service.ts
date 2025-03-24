import { NextRequest, NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth/auth";

/**
 * Type de gestionnaire pour les routes d'API Next.js
 */
type RouteHandler = (
  request: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse> | NextResponse;

/**
 * Déconnexion de l'utilisateur
 */
export async function logout() {
  await signOut({ redirectTo: "/" });
}

/**
 * Middleware qui vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non authentifié");
  }
  return session.user;
}

/**
 * Middleware pour protéger une route d'API par un privilège
 * @param handler - Gestionnaire de la route
 * @param requiredPrivilege - Privilège requis pour accéder à la route
 * @returns NextResponse
 */
export function withPrivilege(
  requiredPrivilege: string,
  handler: RouteHandler
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { message: "Non authentifié" },
          { status: 401 }
        );
      }

      // Si c'est un SUPER_ADMIN, autoriser automatiquement
      if (session.user.roleName === "SUPER_ADMIN") {
        return handler(request, ...args);
      }

      // Vérifier si l'utilisateur a le privilège requis
      const hasPrivilege = session.user.privileges.includes(requiredPrivilege);

      if (!hasPrivilege) {
        return NextResponse.json(
          { message: "Accès non autorisé" },
          { status: 403 }
        );
      }

      return handler(request, ...args);
    } catch (error) {
      console.error("Erreur d'autorisation:", error);
      return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
  };
}

/**
 * Middleware pour vérifier si l'utilisateur possède un privilège spécifique
 * @param userId - ID de l'utilisateur
 * @param privilege - Privilège à vérifier
 * @returns true si l'utilisateur possède le privilège, false sinon
 */
export async function checkPrivilege(privilege: string): Promise<boolean> {
  try {
    // Vérifier si l'utilisateur possède le privilège spécifié
    const session = await auth();
    if (!session?.user) return false;

    // Si l'utilisateur est SUPER_ADMIN, il a tous les privilèges
    if (session.user.roleName === "SUPER_ADMIN") return true;

    // Vérifier si l'utilisateur a le privilège spécifié
    return session.user.privileges.includes(privilege);
  } catch (error) {
    console.error("Erreur lors de la vérification du privilège:", error);
    return false;
  }
}

/**
 * Fonction utilitaire pour vérifier si l'utilisateur actuel possède un privilège donné (côté client)
 * @param privilege - Privilège à vérifier
 */
export async function useHasPrivilege(privilege: string): Promise<boolean> {
  try {
    const session = await auth();

    // Vérifier si la session et l'utilisateur existent
    if (!session?.user) {
      return false;
    }

    // Si l'utilisateur est SUPER_ADMIN, il a tous les privilèges
    if (session.user.roleName === "SUPER_ADMIN") {
      return true;
    }

    // Vérifier si l'utilisateur a le privilège spécifié
    return session.user.privileges.includes(privilege);
  } catch (error) {
    console.error("Erreur lors de la vérification du privilège:", error);
    return false;
  }
}

const AUTH_SERVICES = {
  logout,
  isAuthenticated,
  withPrivilege,
  checkPrivilege,
};

export default AUTH_SERVICES;
