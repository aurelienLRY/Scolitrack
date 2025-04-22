import * as yup from "yup";

/**
 * Schéma de validation pour la création d'une famille
 */
export const createFamilySchema = yup.object({
  name: yup.string().required("Le nom de la famille est requis"),
  notes: yup.string().nullable(),
});

export type CreateFamilySchemaType = yup.InferType<typeof createFamilySchema>;

/**
 * Schéma de validation pour la mise à jour d'une famille
 */
export const updateFamilySchema = yup.object({
  name: yup.string().optional(),
  notes: yup.string().nullable().optional(),
});

export type UpdateFamilySchemaType = yup.InferType<typeof updateFamilySchema>;

/**
 * Schéma de validation pour l'ajout d'un membre à une famille
 */
export const addFamilyMemberSchema = yup.object({
  userId: yup.string().required("L'utilisateur est requis"),
  familyId: yup.string().required("La famille est requise"),
  relationship: yup
    .string()
    .required("La relation avec la famille est requise")
    .oneOf(
      ["PRINCIPAL", "SECONDAIRE", "TUTEUR", "AUTRE"],
      "Relation invalide"
    ),
  isMainAddress: yup.boolean().default(false),
});

export type AddFamilyMemberSchemaType = yup.InferType<typeof addFamilyMemberSchema>; 