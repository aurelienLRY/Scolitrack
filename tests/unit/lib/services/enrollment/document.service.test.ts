import { promises as fs } from "fs";
import { enrollmentDocumentService } from "@/lib/services/enrollment/document.service";
import { prismaMock, resetPrismaMock } from "@tests/mocks/prisma";
import { resetEnrollmentBlobStore } from "@/lib/storage/enrollment-blob-store";

vi.mock("@/lib/prisma/prisma", async () => {
  const { prismaMock: mockedPrisma } = await import("@tests/mocks/prisma");
  return { prisma: mockedPrisma };
});

vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("crypto")>();
  return {
    ...actual,
    randomUUID: vi.fn(() => "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
  };
});

describe("enrollmentDocumentService", () => {
  beforeEach(() => {
    resetPrismaMock();
    resetEnrollmentBlobStore();
    delete process.env.ENROLLMENT_STORAGE;
    vi.spyOn(fs, "mkdir").mockResolvedValue(undefined as never);
    vi.spyOn(fs, "writeFile").mockResolvedValue(undefined as never);
    vi.spyOn(fs, "unlink").mockResolvedValue(undefined as never);
    vi.spyOn(fs, "readFile").mockResolvedValue(Buffer.from("pdf"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("liste les documents d'un token", async () => {
    prismaMock.enrollmentDocument.findMany.mockResolvedValue([{ id: "d1" }]);

    const rows = await enrollmentDocumentService.listByFileToken("tok-1");

    expect(prismaMock.enrollmentDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { fileToken: "tok-1" },
        orderBy: { createdAt: "desc" },
      })
    );
    expect(rows).toEqual([{ id: "d1" }]);
  });

  it("refuse une catégorie, un MIME ou un fichier trop lourd", async () => {
    await expect(
      enrollmentDocumentService.upload({
        fileToken: "tok-1",
        category: "UNKNOWN" as never,
        fileName: "a.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("x"),
      })
    ).rejects.toThrow(/Catégorie/);

    await expect(
      enrollmentDocumentService.upload({
        fileToken: "tok-1",
        category: "PHOTO",
        fileName: "a.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("x"),
      })
    ).rejects.toThrow(/Type de fichier/);

    await expect(
      enrollmentDocumentService.upload({
        fileToken: "tok-1",
        category: "PHOTO",
        fileName: "a.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.alloc(11 * 1024 * 1024),
      })
    ).rejects.toThrow(/trop volumineux/);
  });

  it("refuse l'upload sur un dossier non modifiable", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      status: "APPROVED",
      token: "tok-1",
    });

    await expect(
      enrollmentDocumentService.upload({
        fileToken: "tok-1",
        category: "FAMILY_BOOK",
        fileName: "livret.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF"),
      })
    ).rejects.toThrow(/n'accepte plus/);
  });

  it("écrit le fichier puis crée l'enregistrement Prisma", async () => {
    prismaMock.enrollmentFile.findUnique.mockResolvedValue({
      id: "file-1",
      status: "DRAFT",
      token: "tok-1",
    });
    prismaMock.enrollmentDocument.create.mockResolvedValue({
      id: "aaaaaaaaaaaaaaaaaaaaaaaa",
      category: "FAMILY_BOOK",
    });

    await enrollmentDocumentService.upload({
      fileToken: "tok-1",
      category: "FAMILY_BOOK",
      fileName: "Livret famille.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4"),
      scopeRef: "  ",
    });

    expect(fs.mkdir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
    expect(prismaMock.enrollmentDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          enrollmentFileId: "file-1",
          fileToken: "tok-1",
          category: "FAMILY_BOOK",
          scopeRef: "",
          mimeType: "application/pdf",
          uploadedBy: "PARENT",
          originalName: "Livret famille.pdf",
        }),
      })
    );
  });

  it("supprime un document DRAFT et nettoie le disque", async () => {
    prismaMock.enrollmentDocument.findUnique.mockResolvedValue({
      id: "doc-1",
      fileToken: "tok-1",
      storagePath: "tok-1/doc.pdf",
      enrollmentFile: { status: "NEED_INFO", token: "tok-1" },
    });
    prismaMock.enrollmentDocument.delete.mockResolvedValue({ id: "doc-1" });

    await expect(
      enrollmentDocumentService.deleteByAccessToken("access-1", "tok-1")
    ).resolves.toEqual({ id: "doc-1" });

    expect(prismaMock.enrollmentDocument.delete).toHaveBeenCalledWith({
      where: { id: "doc-1" },
    });
    expect(fs.unlink).toHaveBeenCalled();
  });

  it("refuse la suppression si le token dossier ne correspond pas", async () => {
    prismaMock.enrollmentDocument.findUnique.mockResolvedValue({
      id: "doc-1",
      fileToken: "autre",
      storagePath: "autre/doc.pdf",
      enrollmentFile: { status: "DRAFT", token: "autre" },
    });

    await expect(
      enrollmentDocumentService.deleteByAccessToken("access-1", "tok-1")
    ).rejects.toThrow("Document introuvable");
  });
});
