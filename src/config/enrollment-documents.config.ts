/**
 * Catalogue des pièces jointes du dossier d'inscription.
 */

export type EnrollmentDocumentCategoryKey =
  | "FAMILY_BOOK"
  | "SCHOOL_TRANSFER"
  | "MEDICAL_FITNESS"
  | "VACCINATION"
  | "INSURANCE"
  | "PHOTO"
  | "OTHER";

export interface EnrollmentDocumentCategoryMeta {
  key: EnrollmentDocumentCategoryKey;
  label: string;
  hint: string;
  /** Lié à un enfant (scopeRef) */
  perChild?: boolean;
  /** Bloque la soumission du dossier si absent */
  required?: boolean;
  /** Accès restreint (données de santé) */
  sensitive?: boolean;
}

export const ENROLLMENT_DOCUMENT_CATEGORIES: EnrollmentDocumentCategoryMeta[] =
  [
    {
      key: "FAMILY_BOOK",
      label: "Livret de famille",
      hint: "Photocopie (jugement si autorité parentale exclusive)",
      required: true,
    },
    {
      key: "SCHOOL_TRANSFER",
      label: "Certificat de radiation",
      hint: "Si l'enfant vient d'une autre école",
      perChild: true,
    },
    {
      key: "MEDICAL_FITNESS",
      label: "Aptitude vie en collectivité",
      hint: "Ordonnance / certificat médical (1ère rentrée)",
      perChild: true,
      sensitive: true,
    },
    {
      key: "VACCINATION",
      label: "Pages de vaccination",
      hint: "Photocopie du carnet de santé",
      perChild: true,
      required: true,
      sensitive: true,
    },
    {
      key: "INSURANCE",
      label: "Attestation d'assurance scolaire",
      hint: "Responsabilité civile + individuelle accident",
      perChild: true,
      required: true,
    },
    {
      key: "PHOTO",
      label: "Photo (trombinoscope)",
      hint: "Photo identité ou famille — nouvelles familles",
    },
    {
      key: "OTHER",
      label: "Autre document",
      hint: "Pièce complémentaire",
      perChild: true,
    },
  ];

export const SENSITIVE_DOCUMENT_CATEGORIES = new Set(
  ENROLLMENT_DOCUMENT_CATEGORIES.filter((c) => c.sensitive).map((c) => c.key)
);

export function isSensitiveDocumentCategory(key: string): boolean {
  return SENSITIVE_DOCUMENT_CATEGORIES.has(
    key as EnrollmentDocumentCategoryKey
  );
}

/** Catégories proposées dans la fiche enfant */
export const CHILD_DOCUMENT_CATEGORIES =
  ENROLLMENT_DOCUMENT_CATEGORIES.filter((c) => c.perChild);

export const ENROLLMENT_DOC_MAX_BYTES = 10 * 1024 * 1024; // 10 Mo

/** Formats acceptés : PDF + photos courantes */
export const ENROLLMENT_DOC_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const ENROLLMENT_DOC_ACCEPT_ATTR =
  ".pdf,image/jpeg,image/png,image/webp,image/jpg";

export function getDocumentCategoryMeta(
  key: string
): EnrollmentDocumentCategoryMeta | null {
  return (
    ENROLLMENT_DOCUMENT_CATEGORIES.find((c) => c.key === key) ?? null
  );
}

/** Libellé avec mention « obligatoire » pour l'UI parent */
export function documentCategoryHint(meta: EnrollmentDocumentCategoryMeta) {
  return meta.required ? `${meta.hint} — obligatoire` : meta.hint;
}
