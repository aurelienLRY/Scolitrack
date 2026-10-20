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
  /** Optionnel : déjà fourni par l'URL /campaigns/[id]/generate */
  campaignId: yup.string().optional(),
  emails: yup
    .array()
    .of(yup.string().email("Format d'email invalide").required())
    .min(1, "Au moins un email est requis")
    .required("Au moins un email est requis"),
});

const parentFormSchema = yup.object({
  role: yup
    .string()
    .oneOf(["pere", "mere", "tuteur", "autre"])
    .required(),
  lastName: yup.string().required("Nom requis"),
  firstName: yup.string().required("Prénom requis"),
  maritalStatus: yup.string().nullable(),
  profession: yup.string().nullable(),
  address: yup.string().required("Adresse requise"),
  postalCode: yup.string().required("Code postal requis"),
  city: yup.string().required("Ville requise"),
  socialSecurityNum: yup
    .string()
    .nullable()
    .max(15, "N° de sécurité sociale : 15 caractères max"),
  phoneLandline: yup.string().nullable(),
  phoneMobile: yup.string().required("Téléphone mobile requis"),
  email: yup.string().email("Email invalide").required("Email requis"),
  commissionId: yup.string().required("Choisissez une commission"),
  skills: yup.string().nullable(),
  availability: yup.object().nullable(),
});

const childMedicalSchema = yup.object({
  hasRubella: yup.boolean().default(false),
  hasChickenpox: yup.boolean().default(false),
  hasTonsillitis: yup.boolean().default(false),
  hasOtitis: yup.boolean().default(false),
  hasScarletFever: yup.boolean().default(false),
  hasWhoopingCough: yup.boolean().default(false),
  hasMumps: yup.boolean().default(false),
  hasMeasles: yup.boolean().default(false),
  hasAsthma: yup.boolean().default(false),
  hasRheumatism: yup.boolean().default(false),
  medicalConsent: yup.boolean().default(false),
  healthDetails: yup.string().nullable(),
  preferredHospital: yup.string().nullable(),
  doctorName: yup.string().nullable(),
  parentRecommendations: yup.string().nullable(),
});

const childFormSchema = yup.object({
  localId: yup.string().required(),
  studentId: yup.string().optional(),
  firstName: yup.string().required("Prénom de l'enfant requis"),
  lastName: yup.string().required("Nom de l'enfant requis"),
  birthDate: yup.string().required("Date de naissance requise"),
  birthPlace: yup.string().required("Lieu de naissance requis"),
  entryDate: yup.string().nullable(),
  previousSchool: yup.string().nullable(),
  radiationDate: yup.string().nullable(),
  targetLevel: yup
    .string()
    .required("Classe d'inscription requise")
    .oneOf(
      ["PS1", "PS2", "MS", "GS", "CP", "CE1", "CE2", "CM1", "CM2"],
      "Classe d'inscription requise"
    ),
  sleepsAtParent1: yup.boolean().default(false),
  sleepsAtParent2: yup.boolean().default(false),
  sleepsElsewhere: yup.boolean().default(false),
  otherResidenceAddress: yup.string().nullable(),
  otherResidencePostalCode: yup.string().nullable(),
  otherResidenceCity: yup.string().nullable(),
  residence: yup.string().nullable(),
  hasSplitResidence: yup.boolean().default(false),
  custodyArrangement: yup.string().nullable(),
  legalGuardians: yup.string().nullable(),
  insuranceProvider: yup.string().nullable(),
  insuranceNumber: yup.string().nullable(),
  medical: childMedicalSchema,
  emergencyContacts: yup.array().of(
    yup.object({
      firstName: yup.string().nullable(),
      lastName: yup.string().nullable(),
      phoneNumber: yup.string().nullable(),
    })
  ),
  authorizedPickups: yup.array().of(
    yup.object({
      firstName: yup.string().nullable(),
      lastName: yup.string().nullable(),
      phoneNumber: yup.string().nullable(),
    })
  ),
});

const parentFormDraftSchema = yup.object({
  role: yup.string().oneOf(["pere", "mere", "tuteur", "autre"]).required(),
  lastName: yup.string().nullable(),
  firstName: yup.string().nullable(),
  maritalStatus: yup.string().nullable(),
  profession: yup.string().nullable(),
  address: yup.string().nullable(),
  postalCode: yup.string().nullable(),
  city: yup.string().nullable(),
  socialSecurityNum: yup
    .string()
    .nullable()
    .max(15, "N° de sécurité sociale : 15 caractères max"),
  phoneLandline: yup.string().nullable(),
  phoneMobile: yup.string().nullable(),
  email: yup
    .string()
    .email("Email invalide")
    .nullable()
    .transform((v) => v || null),
  commissionId: yup.string().nullable(),
  skills: yup.string().nullable(),
  availability: yup.object().nullable(),
});

