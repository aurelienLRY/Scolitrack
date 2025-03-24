import { NextResponse } from "next/server";
import {
  privilegesApiRoutes,
  privilegesRoutes,
  TPrivilegeRoute,
} from "@/config/routes.config";

//* Edge compatibility *//
import authConfig from "@/lib/auth/auth.config";
import NextAuth from "next-auth";

const { auth: authMiddleware } = NextAuth(authConfig);

export default authMiddleware(async function middleware(req) {
  const session = req.auth;
  const isLoggedIn = !!session;
  const { nextUrl } = req;

  /**
   * Vérifie si la route est soumise à des privilèges
   * @param routes - Les routes à vérifier
   * @returns undefined si l'utilisateur a les privilèges, ou une réponse si non
   */
  const checkRoutePrivileges = (routes: TPrivilegeRoute[]) => {
    const matchedRoute = routes.find((route) =>
      nextUrl.pathname.startsWith(route.path)
    );

    if (!matchedRoute) return undefined;

    if (!isLoggedIn) {
      // Pour les routes API, renvoyer une erreur JSON
      if (nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      }
      // Pour les autres routes, rediriger vers la page de connexion
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    const hasPrivilege = session?.user?.privileges?.includes(
      matchedRoute.privilege
    );

    if (!hasPrivilege) {
      if (nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
    }

    return undefined;
  };

  // Traiter les routes protégées génériques d'abord
  const isProtectedRoute = nextUrl.pathname.startsWith("/private");
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // Vérifier les routes API avec privilèges
  if (nextUrl.pathname.startsWith("/api/")) {
    const apiResult = checkRoutePrivileges(privilegesApiRoutes);
    if (apiResult) return apiResult;
  }
  // Vérifier les routes UI avec privilèges
  else {
    const routeResult = checkRoutePrivileges(privilegesRoutes);
    if (routeResult) return routeResult;
  }

  return undefined;
});

// Très important : configure quelles routes le middleware doit vérifier
export const config = {
  matcher: [
    // Vérifie toutes les routes sauf celles qui commencent par:
    // - _next/static (fichiers statiques)
    // - _next/image (images optimisées)
    // - favicon.ico (icône du navigateur)
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/auth/:path*",
  ],
};
