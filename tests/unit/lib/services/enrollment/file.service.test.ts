import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import { createEmptyFormPayload } from "@/types/enrollment-form.type";
import { prismaMock, resetPrismaMock } from "@tests/mocks/prisma";

vi.mock("@/lib/prisma/prisma", async () => {
  const { prismaMock: mockedPrisma } = await import("@tests/mocks/prisma");
  return { prisma: mockedPrisma };
});

vi.mock("@/lib/services/crud/activity-log.service", () => ({
  activityLogService: {
    logActivity: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/nodemailer/enrollment-invitation.email", () => ({
  sendEnrollmentInvitationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/nodemailer/enrollment-status-change.email", () => ({
  sendEnrollmentStatusChangeEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/services/enrollment/document.service", () => ({
  enrollmentDocumentService: {
    listByFileToken: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/services/enrollment/signature.service", () => ({
  enrollmentSignatureService: {
    listByFileToken: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/enrollment/completeness", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/enrollment/completeness")>();
  return {
    ...actual,
    evaluateEnrollmentCompleteness: vi.fn((input) =>
      actual.evaluateEnrollmentCompleteness(input)
    ),
  };
});

const { sendEnrollmentStatusChangeEmail } = await import(
  "@/lib/nodemailer/enrollment-status-change.email"
);
const { evaluateEnrollmentCompleteness } = await import(
  "@/lib/enrollment/completeness"
);

describe("enrollmentFileService.getFileByToken", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("retourne null si le dossier est absent", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue(null);
    await expect(
      enrollmentFileService.getFileByToken("missing")
    ).resolves.toBeNull();
  });

  it("parse le formPayload JSON et normalise le résultat", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      email: "parent@example.com",
      formPayload: JSON.stringify({
        version: 1,
        parents: [{ role: "pere", firstName: "Jean" }],
        children: [],
        consents: { acceptRegulations: true },
      }),
      campaign: { id: "camp-1" },
      family: null,
      students: [],
    });

    const file = await enrollmentFileService.getFileByToken("tok-1");

    expect(file?.parsedFormPayload.parents[0].firstName).toBe("Jean");
    expect(file?.parsedFormPayload.consents.acceptRegulations).toBe(true);
    expect(file?.parsedFormPayload.parents[1].role).toBe("mere");
  });

  it("retombe sur un payload vide si le JSON est corrompu", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      email: "parent@example.com",
      formPayload: "{not-json",
      campaign: {},
      family: null,
      students: [],
    });

    const file = await enrollmentFileService.getFileByToken("tok-1");

    expect(file?.parsedFormPayload.parents[0].email).toBe(
      "parent@example.com"
    );
    expect(file?.parsedFormPayload.children).toEqual([]);
  });
});

describe("enrollmentFileService.savePublicFormByToken", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.mocked(sendEnrollmentStatusChangeEmail).mockClear();
  });

  it("refuse la modification d'un dossier déjà soumis", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      status: "SUBMITTED",
      email: "a@b.c",
      campaign: { name: "Rentrée" },
    });

    await expect(
      enrollmentFileService.savePublicFormByToken("tok-1", {
        formPayload: createEmptyFormPayload(),
      })
    ).rejects.toThrow(/ne peut plus être modifié/);
  });

  it("enregistre un brouillon via transaction sans email de soumission", async () => {
    const payload = createEmptyFormPayload("jean@example.com");
    payload.parents[0].firstName = "Jean";

    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      status: "DRAFT",
      email: "old@example.com",
      submittedAt: null,
      campaign: { name: "Rentrée" },
    });

    const updated = {
      id: "file-1",
      token: "tok-1",
      email: "jean@example.com",
      formPayload: JSON.stringify(payload),
      status: "DRAFT",
      campaign: { name: "Rentrée" },
      family: null,
      students: [],
    };

    prismaMock.enrollmentFile.update.mockResolvedValue(updated);

    const result = await enrollmentFileService.savePublicFormByToken("tok-1", {
      status: "DRAFT",
      formPayload: payload,
    });

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(result.parsedFormPayload.parents[0].firstName).toBe("Jean");
    expect(sendEnrollmentStatusChangeEmail).not.toHaveBeenCalled();
    expect(prismaMock.enrollmentHistory.create).not.toHaveBeenCalled();
  });

  it("soumet le dossier, historise et envoie l'email", async () => {
    const payload = createEmptyFormPayload("jean@example.com");

    vi.mocked(evaluateEnrollmentCompleteness).mockReturnValueOnce({
      docsOk: true,
      signaturesOk: true,
      missingDocs: [],
      missingSignatures: [],
      blockers: [],
    });

    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      status: "NEED_INFO",
      email: "jean@example.com",
      submittedAt: null,
      campaign: { name: "Rentrée 2026" },
    });

    const updated = {
      id: "file-1",
      token: "tok-1",
      email: "jean@example.com",
      formPayload: JSON.stringify(payload),
      status: "SUBMITTED",
      campaign: { name: "Rentrée 2026" },
      family: null,
      students: [],
    };

    prismaMock.enrollmentFile.update.mockResolvedValue(updated);
    prismaMock.enrollmentHistory.create.mockResolvedValue({});

    await enrollmentFileService.savePublicFormByToken("tok-1", {
      status: "SUBMITTED",
      formPayload: payload,
    });

    expect(prismaMock.enrollmentHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          newStatus: "SUBMITTED",
          oldStatus: "NEED_INFO",
        }),
      })
    );
    expect(sendEnrollmentStatusChangeEmail).toHaveBeenCalledWith(
      "jean@example.com",
      "tok-1",
      "Rentrée 2026",
      "SUBMITTED"
    );
  });
});
