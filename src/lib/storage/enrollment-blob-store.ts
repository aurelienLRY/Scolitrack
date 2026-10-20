/**
 * Abstraction stockage des pièces d'inscription.
 * ENROLLMENT_STORAGE=local (défaut) | s3
 * Pour MinIO / S3 : ENROLLMENT_S3_BUCKET, ENROLLMENT_S3_ENDPOINT,
 * ENROLLMENT_S3_REGION, ENROLLMENT_S3_ACCESS_KEY, ENROLLMENT_S3_SECRET_KEY
 */

import { promises as fs } from "fs";
import path from "path";

export interface EnrollmentBlobStore {
  write(relativePath: string, buffer: Buffer): Promise<void>;
  read(relativePath: string): Promise<Buffer>;
  delete(relativePath: string): Promise<void>;
}

const LOCAL_ROOT = path.join(process.cwd(), "storage", "enrollment-documents");

function assertSafeRelative(relativePath: string, root: string) {
  const full = path.join(root, relativePath);
  const resolved = path.resolve(full);
  if (!resolved.startsWith(path.resolve(root))) {
    throw new Error("Chemin de fichier invalide");
  }
  return resolved;
}

export class LocalEnrollmentBlobStore implements EnrollmentBlobStore {
  constructor(private readonly root = LOCAL_ROOT) {}

  async write(relativePath: string, buffer: Buffer) {
    const abs = assertSafeRelative(relativePath, this.root);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, buffer);
  }

  async read(relativePath: string) {
    return fs.readFile(assertSafeRelative(relativePath, this.root));
  }

  async delete(relativePath: string) {
    await fs
      .unlink(assertSafeRelative(relativePath, this.root))
      .catch(() => undefined);
  }
}

/**
 * Client S3/MinIO minimal via fetch + Signature… non implémenté ici :
 * on expose l'interface et un adaptateur prêt à brancher un SDK
 * (@aws-sdk/client-s3) sans casser le mode local.
 */
export class S3EnrollmentBlobStore implements EnrollmentBlobStore {
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly prefix: string;

  constructor() {
    this.bucket = process.env.ENROLLMENT_S3_BUCKET ?? "";
    this.endpoint = (
      process.env.ENROLLMENT_S3_ENDPOINT ?? ""
    ).replace(/\/$/, "");
    this.prefix = (process.env.ENROLLMENT_S3_PREFIX ?? "enrollment-documents")
      .replace(/^\/|\/$/g, "");
    if (!this.bucket || !this.endpoint) {
      throw new Error(
        "Stockage S3 mal configuré (ENROLLMENT_S3_BUCKET / ENROLLMENT_S3_ENDPOINT)"
      );
    }
    if (
      !process.env.ENROLLMENT_S3_ACCESS_KEY ||
      !process.env.ENROLLMENT_S3_SECRET_KEY
    ) {
      throw new Error(
        "Stockage S3 : ENROLLMENT_S3_ACCESS_KEY / ENROLLMENT_S3_SECRET_KEY requis"
      );
    }
  }

  private objectKey(relativePath: string) {
    const clean = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${this.prefix}/${clean}`;
  }

  /**
   * Placeholder : brancher @aws-sdk/client-s3 (PutObject/GetObject/DeleteObject).
   * En attendant, on refuse explicitement pour éviter une fausse production.
   */
  async write(_relativePath: string, _buffer: Buffer): Promise<void> {
    throw new Error(
      "ENROLLMENT_STORAGE=s3 : installez et branchez @aws-sdk/client-s3 dans S3EnrollmentBlobStore"
    );
  }

  async read(_relativePath: string): Promise<Buffer> {
    throw new Error(
      "ENROLLMENT_STORAGE=s3 : installez et branchez @aws-sdk/client-s3 dans S3EnrollmentBlobStore"
    );
  }

  async delete(_relativePath: string): Promise<void> {
    throw new Error(
      "ENROLLMENT_STORAGE=s3 : installez et branchez @aws-sdk/client-s3 dans S3EnrollmentBlobStore"
    );
  }
}

let cached: EnrollmentBlobStore | null = null;

export function getEnrollmentBlobStore(): EnrollmentBlobStore {
  if (cached) return cached;
  const mode = (process.env.ENROLLMENT_STORAGE ?? "local").toLowerCase();
  cached =
    mode === "s3" ? new S3EnrollmentBlobStore() : new LocalEnrollmentBlobStore();
  return cached;
}

/** Tests / hot-reload */
export function resetEnrollmentBlobStore() {
  cached = null;
}

export { LOCAL_ROOT as ENROLLMENT_LOCAL_STORAGE_ROOT };
