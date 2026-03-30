import { prisma } from "@/lib/prisma/prisma";
import { Prisma } from "@prisma/client";
import { activityLogService } from "@/lib/services/crud/activity-log.service";

/**
 * Service de gestion des campagnes d'inscription
 */
export const enrollmentCampaignService = {
  /**
   * Récupère toutes les campagnes d'inscription
   */
  async getAllCampaigns() {
    return prisma.enrollmentCampaign.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollmentFiles: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });
  },

  /**
   * Récupère une campagne d'inscription par son ID
   */
  async getCampaignById(id: string) {
    return prisma.enrollmentCampaign.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollmentFiles: true,
          },
        },
      },
    });
  },

  /**
   * Récupère les campagnes d'inscription actives (en cours)
   */
  async getActiveCampaigns() {
    const now = new Date();
    return prisma.enrollmentCampaign.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollmentFiles: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });
  },

  /**
   * Récupère les campagnes d'inscription à venir
   */
  async getUpcomingCampaigns() {
    const now = new Date();
    return prisma.enrollmentCampaign.findMany({
      where: {
        startDate: { gt: now },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollmentFiles: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });
  },

  /**
   * Crée une nouvelle campagne d'inscription
   */
  async createCampaign(data: Prisma.EnrollmentCampaignCreateInput, userId: string) {
    const campaign = await prisma.enrollmentCampaign.create({
      data: {
        ...data,
        creator: {
          connect: { id: userId },
        },
      },
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "CREATE_ENROLLMENT_CAMPAIGN",
      details: `Création de la campagne d'inscription "${campaign.name}"`,
    });

    return campaign;
  },

  /**
   * Met à jour une campagne d'inscription
   */
  async updateCampaign(
    id: string,
    data: Prisma.EnrollmentCampaignUpdateInput,
    userId: string
  ) {
    const campaign = await prisma.enrollmentCampaign.update({
      where: { id },
      data,
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "UPDATE_ENROLLMENT_CAMPAIGN",
      details: `Mise à jour de la campagne d'inscription "${campaign.name}"`,
    });

    return campaign;
  },

  /**
   * Supprime une campagne d'inscription
   * Supprime également tous les dossiers d'inscription associés
   */
  async deleteCampaign(id: string, userId: string) {
    const campaign = await prisma.enrollmentCampaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollmentFiles: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error("Campagne d'inscription non trouvée");
    }

    // Supprimer d'abord tous les dossiers d'inscription associés
    await prisma.enrollmentFile.deleteMany({
      where: { campaignId: id },
    });

    // Puis supprimer la campagne
    await prisma.enrollmentCampaign.delete({
      where: { id },
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "DELETE_ENROLLMENT_CAMPAIGN",
      details: `Suppression de la campagne d'inscription "${campaign.name}" et de ${campaign._count.enrollmentFiles} dossier(s) associé(s)`,
    });

    return campaign;
  },

  /**
   * Récupère les statistiques d'une campagne
   */
  async getCampaignStats(id: string) {
    const campaign = await prisma.enrollmentCampaign.findUnique({
      where: { id },
      include: {
        enrollmentFiles: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error("Campagne d'inscription non trouvée");
    }

    const totalFiles = campaign.enrollmentFiles.length;
    const draft = campaign.enrollmentFiles.filter(
      (file) => file.status === "DRAFT"
    ).length;
    const submitted = campaign.enrollmentFiles.filter(
      (file) => file.status === "SUBMITTED"
    ).length;
    const needInfo = campaign.enrollmentFiles.filter(
      (file) => file.status === "NEED_INFO"
    ).length;
    const approved = campaign.enrollmentFiles.filter(
      (file) => file.status === "APPROVED"
    ).length;
    const rejected = campaign.enrollmentFiles.filter(
      (file) => file.status === "REJECTED"
    ).length;

    return {
      campaignId: id,
      campaignName: campaign.name,
      totalFiles,
      draft,
      submitted,
      needInfo,
      approved,
      rejected,
      progress: totalFiles > 0 ? (submitted + approved + rejected) / totalFiles : 0,
    };
  },
}; 