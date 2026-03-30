import { PrivilegeName } from "@/config/privileges.config";

export type TPrivilegeRoute = {
  path: string;
  privilege: string;
};

/**
 * Routes publiques ne nécessitant pas d'authentification
 */
const publicRoutes = [
  "/",
  "/activate-account",
  "/forgot-password",
  "/reset-password",
  "/unauthorized", // Page d'erreur d'autorisation
  "/enrollment/[token]", // Accès public aux dossiers d'inscription par token
];

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
  privilegesRoutes,
  DEFAULT_LOGIN_REDIRECT,
};
