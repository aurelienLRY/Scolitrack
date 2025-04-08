import * as yup from "yup";

/**
 * Schéma pour la création d'une salle de classe
 */
export const classRoomSchema = yup.object({
  name: yup.string().required("Le nom de la classe est requis"),
  educationLevelIds: yup
    .array()
    .of(yup.string())
    .required("Au moins un niveau d'éducation est requis"),
  capacity: yup.number().nullable(),
  establishmentId: yup.string().required("L'ID de l'établissement est requis"),
  logoUrl: yup.string().nullable(),
  logoFileId: yup.string().nullable(),
  colorCode: yup.string().nullable(),
});

export type TClassRoomFormData = yup.InferType<typeof classRoomSchema>;

/**
 * Schéma pour la mise à jour d'une salle de classe
 */
export const classRoomUpdateSchema = yup.object({
  name: yup.string().optional(),
  educationLevelIds: yup.array().of(yup.string()).optional(),
  capacity: yup.number().nullable().optional(),
  logoUrl: yup.string().nullable().optional(),
  logoFileId: yup.string().nullable().optional(),
  colorCode: yup.string().nullable().optional(),
});

export type TClassRoomUpdateFormData = yup.InferType<
  typeof classRoomUpdateSchema
>;

/**
 * Schéma pour l'attribution d'un membre du personnel à une classe
 */
export const classRoomPersonnelSchema = yup.object({
  userId: yup.string().required("L'ID de l'utilisateur est requis"),
  roleInClass: yup.string().nullable(),
});

export type TClassRoomPersonnelFormData = yup.InferType<
  typeof classRoomPersonnelSchema
>;
