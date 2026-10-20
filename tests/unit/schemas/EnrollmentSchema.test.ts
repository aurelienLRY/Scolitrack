import {
  createEnrollmentCampaignSchema,
  createEnrollmentFileSchema,
  enrollmentFormPayloadDraftSchema,
  enrollmentFormPayloadSubmitSchema,
  updateEnrollmentFileByTokenSchema,
  updateEnrollmentStatusSchema,
} from "@/schemas/EnrollmentSchema";
import { createEmptyFormPayload } from "@/types/enrollment-form.type";

function completeParent(overrides: Record<string, unknown> = {}) {
  return {
    role: "pere",
    lastName: "Dupont",
    firstName: "Jean",
    maritalStatus: "marie",
    profession: "Dev",
    address: "1 rue de l'École",
    postalCode: "11160",
    city: "Rieux",
    socialSecurityNum: null,
    phoneLandline: null,
    phoneMobile: "0612345678",
    email: "jean@example.com",
    commissionId: "comm-1",
    skills: null,
    availability: null,
    ...overrides,
  };
}

function completeChild(overrides: Record<string, unknown> = {}) {
  return {
    localId: "child-1",
    firstName: "Léa",
    lastName: "Dupont",
    birthDate: "2018-05-01",
    birthPlace: "Carcassonne",
    entryDate: null,
    previousSchool: null,
    radiationDate: null,
    targetLevel: "CP",
    sleepsAtParent1: true,
    sleepsAtParent2: false,
    sleepsElsewhere: false,
    otherResidenceAddress: null,
    otherResidencePostalCode: null,
    otherResidenceCity: null,
    residence: null,
    hasSplitResidence: false,
    custodyArrangement: null,
    legalGuardians: null,
    insuranceProvider: null,
    insuranceNumber: null,
    medical: {
      hasAsthma: false,
      medicalConsent: false,
    },
    emergencyContacts: [],
    authorizedPickups: [],
    ...overrides,
  };
}

describe("createEnrollmentCampaignSchema", () => {
  it("accepte une campagne avec dates cohérentes", async () => {
    await expect(
      createEnrollmentCampaignSchema.validate({
        name: "Rentrée 2026",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-06-01"),
      })
    ).resolves.toMatchObject({ name: "Rentrée 2026" });
  });

  it("refuse une fin antérieure au début", async () => {
    await expect(
      createEnrollmentCampaignSchema.validate({
        name: "Rentrée 2026",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-03-01"),
      })
    ).rejects.toThrow(/postérieure/);
  });
});

describe("createEnrollmentFileSchema / updateEnrollmentStatusSchema", () => {
  it("exige un email et une campagne", async () => {
    await expect(
      createEnrollmentFileSchema.validate({
        campaignId: "camp-1",
        email: "pas-valide",
      })
    ).rejects.toThrow(/email/i);
  });

  it("restreint les statuts connus", async () => {
    await expect(
      updateEnrollmentStatusSchema.validate({ status: "APPROVED" })
    ).resolves.toMatchObject({ status: "APPROVED" });
    await expect(
      updateEnrollmentStatusSchema.validate({ status: "ARCHIVED" })
    ).rejects.toThrow();
  });
});

describe("enrollmentFormPayloadDraftSchema", () => {
  it("accepte un brouillon minimal", async () => {
    const draft = createEmptyFormPayload("parent@example.com");
    await expect(
      enrollmentFormPayloadDraftSchema.validate(draft)
    ).resolves.toMatchObject({ version: 1 });
  });
});

describe("enrollmentFormPayloadSubmitSchema", () => {
  it("exige un parent 1 complet et au moins un enfant", async () => {
    const payload = {
      version: 1,
      parents: [completeParent(), createEmptyFormPayload().parents[1]],
      children: [completeChild()],
      emergencyContacts: [],
      authorizedPickups: [],
      consents: { saquetasQuantity: 0 },
    };

    await expect(
      enrollmentFormPayloadSubmitSchema.validate(payload)
    ).resolves.toMatchObject({
      children: [expect.objectContaining({ firstName: "Léa" })],
    });
  });

  it("refuse une soumission sans enfant", async () => {
    await expect(
      enrollmentFormPayloadSubmitSchema.validate({
        version: 1,
        parents: [completeParent()],
        children: [],
        consents: {},
      })
    ).rejects.toThrow(/enfant/i);
  });

  it("refuse un parent 1 incomplet même si le second est rempli", async () => {
    await expect(
      enrollmentFormPayloadSubmitSchema.validate({
        version: 1,
        parents: [
          { role: "pere", firstName: "", lastName: "", email: "" },
          completeParent({ role: "mere", email: "mere@example.com" }),
        ],
        children: [completeChild()],
        consents: {},
      })
    ).rejects.toThrow(/responsable légal 1/i);
  });
});

describe("updateEnrollmentFileByTokenSchema", () => {
  it("n'autorise que DRAFT ou SUBMITTED côté public", async () => {
    const draftPayload = createEmptyFormPayload("parent@example.com");

    await expect(
      updateEnrollmentFileByTokenSchema.validate({
        status: "SUBMITTED",
        formPayload: draftPayload,
      })
    ).resolves.toMatchObject({ status: "SUBMITTED" });

    await expect(
      updateEnrollmentFileByTokenSchema.validate({
        status: "APPROVED",
        formPayload: draftPayload,
      })
    ).rejects.toThrow();
  });
});
