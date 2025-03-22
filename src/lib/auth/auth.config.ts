import { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";
import { LoginSchema } from "@/schemas/LoginSchema";

import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const validatedCredentials = await LoginSchema.validate(credentials);
        if (!validatedCredentials) return null;

        /* search user */
        const user = await prisma.user.findUnique({
          where: { email: validatedCredentials.email },
          include: {
            role: {
              include: {
                rolePrivileges: {
                  include: {
                    privilege: true,
                  },
                },
              },
            },
          },
        });

        /* if user not found */
        if (!user || !user.password) return null;

        /* check password */
        const passwordsMatch = await bcrypt.compare(
          validatedCredentials.password,
          user.password as string
        );

        /* if password is incorrect */
        if (!passwordsMatch) return null;

        // Préparer l'utilisateur pour la session en extrayant les privilèges
        const privileges = user.role.rolePrivileges.map(
          (rp) => rp.privilege.name
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          privileges,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roleName = user.roleName;
        token.id = user.id;

        // Utiliser les privilèges déjà récupérés lors de l'authentification
        if ("privileges" in user && Array.isArray(user.privileges)) {
          token.privileges = user.privileges;
        } else {
          // Fallback pour les autres providers qui n'incluent pas les privilèges
          const rolePrivileges = await prisma.rolePrivilege.findMany({
            where: {
              role: { name: user.roleName },
            },
            include: {
              privilege: true,
            },
          });

          // Extraire les noms des privilèges
          const privileges = rolePrivileges.map((rp) => rp.privilege.name);
          token.privileges = privileges;
        }
      }
      return token;
    },
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
