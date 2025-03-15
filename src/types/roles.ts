export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  USER = "USER",
}

export const roleLabels = {
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.ADMIN]: "Directrice | Directeur",
  [Role.TEACHER]: "Enseignante | Enseignant",
  [Role.USER]: "Parent | Tuteur",
};
