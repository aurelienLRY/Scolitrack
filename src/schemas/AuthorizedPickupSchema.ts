import * as yup from "yup";

/**
 * Schéma de validation pour l'ajout d'une personne autorisée à récupérer un élève
 */
export const createAuthorizedPickupSchema = yup.object({
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
  identityDocument: yup.string().nullable(),
  startDate: yup.date().nullable(),
  endDate: yup.date().nullable().when("startDate", {
    is: (startDate: Date | null) => startDate !== null,
    then: (schema) => 
      schema.min(
        yup.ref("startDate"), 
        "La date de fin doit être postérieure à la date de début"
      ),
  }),
});

export type CreateAuthorizedPickupSchemaType = yup.InferType<
  typeof createAuthorizedPickupSchema
>;

/**
 * Schéma de validation pour la mise à jour d'une personne autorisée
 */
export const updateAuthorizedPickupSchema = yup.object({
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  relationship: yup.string().optional(),
  phoneNumber: yup
    .string()
    .optional()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  identityDocument: yup.string().nullable().optional(),
  startDate: yup.date().nullable().optional(),
  endDate: yup.date().nullable().optional().when("startDate", {
    is: (startDate: Date | null) => startDate !== null,
    then: (schema) => 
      schema.min(
        yup.ref("startDate"), 
        "La date de fin doit être postérieure à la date de début"
      ),
  }),
});

export type UpdateAuthorizedPickupSchemaType = yup.InferType<
  typeof updateAuthorizedPickupSchema
>; 