import { PrismaClient } from "@prisma/client";
import { ESTABLISHMENT_POST_MIDDLEWARE } from "./Prisma-Middleware/EstablishmentMiddleware";
import {
  USER_POST_MIDDLEWARE,
  USER_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/UserMiddleware";
import { CLASSROOM_PERSONNEL_POST_MIDDLEWARE } from "./Prisma-Middleware/ClassRoomPersonnelMiddleware";
/**
 * Prisma client
 * @description Prisma client pour la base de données
 */

// Singleton pour Prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"], // Activer la journalisation des erreurs uniquement
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Middleware
prisma.$use(async (params, next) => {
  try {
    // Avant l'opération - préparation des données
    if (params.model === "User") {
      USER_PRE_MIDDLEWARE(params);
    }

    // Exécution de la requête Prisma
    let result = await next(params);

    // Après l'opération - transformation des résultats
    if (params.model === "User" && result) {
      const processedResult = USER_POST_MIDDLEWARE(params, result);
      if (processedResult) {
        result = processedResult;
      }
    }

    if (params.model === "Establishment" && result) {
      const processedResult = await ESTABLISHMENT_POST_MIDDLEWARE(
        params,
        result
      );
      if (processedResult) {
        result = processedResult;
      }
    }

    if (params.model === "ClassRoomPersonnel" && result) {
      const processedResult = await CLASSROOM_PERSONNEL_POST_MIDDLEWARE(
        params,
        result
      );
      if (processedResult) {
        result = processedResult;
      }
    }

    return result;
  } catch (error) {
    console.error("Prisma middleware | Error : ", error);
    throw error;
  }
});
