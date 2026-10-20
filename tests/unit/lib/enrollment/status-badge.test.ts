import {
  ENROLLMENT_STATUS_LABEL,
  ENROLLMENT_STATUS_VARIANT,
  enrollmentStatusLabel,
  enrollmentStatusVariant,
} from "@/lib/enrollment/status-badge";

describe("enrollment status badges", () => {
  it("associe chaque statut connu à un libellé FR", () => {
    expect(enrollmentStatusLabel("DRAFT")).toBe("Brouillon");
    expect(enrollmentStatusLabel("SUBMITTED")).toBe("Soumis");
    expect(enrollmentStatusLabel("NEED_INFO")).toBe("A compléter");
    expect(enrollmentStatusLabel("APPROVED")).toBe("Approuvé");
    expect(enrollmentStatusLabel("REJECTED")).toBe("Refusé");
  });

  it("retombe sur le code brut pour un statut inconnu", () => {
    expect(enrollmentStatusLabel("ARCHIVED")).toBe("ARCHIVED");
  });

  it("mappe les variantes de couleur métier", () => {
    expect(enrollmentStatusVariant("DRAFT")).toBe("secondary");
    expect(enrollmentStatusVariant("SUBMITTED")).toBe("success");
    expect(enrollmentStatusVariant("NEED_INFO")).toBe("warning");
    expect(enrollmentStatusVariant("APPROVED")).toBe("success");
    expect(enrollmentStatusVariant("REJECTED")).toBe("destructive");
    expect(enrollmentStatusVariant("???")).toBe("info");
  });

  it("reste synchronisé entre tables label et variante", () => {
    expect(Object.keys(ENROLLMENT_STATUS_LABEL).sort()).toEqual(
      Object.keys(ENROLLMENT_STATUS_VARIANT).sort()
    );
  });
});
