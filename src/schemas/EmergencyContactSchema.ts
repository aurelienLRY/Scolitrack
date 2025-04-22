import * as yup from "yup";

/**
 * Schéma de validation pour l'ajout d'un contact d'urgence
 */
export const createEmergencyContactSchema = yup.object({
  studentId: yup.string().required("L'élève est requis"),
  firstName: yup.string().required("Le prénom est requis"),
  lastName: yup.string().required("Le nom est requis"),
  relationship: yup.string().required("La relation avec l'élève est requise"),
  phoneNumber: yup
    .string()
    .required("Le numéro de téléphone est requis")
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  alternatePhone: yup
    .string()
    .nullable()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  priority: yup
    .number()
    .required("La priorité est requise")
    .min(1, "La priorité minimale est 1")
    .integer("La priorité doit être un nombre entier"),
});

export type CreateEmergencyContactSchemaType = yup.InferType<
  typeof createEmergencyContactSchema
>;

/**
 * Schéma de validation pour la mise à jour d'un contact d'urgence
 */
export const updateEmergencyContactSchema = yup.object({
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  relationship: yup.string().optional(),
  phoneNumber: yup
    .string()
    .optional()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  alternatePhone: yup
    .string()
    .nullable()
    .optional()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  priority: yup
    .number()
    .optional()
    .min(1, "La priorité minimale est 1")
    .integer("La priorité doit être un nombre entier"),
});

export type UpdateEmergencyContactSchemaType = yup.InferType<
  typeof updateEmergencyContactSchema
>; 