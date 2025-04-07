import { Prisma, ClassRoom } from "@prisma/client";
import { ClassRoomFullData } from "@/types/classroom.type";
/**
 * Type pour les résultats des requêtes de classe
 */
type ClassRoomResult = ClassRoom | ClassRoom[] | null | undefined;

/**
 * Middleware après opération - déchiffre les noms des utilisateurs dans le personnel des classes
 */
export const CLASSROOM_POST_MIDDLEWARE = async (
  params: Prisma.MiddlewareParams,
  result: ClassRoomResult
) => {
  try {
    if (
      params.model !== "ClassRoom" ||
      !["findFirst", "findUnique"].includes(params.action) ||
      !result
    ) {
      return result;
    }
  } catch (error) {
    console.error("Error in CLASSROOM_POST_MIDDLEWARE:", error);
    return result;
  }
};
