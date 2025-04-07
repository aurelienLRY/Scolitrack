import {
  ClassRoom,
  ClassRoomPersonnel,
  EducationLevel,
  User,
} from "@prisma/client";

/**
 * Interface pour une salle de classe avec son personnel
 */
export interface ClassRoomWithPersonnel extends ClassRoom {
  classPersonnel: (ClassRoomPersonnel & {
    user: {
      id: string;
      name: string | null;
      email: string;
      image?: string | null;
      roleName: string | null;
    };
  })[];
  educationLevels?: {
    educationLevel: {
      id: string;
      name: string;
      code: string;
    };
  }[];
}

/**
 * Interface pour le personnel d'une salle de classe avec informations utilisateur
 */
export interface ClassRoomPersonnelWithUser extends ClassRoomPersonnel {
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    roleName: string | null;
  };
}

/**
 * Interface pour les données complètes d'une salle de classe
 */
export interface ClassRoomFullData extends ClassRoom {
  classPersonnel: User[];
  educationLevels: EducationLevel[];
}
