import {
  ENROLLMENT_INFO_DOCS,
  getEnrollmentInfoDoc,
  SIGNATURE_INFO_DOC,
} from "@/config/enrollment-info-docs.config";
import {
  CHILD_SIGNATURE_ORDER,
  GUARDIAN_SIGNATURE_ORDER,
} from "@/config/enrollment-signatures.config";

describe("enrollment-info-docs.config", () => {
  it("expose un document d'info pour chaque id connu", () => {
    expect(getEnrollmentInfoDoc("horaires").title).toMatch(/Horaires/i);
    expect(getEnrollmentInfoDoc("adhesion").sections.length).toBeGreaterThan(0);
    expect(Object.keys(ENROLLMENT_INFO_DOCS)).toEqual(
      expect.arrayContaining([
        "horaires",
        "adhesion",
        "cantine_garderie",
        "reglements",
        "commissions",
        "sorties",
        "quitter_seul",
        "droit_image",
        "consentement_medical",
      ])
    );
  });

  it("relie chaque signature catalogue à un document d'info", () => {
    for (const key of [
      ...GUARDIAN_SIGNATURE_ORDER,
      ...CHILD_SIGNATURE_ORDER,
    ]) {
      const docId = SIGNATURE_INFO_DOC[key];
      expect(docId).toBeDefined();
      expect(ENROLLMENT_INFO_DOCS[docId!]).toBeDefined();
    }
  });
});
