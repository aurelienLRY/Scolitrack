import { Prisma, ClassRoom } from "@prisma/client";
import { ClassRoomComplete } from "@/types/classroom.type";
import { safeDecrypt } from "@/lib/services/crypto.service";

/**
 * Type pour les résultats des requêtes de classe
 */
type ClassRoomResult =
  | ClassRoom
  | ClassRoomComplete
  | ClassRoom[]
  | ClassRoomComplete[]
  | null
  | undefined;

/**
 * Vérifie si une classe possède du personnel avec des relations user
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasClassPersonnel = (classroom: any): classroom is ClassRoomComplete => {
  return (
    classroom &&
    typeof classroom === "object" &&
    "classPersonnel" in classroom &&
    Array.isArray(classroom.classPersonnel)
  );
};

/**
 * Middleware après opération - déchiffre les noms des utilisateurs dans le personnel des classes
 */
export const CLASSROOM_POST_MIDDLEWARE = async (
  params: Prisma.MiddlewareParams,
  result: ClassRoomResult
): Promise<ClassRoomResult> => {
  try {
    if (
      params.model !== "ClassRoom" ||
      !["findMany", "findFirst", "findUnique"].includes(params.action) ||
      !result
    ) {
      return result;
    }
    console.log("---- CLASSROOM PRISMA MIDDLEWARE ----");

    // Traitement des résultats selon leur type
    if (Array.isArray(result)) {
      // Collection de classes (findMany)
      return result.map((classroom) => {
        if (!classroom) return classroom;

        if (hasClassPersonnel(classroom)) {
          return {
            ...classroom,
            classPersonnel: classroom.classPersonnel.map((personnel) => {
              if (!personnel.user || !personnel.user.name) return personnel;

              const decryptedName = safeDecrypt(personnel.user.name);
              return {
                ...personnel,
                user: {
                  ...personnel.user,
                  name: decryptedName,
                },
              };
            }),
          };
        }
        return classroom;
      });
    } else if (hasClassPersonnel(result)) {
      // Classe unique (findFirst/findUnique)
      return {
        ...result,
        classPersonnel: result.classPersonnel.map((personnel) => {
          if (!personnel.user || !personnel.user.name) return personnel;

          const decryptedName = safeDecrypt(personnel.user.name);
          return {
            ...personnel,
            user: {
              ...personnel.user,
              name: decryptedName,
            },
          };
        }),
      };
    }

    return result;
  } catch (error) {
    console.error("Erreur dans CLASSROOM_POST_MIDDLEWARE:", error);
    return result;
  } finally {
    console.log("---- CLASSROOM PRISMA MIDDLEWARE FINISHED ----");
  }
};
