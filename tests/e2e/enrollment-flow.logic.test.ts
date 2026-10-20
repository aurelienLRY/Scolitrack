/**
 * Parcours logique parent → staff (sans navigateur).
 * Couvre les règles métier des points 1–5 / 11.
 */
import { describe, expect, it } from "vitest";
import {
  evaluateEnrollmentCompleteness,
  getRequiredDocumentSlots,
  getRequiredSignatureSlots,
} from "@/lib/enrollment/completeness";
import {
  createEmptyChild,
  createEmptyFormPayload,
} from "@/types/enrollment-form.type";
import { isSensitiveDocumentCategory } from "@/config/enrollment-documents.config";

function buildReadyForm() {
  const form = createEmptyFormPayload("parent@example.com");
  form.parents[0] = {
    ...form.parents[0],
    firstName: "Camille",
    lastName: "Dupont",
    email: "parent@example.com",
    phoneMobile: "0612345678",
    address: "12 rue des Écoles",
    postalCode: "31000",
    city: "Toulouse",
    commissionId: "comm-1",
  };
  form.children = [
    {
      ...createEmptyChild("local-child-1"),
      firstName: "Inès",
      lastName: "Dupont",
      birthDate: "2019-05-12",
      birthPlace: "Toulouse",
      targetLevel: "MS",
    },
  ];
  return form;
}

describe("E2E logique inscription", () => {
  it("parcours parent : formulaires OK mais soumission bloquée sans docs/signatures", () => {
    const form = buildReadyForm();
    const result = evaluateEnrollmentCompleteness({
      form,
      documents: [],
      signatures: [],
    });
    expect(result.docsOk).toBe(false);
    expect(result.signaturesOk).toBe(false);
  });

  it("parcours parent : soumission possible une fois pièces + signatures présentes", () => {
    const form = buildReadyForm();
    const docs = getRequiredDocumentSlots(form);
    const sigs = getRequiredSignatureSlots(form);
    const result = evaluateEnrollmentCompleteness({
      form,
      documents: docs.map((d) => ({
        category: d.category,
        scopeRef: d.scopeRef,
      })),
      signatures: sigs.map((s) => ({
        subjectKey: s.subjectKey,
        scopeRef: s.scopeRef,
        email: s.email,
        status: "SIGNED",
      })),
    });
    expect(result.docsOk).toBe(true);
    expect(result.signaturesOk).toBe(true);
  });

  it("parcours staff : checklist reflète l'état OK/KO", () => {
    const form = buildReadyForm();
    const incomplete = evaluateEnrollmentCompleteness({
      form,
      documents: [{ category: "FAMILY_BOOK", scopeRef: "" }],
      signatures: [],
    });
    expect(incomplete.docsOk).toBe(false);
    expect(incomplete.missingDocs.some((d) => d.category === "INSURANCE")).toBe(
      true
    );
  });

  it("docs santé marqués sensibles (audit)", () => {
    expect(isSensitiveDocumentCategory("VACCINATION")).toBe(true);
    expect(isSensitiveDocumentCategory("MEDICAL_FITNESS")).toBe(true);
    expect(isSensitiveDocumentCategory("FAMILY_BOOK")).toBe(false);
  });
});
