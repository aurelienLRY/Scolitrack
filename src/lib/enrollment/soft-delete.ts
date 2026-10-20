/** Délai de rétention en corbeille avant purge définitive (jours). */
export const ENROLLMENT_SOFT_DELETE_RETENTION_DAYS = 30;

/** Date de purge estimée à partir de deletedAt. */
export function enrollmentSoftDeletePurgeAt(deletedAt: Date | string): Date {
  const base =
    deletedAt instanceof Date ? deletedAt : new Date(deletedAt);
  return new Date(
    base.getTime() +
      ENROLLMENT_SOFT_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000
  );
}
