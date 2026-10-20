import {
  CHILD_SIGNATURE_ORDER,
  ENROLLMENT_SIGNATURE_SUBJECTS,
  getSignatureSubject,
  GUARDIAN_SIGNATURE_ORDER,
} from "@/config/enrollment-signatures.config";

describe("enrollment-signatures.config", () => {
  it("sépare signatures responsable et signatures enfant", () => {
    expect(GUARDIAN_SIGNATURE_ORDER).toEqual([
      "FICHE1_HORAIRES",
      "FICHE4_ADHESION",
      "FICHE7_CANTINE_GARDERIE",
      "FICHE9_REGLEMENTS",
    ]);
    expect(CHILD_SIGNATURE_ORDER).toEqual([
      "FICHE3_SORTIES",
      "FICHE3_QUITTER_SEUL",
      "FICHE11_DROIT_IMAGE",
      "FICHE2_CONSENTEMENT_MEDICAL",
    ]);
  });

  it("définit un label et un texte d'acceptation pour chaque sujet", () => {
    for (const key of [
      ...GUARDIAN_SIGNATURE_ORDER,
      ...CHILD_SIGNATURE_ORDER,
    ]) {
      const subject = ENROLLMENT_SIGNATURE_SUBJECTS[key];
      expect(subject.key).toBe(key);
      expect(subject.label.length).toBeGreaterThan(0);
      expect(subject.acceptanceText.length).toBeGreaterThan(0);
    }
  });

  it("résout un sujet connu et ignore les clés inconnues", () => {
    expect(getSignatureSubject("FICHE11_DROIT_IMAGE")?.label).toMatch(
      /image/i
    );
    expect(getSignatureSubject("INEXISTANT")).toBeNull();
  });
});
