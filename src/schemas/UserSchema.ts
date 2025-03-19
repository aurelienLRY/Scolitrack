import * as yup from "yup";
import { UserRole } from "@prisma/client";

/**
 * Schéma de validation pour la création d'un utilisateur par un administrateur
 */
export const CreateUserSchema = yup.object().shape({
  name: yup.string().required("Nom complet requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  role: yup
    .string()
    .oneOf(Object.values(UserRole), "Rôle invalide")
    .required("Rôle requis"),
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
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
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
