import * as yup from "yup";

/**
 * Schéma de validation pour la création d'une campagne d'inscription
 */
export const createEnrollmentCampaignSchema = yup.object({
  name: yup.string().required("Le nom de la campagne est requis"),
  startDate: yup.date().required("La date de début est requise"),
  endDate: yup
    .date()
    .required("La date de fin est requise")
    .min(
      yup.ref("startDate"),
      "La date de fin doit être postérieure à la date de début"
    ),
});

/**
 * Schéma de validation pour la mise à jour d'une campagne d'inscription
 */
export const updateEnrollmentCampaignSchema = yup.object({
  name: yup.string().optional(),
  startDate: yup.date().optional(),
  endDate: yup
    .date()
    .optional()
    .min(
      yup.ref("startDate"),
      "La date de fin doit être postérieure à la date de début"
    ),
});

/**
 * Schéma de validation pour la création d'un dossier d'inscription
 */
export const createEnrollmentFileSchema = yup.object({
  campaignId: yup.string().required("L'ID de la campagne est requis"),
  familyId: yup.string().nullable(),
  email: yup
    .string()
    .email("Format d'email invalide")
    .required("L'email est requis"),
});

/**
 * Schéma de validation pour la mise à jour d'un dossier d'inscription
 */
export const updateEnrollmentFileSchema = yup.object({
  familyId: yup.string().nullable().optional(),
  status: yup
    .string()
    .oneOf(["DRAFT", "SUBMITTED", "NEED_INFO", "APPROVED", "REJECTED"])
    .optional(),
  decisionNote: yup.string().nullable().optional(),
});

/**
 * Schéma de validation pour la mise à jour du statut d'un dossier
 */
export const updateEnrollmentStatusSchema = yup.object({
  status: yup
    .string()
    .oneOf(["DRAFT", "SUBMITTED", "NEED_INFO", "APPROVED", "REJECTED"])
    .required("Le statut est requis"),
  note: yup.string().nullable(),
});

/**
 * Schéma de validation pour l'ajout d'un étudiant à un dossier
 */
export const addStudentToEnrollmentSchema = yup.object({
  studentId: yup.string().required("L'ID de l'étudiant est requis"),
});

/**
 * Schéma de validation pour la génération de dossiers d'inscription
 */
export const generateEnrollmentFilesSchema = yup.object({
  campaignId: yup.string().required("L'ID de la campagne est requis"),
  emails: yup
    .array()
    .of(yup.string().email("Format d'email invalide"))
    .min(1, "Au moins un email est requis"),
}); 