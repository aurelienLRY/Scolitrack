/**
 * Énumération des privilèges pour garantir la cohérence
 */
export enum PrivilegeName {
  SETUP_APPLICATION = "SETUP_APPLICATION",
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_STUDENTS = "MANAGE_STUDENTS",
  MANAGE_MEDICAL_INFORMATIONS = "MANAGE_MEDICAL_INFORMATIONS",
  DELETE_DATA = "DELETE_DATA",
  UPDATE_DATA = "UPDATE_DATA",
  UPLOAD_FILES = "UPLOAD_FILES",
  MANAGE_COMMISSIONS = "MANAGE_COMMISSIONS",
  INSCRIPTION = "INSCRIPTION",
}

/**
 * Type pour la structure d'un privilège
 */
export interface PrivilegeDefinition {
  name: PrivilegeName;
  description: string;
}

/**
 * Liste complète des définitions de privilèges
 */
export const PRIVILEGES: PrivilegeDefinition[] = [
  {
    name: PrivilegeName.SETUP_APPLICATION,
    description: "Paramétrer l'application",
  },
  { name: PrivilegeName.MANAGE_USERS, description: "Gérer les utilisateurs" },
  { name: PrivilegeName.MANAGE_STUDENTS, description: "Gérer les élèves" },
  {
    name: PrivilegeName.MANAGE_MEDICAL_INFORMATIONS,
    description: "Gérer les informations médicales",
  },
  { name: PrivilegeName.DELETE_DATA, description: "Supprimer des données" },
  { name: PrivilegeName.UPDATE_DATA, description: "Modifier des données" },
  { name: PrivilegeName.UPLOAD_FILES, description: "Télécharger des fichiers" },
  { name: PrivilegeName.MANAGE_COMMISSIONS, description: "Gérer les commissions" },
  { name: PrivilegeName.INSCRIPTION, description: "Gérer les inscriptions" },
];

/**
 * Types pour les rôles
 */
export type RoleName = "SUPER_ADMIN" | "ADMIN" | "USER";

/**
 * Type pour la structure d'un rôle
 */
export interface RoleDefinition {
  name: RoleName;
  isPermanent: boolean;
  description: string;
}

/**
 * Privilèges exclus pour le rôle ADMIN
 */
export const ADMIN_EXCLUDED_PRIVILEGES: PrivilegeName[] = [
  PrivilegeName.SETUP_APPLICATION,
  PrivilegeName.MANAGE_USERS,
  PrivilegeName.MANAGE_STUDENTS,
  PrivilegeName.MANAGE_MEDICAL_INFORMATIONS,
  PrivilegeName.DELETE_DATA,
  PrivilegeName.UPDATE_DATA,
  PrivilegeName.INSCRIPTION,
];

/**
 * Vérifier si un utilisateur a un privilège spécifique
 * @param userPrivileges - Liste des privilèges de l'utilisateur
 * @param requiredPrivilege - Privilège requis
 */
export const hasPrivilege = (
  userPrivileges: { name: string }[],
  requiredPrivilege: PrivilegeName
): boolean => {
  return userPrivileges.some((p) => p.name === requiredPrivilege);
};

/**
 * Vérifier si un utilisateur a l'un des privilèges spécifiés
 * @param userPrivileges - Liste des privilèges de l'utilisateur
 * @param requiredPrivileges - Liste des privilèges requis (un seul suffit)
 */
export const hasAnyPrivilege = (
  userPrivileges: { name: string }[],
  requiredPrivileges: PrivilegeName[]
): boolean => {
  return requiredPrivileges.some((privilege) =>
    userPrivileges.some((p) => p.name === privilege)
  );
};

/**
 * Vérifier si un utilisateur a tous les privilèges spécifiés
 * @param userPrivileges - Liste des privilèges de l'utilisateur
 * @param requiredPrivileges - Liste des privilèges requis (tous sont nécessaires)
 */
export const hasAllPrivileges = (
  userPrivileges: { name: string }[],
  requiredPrivileges: PrivilegeName[]
): boolean => {
  return requiredPrivileges.every((privilege) =>
    userPrivileges.some((p) => p.name === privilege)
  );
};
