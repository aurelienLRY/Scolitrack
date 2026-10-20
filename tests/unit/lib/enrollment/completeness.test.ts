import { describe, expect, it } from "vitest";
import {
  evaluateEnrollmentCompleteness,
  getRequiredDocumentSlots,
  getRequiredSignatureSlots,
} from "@/lib/enrollment/completeness";
import { createEmptyFormPayload, createEmptyChild } from "@/types/enrollment-form.type";

describe("enrollment completeness", () => {
  it("exige livret + vaccination + assurance par enfant", () => {
    const form = createEmptyFormPayload("a@b.c");
    form.parents[0] = {
      ...form.parents[0],
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phoneMobile: "0600000000",
      address: "1 rue",
      postalCode: "31000",
      city: "Toulouse",
      commissionId: "c1",
    };
    form.children = [
      {
        ...createEmptyChild("child-1"),
        firstName: "Léa",
        lastName: "Lovelace",
        birthDate: "2018-01-01",
        birthPlace: "Toulouse",
        targetLevel: "CP",
      },
    ];

    const docs = getRequiredDocumentSlots(form);
    expect(docs.map((d) => d.category)).toEqual(
      expect.arrayContaining(["FAMILY_BOOK", "VACCINATION", "INSURANCE"])
    );
    expect(docs.filter((d) => d.category === "VACCINATION")[0].scopeRef).toBe(
      "child-1"
    );
  });

  it("bloque la soumission si docs ou signatures manquent", () => {
    const form = createEmptyFormPayload("ada@example.com");
    form.parents[0].email = "ada@example.com";
    form.parents[0].firstName = "Ada";
    form.parents[0].lastName = "L";
    form.children = [createEmptyChild("c1")];

    const empty = evaluateEnrollmentCompleteness({
      form,
      documents: [],
      signatures: [],
    });
    expect(empty.docsOk).toBe(false);
    expect(empty.signaturesOk).toBe(false);
    expect(empty.blockers.length).toBeGreaterThan(0);

    const requiredDocs = getRequiredDocumentSlots(form);
    const requiredSigs = getRequiredSignatureSlots(form);

    const full = evaluateEnrollmentCompleteness({
      form,
      documents: requiredDocs.map((d) => ({
        category: d.category,
        scopeRef: d.scopeRef,
      })),
      signatures: requiredSigs.map((s) => ({
        subjectKey: s.subjectKey,
        scopeRef: s.scopeRef,
        email: s.email,
        status: "SIGNED",
      })),
    });
    expect(full.docsOk).toBe(true);
    expect(full.signaturesOk).toBe(true);
    expect(full.blockers).toEqual([]);
  });

  it("ne rend pas obligatoire l'autorisation de quitter seul", () => {
    const form = createEmptyFormPayload("a@b.c");
    form.parents[0].email = "a@b.c";
    form.children = [createEmptyChild("c1")];
    const keys = getRequiredSignatureSlots(form).map((s) => s.subjectKey);
    expect(keys).not.toContain("FICHE3_QUITTER_SEUL");
    expect(keys).toContain("FICHE3_SORTIES");
  });
});
