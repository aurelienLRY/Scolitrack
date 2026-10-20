import type { Student } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import {
  encryptDataFields,
  decryptRecordFields,
  STUDENT_SENSITIVE_FIELDS,
} from "./crypto-fields.util";

export const STUDENT_PRE_MIDDLEWARE = (params: PrismaMiddlewareParams) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "Student" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...STUDENT_SENSITIVE_FIELDS]);
  }
};

type StudentResult = Student | Student[] | null | undefined;

const READ_OR_WRITE = [
  "findMany",
  "findFirst",
  "findUnique",
  "create",
  "update",
  "upsert",
];

export const STUDENT_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: StudentResult
): StudentResult => {
  try {
    if (
      params.model !== "Student" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }

    if (Array.isArray(result)) {
      return result.map((row) =>
        decryptRecordFields(
          row as unknown as Record<string, unknown>,
          [...STUDENT_SENSITIVE_FIELDS]
        )
      ) as Student[];
    }

    return decryptRecordFields(
      result as unknown as Record<string, unknown>,
      [...STUDENT_SENSITIVE_FIELDS]
    ) as Student;
  } catch (error) {
    console.error("Erreur dans STUDENT_POST_MIDDLEWARE:", error);
    return result;
  }
};
