import {
  enrollmentSignatureService,
  hashEnrollmentEmail,
} from "@/lib/services/enrollment/signature.service";
import { prismaMock, resetPrismaMock } from "@tests/mocks/prisma";

vi.mock("@/lib/prisma/prisma", async () => {
  const { prismaMock: mockedPrisma } = await import("@tests/mocks/prisma");
  return { prisma: mockedPrisma };
});

vi.mock("@/lib/nodemailer/enrollment-signature.email", () => ({
  sendEnrollmentSignatureEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/nodemailer/enrollment-signature-batch.email", () => ({
  sendEnrollmentSignatureBatchEmail: vi.fn().mockResolvedValue(undefined),
}));

const { sendEnrollmentSignatureEmail } = await import(
  "@/lib/nodemailer/enrollment-signature.email"
);

const file = {
  id: "file-1",
  token: "tok-1",
  campaignId: "camp-1",
  status: "DRAFT" as const,
  campaign: { id: "camp-1", name: "Rentrée 2026", startDate: new Date() },
};

describe("hashEnrollmentEmail", () => {
  it("normalise la casse et les espaces avant le hash", () => {
    expect(hashEnrollmentEmail(" Ada@Example.com ")).toBe(
      hashEnrollmentEmail("ada@example.com")
    );
    expect(hashEnrollmentEmail("a@b.c")).not.toBe(
      hashEnrollmentEmail("c@b.a")
    );
  });
});

describe("enrollmentSignatureService.requestSignature", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.mocked(sendEnrollmentSignatureEmail).mockClear();
  });

  it("refuse un sujet ou un email invalide", async () => {
    await expect(
      enrollmentSignatureService.requestSignature({
        fileToken: "tok-1",
        email: "ada@example.com",
        subjectKey: "INCONNU" as never,
      })
    ).rejects.toThrow("Sujet de signature inconnu");

    await expect(
      enrollmentSignatureService.requestSignature({
        fileToken: "tok-1",
        email: "pas-un-email",
        subjectKey: "FICHE1_HORAIRES",
      })
    ).rejects.toThrow("Email invalide");
  });

  it("refuse un dossier clos", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      ...file,
      status: "SUBMITTED",
    });

    await expect(
      enrollmentSignatureService.requestSignature({
        fileToken: "tok-1",
        email: "ada@example.com",
        subjectKey: "FICHE1_HORAIRES",
      })
    ).rejects.toThrow(/ne peut plus recevoir/);
  });

  it("retourne alreadySigned si la signature existe déjà", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue(file);
    prismaMock.enrollmentSignature.findUnique.mockResolvedValue({
      id: "sig-1",
      status: "SIGNED",
    });

    const result = await enrollmentSignatureService.requestSignature({
      fileToken: "tok-1",
      email: "ada@example.com",
      subjectKey: "FICHE1_HORAIRES",
    });

    expect(result.alreadySigned).toBe(true);
    expect(sendEnrollmentSignatureEmail).not.toHaveBeenCalled();
  });

  it("crée une signature, personnalise le libellé enfant et envoie l'email", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue(file);
    prismaMock.enrollmentSignature.findUnique.mockResolvedValue(null);
    prismaMock.enrollmentSignature.create.mockResolvedValue({
      id: "sig-new",
      status: "PENDING",
    });

    await enrollmentSignatureService.requestSignature({
      fileToken: "tok-1",
      email: " Ada@Example.com ",
      subjectKey: "FICHE3_SORTIES",
      scopeRef: "child-1",
      childName: "Léa Dupont",
    });

    expect(prismaMock.enrollmentSignature.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "ada@example.com",
          subjectKey: "FICHE3_SORTIES",
          scopeRef: "child-1",
          subjectLabel: "Sorties & classes de découverte — Léa Dupont",
          status: "PENDING",
        }),
      })
    );
    expect(sendEnrollmentSignatureEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "ada@example.com",
        campaignName: "Rentrée 2026",
        subjectLabel: "Sorties & classes de découverte — Léa Dupont",
        acceptanceText: expect.stringContaining("Léa Dupont"),
      })
    );
  });

  it("remet en PENDING une signature existante non signée", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue(file);
    prismaMock.enrollmentSignature.findUnique.mockResolvedValue({
      id: "sig-old",
      status: "EXPIRED",
    });
    prismaMock.enrollmentSignature.update.mockResolvedValue({
      id: "sig-old",
      status: "PENDING",
    });

    const result = await enrollmentSignatureService.requestSignature({
      fileToken: "tok-1",
      email: "ada@example.com",
      subjectKey: "FICHE9_REGLEMENTS",
    });

    expect(result.alreadySigned).toBe(false);
    expect(prismaMock.enrollmentSignature.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sig-old" },
        data: expect.objectContaining({ status: "PENDING", confirmedAt: null }),
      })
    );
  });
});

describe("enrollmentSignatureService.getByConfirmToken / confirmSignature", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("marque EXPIRED un lien PENDING dépassé", async () => {
    prismaMock.enrollmentSignature.findUnique.mockResolvedValue({
      id: "sig-1",
      status: "PENDING",
      linkExpiresAt: new Date(Date.now() - 1000),
      campaign: { id: "camp-1", name: "Rentrée" },
    });
    prismaMock.enrollmentSignature.update.mockResolvedValue({
      id: "sig-1",
      status: "EXPIRED",
    });

    const result = await enrollmentSignatureService.getByConfirmToken("token");

    expect(result?.status).toBe("EXPIRED");
    expect(prismaMock.enrollmentSignature.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "EXPIRED" },
      })
    );
  });

  it("refuse la confirmation sans acceptation ou lien expiré", async () => {
    await expect(
      enrollmentSignatureService.confirmSignature({
        confirmToken: "t",
        accepted: false,
      })
    ).rejects.toThrow(/accepter/);

    prismaMock.enrollmentSignature.findUnique.mockResolvedValue({
      id: "sig-1",
      status: "EXPIRED",
      linkExpiresAt: new Date(Date.now() - 1000),
      campaign: { id: "camp-1", name: "Rentrée" },
    });
    prismaMock.enrollmentSignature.update.mockResolvedValue({
      id: "sig-1",
      status: "EXPIRED",
    });

    await expect(
      enrollmentSignatureService.confirmSignature({
        confirmToken: "t",
        accepted: true,
      })
    ).rejects.toThrow(/expiré/);
  });

  it("confirme une signature PENDING", async () => {
    prismaMock.enrollmentSignature.findUnique.mockResolvedValue({
      id: "sig-1",
      status: "PENDING",
      linkExpiresAt: new Date(Date.now() + 60_000),
      campaign: { id: "camp-1", name: "Rentrée" },
    });
    prismaMock.enrollmentSignature.update.mockResolvedValue({
      id: "sig-1",
      status: "SIGNED",
    });

    await enrollmentSignatureService.confirmSignature({
      confirmToken: "confirm-1",
      accepted: true,
      ip: "127.0.0.1",
      userAgent: "vitest",
    });

    expect(prismaMock.enrollmentSignature.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sig-1" },
        data: expect.objectContaining({
          status: "SIGNED",
          signerIp: "127.0.0.1",
          userAgent: "vitest",
        }),
      })
    );
  });
});
