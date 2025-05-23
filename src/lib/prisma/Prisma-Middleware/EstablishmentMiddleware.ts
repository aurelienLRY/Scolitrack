import { Prisma, Establishment, User } from "@prisma/client";
import { safeDecrypt } from "@/lib/services/crypto.service";

/**
 * Type pour les résultats des requêtes d'établissement
 */
type EstablishmentWithAdmin = Establishment & {
  admin?: User | null;
};

type EstablishmentResult =
  | Establishment
  | EstablishmentWithAdmin
  | EstablishmentWithAdmin[]
  | Establishment[]
  | null
  | undefined;

/**
 * Vérifie si un établissement possède une relation admin
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasAdmin = (est: any): est is EstablishmentWithAdmin => {
  return est && typeof est === "object" && "admin" in est && est.admin !== null;
};

/**
 * Middleware après opération - déchiffre les noms des administrateurs dans les établissements
 */
export const ESTABLISHMENT_POST_MIDDLEWARE = async (
  params: Prisma.MiddlewareParams,
  result: EstablishmentResult
): Promise<EstablishmentResult> => {
  try {
    if (
      params.model !== "Establishment" ||
      !["findMany", "findFirst", "findUnique"].includes(params.action) ||
      !result
    ) {
      return result;
    }
    console.log("---- ESTABLISHMENT PRISMA MIDDLEWARE ----");
    // Traitement des résultats selon leur type
    if (Array.isArray(result)) {
      // Collection d'établissements (findMany)
      return result.map((establishment) => {
        if (!establishment) return establishment;

        if (hasAdmin(establishment) && establishment.admin?.name) {
          const decryptedName = safeDecrypt(establishment.admin.name);

          return {
            ...establishment,
            admin: {
              ...establishment.admin,
              name: decryptedName,
            },
          };
        }
        return establishment;
      });
    } else if (hasAdmin(result) && result.admin?.name) {
      // Établissement unique (findFirst/findUnique)
      const decryptedName = safeDecrypt(result.admin.name);

      return {
        ...result,
        admin: {
          ...result.admin,
          name: decryptedName,
        },
      };
    }

    return result;
  } catch (error) {
    console.error("Erreur dans ESTABLISHMENT_POST_MIDDLEWARE:", error);
    return result;
  } finally {
    console.log("---- ESTABLISHMENT PRISMA MIDDLEWARE FINISHED ----");
  }
};
