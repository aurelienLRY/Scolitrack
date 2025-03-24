"use client";
import { useSession } from "next-auth/react";

/**
 * Composant Authorized
 *
 * Ce composant permet de contrôler l'accès à certaines parties de l'interface utilisateur
 * en fonction des privilèges de l'utilisateur connecté.
 *
 * @param children - Le contenu à afficher si l'utilisateur a le privilège requis
 * @param privilege - Le privilège requis pour afficher le contenu
 * @param fallback - Contenu alternatif à afficher si l'utilisateur n'a pas le privilège requis
 *
 * @example
 * ```tsx
 * // Exemple d'utilisation
 * <Authorized privilege="MANAGE_USERS" fallback={<p>Accès non autorisé</p>}>
 *   <UserManagementPanel />
 * </Authorized>
 * ```
 */
function Authorized({
  children,
  privilege = undefined,
  privileges = undefined,
  fallback,
}: {
  children: React.ReactNode;
  privilege?: string;
  privileges?: string[];

  fallback?: React.ReactNode;
}) {
  const { data: session } = useSession();

  if (!privilege && !privileges) {
    return children;
  }

  if (!session) {
    return fallback || null;
  }

  if (privilege && !session.user.privileges.includes(privilege)) {
    return fallback || null;
  }

  if (
    privileges &&
    !privileges.some((p) => session.user.privileges.includes(p))
  ) {
    return fallback || null;
  }

  return children;
}
Authorized.displayName = "Authorized";
export default Authorized;
