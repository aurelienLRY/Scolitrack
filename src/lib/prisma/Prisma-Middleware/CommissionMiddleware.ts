import { Prisma, Commission } from "@prisma/client";
import { TCommissionWithAllRelations } from "@/types/commission.type";
import { safeDecrypt } from "@/lib/services/crypto.service";

/**
 * Type pour les résultats des requêtes de commission
 */
type CommissionResult =
  | Commission
  | TCommissionWithAllRelations
  | Commission[]
  | TCommissionWithAllRelations[]
  | null
  | undefined;

/**
 * Vérifie si une commission possède des membres avec des relations user
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasCommissionMembers = (commission: any): commission is TCommissionWithAllRelations => {
  return (
    commission &&
    typeof commission === "object" &&
    "members" in commission &&
    Array.isArray(commission.members)
  );
};

/**
 * Middleware après opération - déchiffre les noms des utilisateurs dans les membres des commissions
 */
export const COMMISSION_POST_MIDDLEWARE = async (
  params: Prisma.MiddlewareParams,
  result: CommissionResult
): Promise<CommissionResult> => {
  try {
    if (
      params.model !== "Commission" ||
      !["findMany", "findFirst", "findUnique"].includes(params.action) ||
      !result
    ) {
      return result;
    }
    console.log("---- COMMISSION PRISMA MIDDLEWARE ----");

    // Traitement des résultats selon leur type
    if (Array.isArray(result)) {
      // Collection de commissions (findMany)
      return result.map((commission) => {
        if (!commission) return commission;

        if (hasCommissionMembers(commission) && commission.members) {
          return {
            ...commission,
            members: commission.members.map((member) => {
              if (!member.user || !member.user.name) return member;

              const decryptedName = safeDecrypt(member.user.name);
              return {
                ...member,
                user: {
                  ...member.user,
                  name: decryptedName,
                },
              };
            }),
          };
        }
        return commission;
      });
    } else if (hasCommissionMembers(result) && result.members) {
      // Commission unique (findFirst/findUnique)
      return {
        ...result,
        members: result.members.map((member) => {
          if (!member.user || !member.user.name) return member;

          const decryptedName = safeDecrypt(member.user.name);
          return {
            ...member,
            user: {
              ...member.user,
              name: decryptedName,
            },
          };
        }),
      };
    }

    return result;
  } catch (error) {
    console.error("Erreur dans COMMISSION_POST_MIDDLEWARE:", error);
    return result;
  } finally {
    console.log("---- COMMISSION PRISMA MIDDLEWARE FINISHED ----");
  }
};
