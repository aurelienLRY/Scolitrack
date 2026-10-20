import type { AuthorizedPickup, EmergencyContact } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import {
  encryptDataFields,
  decryptRecordFields,
  AUTHORIZED_PICKUP_SENSITIVE_FIELDS,
  EMERGENCY_CONTACT_SENSITIVE_FIELDS,
} from "./crypto-fields.util";

const READ_OR_WRITE = [
  "findMany",
  "findFirst",
  "findUnique",
  "create",
  "update",
  "upsert",
];

export const EMERGENCY_CONTACT_PRE_MIDDLEWARE = (
  params: PrismaMiddlewareParams
) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "EmergencyContact" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...EMERGENCY_CONTACT_SENSITIVE_FIELDS]);
  }
};

export const EMERGENCY_CONTACT_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: EmergencyContact | EmergencyContact[] | null | undefined
) => {
  try {
    if (
      params.model !== "EmergencyContact" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }
    if (Array.isArray(result)) {
      return result.map((row) =>
        decryptRecordFields(
          row as unknown as Record<string, unknown>,
          [...EMERGENCY_CONTACT_SENSITIVE_FIELDS]
        )
      ) as EmergencyContact[];
    }
    return decryptRecordFields(
      result as unknown as Record<string, unknown>,
      [...EMERGENCY_CONTACT_SENSITIVE_FIELDS]
    ) as EmergencyContact;
  } catch (error) {
    console.error("Erreur dans EMERGENCY_CONTACT_POST_MIDDLEWARE:", error);
    return result;
  }
};

export const AUTHORIZED_PICKUP_PRE_MIDDLEWARE = (
  params: PrismaMiddlewareParams
) => {
  const data = params.args?.data as Record<string, unknown> | undefined;
  if (
    params.model === "AuthorizedPickup" &&
    (params.action === "create" || params.action === "update") &&
    data
  ) {
    encryptDataFields(data, [...AUTHORIZED_PICKUP_SENSITIVE_FIELDS]);
  }
};

export const AUTHORIZED_PICKUP_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: AuthorizedPickup | AuthorizedPickup[] | null | undefined
) => {
  try {
    if (
      params.model !== "AuthorizedPickup" ||
      !READ_OR_WRITE.includes(params.action) ||
      !result
    ) {
      return result;
    }
    if (Array.isArray(result)) {
      return result.map((row) =>
        decryptRecordFields(
          row as unknown as Record<string, unknown>,
          [...AUTHORIZED_PICKUP_SENSITIVE_FIELDS]
        )
      ) as AuthorizedPickup[];
    }
    return decryptRecordFields(
      result as unknown as Record<string, unknown>,
      [...AUTHORIZED_PICKUP_SENSITIVE_FIELDS]
    ) as AuthorizedPickup;
  } catch (error) {
    console.error("Erreur dans AUTHORIZED_PICKUP_POST_MIDDLEWARE:", error);
    return result;
  }
};
