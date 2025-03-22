const publicRoutes = [
  "/",
  "/activate-account",
  "/forgot-password",
  "/reset-password",
];

const privateRoutes = ["/private"];

const DEFAULT_LOGIN_REDIRECT: string = "/";

const privilegeApiRoutes = [
  {
    path: "/api/setup-application/",
    privilege: "SETUP_APPLICATION",
  },
];

export {
  privilegeApiRoutes,
  publicRoutes,
  privateRoutes,
  DEFAULT_LOGIN_REDIRECT,
};
