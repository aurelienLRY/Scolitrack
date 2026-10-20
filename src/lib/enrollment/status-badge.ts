/**
 * Couleurs des badges de statut dossier d'inscription.
 * Soumis = vert · À compléter = orange · Refusé = rouge · Approuvé = vert · Brouillon = neutre
 */

export type EnrollmentStatusBadgeVariant =
  | "info"
  | "secondary"
  | "warning"
  | "success"
  | "destructive";

export const ENROLLMENT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumis",
  NEED_INFO: "A compléter",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
};

export const ENROLLMENT_STATUS_VARIANT: Record<
  string,
  EnrollmentStatusBadgeVariant
> = {
  DRAFT: "secondary",
  SUBMITTED: "success",
  NEED_INFO: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export function enrollmentStatusLabel(status: string): string {
  return ENROLLMENT_STATUS_LABEL[status] ?? status;
}

export function enrollmentStatusVariant(
  status: string
): EnrollmentStatusBadgeVariant {
  return ENROLLMENT_STATUS_VARIANT[status] ?? "info";
}
