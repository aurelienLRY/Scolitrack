import { NextResponse } from "next/server";
import { privilegeApiRoutes } from "../routes";
import authConfig from "@/lib/auth/auth.config";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isProtectedRoute = nextUrl.pathname.startsWith("/private");
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  //* Vérifie si la route API est soumise à des privilèges *//
  const isPrivilegedApiRoute = privilegeApiRoutes.some((route) =>
    nextUrl.pathname.startsWith(route.path)
  );
  //* Si la route API est soumise à des privilèges et que l'utilisateur est connecté, vérifie si l'utilisateur a les privilèges *//
  if (isPrivilegedApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thisRoutePrivilege = privilegeApiRoutes.find((route) =>
      nextUrl.pathname.startsWith(route.path)
    );

    const hasPrivilege = token?.privileges?.includes(
      thisRoutePrivilege?.privilege ?? ""
    );
    if (!hasPrivilege) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return undefined;
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
