/**
 * Payload du formulaire public d'inscription (stocké chiffré dans EnrollmentFile.formPayload).
 * Un token = un dossier famille pouvant contenir N enfants.
 */

export type ParentalRole = "pere" | "mere" | "tuteur" | "autre";
export type MaritalStatus =
  | "celibataire"
  | "marie"
  | "divorce"
  | "concubinage"
  | "pacse"
  | "";

/** NIR français : 13 caractères + clé 2 chiffres = 15 max (espaces ignorés à la saisie). */
export const SOCIAL_SECURITY_MAX_LENGTH = 15;

export interface EnrollmentParentAvailability {
  canteen: boolean;
  daycare: boolean;
  halfDaySubstitute: boolean;
  housekeeping: boolean;
  greenSpaces: boolean;
}

export interface EnrollmentParentForm {
  role: ParentalRole;
  lastName: string;
  firstName: string;
  maritalStatus: MaritalStatus;
  profession: string;
  address: string;
  postalCode: string;
  city: string;
  socialSecurityNum: string;
  phoneLandline: string;
  phoneMobile: string;
  email: string;
  /** Commission choisie (id Prisma) — 1 par parent (fiche 4) */
  commissionId: string;
  skills: string;
  availability: EnrollmentParentAvailability;
}

export interface EnrollmentEmergencyContactForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  relationship?: string;
}

export interface EnrollmentAuthorizedPickupForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  relationship?: string;
}

export interface EnrollmentMedicalForm {
  hasRubella: boolean;
  hasChickenpox: boolean;
  hasTonsillitis: boolean;
  hasOtitis: boolean;
  hasScarletFever: boolean;
  hasWhoopingCough: boolean;
  hasMumps: boolean;
  hasMeasles: boolean;
  hasAsthma: boolean;
  hasRheumatism: boolean;
  healthDetails: string;
  preferredHospital: string;
  doctorName: string;
  parentRecommendations: string;
  medicalConsent: boolean;
}

export type EducationLevelCode =
  | "PS1"
  | "PS2"
  | "MS"
  | "GS"
  | "CP"
  | "CE1"
  | "CE2"
  | "CM1"
  | "CM2"
  | "";

export interface EnrollmentChildForm {
  localId: string;
  studentId?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  /** Date d'entrée à la Calandreta */
  entryDate: string;
  /** Établissement fréquenté auparavant */
  previousSchool: string;
  /** Date de radiation (si changement d'établissement) */
  radiationDate: string;
  targetLevel: EducationLevelCode;
  /** L'enfant dort / réside chez le responsable légal 1 */
  sleepsAtParent1: boolean;
  /** L'enfant dort / réside chez le responsable légal 2 */
  sleepsAtParent2: boolean;
  /** L'enfant réside ailleurs */
  sleepsElsewhere: boolean;
  /** Adresse complète si sleepsElsewhere */
  otherResidenceAddress: string;
  otherResidencePostalCode: string;
  otherResidenceCity: string;
  /** @deprecated rétrocompat payload */
  residence?: string;
  /** @deprecated rétrocompat payload */
  hasSplitResidence?: boolean;
  /** @deprecated rétrocompat payload */
  custodyArrangement?: string;
  legalGuardians: string;
  insuranceProvider: string;
  insuranceNumber: string;
  medical: EnrollmentMedicalForm;
  emergencyContacts: EnrollmentEmergencyContactForm[];
  authorizedPickups: EnrollmentAuthorizedPickupForm[];
}

export interface EnrollmentConsentsForm {
  authorizeOutings: boolean;
  authorizeLeaveAlone: boolean;
  acceptRegulations: boolean;
  authorizeImageRights: boolean;
  acceptAssociation: boolean;
  acceptCanteenRules: boolean;
  saquetasQuantity: number;
}

export interface EnrollmentFormPayload {
  version: 1;
  parents: [EnrollmentParentForm, EnrollmentParentForm];
  children: EnrollmentChildForm[];
  /** Contacts d'urgence au niveau dossier / famille (ficha 1 suite) */
  emergencyContacts: EnrollmentEmergencyContactForm[];
  /** Personnes autorisées à récupérer l'enfant (CI obligatoire) */
  authorizedPickups: EnrollmentAuthorizedPickupForm[];
  consents: EnrollmentConsentsForm;
}

function emptyAvailability(): EnrollmentParentAvailability {
  return {
    canteen: false,
    daycare: false,
    halfDaySubstitute: false,
    housekeeping: false,
    greenSpaces: false,
  };
}

export function createEmptyParent(
  role: ParentalRole = "pere"
): EnrollmentParentForm {
  return {
    role,
    lastName: "",
    firstName: "",
    maritalStatus: "",
    profession: "",
    address: "",
    postalCode: "",
    city: "",
    socialSecurityNum: "",
    phoneLandline: "",
    phoneMobile: "",
    email: "",
    commissionId: "",
    skills: "",
    availability: emptyAvailability(),
  };
}

export function createEmptyMedical(): EnrollmentMedicalForm {
  return {
    hasRubella: false,
    hasChickenpox: false,
    hasTonsillitis: false,
    hasOtitis: false,
    hasScarletFever: false,
    hasWhoopingCough: false,
    hasMumps: false,
    hasMeasles: false,
    hasAsthma: false,
    hasRheumatism: false,
    healthDetails: "",
    preferredHospital: "",
    doctorName: "",
    parentRecommendations: "",
    medicalConsent: false,
  };
}

