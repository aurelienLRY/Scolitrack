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
];

/**
 * Routes API nécessitant des privilèges spécifiques
 */
const privilegesApiRoutes: TPrivilegeRoute[] = [
  {
    path: "/api/setup-application",
    privilege: "SETUP_APPLICATION",
  },
  {
    path: "/api/users/[id]/role",
    privilege: "SETUP_APPLICATION",
  },

  // Ajoutez d'autres routes API protégées ici
];

/**
 * Routes UI nécessitant des privilèges spécifiques
 */
const privilegesRoutes: TPrivilegeRoute[] = [
  {
    path: "/private/setup-application",
    privilege: "SETUP_APPLICATION",
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
