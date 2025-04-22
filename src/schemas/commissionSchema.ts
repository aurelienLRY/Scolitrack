import * as yup from "yup";

/**
 * Schéma de validation pour la création d'une commission
 */
export const CommissionSchema = yup.object({
  name: yup.string().required("Le nom est requis"),
  description: yup.string().optional(),
  speciality: yup.string().optional(),
  establishmentId: yup.string().required("L'établissement est requis"),
  logoUrl: yup.string().optional(),
  logoFileId: yup.string().optional(),
  colorCode: yup.string().optional(),
});

/**
 * Type pour les données de création d'une commission
 */
export type CommissionFormData = yup.InferType<typeof CommissionSchema>;

/**
 * Schéma de validation pour la mise à jour d'une commission
 */
export const CommissionUpdateSchema = CommissionSchema.partial();

/**
 * Type pour les données de mise à jour d'une commission
 */
export type CommissionUpdateFormData = yup.InferType<typeof CommissionUpdateSchema>;

/**
 * Schéma de validation pour l'ajout d'un membre à une commission
 */
export const CommissionMemberSchema = yup.object({
  userId: yup.string().required("L'utilisateur est requis"),
  commissionId: yup.string().required("La commission est requise"),
  role: yup.string().required("Le rôle est requis"),
});

/**
 * Type pour les données d'ajout d'un membre à une commission
 */
export type CommissionMemberFormData = yup.InferType<typeof CommissionMemberSchema>;
