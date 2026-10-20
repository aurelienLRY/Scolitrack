import { useEnrollmentStats } from "@/hooks/query/useEnrollment";
import type { EnrollmentFileWithDetails } from "@/types/enrollment.type";

function file(
  overrides: Partial<EnrollmentFileWithDetails> & {
    id: string;
    status: EnrollmentFileWithDetails["status"];
  }
): EnrollmentFileWithDetails {
  return {
    email: "a@b.c",
    token: overrides.id,
    campaignId: "camp-1",
    deletedAt: null,
    ...overrides,
  } as EnrollmentFileWithDetails;
}

describe("useEnrollmentStats", () => {
  it("ignore les dossiers en corbeille dans les totaux", () => {
    const stats = useEnrollmentStats([
      file({ id: "1", status: "DRAFT" }),
      file({ id: "2", status: "SUBMITTED" }),
      file({ id: "3", status: "APPROVED" }),
      file({ id: "4", status: "REJECTED" }),
      file({ id: "5", status: "NEED_INFO" }),
      file({
        id: "6",
        status: "SUBMITTED",
        deletedAt: new Date("2026-04-01"),
      }),
    ]);

    expect(stats).toEqual({
      totalFiles: 5,
      submittedFiles: 1,
      approvedFiles: 1,
      rejectedFiles: 1,
      pendingFiles: 2,
      draftFiles: 1,
      needInfoFiles: 1,
    });
  });

  it("retourne des zéros pour une liste vide", () => {
    expect(useEnrollmentStats([])).toEqual({
      totalFiles: 0,
      submittedFiles: 0,
      approvedFiles: 0,
      rejectedFiles: 0,
      pendingFiles: 0,
      draftFiles: 0,
      needInfoFiles: 0,
    });
  });
});
