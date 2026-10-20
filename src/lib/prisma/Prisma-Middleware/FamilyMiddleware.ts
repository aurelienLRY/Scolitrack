import type { Family } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import {
  encryptDataFields,
  decryptRecordFields,
  FAMILY_SENSITIVE_FIELDS,
} from "./crypto-fields.util";

export const FAMILY_PRE_MIDDLEWARE = (params: PrismaMiddlewareParams) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "Family" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...FAMILY_SENSITIVE_FIELDS]);
  }
};

type FamilyResult = Family | Family[] | null | undefined;

const READ_OR_WRITE = [
  "findMany",
  "findFirst",
  "findUnique",
  "create",
  "update",
  "upsert",
];

export const FAMILY_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: FamilyResult
): FamilyResult => {
  try {
    if (
      params.model !== "Family" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }

    if (Array.isArray(result)) {
      return result.map((row) =>
        decryptRecordFields(
          row as unknown as Record<string, unknown>,
          [...FAMILY_SENSITIVE_FIELDS]
        )
      ) as Family[];
    }

    return decryptRecordFields(
      result as unknown as Record<string, unknown>,
      [...FAMILY_SENSITIVE_FIELDS]
    ) as Family;
  } catch (error) {
    console.error("Erreur dans FAMILY_POST_MIDDLEWARE:", error);
    return result;
  }
};
