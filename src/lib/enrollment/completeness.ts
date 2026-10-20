/**
 * Règles de complétude d'un dossier d'inscription
 * (documents + signatures obligatoires avant soumission).
 */

import {
  ENROLLMENT_DOCUMENT_CATEGORIES,
  type EnrollmentDocumentCategoryKey,
} from "@/config/enrollment-documents.config";
import {
  CHILD_SIGNATURE_ORDER,
  GUARDIAN_SIGNATURE_ORDER,
  type EnrollmentSignatureSubjectKey,
} from "@/config/enrollment-signatures.config";
import type { EnrollmentFormPayload } from "@/types/enrollment-form.type";

export type DocLike = {
  category: string;
  scopeRef?: string | null;
};

export type SigLike = {
  subjectKey: string;
  scopeRef?: string | null;
  email?: string | null;
  status: string;
};

export type RequiredDocSlot = {
  category: EnrollmentDocumentCategoryKey;
  scopeRef: string;
  label: string;
  childName?: string;
};

export type RequiredSigSlot = {
  subjectKey: EnrollmentSignatureSubjectKey;
  scopeRef: string;
  email: string;
  label: string;
};

/** Signatures enfant optionnelles (autorisation, pas obligation). */
export const OPTIONAL_CHILD_SIGNATURES = new Set<EnrollmentSignatureSubjectKey>([
  "FICHE3_QUITTER_SEUL",
]);

function parentStarted(p: EnrollmentFormPayload["parents"][0]) {
  return Boolean(
    p.firstName?.trim() ||
      p.lastName?.trim() ||
      (p.email && p.email.includes("@")) ||
      p.phoneMobile?.trim() ||
      p.address?.trim() ||
      p.commissionId
  );
}

function guardianEmails(form: EnrollmentFormPayload): string[] {
  const emails: string[] = [];
  const p1 = form.parents[0]?.email?.trim().toLowerCase();
  if (p1?.includes("@")) emails.push(p1);
  if (parentStarted(form.parents[1])) {
    const p2 = form.parents[1]?.email?.trim().toLowerCase();
    if (p2?.includes("@") && !emails.includes(p2)) emails.push(p2);
  }
  return emails;
}

/** Documents marqués required dans le catalogue. */
export function getRequiredDocumentSlots(
  form: EnrollmentFormPayload
): RequiredDocSlot[] {
  const slots: RequiredDocSlot[] = [];

  for (const cat of ENROLLMENT_DOCUMENT_CATEGORIES) {
    if (!cat.required) continue;
    if (cat.perChild) {
      for (const child of form.children) {
        const name = `${child.firstName} ${child.lastName}`.trim();
        slots.push({
          category: cat.key,
          scopeRef: child.localId,
          label: name ? `${cat.label} (${name})` : `${cat.label} (enfant)`,
          childName: name || undefined,
        });
      }
    } else {
      slots.push({
        category: cat.key,
        scopeRef: "",
        label: cat.label,
      });
    }
  }

  return slots;
}

export function getRequiredSignatureSlots(
  form: EnrollmentFormPayload
): RequiredSigSlot[] {
  const slots: RequiredSigSlot[] = [];
  const emails = guardianEmails(form);

  for (const email of emails) {
    for (const key of GUARDIAN_SIGNATURE_ORDER) {
      slots.push({
        subjectKey: key,
        scopeRef: "",
        email,
        label: `${key} · ${email}`,
      });
    }
  }

  const requiredChildKeys = CHILD_SIGNATURE_ORDER.filter(
    (k) => !OPTIONAL_CHILD_SIGNATURES.has(k)
  );

  for (const child of form.children) {
    const name = `${child.firstName} ${child.lastName}`.trim() || "enfant";
    for (const email of emails) {
      for (const key of requiredChildKeys) {
        slots.push({
          subjectKey: key,
          scopeRef: child.localId,
          email,
          label: `${key} · ${name} · ${email}`,
        });
      }
    }
  }

  return slots;
}

function docMatches(doc: DocLike, slot: RequiredDocSlot) {
  return (
    doc.category === slot.category &&
    (doc.scopeRef ?? "").trim() === slot.scopeRef
  );
}

function sigMatches(sig: SigLike, slot: RequiredSigSlot) {
  if (sig.status !== "SIGNED") return false;
  if (sig.subjectKey !== slot.subjectKey) return false;
  if ((sig.scopeRef ?? "").trim() !== slot.scopeRef) return false;
  if (slot.email && sig.email) {
    return sig.email.trim().toLowerCase() === slot.email;
  }
  return true;
}

export type CompletenessResult = {
  docsOk: boolean;
  signaturesOk: boolean;
  missingDocs: RequiredDocSlot[];
  missingSignatures: RequiredSigSlot[];
  blockers: string[];
};

export function evaluateEnrollmentCompleteness(input: {
  form: EnrollmentFormPayload;
  documents?: DocLike[] | null;
  signatures?: SigLike[] | null;
}): CompletenessResult {
  const documents = input.documents ?? [];
  const signatures = input.signatures ?? [];
  const requiredDocs = getRequiredDocumentSlots(input.form);
  const requiredSigs = getRequiredSignatureSlots(input.form);

  const missingDocs = requiredDocs.filter(
    (slot) => !documents.some((d) => docMatches(d, slot))
  );
  const missingSignatures = requiredSigs.filter(
    (slot) => !signatures.some((s) => sigMatches(s, slot))
  );

  const blockers: string[] = [];
  if (missingDocs.length) {
    blockers.push(
      `documents manquants : ${missingDocs
        .slice(0, 3)
        .map((d) => d.label)
        .join(", ")}${missingDocs.length > 3 ? "…" : ""}`
    );
  }
  if (missingSignatures.length) {
    blockers.push(
      `${missingSignatures.length} signature(s) manquante(s)`
    );
  }

  return {
    docsOk: missingDocs.length === 0,
    signaturesOk: missingSignatures.length === 0,
    missingDocs,
    missingSignatures,
    blockers,
  };
}
