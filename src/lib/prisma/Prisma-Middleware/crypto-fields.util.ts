import { encrypt, safeDecrypt } from "@/lib/services/crypto.service";

/**
 * Chiffre les champs string listés sur un objet data Prisma (create/update).
 * Ignore les valeurs déjà préfixées ENC: (géré dans encrypt).
 */
export function encryptDataFields(
  data: Record<string, unknown> | undefined,
  fields: string[]
): void {
  if (!data || typeof data !== "object") return;
  for (const field of fields) {
    const value = data[field];
    if (typeof value === "string" && value.length > 0) {
      data[field] = encrypt(value);
    }
  }
}

/**
 * Déchiffre les champs string listés sur un enregistrement.
 */
export function decryptRecordFields<T extends Record<string, unknown>>(
  record: T,
  fields: string[]
): T {
  const next = { ...record };
  for (const field of fields) {
    const value = next[field];
    if (typeof value === "string") {
      (next as Record<string, unknown>)[field] = safeDecrypt(value);
    }
  }
  return next;
}

/** Champs User sensibles (email volontairement exclu : unique + auth NextAuth). */
export const USER_SENSITIVE_FIELDS = [
  "name",
  "firstName",
  "phoneNumber",
  "socialSecurityNum",
  "address",
  "city",
  "postalCode",
  "profession",
  "bio",
] as const;

/** Champs Student sensibles */
export const STUDENT_SENSITIVE_FIELDS = [
  "firstName",
  "lastName",
  "birthPlace",
  "previousSchool",
  "currentClass",
  "custodyArrangement",
  "insuranceProvider",
  "insuranceNumber",
  "insuranceCertificate",
  "legalGuardians",
] as const;

/**
 * Champs médicaux sensibles.
 * Note : studentId reste en clair pour la relation Prisma ;
 * le contenu médical est chiffré pour limiter l’identification hors clé app.
 */
export const MEDICAL_SENSITIVE_FIELDS = [
  "fileNumber",
  "healthBooklet",
  "medicalCertificate",
  "healthDetails",
  "doctorName",
  "preferredHospital",
  "parentRecommendations",
] as const;

export const EMERGENCY_CONTACT_SENSITIVE_FIELDS = [
  "firstName",
  "lastName",
  "relationship",
  "phoneNumber",
  "alternatePhone",
] as const;

export const AUTHORIZED_PICKUP_SENSITIVE_FIELDS = [
  "firstName",
  "lastName",
  "relationship",
  "phoneNumber",
  "identityDocument",
] as const;

export const ENROLLMENT_FILE_SENSITIVE_FIELDS = [
  "email",
  "decisionNote",
  "formPayload",
] as const;

export const FAMILY_SENSITIVE_FIELDS = ["name", "notes"] as const;
