import { PrismaClient } from "@prisma/client";

/**
 * Prisma client
 */

// Singleton pour Prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
