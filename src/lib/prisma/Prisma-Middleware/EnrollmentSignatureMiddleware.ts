import type { EnrollmentSignature } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import { encryptDataFields, decryptRecordFields } from "./crypto-fields.util";

const SENSITIVE = ["email"] as const;

export const ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE = (
  params: PrismaMiddlewareParams
) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "EnrollmentSignature" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...SENSITIVE]);
  }
};

const READ_OR_WRITE = [
  "findMany",
  "findFirst",
  "findUnique",
  "create",
  "update",
  "upsert",
];

export const ENROLLMENT_SIGNATURE_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: EnrollmentSignature | EnrollmentSignature[] | null | undefined
) => {
  try {
    if (
      params.model !== "EnrollmentSignature" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }
    if (Array.isArray(result)) {
      return result.map((row) =>
        decryptRecordFields(row as unknown as Record<string, unknown>, [
          ...SENSITIVE,
        ])
      ) as EnrollmentSignature[];
    }
    return decryptRecordFields(result as unknown as Record<string, unknown>, [
      ...SENSITIVE,
    ]) as EnrollmentSignature;
  } catch (error) {
    console.error("Erreur ENROLLMENT_SIGNATURE_POST_MIDDLEWARE:", error);
    return result;
  }
};
