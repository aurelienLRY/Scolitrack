import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns NextResponse - Réponse HTTP
 */
export async function isAuthenticated() {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Non autorisé - Authentification requise" },
      { status: 401 }
    );
  }

  return null; // Pas d'erreur, l'utilisateur est authentifié
}

/**
 * Vérifie si l'utilisateur a l'un des rôles requis
 * @param allowedRoles - Rôles autorisés
 * @returns NextResponse - Réponse HTTP si non autorisé
 */
export async function hasRole(allowedRoles: UserRole[]) {
  const session = await auth();

  // Vérifier d'abord l'authentification
  const authError = await isAuthenticated();
  if (authError) return authError;

  // Récupérer le rôle de l'utilisateur
  const userRole = session?.user?.role as UserRole;

  // Vérifier si le rôle est autorisé
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: "Non autorisé - Rôle insuffisant" },
      { status: 403 }
    );
  }

  return null; // Pas d'erreur, l'utilisateur a le rôle requis
}

/**
 * Vérifie si l'utilisateur est un administrateur (ADMIN ou SUPER_ADMIN)
 * @returns NextResponse - Réponse HTTP si non autorisé
 */
export async function isAdmin() {
  return hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);
}
