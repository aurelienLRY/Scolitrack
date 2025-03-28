import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/services/crypto.service";

/**
 * Prisma client
 * @description Prisma client pour la base de données
 */

// Singleton pour Prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Middleware pour chiffrer/déchiffrer

prisma.$use(async (params, next) => {
  // Avant l'opération
  if (params.model === "User") {
    if (params.action === "create" || params.action === "update") {
      if (params.args.data?.name) {
        params.args.data.name = await encrypt(params.args.data.name);
      }
    }
  }

  // Exécution de la requête
  const result = await next(params);

  // Après l'opération - déchiffrement
  if (params.model === "User") {
    if (
      ["findMany", "findFirst", "findUnique", "count"].includes(params.action)
    ) {
      if (Array.isArray(result)) {
        // Pour findMany
        return result.map((user) => ({
          ...user,
          name: decrypt(user.name),
        }));
      } else if (result) {
        // Pour findFirst/findUnique
        return {
          ...result,
          name: decrypt(result.name),
        };
      }
    }
  }

  return result;
});