export function createEmptyChild(localId: string): EnrollmentChildForm {
  return {
    localId,
    firstName: "",
    lastName: "",
    birthDate: "",
    birthPlace: "",
    entryDate: "",
    previousSchool: "",
    radiationDate: "",
    targetLevel: "",
    sleepsAtParent1: false,
    sleepsAtParent2: false,
    sleepsElsewhere: false,
    otherResidenceAddress: "",
    otherResidencePostalCode: "",
    otherResidenceCity: "",
    legalGuardians: "",
    insuranceProvider: "",
    insuranceNumber: "",
    medical: createEmptyMedical(),
    emergencyContacts: [],
    authorizedPickups: [],
  };
}

function mergeChild(
  c: Partial<EnrollmentChildForm> | undefined,
  fallback: EnrollmentChildForm
): EnrollmentChildForm {
  if (!c) return fallback;

  const hasNewResidence =
    c.sleepsAtParent1 != null ||
    c.sleepsAtParent2 != null ||
    c.sleepsElsewhere != null;

  let sleepsAtParent1 = c.sleepsAtParent1 ?? fallback.sleepsAtParent1;
  let sleepsAtParent2 = c.sleepsAtParent2 ?? fallback.sleepsAtParent2;
  let sleepsElsewhere = c.sleepsElsewhere ?? fallback.sleepsElsewhere;
  let otherResidenceAddress =
    c.otherResidenceAddress ?? fallback.otherResidenceAddress;
  let otherResidencePostalCode =
    c.otherResidencePostalCode ?? fallback.otherResidencePostalCode;
  let otherResidenceCity =
    c.otherResidenceCity ?? fallback.otherResidenceCity;

  // Migration anciens payloads
  if (!hasNewResidence) {
    if (c.hasSplitResidence) {
      sleepsAtParent1 = true;
      sleepsAtParent2 = true;
    }
    if (c.residence?.trim()) {
      sleepsElsewhere = true;
      otherResidenceAddress = c.residence;
    }
  }

  return {
    ...fallback,
    ...c,
    radiationDate: c.radiationDate ?? "",
    sleepsAtParent1,
    sleepsAtParent2,
    sleepsElsewhere,
    otherResidenceAddress,
    otherResidencePostalCode,
    otherResidenceCity,
    medical: {
      ...fallback.medical,
      ...(c.medical ?? {}),
    },
    emergencyContacts: Array.isArray(c.emergencyContacts)
      ? c.emergencyContacts
      : fallback.emergencyContacts,
    authorizedPickups: Array.isArray(c.authorizedPickups)
      ? c.authorizedPickups
      : fallback.authorizedPickups,
  };
}

export function createEmptyFormPayload(
  contactEmail?: string
): EnrollmentFormPayload {
  const parent1 = createEmptyParent("pere");
  const parent2 = createEmptyParent("mere");
  if (contactEmail) parent1.email = contactEmail;
  return {
    version: 1,
    parents: [parent1, parent2],
    children: [],
    emergencyContacts: [
      { firstName: "", lastName: "", phoneNumber: "" },
      { firstName: "", lastName: "", phoneNumber: "" },
    ],
    authorizedPickups: [
      { firstName: "", lastName: "", phoneNumber: "" },
    ],
    consents: {
      authorizeOutings: false,
      authorizeLeaveAlone: false,
      acceptRegulations: false,
      authorizeImageRights: false,
      acceptAssociation: false,
      acceptCanteenRules: false,
      saquetasQuantity: 0,
    },
  };
}

/** Normalise un payload chargé (anciennes versions / champs manquants). */
export function normalizeFormPayload(
  raw: EnrollmentFormPayload | null | undefined,
  contactEmail?: string
): EnrollmentFormPayload {
  const base = createEmptyFormPayload(contactEmail);
  if (!raw || raw.version !== 1) return base;

  const mergeParent = (
    p: Partial<EnrollmentParentForm> | undefined,
    fallback: EnrollmentParentForm
  ): EnrollmentParentForm => ({
    ...fallback,
    ...p,
    availability: {
      ...fallback.availability,
      ...(p?.availability ?? {}),
    },
    commissionId: p?.commissionId ?? "",
    skills: p?.skills ?? "",
  });

  return {
    ...base,
    ...raw,
    parents: [
      mergeParent(raw.parents?.[0], base.parents[0]),
      mergeParent(raw.parents?.[1], base.parents[1]),
    ],
    children: Array.isArray(raw.children)
      ? raw.children.map((c, i) =>
          mergeChild(c, createEmptyChild(c?.localId || `legacy_${i}`))
        )
      : [],
    emergencyContacts:
      raw.emergencyContacts?.length
        ? raw.emergencyContacts
        : base.emergencyContacts,
    authorizedPickups:
      raw.authorizedPickups?.length
        ? raw.authorizedPickups
        : base.authorizedPickups,
    consents: { ...base.consents, ...(raw.consents ?? {}) },
  };
}

/** Nettoie la saisie NIR (chiffres + A/B Corse), max 15. */
export function sanitizeSocialSecurityInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^0-9AB]/g, "")
    .slice(0, SOCIAL_SECURITY_MAX_LENGTH);
}
