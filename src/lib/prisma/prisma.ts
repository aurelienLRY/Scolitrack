import { PrismaClient, Prisma } from "@prisma/client";
import { ESTABLISHMENT_POST_MIDDLEWARE } from "./Prisma-Middleware/EstablishmentMiddleware";
import {
  USER_POST_MIDDLEWARE,
  USER_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/UserMiddleware";
import { CLASSROOM_PERSONNEL_POST_MIDDLEWARE } from "./Prisma-Middleware/ClassRoomPersonnelMiddleware";
import { CLASSROOM_POST_MIDDLEWARE } from "./Prisma-Middleware/classRoomMiddleware";
import { COMMISSION_POST_MIDDLEWARE } from "./Prisma-Middleware/CommissionMiddleware";
import { ENROLLMENT_CAMPAIGN_POST_MIDDLEWARE } from "./Prisma-Middleware/EnrollmentCampaignMiddleware";
import {
  ENROLLMENT_FILE_POST_MIDDLEWARE,
  ENROLLMENT_FILE_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/EnrollmentFileMiddleware";
import {
  STUDENT_POST_MIDDLEWARE,
  STUDENT_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/StudentMiddleware";
import {
  MEDICAL_POST_MIDDLEWARE,
  MEDICAL_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/MedicalInformationMiddleware";
import {
  FAMILY_POST_MIDDLEWARE,
  FAMILY_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/FamilyMiddleware";
import {
  AUTHORIZED_PICKUP_POST_MIDDLEWARE,
  AUTHORIZED_PICKUP_PRE_MIDDLEWARE,
  EMERGENCY_CONTACT_POST_MIDDLEWARE,
  EMERGENCY_CONTACT_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/ContactMiddleware";
import {
  ENROLLMENT_SIGNATURE_POST_MIDDLEWARE,
  ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE,
} from "./Prisma-Middleware/EnrollmentSignatureMiddleware";
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

        if (model === "User") USER_PRE_MIDDLEWARE(params);
        else if (model === "Student") STUDENT_PRE_MIDDLEWARE(params);
        else if (model === "MedicalInformation") MEDICAL_PRE_MIDDLEWARE(params);
        else if (model === "Family") FAMILY_PRE_MIDDLEWARE(params);
        else if (model === "EnrollmentFile") ENROLLMENT_FILE_PRE_MIDDLEWARE(params);
        else if (model === "EmergencyContact")
          EMERGENCY_CONTACT_PRE_MIDDLEWARE(params);
        else if (model === "AuthorizedPickup")
          AUTHORIZED_PICKUP_PRE_MIDDLEWARE(params);
        else if (model === "EnrollmentSignature")
          ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE(params);

        let result = await query(args);

        if (result == null || result === undefined) {
          return result;
        }

        try {
          const r = result as never;
          if (model === "User") {
            const processed = USER_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "Student") {
            const processed = STUDENT_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "MedicalInformation") {
            const processed = MEDICAL_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "Family") {
            const processed = FAMILY_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "EnrollmentFile") {
            const processed = ENROLLMENT_FILE_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "EmergencyContact") {
            const processed = EMERGENCY_CONTACT_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "AuthorizedPickup") {
            const processed = AUTHORIZED_PICKUP_POST_MIDDLEWARE(params, r);
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
          } else if (model === "EnrollmentCampaign") {
            const processed = ENROLLMENT_CAMPAIGN_POST_MIDDLEWARE(params, r);
            if (processed !== undefined) result = processed;
          } else if (model === "EnrollmentSignature") {
            const processed = ENROLLMENT_SIGNATURE_POST_MIDDLEWARE(params, r);
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
