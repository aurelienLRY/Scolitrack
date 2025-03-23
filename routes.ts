const publicRoutes = [
  "/",
  "/activate-account",
  "/forgot-password",
  "/reset-password",
];

const privilegeApiRoutes = [
  {
    path: "/api/setup-application/",
    privilege: "SETUP_APPLICATION",
  },
];

const DEFAULT_LOGIN_REDIRECT: string = "/";
export { privilegeApiRoutes, publicRoutes, DEFAULT_LOGIN_REDIRECT };
