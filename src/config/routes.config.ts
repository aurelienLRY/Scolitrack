import { PrivilegeName } from "@/config/privileges.config";

export type TPrivilegeRoute = {
  path: string;
  privilege: string;
};

/**
 * Préfixes (ou chemins exacts) accessibles sans session.
 * Les parents remplissent le dossier via /enrollment/[token] + APIs token.
 */
const publicRoutePrefixes = [
  "/activate-account",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
  "/enrollment", // UI publique + signatures /enrollment/sign/...
  "/api/enrollment/files/token",
  "/api/enrollment/signatures",
  "/api/enrollment/documents/access",
  // Liste des commissions pour le formulaire public (POST reste protégé dans la route)
  "/api/setup-application/commissions",
  "/api/storage/images",
] as const;

/** @deprecated préférer isPublicPath — conservé pour compat imports */
const publicRoutes = ["/", ...publicRoutePrefixes];

/**
 * true si la route UI ou API est ouverte sans authentification.
 */
function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return publicRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Routes API nécessitant des privilèges spécifiques
 */
const privilegesApiRoutes: TPrivilegeRoute[] = [
  {
    path: "/api/setup-application",
    privilege: PrivilegeName.SETUP_APPLICATION,
  },
  {
    path: "/api/users/[id]/role",
    privilege: PrivilegeName.SETUP_APPLICATION,
  },
  {
    path: "/api/enrollment/campaigns",
    privilege: PrivilegeName.MANAGE_CAMPAIGNS,
  },
  {
    path: "/api/enrollment/campaigns/[id]",
    privilege: PrivilegeName.MANAGE_CAMPAIGNS,
  },
  {
    path: "/api/enrollment/campaigns/[id]/generate",
    privilege: PrivilegeName.MANAGE_CAMPAIGNS,
  },
  {
    path: "/api/enrollment/files",
    privilege: PrivilegeName.MANAGE_ENROLLMENTS,
  },
  {
    path: "/api/enrollment/files/[id]",
    privilege: PrivilegeName.MANAGE_ENROLLMENTS,
  },
  {
    path: "/api/enrollment/files/[id]/status",
    privilege: PrivilegeName.MANAGE_ENROLLMENTS,
  },
  // Ajoutez d'autres routes API protégées ici
];

/**
 * Routes UI nécessitant des privilèges spécifiques
 */
const privilegesRoutes: TPrivilegeRoute[] = [
  {
    path: "/private/setup-application",
    privilege: PrivilegeName.SETUP_APPLICATION,
  },
  {
    path: "/private/enrollment/campaign",
    privilege: PrivilegeName.MANAGE_CAMPAIGNS,
  },
  {
    path: "/private/enrollment/campaign/create",
    privilege: PrivilegeName.MANAGE_CAMPAIGNS,
  },
  {
    path: "/private/enrollment/campaign/[id]",
    privilege: PrivilegeName.MANAGE_CAMPAIGNS,
  },
  {
    path: "/private/enrollment/campaign/[id]/edit",
    privilege: PrivilegeName.MANAGE_CAMPAIGNS,
  },

  {
    path: "/private/enrollment/files",
    privilege: PrivilegeName.MANAGE_ENROLLMENTS,
  },
  {
    path: "/private/enrollment/files/[id]",
    privilege: PrivilegeName.MANAGE_ENROLLMENTS,
  },
  {
    path: "/private/enrollment/files/[id]/status",
    privilege: PrivilegeName.MANAGE_ENROLLMENTS,
  },
  // Ajoutez d'autres routes UI protégées ici
];

const DEFAULT_LOGIN_REDIRECT: string = "/";

export {
  privilegesApiRoutes,
  publicRoutes,
  publicRoutePrefixes,
  isPublicPath,
  privilegesRoutes,
  DEFAULT_LOGIN_REDIRECT,
};
