import type { User } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import {
  encryptDataFields,
  decryptRecordFields,
  USER_SENSITIVE_FIELDS,
} from "./crypto-fields.util";

/**
 * Middleware avant opération - chiffre les données sensibles de l'utilisateur.
 * Email non chiffré : contrainte unique + authentification NextAuth.
 */
export const USER_PRE_MIDDLEWARE = (params: PrismaMiddlewareParams) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "User" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...USER_SENSITIVE_FIELDS]);
  }
};

type UserResult =
  | User
  | User[]
  | { count?: number; [key: string]: unknown }
  | null
  | undefined;

const isUser = (obj: unknown): obj is User => {
  return (
    !!obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "email" in obj
  );
};

const READ_OR_WRITE = [
  "findMany",
  "findFirst",
  "findUnique",
  "create",
  "update",
  "upsert",
];

/**
 * Middleware après opération - déchiffre les données sensibles de l'utilisateur
 */
export const USER_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: UserResult
): UserResult => {
  try {
    if (
      params.model !== "User" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }

    if (params.action === "count") {
      return result;
    }

    if (Array.isArray(result)) {
      return result.map((user) => {
        if (!user || typeof user !== "object" || !("id" in user)) return user;
        return decryptRecordFields(
          user as unknown as Record<string, unknown>,
          [...USER_SENSITIVE_FIELDS]
        ) as unknown as User;
      });
    }

    if (isUser(result)) {
      return decryptRecordFields(
        result as unknown as Record<string, unknown>,
        [...USER_SENSITIVE_FIELDS]
      ) as unknown as User;
    }

    return result;
  } catch (error) {
    console.error("Erreur dans USER_POST_MIDDLEWARE:", error);
    return result;
  }
};
