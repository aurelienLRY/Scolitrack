import {
  ClassRoom,
  ClassRoomPersonnel,
  ClassRoomEducationLevel,
} from "@prisma/client";

/**
 * Type pour représenter un utilisateur simplifié (pour le personnel)
 */
export type UserBasic = {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  roleName: string | null;
};

/**
 * Type pour représenter un niveau d'éducation simplifié
 */
export type EducationLevelBasic = {
  id: string;
  name: string;
  code: string;
};

/**
 * Type pour une relation ClassRoom-EducationLevel avec les données du niveau
 */
export type ClassRoomEducationLevelWithLevel = ClassRoomEducationLevel & {
  educationLevel: EducationLevelBasic;
};

/**
 * Type pour une relation ClassRoom-Personnel avec les données de l'utilisateur
 */
export type ClassRoomPersonnelWithUser = ClassRoomPersonnel & {
  user: UserBasic;
};

/**
 * Interface uniformisée pour une salle de classe complète
 * Cette interface est utilisée partout dans l'application pour représenter une classe
 * avec toutes ses relations (personnel et niveaux d'éducation)
 */
export interface ClassRoomComplete extends ClassRoom {
  // Personnel associé à la classe
  classPersonnel: ClassRoomPersonnelWithUser[];

  // Niveaux d'éducation associés à la classe
  educationLevels: ClassRoomEducationLevelWithLevel[];
}

// Les interfaces ci-dessous sont conservées pour la rétrocompatibilité
// mais devraient être remplacées progressivement par ClassRoomComplete

/**
 * @deprecated Utiliser ClassRoomComplete à la place
 */
export interface ClassRoomWithPersonnel extends ClassRoom {
  classPersonnel: ClassRoomPersonnelWithUser[];
  educationLevels: ClassRoomEducationLevelWithLevel[];
}

/**
 * @deprecated Utiliser ClassRoomComplete à la place
 */
export interface ClassRoomFullData extends ClassRoom {
  classPersonnel: ClassRoomPersonnelWithUser[];
  educationLevels: ClassRoomEducationLevelWithLevel[];
}
