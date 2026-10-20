import { describe, expect, it, beforeEach } from "vitest";
import {
  LocalEnrollmentBlobStore,
  getEnrollmentBlobStore,
  resetEnrollmentBlobStore,
} from "@/lib/storage/enrollment-blob-store";

describe("enrollment-blob-store", () => {
  beforeEach(() => {
    resetEnrollmentBlobStore();
    delete process.env.ENROLLMENT_STORAGE;
  });

  it("utilise le store local par défaut", () => {
    const store = getEnrollmentBlobStore();
    expect(store).toBeInstanceOf(LocalEnrollmentBlobStore);
  });

  it("refuse un chemin hors racine", async () => {
    const store = new LocalEnrollmentBlobStore();
    await expect(store.read("../etc/passwd")).rejects.toThrow(/invalide/);
  });

  it("exige la config S3 si ENROLLMENT_STORAGE=s3", () => {
    process.env.ENROLLMENT_STORAGE = "s3";
    resetEnrollmentBlobStore();
    expect(() => getEnrollmentBlobStore()).toThrow(/S3/);
  });
});