const childFormDraftSchema = yup.object({
  localId: yup.string().required(),
  studentId: yup.string().optional(),
  firstName: yup.string().nullable(),
  lastName: yup.string().nullable(),
  birthDate: yup.string().nullable(),
  birthPlace: yup.string().nullable(),
  entryDate: yup.string().nullable(),
  previousSchool: yup.string().nullable(),
  radiationDate: yup.string().nullable(),
  targetLevel: yup.string().nullable(),
  sleepsAtParent1: yup.boolean().default(false),
  sleepsAtParent2: yup.boolean().default(false),
  sleepsElsewhere: yup.boolean().default(false),
  otherResidenceAddress: yup.string().nullable(),
  otherResidencePostalCode: yup.string().nullable(),
  otherResidenceCity: yup.string().nullable(),
  residence: yup.string().nullable(),
  hasSplitResidence: yup.boolean().default(false),
  custodyArrangement: yup.string().nullable(),
  legalGuardians: yup.string().nullable(),
  insuranceProvider: yup.string().nullable(),
  insuranceNumber: yup.string().nullable(),
  medical: yup.object().nullable(),
  emergencyContacts: yup.array().nullable(),
  authorizedPickups: yup.array().nullable(),
});

/**
 * Schéma Yup — enregistrement brouillon (souple)
 */
export const enrollmentFormPayloadDraftSchema = yup.object({
  version: yup.number().oneOf([1]).required(),
  parents: yup.array().of(parentFormDraftSchema).min(1).max(2).required(),
  children: yup.array().of(childFormDraftSchema).default([]),
  emergencyContacts: yup.array().nullable(),
  authorizedPickups: yup.array().nullable(),
  consents: yup.object({
    authorizeOutings: yup.boolean().default(false),
    authorizeLeaveAlone: yup.boolean().default(false),
    acceptRegulations: yup.boolean().default(false),
    authorizeImageRights: yup.boolean().default(false),
    acceptAssociation: yup.boolean().default(false),
    acceptCanteenRules: yup.boolean().default(false),
    saquetasQuantity: yup.number().min(0).default(0),
  }),
});

/**
 * Schéma Yup — soumission (plus strict)
 */
function parentHasStarted(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  const email = typeof p.email === "string" ? p.email : "";
  return Boolean(
    (typeof p.firstName === "string" && p.firstName.trim()) ||
      (typeof p.lastName === "string" && p.lastName.trim()) ||
      email.includes("@")
  );
}

export const enrollmentFormPayloadSubmitSchema =
  enrollmentFormPayloadDraftSchema.shape({
    parents: yup
      .array()
      .of(
        yup.lazy((value) =>
          parentHasStarted(value) ? parentFormSchema : parentFormDraftSchema
        )
      )
      .min(1, "Au moins un parent est requis")
      .required()
      .test(
        "primary-parent-complete",
        "Le responsable légal 1 doit être complet",
        (parents) =>
          Array.isArray(parents) &&
          parents[0] != null &&
          parentFormSchema.isValidSync(parents[0])
      ),
    children: yup
      .array()
      .of(childFormSchema)
      .min(1, "Ajoutez au moins un enfant")
      .required(),
    // Les engagements / autorisations passent par signatures email ;
    // les booléens consents restent optionnels (rétrocompat).
    consents: yup.object({
      authorizeOutings: yup.boolean().default(false),
      authorizeLeaveAlone: yup.boolean().default(false),
      acceptRegulations: yup.boolean().default(false),
      authorizeImageRights: yup.boolean().default(false),
      acceptAssociation: yup.boolean().default(false),
      acceptCanteenRules: yup.boolean().default(false),
      saquetasQuantity: yup.number().min(0).default(0),
    }),
  });

/**
 * Schéma de validation pour la mise à jour d'un dossier (staff)
 */
export const updateEnrollmentFileSchema = yup.object({
  email: yup.string().email("Format d'email invalide").optional(),
  familyId: yup.string().nullable().optional(),
  status: yup
    .string()
    .oneOf(["DRAFT", "SUBMITTED", "NEED_INFO", "APPROVED", "REJECTED"])
    .optional(),
  decisionNote: yup.string().nullable().optional(),
  formPayload: enrollmentFormPayloadDraftSchema.optional(),
  authorizeOutings: yup.boolean().optional(),
  authorizeLeaveAlone: yup.boolean().optional(),
  acceptRegulations: yup.boolean().optional(),
  authorizeImageRights: yup.boolean().optional(),
  acceptAssociation: yup.boolean().optional(),
  acceptCanteenRules: yup.boolean().optional(),
  saquetasQuantity: yup.number().min(0).optional(),
});

/**
 * Mise à jour publique d'un dossier via token (formulaire complet)
 */
export const updateEnrollmentFileByTokenSchema = yup.object({
  email: yup.string().email("Format d'email invalide").optional(),
  status: yup.string().oneOf(["DRAFT", "SUBMITTED"]).optional(),
  formPayload: enrollmentFormPayloadDraftSchema.optional(),
  authorizeOutings: yup.boolean().optional(),
  authorizeLeaveAlone: yup.boolean().optional(),
  acceptRegulations: yup.boolean().optional(),
  authorizeImageRights: yup.boolean().optional(),
  acceptAssociation: yup.boolean().optional(),
  acceptCanteenRules: yup.boolean().optional(),
  saquetasQuantity: yup.number().min(0).optional(),
}); 