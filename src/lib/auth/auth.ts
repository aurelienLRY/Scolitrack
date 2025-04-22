import NextAuth from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prismaForAuth } from "../prisma/prismaForAuth";

import authConfig from "./auth.config";
import { Adapter } from "next-auth/adapters";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prismaForAuth) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET,
  ...authConfig,
});
