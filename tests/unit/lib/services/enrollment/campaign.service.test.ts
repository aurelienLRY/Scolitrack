import { enrollmentCampaignService } from "@/lib/services/enrollment/campaign.service";
import { activityLogService } from "@/lib/services/crud/activity-log.service";
import { prismaMock, resetPrismaMock } from "@tests/mocks/prisma";

vi.mock("@/lib/prisma/prisma", async () => {
  const { prismaMock: mockedPrisma } = await import("@tests/mocks/prisma");
  return { prisma: mockedPrisma };
});

vi.mock("@/lib/services/crud/activity-log.service", () => ({
  activityLogService: {
    logActivity: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("enrollmentCampaignService.deleteCampaign", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.mocked(activityLogService.logActivity).mockClear();
  });

  it("refuse une campagne introuvable", async () => {
    prismaMock.enrollmentCampaign.findUnique.mockResolvedValue(null);

    await expect(
      enrollmentCampaignService.deleteCampaign("missing", "user-1")
    ).rejects.toThrow("Campagne d'inscription non trouvée");
  });

  it("refuse tant que la date de fin n'est pas passée", async () => {
    prismaMock.enrollmentCampaign.findUnique.mockResolvedValue({
      id: "camp-1",
      name: "Rentrée",
      endDate: new Date(Date.now() + 86_400_000),
      _count: { enrollmentFiles: 0, signatures: 0 },
    });

    await expect(
      enrollmentCampaignService.deleteCampaign("camp-1", "user-1")
    ).rejects.toThrow(/date de fin n'est pas encore passée/);
  });

  it("refuse s'il reste des dossiers (actifs ou corbeille)", async () => {
    prismaMock.enrollmentCampaign.findUnique.mockResolvedValue({
      id: "camp-1",
      name: "Rentrée",
      endDate: new Date("2020-01-01"),
      _count: { enrollmentFiles: 2, signatures: 0 },
    });
    prismaMock.enrollmentFile.count.mockResolvedValue(2);

    await expect(
      enrollmentCampaignService.deleteCampaign("camp-1", "user-1")
    ).rejects.toThrow(/contient encore des dossiers/);
  });

  it("supprime signatures puis campagne quand tout est vide", async () => {
    const campaign = {
      id: "camp-1",
      name: "Rentrée 2025",
      endDate: new Date("2020-01-01"),
      _count: { enrollmentFiles: 0, signatures: 1 },
    };
    prismaMock.enrollmentCampaign.findUnique.mockResolvedValue(campaign);
    prismaMock.enrollmentFile.count.mockResolvedValue(0);
    prismaMock.enrollmentSignature.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.enrollmentCampaign.delete.mockResolvedValue(campaign);

    await expect(
      enrollmentCampaignService.deleteCampaign("camp-1", "user-1")
    ).resolves.toEqual(campaign);

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.enrollmentSignature.deleteMany).toHaveBeenCalledWith({
      where: { campaignId: "camp-1" },
    });
    expect(prismaMock.enrollmentCampaign.delete).toHaveBeenCalledWith({
      where: { id: "camp-1" },
    });
    expect(prismaMock.enrollmentFile.deleteMany).not.toHaveBeenCalled();
    expect(activityLogService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DELETE_ENROLLMENT_CAMPAIGN",
        details: expect.stringContaining("Rentrée 2025"),
      })
    );
  });
});
