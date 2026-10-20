import {
  ENROLLMENT_SOFT_DELETE_RETENTION_DAYS,
  enrollmentSoftDeletePurgeAt,
} from "@/lib/enrollment/soft-delete";

describe("enrollment soft-delete", () => {
  it("fixe la rétention à 30 jours", () => {
    expect(ENROLLMENT_SOFT_DELETE_RETENTION_DAYS).toBe(30);
  });

  it("calcule la date de purge depuis un Date", () => {
    const deletedAt = new Date("2026-04-01T12:00:00.000Z");
    const purgeAt = enrollmentSoftDeletePurgeAt(deletedAt);

    expect(purgeAt.toISOString()).toBe(
      new Date(
        deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000
      ).toISOString()
    );
  });

  it("accepte une date ISO string", () => {
    const purgeAt = enrollmentSoftDeletePurgeAt("2026-01-01T00:00:00.000Z");
    expect(purgeAt.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});
