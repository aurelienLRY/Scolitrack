import { encrypt, safeDecrypt } from "@/lib/services/crypto.service";
import { Prisma, User } from "@prisma/client";

/**
 * Middleware avant opération - chiffre les données sensibles de l'utilisateur
 */
export const USER_PRE_MIDDLEWARE = (params: Prisma.MiddlewareParams) => {
  if (
    params.model === "User" &&
    (params.action === "create" || params.action === "update") &&
    params.args.data?.name
  ) {
    params.args.data.name = encrypt(params.args.data.name);
  }
};

/**
 * Type plus précis pour les résultats de requêtes utilisateur
 */
type UserResult =
  | User
  | User[]
  | { count?: number; [key: string]: unknown }
  | null
  | undefined;

/**
 * Vérifie si un objet est un utilisateur en vérifiant les propriétés attendues
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUser = (obj: any): obj is User => {
  return obj && typeof obj === "object" && "id" in obj && "name" in obj;
};

/**
 * Middleware après opération - déchiffre les données sensibles de l'utilisateur
 */
export const USER_POST_MIDDLEWARE = (
  params: Prisma.MiddlewareParams,
  result: UserResult
): UserResult => {
  try {
    if (
      params.model !== "User" ||
      !["findMany", "findFirst", "findUnique", "count"].includes(
        params.action
      ) ||
      !result
    ) {
      return result;
    }

    // Cas spécial pour count qui retourne juste un nombre
    if (params.action === "count") {
      // Résultat count est juste un chiffre, pas besoin de déchiffrer
      return result;
    }

    // Traitement des résultats selon leur type
    if (Array.isArray(result)) {
      // Collection d'utilisateurs (findMany)
      const decryptedResults = result.map((user) => {
        if (!user) return user;

        const decryptedName = safeDecrypt(user.name as string);
        return {
          ...user,
          name: decryptedName,
        };
      });

      return decryptedResults;
    } else if (isUser(result)) {
      // Utilisateur unique (findFirst/findUnique)

      const decryptedName = safeDecrypt(result.name as string);
      return {
        ...result,
        name: decryptedName,
      };
    }

    return result;
  } catch (error) {
    console.error("Erreur dans USER_POST_MIDDLEWARE:", error);
    return result;
  }
};
