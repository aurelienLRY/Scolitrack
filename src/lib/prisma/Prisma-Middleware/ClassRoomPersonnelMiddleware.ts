import { Prisma, ClassRoomPersonnel } from "@prisma/client";
import { ClassRoomPersonnelWithUser } from "@/types/classroom.type";
import { safeDecrypt } from "@/lib/services/crypto.service";

/**
 * Type pour les résultats des requêtes du personnel de classe
 */
type ClassRoomPersonnelResult =
  | ClassRoomPersonnel
  | ClassRoomPersonnelWithUser
  | ClassRoomPersonnelWithUser[]
  | ClassRoomPersonnel[]
  | null
  | undefined;

/**
 * Vérifie si un personnel de classe possède une relation user
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasUser = (personnel: any): personnel is ClassRoomPersonnelWithUser => {
  return (
    personnel &&
    typeof personnel === "object" &&
    "user" in personnel &&
    personnel.user !== null
  );
};

/**
 * Middleware après opération - déchiffre les noms des utilisateurs dans le personnel des classes
 */
export const CLASSROOM_PERSONNEL_POST_MIDDLEWARE = async (
  params: Prisma.MiddlewareParams,
  result: ClassRoomPersonnelResult
): Promise<ClassRoomPersonnelResult> => {
  try {
    if (
      params.model !== "ClassRoomPersonnel" ||
      !["findMany", "findFirst", "findUnique"].includes(params.action) ||
      !result
    ) {
      return result;
    }
    console.log("---- CLASSROOM PERSONNEL PRISMA MIDDLEWARE ----");
    // Traitement des résultats selon leur type
    if (Array.isArray(result)) {
      // Collection de personnel (findMany)
      return result.map((personnel) => {
        if (!personnel) return personnel;

        if (hasUser(personnel) && personnel.user?.name) {
          const decryptedName = safeDecrypt(personnel.user.name);

          return {
            ...personnel,
            user: {
              ...personnel.user,
              name: decryptedName,
            },
          };
        }
        return personnel;
      });
    } else if (hasUser(result) && result.user?.name) {
      // Personnel unique (findFirst/findUnique)
      const decryptedName = safeDecrypt(result.user.name);

      return {
        ...result,
        user: {
          ...result.user,
          name: decryptedName,
        },
      };
    }

    return result;
  } catch (error) {
    console.error("Erreur dans CLASSROOM_PERSONNEL_POST_MIDDLEWARE:", error);
    return result;
  } finally {
    console.log("---- CLASSROOM PERSONNEL PRISMA MIDDLEWARE FINISHED ----");
  }
};
