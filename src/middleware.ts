import { NextResponse } from "next/server";
import {
  privilegesApiRoutes,
  privilegesRoutes,
  isPublicPath,
  TPrivilegeRoute,
} from "@/config/routes.config";

//* Edge : config sans Prisma (voir auth.edge.config.ts) *//
import authEdgeConfig from "@/lib/auth/auth.edge.config";
import NextAuth from "next-auth";

const { auth: authMiddleware } = NextAuth(authEdgeConfig);

export default authMiddleware(async function middleware(req) {
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

  console.log("---- MIDDLEWARE ----");
  const session = req.auth;
  const isLoggedIn = !!session;
  const { nextUrl } = req;
  console.log("MIDDLEWARE -> Next URL: ", nextUrl.pathname);

  // Images legacy sous public/
  if (nextUrl.pathname.includes("/img/uploads/")) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");
    return response;
  }

  // Parcours public (lien token inscription, signatures, commissions lecture, images…)
  // Doit passer AVANT le 401 global sur /api — sinon le parent non connecté est bloqué.
  if (isPublicPath(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Traiter les routes protégées génériques d'abord
  const isProtectedRoute = nextUrl.pathname.startsWith("/private");
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // Vérifier les routes API avec privilèges
  if (nextUrl.pathname.startsWith("/api/")) {
    console.log("MIDDLEWARE -> API route détectée ");
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const apiResult = checkRoutePrivileges(privilegesApiRoutes);
    if (apiResult) return apiResult;
  }
  // Vérifier les routes UI avec privilèges
  else {
    console.log("MIDDLEWARE -> Route UI détectée ");
    const routeResult = checkRoutePrivileges(privilegesRoutes);
    if (routeResult) return routeResult;
  }

  return undefined;
});

// Très important : configure quelles routes le middleware doit vérifier
export const config = {
  matcher: [
    // Vérifie toutes les routes sauf celles qui commencent par:
    // - api/auth (routes d'authentification)
    // - _next/static (fichiers statiques)
    // - favicon.ico (icône du navigateur)
    "/((?!_next/static|favicon.ico|api/auth).*)",
    // Inclure explicitement les images pour pouvoir gérer leur cache
    "/_next/image/:path*",
  ],
};
