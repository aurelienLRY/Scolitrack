import {
  createEmptyChild,
  createEmptyFormPayload,
  createEmptyParent,
  normalizeFormPayload,
  sanitizeSocialSecurityInput,
  SOCIAL_SECURITY_MAX_LENGTH,
} from "@/types/enrollment-form.type";

describe("createEmptyFormPayload", () => {
  it("préremplit l'email du premier parent", () => {
    const payload = createEmptyFormPayload("parent@example.com");

    expect(payload.version).toBe(1);
    expect(payload.parents).toHaveLength(2);
    expect(payload.parents[0].email).toBe("parent@example.com");
    expect(payload.parents[1].role).toBe("mere");
    expect(payload.children).toEqual([]);
    expect(payload.consents.saquetasQuantity).toBe(0);
  });
});

describe("createEmptyParent / createEmptyChild", () => {
  it("utilise le rôle fourni pour le parent", () => {
    expect(createEmptyParent("tuteur").role).toBe("tuteur");
  });

  it("attache un localId à l'enfant vide", () => {
    expect(createEmptyChild("child-1").localId).toBe("child-1");
    expect(createEmptyChild("child-1").medical.hasAsthma).toBe(false);
  });
});

describe("normalizeFormPayload", () => {
  it("retourne un payload vide pour une version inconnue", () => {
    const result = normalizeFormPayload(
      { version: 99 } as never,
      "fallback@example.com"
    );

    expect(result.parents[0].email).toBe("fallback@example.com");
    expect(result.children).toEqual([]);
  });

  it("fusionne parents, enfants et consentements partiels", () => {
    const result = normalizeFormPayload({
      version: 1,
      parents: [
        {
          role: "pere",
          firstName: "Jean",
          lastName: "Dupont",
          email: "jean@example.com",
          availability: { canteen: true },
        },
      ],
      children: [
        {
          localId: "c1",
          firstName: "Léa",
          medical: { hasAsthma: true },
        },
      ],
      consents: { acceptRegulations: true, saquetasQuantity: 2 },
    } as never);

    expect(result.parents[0].firstName).toBe("Jean");
    expect(result.parents[0].availability.canteen).toBe(true);
    expect(result.parents[0].availability.daycare).toBe(false);
    expect(result.parents[1].role).toBe("mere");
    expect(result.children[0].firstName).toBe("Léa");
    expect(result.children[0].medical.hasAsthma).toBe(true);
    expect(result.children[0].medical.hasMeasles).toBe(false);
    expect(result.consents.acceptRegulations).toBe(true);
    expect(result.consents.saquetasQuantity).toBe(2);
  });

  it("migre l'ancienne résidence split / libre vers les nouveaux booléens", () => {
    const result = normalizeFormPayload({
      version: 1,
      parents: [],
      children: [
        {
          localId: "legacy",
          hasSplitResidence: true,
          residence: "12 rue des Lilas",
        },
      ],
      consents: {},
    } as never);

    expect(result.children[0].sleepsAtParent1).toBe(true);
    expect(result.children[0].sleepsAtParent2).toBe(true);
    expect(result.children[0].sleepsElsewhere).toBe(true);
    expect(result.children[0].otherResidenceAddress).toBe("12 rue des Lilas");
  });
});

describe("sanitizeSocialSecurityInput", () => {
  it("conserve chiffres et A/B, majuscules, max 15", () => {
    expect(sanitizeSocialSecurityInput("1 85 12 2a 123 456 78")).toBe(
      "185122A12345678"
    );
    expect(sanitizeSocialSecurityInput("x".repeat(40)).length).toBeLessThanOrEqual(
      SOCIAL_SECURITY_MAX_LENGTH
    );
  });
});
