import {
  CHILD_DOCUMENT_CATEGORIES,
  ENROLLMENT_DOC_ALLOWED_MIME,
  ENROLLMENT_DOC_MAX_BYTES,
  ENROLLMENT_DOCUMENT_CATEGORIES,
  getDocumentCategoryMeta,
} from "@/config/enrollment-documents.config";

describe("enrollment-documents.config", () => {
  it("catalogue au moins les catégories famille, photo et pièces enfant", () => {
    const keys = ENROLLMENT_DOCUMENT_CATEGORIES.map((c) => c.key);

    expect(keys).toEqual(
      expect.arrayContaining([
        "FAMILY_BOOK",
        "PHOTO",
        "SCHOOL_TRANSFER",
        "VACCINATION",
        "OTHER",
      ])
    );
  });

  it("filtre les catégories par enfant", () => {
    expect(CHILD_DOCUMENT_CATEGORIES.every((c) => c.perChild)).toBe(true);
    expect(CHILD_DOCUMENT_CATEGORIES.map((c) => c.key)).not.toContain(
      "FAMILY_BOOK"
    );
    expect(CHILD_DOCUMENT_CATEGORIES.map((c) => c.key)).not.toContain("PHOTO");
  });

  it("limite la taille à 10 Mo et accepte PDF / images", () => {
    expect(ENROLLMENT_DOC_MAX_BYTES).toBe(10 * 1024 * 1024);
    expect(ENROLLMENT_DOC_ALLOWED_MIME.has("application/pdf")).toBe(true);
    expect(ENROLLMENT_DOC_ALLOWED_MIME.has("image/png")).toBe(true);
    expect(ENROLLMENT_DOC_ALLOWED_MIME.has("text/plain")).toBe(false);
  });

  it("retourne les métadonnées d'une catégorie connue", () => {
    expect(getDocumentCategoryMeta("INSURANCE")).toMatchObject({
      key: "INSURANCE",
      perChild: true,
      required: true,
    });
    expect(getDocumentCategoryMeta("UNKNOWN")).toBeNull();
  });

  it("marque livret / vaccination / assurance comme obligatoires", () => {
    expect(getDocumentCategoryMeta("FAMILY_BOOK")?.required).toBe(true);
    expect(getDocumentCategoryMeta("VACCINATION")?.required).toBe(true);
    expect(getDocumentCategoryMeta("INSURANCE")?.required).toBe(true);
    expect(getDocumentCategoryMeta("PHOTO")?.required).toBeFalsy();
  });
});
