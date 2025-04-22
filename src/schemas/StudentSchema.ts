import * as yup from "yup";

/**
 * Schéma de validation pour la création d'un élève
 */
export const createStudentSchema = yup.object({
  firstName: yup.string().required("Le prénom est requis"),
  lastName: yup.string().required("Le nom est requis"),
  birthDate: yup.date().required("La date de naissance est requise"),
  birthPlace: yup.string().required("Le lieu de naissance est requis"),
  
  // Informations d'inscription et scolarité
  desiredEnrollmentDate: yup.date().nullable(),
  previousSchool: yup.string().nullable(),
  currentClass: yup.string().nullable(),
  
  // Garde et résidence
  hasSplitResidence: yup.boolean().default(false),
  custodyArrangement: yup.string().nullable().when("hasSplitResidence", {
    is: true,
    then: (schema) => schema.required("Le rythme de garde alternée est requis"),
  }),
  legalGuardians: yup.string().required("Les responsables légaux doivent être spécifiés"),
  primaryAddressUserId: yup.string().required("L'adresse principale est requise"),
  secondaryAddressUserId: yup.string().nullable().when("hasSplitResidence", {
    is: true,
    then: (schema) => schema.required("L'adresse secondaire est requise en cas de garde alternée"),
  }),
  
  // Assurance
  insuranceProvider: yup.string().nullable(),
  insuranceNumber: yup.string().nullable(),
  insuranceCertificate: yup.string().nullable(),
  
  // Relations
  familyId: yup.string().required("La famille est requise"),
  educationLevelId: yup.string().nullable(),
  classRoomId: yup.string().nullable(),
});

export type CreateStudentSchemaType = yup.InferType<typeof createStudentSchema>;

/**
 * Schéma de validation pour la mise à jour d'un élève
 */
export const updateStudentSchema = yup.object({
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  birthDate: yup.date().optional(),
  birthPlace: yup.string().optional(),
  
  // Informations d'inscription et scolarité
  desiredEnrollmentDate: yup.date().nullable().optional(),
  previousSchool: yup.string().nullable().optional(),
  currentClass: yup.string().nullable().optional(),
  
  // Garde et résidence
  hasSplitResidence: yup.boolean().optional(),
  custodyArrangement: yup.string().nullable().optional(),
  legalGuardians: yup.string().optional(),
  primaryAddressUserId: yup.string().optional(),
  secondaryAddressUserId: yup.string().nullable().optional(),
  
  // Assurance
  insuranceProvider: yup.string().nullable().optional(),
  insuranceNumber: yup.string().nullable().optional(),
  insuranceCertificate: yup.string().nullable().optional(),
  
  // Relations
  familyId: yup.string().optional(),
  educationLevelId: yup.string().nullable().optional(),
  classRoomId: yup.string().nullable().optional(),
});

export type UpdateStudentSchemaType = yup.InferType<typeof updateStudentSchema>; 