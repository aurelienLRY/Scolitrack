import { NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "./stackMiddleware";
import { prisma } from "@/lib/prisma/prisma";
import { encrypt, decrypt } from "@/lib/services/crypto.service";

// Middleware pour chiffrer/déchiffrer

// Initialiser le middleware Prisma séparément
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

// Créer un middleware compatible avec Next.js
const prismaMiddleware: MiddlewareFactory = (next) => {
  return async (request: NextRequest) => {
    // Ce middleware ne fait que passer au suivant, car le middleware Prisma
    // est déjà configuré globalement au niveau du client Prisma
    return next(request);
  };
};

export default prismaMiddleware;
