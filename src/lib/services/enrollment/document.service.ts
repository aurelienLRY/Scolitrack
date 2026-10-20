import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma/prisma";
import type {
  EnrollmentDocumentCategory,
  EnrollmentDocumentUploader,
} from "@prisma/client";
import {
  ENROLLMENT_DOC_ALLOWED_MIME,
  ENROLLMENT_DOC_MAX_BYTES,
  getDocumentCategoryMeta,
} from "@/config/enrollment-documents.config";
import {
  ENROLLMENT_LOCAL_STORAGE_ROOT,
  getEnrollmentBlobStore,
} from "@/lib/storage/enrollment-blob-store";

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\-()+ ]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

export const enrollmentDocumentService = {
  /** @deprecated préférer getEnrollmentBlobStore — conservé pour compat tests */
  storageRoot: ENROLLMENT_LOCAL_STORAGE_ROOT,

  async listByFileToken(fileToken: string) {
    return prisma.enrollmentDocument.findMany({
      where: { fileToken },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileToken: true,
        accessToken: true,
        category: true,
        scopeRef: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        uploadedBy: true,
        createdAt: true,
      },
    });
  },

  async upload(input: {
    fileToken: string;
    category: EnrollmentDocumentCategory;
    scopeRef?: string;
    uploadedBy?: EnrollmentDocumentUploader;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
  }) {
    const meta = getDocumentCategoryMeta(input.category);
    if (!meta) {
      throw new Error("Catégorie de document inconnue");
    }

    if (!ENROLLMENT_DOC_ALLOWED_MIME.has(input.mimeType)) {
      throw new Error(
        "Type de fichier non accepté (PDF, JPEG, PNG, WEBP)"
      );
    }

    if (input.buffer.length > ENROLLMENT_DOC_MAX_BYTES) {
      throw new Error("Fichier trop volumineux (max 10 Mo)");
    }

    if (input.buffer.length === 0) {
      throw new Error("Fichier vide");
    }

    const file = await prisma.enrollmentFile.findUnique({
      where: { token: input.fileToken },
      select: { id: true, status: true, token: true },
    });

    if (!file) {
      throw new Error("Dossier d'inscription introuvable");
    }

    if (file.status !== "DRAFT" && file.status !== "NEED_INFO") {
      throw new Error("Ce dossier n'accepte plus de nouveaux documents");
    }

    const id = randomUUID().replace(/-/g, "").slice(0, 24);
    const safeName = sanitizeFilename(input.fileName || "document");
    const relativeDir = file.token;
    const relativePath = path
      .join(relativeDir, `${id}_${safeName}`)
      .replace(/\\/g, "/");

    const store = getEnrollmentBlobStore();
    await store.write(relativePath, input.buffer);

    try {
      return await prisma.enrollmentDocument.create({
        data: {
          id,
          enrollmentFileId: file.id,
          fileToken: file.token,
          category: input.category,
          scopeRef: (input.scopeRef ?? "").trim(),
          originalName: input.fileName.slice(0, 255),
          mimeType: input.mimeType,
          sizeBytes: input.buffer.length,
          storagePath: relativePath,
          uploadedBy: input.uploadedBy ?? "PARENT",
        },
        select: {
          id: true,
          fileToken: true,
          accessToken: true,
          category: true,
          scopeRef: true,
          originalName: true,
          mimeType: true,
          sizeBytes: true,
          uploadedBy: true,
          createdAt: true,
        },
      });
    } catch (e) {
      await store.delete(relativePath);
      throw e;
    }
  },

  async getByAccessToken(accessToken: string) {
    return prisma.enrollmentDocument.findUnique({
      where: { accessToken },
    });
  },

  async readFileBuffer(storagePath: string) {
    return getEnrollmentBlobStore().read(storagePath);
  },

  async deleteByAccessToken(accessToken: string, fileToken: string) {
    const doc = await prisma.enrollmentDocument.findUnique({
      where: { accessToken },
      include: {
        enrollmentFile: { select: { status: true, token: true } },
      },
    });

    if (!doc || doc.fileToken !== fileToken) {
      throw new Error("Document introuvable");
    }

    if (
      doc.enrollmentFile.status !== "DRAFT" &&
      doc.enrollmentFile.status !== "NEED_INFO"
    ) {
      throw new Error("Ce document ne peut plus être supprimé");
    }

    await prisma.enrollmentDocument.delete({ where: { id: doc.id } });
    await getEnrollmentBlobStore().delete(doc.storagePath);

    return { id: doc.id };
  },
};
