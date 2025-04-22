import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { PrivilegeName } from "@/config/privileges.config";

/**
 * Type générique pour les paramètres de route
 */
export type RouteParams = {
  params: Promise<Record<string, string>>;
  searchParams?: Record<string, string | string[]>;
};

/**
 * Type de gestionnaire pour les routes d'API Next.js
 * Permet d'utiliser n'importe quel type pour le contexte
 */
export type RouteHandler<T = unknown, C = unknown> = (
  request: NextRequest,
  context: C
) => Promise<NextResponse<T>> | NextResponse<T>;

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
 * @param requiredPrivilege - Privilège requis pour accéder à la route
 * @param handler - Gestionnaire de la route
 * @returns Fonction de gestionnaire de route avec vérification des privilèges
 */
export function withPrivilege<T = unknown, C = unknown>(
  requiredPrivilege: PrivilegeName,
  handler: RouteHandler<T, C>
): (request: NextRequest, context: C) => Promise<NextResponse> {
  return async (request: NextRequest, context: C) => {
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
        return handler(request, context);
      }

      // Vérifier si l'utilisateur a le privilège requis
      const hasPrivilege = session.user.privileges.includes(requiredPrivilege);

      if (!hasPrivilege) {
        return NextResponse.json(
          { message: "Accès non autorisé" },
          { status: 403 }
        );
      }

      return handler(request, context);
    } catch (error) {
      console.error("Erreur d'autorisation:", error);
      return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
  };
}

/**
 * Middleware pour vérifier si l'utilisateur possède un privilège spécifique
 * @param privilege - Privilège à vérifier
 * @returns true si l'utilisateur possède le privilège, false sinon
 */
export async function checkPrivilege(
  privilege: PrivilegeName
): Promise<boolean> {
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
export async function useHasPrivilege(
  privilege: PrivilegeName
): Promise<boolean> {
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
  isAuthenticated,
  withPrivilege,
  checkPrivilege,
};

export default AUTH_SERVICES;
export * from "@/config/privileges.config";
