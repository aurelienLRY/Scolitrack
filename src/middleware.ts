import NextAuth from "next-auth";
import authConfig from "./lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isOnProtectedRoute = nextUrl.pathname.startsWith("/private");
  if (isOnProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/", nextUrl.origin));
  }

  return undefined;
});

// Très important : configure quelles routes le middleware doit vérifier
export const config = {
  matcher: [
    // Vérifie toutes les routes sauf celles qui commencent par:
    // - api (routes API)
    // - _next/static (fichiers statiques)
    // - _next/image (images optimisées)
    // - favicon.ico (icône du navigateur)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
