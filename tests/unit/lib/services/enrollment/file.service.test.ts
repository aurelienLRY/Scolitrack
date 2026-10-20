import { enrollmentFileService } from "@/lib/services/enrollment/file.service";
import { activityLogService } from "@/lib/services/crud/activity-log.service";
import { ENROLLMENT_SOFT_DELETE_RETENTION_DAYS } from "@/lib/enrollment/soft-delete";
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
const { sendEnrollmentInvitationEmail } = await import(
  "@/lib/nodemailer/enrollment-invitation.email"
);
const { evaluateEnrollmentCompleteness } = await import(
  "@/lib/enrollment/completeness"
);

describe("enrollmentFileService.getAllFiles", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("filtre uniquement la corbeille quand onlyDeleted=true", async () => {
    prismaMock.enrollmentFile.findMany.mockResolvedValue([]);

    await enrollmentFileService.getAllFiles({
      campaignId: "camp-1",
      onlyDeleted: true,
    });

    expect(prismaMock.enrollmentFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          campaignId: "camp-1",
          deletedAt: { not: null },
        },
      })
    );
  });

  it("filtre les dossiers actifs quand onlyDeleted=false", async () => {
    prismaMock.enrollmentFile.findMany.mockResolvedValue([]);

    await enrollmentFileService.getAllFiles({ onlyDeleted: false });

    expect(prismaMock.enrollmentFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
      })
    );
  });
});

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

  it("retourne null si le dossier est en corbeille", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      deletedAt: new Date(),
      email: "parent@example.com",
      formPayload: null,
      campaign: {},
      family: null,
      students: [],
    });

    await expect(
      enrollmentFileService.getFileByToken("tok-1")
    ).resolves.toBeNull();
  });

  it("parse le formPayload JSON et normalise le résultat", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      email: "parent@example.com",
      deletedAt: null,
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
      deletedAt: null,
      email: "a@b.c",
      campaign: { name: "Rentrée" },
    });

    await expect(
      enrollmentFileService.savePublicFormByToken("tok-1", {
        formPayload: createEmptyFormPayload(),
      })
    ).rejects.toThrow(/ne peut plus être modifié/);
  });

  it("refuse la modification d'un dossier en corbeille", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      token: "tok-1",
      status: "DRAFT",
      deletedAt: new Date(),
      email: "a@b.c",
      campaign: { name: "Rentrée" },
    });

    await expect(
      enrollmentFileService.savePublicFormByToken("tok-1", {
        formPayload: createEmptyFormPayload(),
      })
    ).rejects.toThrow(/token invalide/);
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

describe("enrollmentFileService soft-delete / restore / purge", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.mocked(activityLogService.logActivity).mockClear();
    vi.mocked(sendEnrollmentInvitationEmail).mockClear();
  });

  it("met un dossier en corbeille (soft-delete)", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      deletedAt: null,
      email: "a@b.c",
      formPayload: null,
    });
    prismaMock.enrollmentFile.update.mockResolvedValue({
      id: "file-1",
      deletedAt: new Date("2026-04-20"),
      email: "a@b.c",
      formPayload: null,
      campaign: {},
      family: null,
      students: [],
    });

    await enrollmentFileService.deleteFile("file-1", "user-1");

    expect(prismaMock.enrollmentFile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "file-1" },
        data: { deletedAt: expect.any(Date) },
      })
    );
    expect(activityLogService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SOFT_DELETE_ENROLLMENT_FILE",
      })
    );
  });

  it("refuse un second soft-delete", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      deletedAt: new Date(),
    });

    await expect(
      enrollmentFileService.deleteFile("file-1", "user-1")
    ).rejects.toThrow(/déjà dans la corbeille/);
  });

  it("restaure un dossier depuis la corbeille", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      deletedAt: new Date(),
      email: "a@b.c",
      formPayload: null,
    });
    prismaMock.enrollmentFile.update.mockResolvedValue({
      id: "file-1",
      deletedAt: null,
      email: "a@b.c",
      formPayload: null,
      campaign: {},
      family: null,
      students: [],
    });

    await enrollmentFileService.restoreFile("file-1", "user-1");

    expect(prismaMock.enrollmentFile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { deletedAt: null },
      })
    );
    expect(activityLogService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "RESTORE_ENROLLMENT_FILE",
      })
    );
  });

  it("refuse de restaurer un dossier actif", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      deletedAt: null,
    });

    await expect(
      enrollmentFileService.restoreFile("file-1", "user-1")
    ).rejects.toThrow(/n'est pas dans la corbeille/);
  });

  it("ne purge rien s'il n'y a pas de dossiers éligibles", async () => {
    prismaMock.enrollmentFile.findMany.mockResolvedValue([]);

    await expect(
      enrollmentFileService.purgeSoftDeletedFiles(30)
    ).resolves.toEqual({ purged: 0, ids: [] });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("purge définitivement les dossiers trop anciens", async () => {
    prismaMock.enrollmentFile.findMany.mockResolvedValue([
      { id: "old-1", email: "a@b.c", deletedAt: new Date("2026-01-01") },
      { id: "old-2", email: "c@d.e", deletedAt: new Date("2026-01-02") },
    ]);
    prismaMock.enrollmentFile.deleteMany.mockResolvedValue({ count: 2 });

    await expect(
      enrollmentFileService.purgeSoftDeletedFiles(30)
    ).resolves.toEqual({ purged: 2, ids: ["old-1", "old-2"] });

    expect(prismaMock.enrollmentFile.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: { not: null, lte: expect.any(Date) },
        },
      })
    );
    expect(prismaMock.enrollmentFile.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["old-1", "old-2"] } },
    });
  });

  it("bloque le renvoi d'invitation pour un dossier en corbeille", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      deletedAt: new Date(),
      email: "a@b.c",
      token: "tok-1",
      campaign: { name: "Rentrée" },
    });

    await expect(
      enrollmentFileService.resendInvitation("file-1", "user-1")
    ).rejects.toThrow(/corbeille/);
    expect(sendEnrollmentInvitationEmail).not.toHaveBeenCalled();
  });
});
