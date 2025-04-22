import * as yup from "yup";

/**
 * Schéma de validation pour la création d'informations médicales
 */
export const createMedicalInformationSchema = yup.object({
  studentId: yup.string().required("L'élève est requis"),
  fileNumber: yup.string().required("Le numéro de dossier est requis"),
  
  // Documents médicaux
  healthBooklet: yup.string().nullable(),
  medicalCertificate: yup.string().nullable(),
  
  // Maladies contractées
  hasRubella: yup.boolean().default(false),
  hasChickenpox: yup.boolean().default(false),
  hasTonsillitis: yup.boolean().default(false),
  hasOtitis: yup.boolean().default(false),
  hasScarletFever: yup.boolean().default(false),
  hasWhoopingCough: yup.boolean().default(false),
  hasMumps: yup.boolean().default(false),
  hasMeasles: yup.boolean().default(false),
  
  // Conditions médicales
  hasAsthma: yup.boolean().default(false),
  hasRheumatism: yup.boolean().default(false),
  
  // Détails et médecin
  healthDetails: yup.string().nullable(),
  doctorName: yup.string().nullable(),
  
  // Autorisations
  medicalConsent: yup.boolean().default(false),
});

export type CreateMedicalInformationSchemaType = yup.InferType<
  typeof createMedicalInformationSchema
>;

/**
 * Schéma de validation pour la mise à jour d'informations médicales
 */
export const updateMedicalInformationSchema = yup.object({
  fileNumber: yup.string().optional(),
  
  // Documents médicaux
  healthBooklet: yup.string().nullable().optional(),
  medicalCertificate: yup.string().nullable().optional(),
  
  // Maladies contractées
  hasRubella: yup.boolean().optional(),
  hasChickenpox: yup.boolean().optional(),
  hasTonsillitis: yup.boolean().optional(),
  hasOtitis: yup.boolean().optional(),
  hasScarletFever: yup.boolean().optional(),
  hasWhoopingCough: yup.boolean().optional(),
  hasMumps: yup.boolean().optional(),
  hasMeasles: yup.boolean().optional(),
  
  // Conditions médicales
  hasAsthma: yup.boolean().optional(),
  hasRheumatism: yup.boolean().optional(),
  
  // Détails et médecin
  healthDetails: yup.string().nullable().optional(),
  doctorName: yup.string().nullable().optional(),
  
  // Autorisations
  medicalConsent: yup.boolean().optional(),
});

export type UpdateMedicalInformationSchemaType = yup.InferType<
  typeof updateMedicalInformationSchema
>; 