import { decrypt } from "@/lib/services/crypto.service";
import { Prisma, Establishment, User } from "@prisma/client";

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
 * Tente de déchiffrer une valeur potentiellement chiffrée
 * Inclut des mécanismes de gestion des erreurs et de fallback
 */
const safeDecrypt = (value: string | null | undefined): string | null => {
  if (!value) return null;

  try {
    const decrypted = decrypt(value);
    return typeof decrypted === "string" ? decrypted : null;
  } catch (error) {
    console.error("Erreur dans safeDecrypt:", error);
    return value; // En cas d'échec, retourner la valeur originale
  }
};

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

    console.log("---------- ESTABLISHMENT_POST_MIDDLEWARE ----------");
    console.log("Params action: ", params.action);

    // Traitement des résultats selon leur type
    if (Array.isArray(result)) {
      console.log("ESTABLISHMENT_POST_MIDDLEWARE: Array détecté");
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
      console.log("ESTABLISHMENT_POST_MIDDLEWARE: Objet unique détecté");
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
  }
};
