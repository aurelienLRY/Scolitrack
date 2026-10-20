import type { EnrollmentFile, Student, User } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import {
  encryptDataFields,
  decryptRecordFields,
  ENROLLMENT_FILE_SENSITIVE_FIELDS,
  STUDENT_SENSITIVE_FIELDS,
  USER_SENSITIVE_FIELDS,
  FAMILY_SENSITIVE_FIELDS,
} from "./crypto-fields.util";

type EnrollmentFileNested = EnrollmentFile & {
  family?: (Record<string, unknown> & { members?: Array<{ user?: User }> }) | null;
  students?: Array<{ student?: Student | null }>;
  reviewer?: User | null;
};

type EnrollmentFileResult =
  | EnrollmentFileNested
  | EnrollmentFileNested[]
  | null
  | undefined;

export const ENROLLMENT_FILE_PRE_MIDDLEWARE = (params: PrismaMiddlewareParams) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "EnrollmentFile" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...ENROLLMENT_FILE_SENSITIVE_FIELDS]);
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

function decryptNested(file: EnrollmentFileNested): EnrollmentFileNested {
  const decrypted = decryptRecordFields(
    file as unknown as Record<string, unknown>,
    [...ENROLLMENT_FILE_SENSITIVE_FIELDS]
  ) as unknown as EnrollmentFileNested;

  if (decrypted.family) {
    decrypted.family = decryptRecordFields(
      decrypted.family,
      [...FAMILY_SENSITIVE_FIELDS]
    );
    if (Array.isArray(decrypted.family.members)) {
      decrypted.family.members = decrypted.family.members.map((m) => {
        if (!m?.user) return m;
        return {
          ...m,
          user: decryptRecordFields(
            m.user as unknown as Record<string, unknown>,
            [...USER_SENSITIVE_FIELDS]
          ) as unknown as User,
        };
      });
    }
  }

  if (Array.isArray(decrypted.students)) {
    decrypted.students = decrypted.students.map((link) => {
      if (!link?.student) return link;
      return {
        ...link,
        student: decryptRecordFields(
          link.student as unknown as Record<string, unknown>,
          [...STUDENT_SENSITIVE_FIELDS]
        ) as unknown as Student,
      };
    });
  }

  if (decrypted.reviewer) {
    decrypted.reviewer = decryptRecordFields(
      decrypted.reviewer as unknown as Record<string, unknown>,
      [...USER_SENSITIVE_FIELDS]
    ) as unknown as User;
  }

  return decrypted;
}

export const ENROLLMENT_FILE_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: EnrollmentFileResult
): EnrollmentFileResult => {
  try {
    if (
      params.model !== "EnrollmentFile" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }

    if (Array.isArray(result)) {
      return result.map((row) => decryptNested(row));
    }

    return decryptNested(result);
  } catch (error) {
    console.error("Erreur dans ENROLLMENT_FILE_POST_MIDDLEWARE:", error);
    return result;
  }
};
