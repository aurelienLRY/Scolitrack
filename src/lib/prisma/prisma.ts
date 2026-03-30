import { PrismaClient, Prisma } from "@prisma/client";
import { ESTABLISHMENT_POST_MIDDLEWARE } from "./Prisma-Middleware/EstablishmentMiddleware";
import {
  USER_POST_MIDDLEWARE,
  USER_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/UserMiddleware";
import { CLASSROOM_PERSONNEL_POST_MIDDLEWARE } from "./Prisma-Middleware/ClassRoomPersonnelMiddleware";
import { CLASSROOM_POST_MIDDLEWARE } from "./Prisma-Middleware/classRoomMiddleware";
import { COMMISSION_POST_MIDDLEWARE } from "./Prisma-Middleware/CommissionMiddleware";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";

function toMiddlewareParams(
  model: string | undefined,
  operation: string,
  args: unknown
): PrismaMiddlewareParams {
  return {
    model: model ?? null,
    action: operation,
    args: args as PrismaMiddlewareParams["args"],
  };
}

/**
 * Prisma 6 : `$use` n'existe plus — logique migrée vers `$extends` + `$allModels.$allOperations`.
 */
const encryptionExtension = Prisma.defineExtension({
  name: "crypto-query-middleware",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const params = toMiddlewareParams(model, operation, args);

        if (model === "User") {
          USER_PRE_MIDDLEWARE(params);
        }

        let result = await query(args);

        if (result == null || result === undefined) {
          return result;
        }

        try {
          // Les middlewares typent le résultat finement ; ici `result` est le résultat générique de l’opération.
          const r = result as never;
          if (model === "User") {
            const processed = USER_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "Establishment") {
            const processed = await ESTABLISHMENT_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "ClassRoomPersonnel") {
            const processed = await CLASSROOM_PERSONNEL_POST_MIDDLEWARE(
              params,
              r
            );
            if (processed !== undefined) result = processed;
          } else if (model === "ClassRoom") {
            const processed = await CLASSROOM_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "Commission") {
            const processed = await COMMISSION_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          }
        } catch (error) {
          console.error("Prisma extension | middleware error:", error);
          throw error;
        }

        return result;
      },
    },
  },
});

function createExtendedClient() {
  return new PrismaClient({
    log: ["error"],
  }).$extends(encryptionExtension);
}

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createExtendedClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createExtendedClient();

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
