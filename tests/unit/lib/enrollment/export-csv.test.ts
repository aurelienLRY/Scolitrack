import { describe, expect, it } from "vitest";
import { buildEnrollmentCsv } from "@/lib/enrollment/export-csv";
import {
  createEmptyChild,
  createEmptyFormPayload,
} from "@/types/enrollment-form.type";

describe("buildEnrollmentCsv", () => {
  it("produit un CSV avec BOM et une ligne par enfant", () => {
    const form = createEmptyFormPayload("a@b.c");
    form.parents[0].firstName = "Ada";
    form.parents[0].lastName = "Lovelace";
    form.parents[0].email = "ada@example.com";
    form.children = [
      {
        ...createEmptyChild("c1"),
        firstName: "Léa",
        lastName: "Lovelace",
        birthDate: "2018-01-01",
        targetLevel: "CP",
      },
      {
        ...createEmptyChild("c2"),
        firstName: "Tom",
        lastName: "Lovelace",
        birthDate: "2020-02-02",
        targetLevel: "MS",
      },
    ];

    const csv = buildEnrollmentCsv({
      campaignName: "Rentrée 2026",
      email: "ada@example.com",
      status: "SUBMITTED",
      form,
    });

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("parent1_prenom");
    expect(csv).toContain("enfant_prenom");
    expect(csv).toContain("Léa");
    expect(csv).toContain("Tom");
    expect(csv).toContain("Ada");
    // header + 2 enfants
    expect(csv.trim().split(/\r?\n/).length).toBe(3);
  });
});
