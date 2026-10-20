import type { EnrollmentCampaign, User } from "@prisma/client";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";
import { safeDecrypt } from "@/lib/services/crypto.service";

type EnrollmentCampaignWithCreator = EnrollmentCampaign & {
  creator?: User | null;
};

type EnrollmentCampaignResult =
  | EnrollmentCampaignWithCreator
  | EnrollmentCampaignWithCreator[]
  | null
  | undefined;

function hasCreator(
  row: unknown
): row is EnrollmentCampaignWithCreator {
  return (
    row !== null &&
    typeof row === "object" &&
    "creator" in row &&
    (row as EnrollmentCampaignWithCreator).creator != null
  );
}

function decryptCreatorName(
  row: EnrollmentCampaignWithCreator
): EnrollmentCampaignWithCreator {
  if (!hasCreator(row) || !row.creator?.name) return row;
  return {
    ...row,
    creator: {
      ...row.creator,
      name: safeDecrypt(row.creator.name),
    },
  };
}

/**
 * Déchiffre le nom du créateur (User) inclus dans les campagnes d'inscription.
 */
export const ENROLLMENT_CAMPAIGN_POST_MIDDLEWARE = (
  params: PrismaMiddlewareParams,
  result: EnrollmentCampaignResult
): EnrollmentCampaignResult => {
  try {
    if (
      params.model !== "EnrollmentCampaign" ||
      !["findMany", "findFirst", "findUnique"].includes(params.action) ||
      !result
    ) {
      return result;
    }

    if (Array.isArray(result)) {
      return result.map((row) =>
        row ? decryptCreatorName(row) : row
      ) as EnrollmentCampaignWithCreator[];
    }

    return decryptCreatorName(result);
  } catch (error) {
    console.error("Erreur dans ENROLLMENT_CAMPAIGN_POST_MIDDLEWARE:", error);
    return result;
  }
};
