import type { MedicalInformation } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import {
  encryptDataFields,
  decryptRecordFields,
  MEDICAL_SENSITIVE_FIELDS,
} from "./crypto-fields.util";

/**
 * Chiffre le contenu médical.
 * Le studentId reste relationnel (nécessité Prisma) ; le contenu chiffré
 * ne permet pas d’identifier l’enfant sans ENCRYPTION_KEY.
 */
export const MEDICAL_PRE_MIDDLEWARE = (params: PrismaMiddlewareParams) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "MedicalInformation" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...MEDICAL_SENSITIVE_FIELDS]);
  }
};

type MedicalResult = MedicalInformation | MedicalInformation[] | null | undefined;

const READ_OR_WRITE = [
  "findMany",
  "findFirst",
  "findUnique",
  "create",
  "update",
  "upsert",
];

export const MEDICAL_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: MedicalResult
): MedicalResult => {
  try {
    if (
      params.model !== "MedicalInformation" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }

    if (Array.isArray(result)) {
      return result.map((row) =>
        decryptRecordFields(
          row as unknown as Record<string, unknown>,
          [...MEDICAL_SENSITIVE_FIELDS]
        )
      ) as MedicalInformation[];
    }

    return decryptRecordFields(
      result as unknown as Record<string, unknown>,
      [...MEDICAL_SENSITIVE_FIELDS]
    ) as MedicalInformation;
  } catch (error) {
    console.error("Erreur dans MEDICAL_POST_MIDDLEWARE:", error);
    return result;
  }
};
