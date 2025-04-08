import * as yup from "yup";

export const educationLevelSchema = yup.object({
  name: yup.string().required("Le nom du niveau est requis"),
  code: yup
    .string()
    .required("Le code du niveau est requis")
    .matches(
      /^[A-Z0-9_]{2,10}$/,
      "Le code doit contenir entre 2 et 10 caractères (lettres majuscules, chiffres ou underscore)"
    ),
  establishmentId: yup.string().required("L'ID de l'établissement est requis"),
});

export type EducationLevelFormData = yup.InferType<typeof educationLevelSchema>;

export const educationLevelUpdateSchema = yup.object({
  name: yup.string().optional(),
  code: yup
    .string()
    .uppercase()
    .optional()
    .matches(
      /^[A-Z0-9_]{2,10}$/,
      "Le code doit contenir entre 2 et 10 caractères (lettres majuscules, chiffres ou underscore)"
    ),
});

export type EducationLevelUpdateFormData = yup.InferType<
  typeof educationLevelUpdateSchema
>;
