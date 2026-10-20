import type { EnrollmentFormPayload } from "@/types/enrollment-form.type";
import {
  createEmptyFormPayload,
  normalizeFormPayload,
} from "@/types/enrollment-form.type";

function parseFormPayload(
  raw: string | null | undefined,
  fallbackEmail?: string
): EnrollmentFormPayload {
  if (!raw) return createEmptyFormPayload(fallbackEmail);
  try {
    const parsed = JSON.parse(raw) as EnrollmentFormPayload;
    return normalizeFormPayload(parsed, fallbackEmail);
  } catch {
    return createEmptyFormPayload(fallbackEmail);
  }
}

type StudentLink = {
  student?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

/**
 * Noms des enfants à afficher pour un dossier.
 * Priorité : liens EnrollmentStudent (après hydratation),
 * sinon enfants du formPayload (brouillon / soumis non approuvé).
 */
export function enrollmentChildLabels(file: {
  email?: string;
  students?: StudentLink[] | null;
  formPayload?: string | null;
  parsedFormPayload?: EnrollmentFormPayload | null;
}): string[] {
  const fromLinks = (file.students ?? [])
    .map((link) => {
      const s = link.student;
      if (!s) return "";
      return `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
    })
    .filter(Boolean);

  if (fromLinks.length > 0) return fromLinks;

  const payload =
    file.parsedFormPayload ??
    parseFormPayload(file.formPayload, file.email);

  return (payload.children ?? [])
    .map((c) => `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim())
    .filter(Boolean);
}
