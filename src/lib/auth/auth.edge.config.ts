import type { NextAuthConfig } from "next-auth";

/**
 * Config NextAuth réservée au middleware Edge : aucun import Prisma / Node-only.
 * Doit rester alignée avec `session` et `callbacks.session` de auth.config.ts + auth.ts.
 */
const authEdgeConfig = {
  providers: [],
  trustHost: true,
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.roleName = token.roleName;
        session.user.id = token.id;
        session.user.privileges = token.privileges || [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authEdgeConfig;
