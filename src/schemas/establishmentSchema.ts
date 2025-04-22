import * as yup from "yup";

export const establishmentSchema = yup.object({
  name: yup.string().required("Le nom de l'établissement est requis"),
  address: yup.string().required("L'adresse est requise"),
  postalCode: yup
    .string()
    .required("Le code postal est requis")
    .matches(/^[0-9]{5}$/, "Le code postal doit contenir 5 chiffres"),
  city: yup.string().required("La ville est requise"),
  email: yup.string().email("Email invalide").nullable(),
  phone: yup
    .string()
    .nullable()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  website: yup.string().url("URL du site web invalide").nullable(),
  adminId: yup.string().required("Le directeur ou la directrice est requis"),
  logoUrl: yup.string().nullable(),
  logoFileId: yup.string().nullable(),
  description: yup
    .string()
    .nullable()
    .max(1000, "La description ne doit pas dépasser 1000 caractères"),
});

export type EstablishmentFormData = yup.InferType<typeof establishmentSchema>;

export const establishmentUpdateSchema = yup.object({
  name: yup.string().optional(),
  address: yup.string().optional(),
  postalCode: yup
    .string()
    .optional()
    .matches(/^[0-9]{5}$/, "Le code postal doit contenir 5 chiffres"),
  city: yup.string().optional(),
  email: yup.string().email("Email invalide").nullable().optional(),
  phone: yup
    .string()
    .nullable()
    .optional()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  website: yup.string().url("URL du site web invalide").nullable().optional(),
  adminId: yup.string().optional(),
  logoUrl: yup.string().nullable().optional(),
  logoFileId: yup.string().nullable().optional(),
  description: yup
    .string()
    .nullable()
    .optional()
    .max(1000, "La description ne doit pas dépasser 1000 caractères"),
});

export type EstablishmentUpdateFormData = yup.InferType<
  typeof establishmentUpdateSchema
>;
