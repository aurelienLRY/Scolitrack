import * as yup from "yup";

/**
 * Schéma de validation pour la création d'un utilisateur par un administrateur
 */
export const CreateUserSchema = yup.object().shape({
  name: yup.string().required("Nom complet requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  role: yup.string(),
});

export type CreateUserSchemaType = yup.InferType<typeof CreateUserSchema>;

/**
 * Schéma de validation pour l'activation du compte et la définition du mot de passe
 */
export const ActivateAccountSchema = yup.object().shape({
  password: yup
    .string()
    .required("Mot de passe requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial"
    ),
  confirmPassword: yup
    .string()
    .required("Confirmation du mot de passe requis")
    .oneOf([yup.ref("password")], "Les mots de passe ne correspondent pas"),
  token: yup.string().required("Token requis"),
});

export type ActivateAccountSchemaType = yup.InferType<
  typeof ActivateAccountSchema
>;

/**
 * Schéma de validation pour les informations de profil utilisateur
 */
export const userProfileSchema = yup.object({
  // Informations de base
  parentType: yup
    .string()
    .required("Le type de parent est requis")
    .oneOf(
      ["MERE", "PERE", "TUTEUR", "AUTRE"],
      "Type de parent invalide"
    ),
  name: yup.string().required("Le nom complet est requis"),
  firstName: yup.string().required("Le prénom est requis"),
  gender: yup
    .string()
    .nullable()
    .oneOf(["M", "F", "N"], "Genre invalide"),
  
  // Informations de contact
  socialSecurityNum: yup
    .string()
    .nullable()
    .test("is-valid-ssn", "Numéro de sécurité sociale invalide", (value) => {
      return !value || /^[12][0-9]{2}(0[1-9]|1[0-2])(2[AB]|[0-9]{2})[0-9]{8}$/.test(value);
    }),
  phoneNumber: yup
    .string()
    .nullable()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  // Adresse
  address: yup.string().nullable(),
  postalCode: yup
    .string()
    .nullable()
    .test("is-valid-postal", "Code postal invalide", (value) => {
      return !value || /^[0-9]{5}$/.test(value);
    }),
  city: yup.string().nullable(),
  
  // Informations complémentaires
  profession: yup.string().nullable(),
  maritalStatus: yup
    .string()
    .nullable()
    .oneOf(
      ["CELIBATAIRE", "MARIE", "PACSE", "DIVORCE", "VEUF", "AUTRE"],
      "Statut marital invalide"
    ),
  bio: yup.string().nullable(),
  skills: yup.string().nullable(),
  
  // Groupes d'appartenance
  isHousekeeping: yup.boolean().default(false),
  isDaycare: yup.boolean().default(false),
  isCanteen: yup.boolean().default(false),
});

export type UserProfileSchemaType = yup.InferType<typeof userProfileSchema>;

/**
 * Schéma de validation pour la mise à jour du profil utilisateur
 */
export const updateUserProfileSchema = yup.object({
  // Informations de base
  parentType: yup
    .string()
    .optional()
    .oneOf(
      ["MERE", "PERE", "TUTEUR", "AUTRE"],
      "Type de parent invalide"
    ),
  name: yup.string().optional(),
  firstName: yup.string().optional(),
  gender: yup
    .string()
    .nullable()
    .optional()
    .oneOf(["M", "F", "N"], "Genre invalide"),
  
  // Informations de contact
  socialSecurityNum: yup
    .string()
    .nullable()
    .optional()
    .test("is-valid-ssn", "Numéro de sécurité sociale invalide", (value) => {
      return !value || /^[12][0-9]{2}(0[1-9]|1[0-2])(2[AB]|[0-9]{2})[0-9]{8}$/.test(value);
    }),
  phoneNumber: yup
    .string()
    .nullable()
    .optional()
    .test("is-valid-phone", "Numéro de téléphone invalide", (value) => {
      return !value || /^((\+)33|0)[1-9](\d{2}){4}$/.test(value);
    }),
  
  // Adresse
  address: yup.string().nullable().optional(),
  postalCode: yup
    .string()
    .nullable()
    .optional()
    .test("is-valid-postal", "Code postal invalide", (value) => {
      return !value || /^[0-9]{5}$/.test(value);
    }),
  city: yup.string().nullable().optional(),
  
  // Informations complémentaires
  profession: yup.string().nullable().optional(),
  maritalStatus: yup
    .string()
    .nullable()
    .optional()
    .oneOf(
      ["CELIBATAIRE", "MARIE", "PACSE", "DIVORCE", "VEUF", "AUTRE"],
      "Statut marital invalide"
    ),
  bio: yup.string().nullable().optional(),
  skills: yup.string().nullable().optional(),
  
  // Groupes d'appartenance
  isHousekeeping: yup.boolean().optional(),
  isDaycare: yup.boolean().optional(),
  isCanteen: yup.boolean().optional(),
});

export type UpdateUserProfileSchemaType = yup.InferType<typeof updateUserProfileSchema>;

/**
 * Schéma de validation pour le changement de mot de passe
 */
export const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required("Le mot de passe actuel est requis"),
  newPassword: yup
    .string()
    .required("Le nouveau mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
      "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial"
    ),
  confirmPassword: yup
    .string()
    .required("La confirmation du mot de passe est requise")
    .oneOf([yup.ref("newPassword")], "Les mots de passe ne correspondent pas"),
});

export type PasswordChangeSchemaType = yup.InferType<typeof passwordChangeSchema>;
