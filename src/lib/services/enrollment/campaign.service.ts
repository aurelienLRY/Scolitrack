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
   * Supprime une campagne d'inscription.
   * Interdit si la date de fin n'est pas passée, ou s'il reste des dossiers
   * (actifs ou en corbeille — attendre la purge / vider les dossiers d'abord).
   */
  async deleteCampaign(id: string, userId: string) {
    const campaign = await prisma.enrollmentCampaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollmentFiles: true,
            signatures: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error("Campagne d'inscription non trouvée");
    }

    const now = new Date();
    if (campaign.endDate >= now) {
      throw new Error(
        "Impossible de supprimer une campagne dont la date de fin n'est pas encore passée"
      );
    }

    const remainingFiles = await prisma.enrollmentFile.count({
      where: { campaignId: id },
    });
    if (remainingFiles > 0) {
      throw new Error(
        "Impossible de supprimer une campagne qui contient encore des dossiers (y compris en corbeille). Supprimez ou attendez la purge des dossiers."
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.enrollmentSignature.deleteMany({
        where: { campaignId: id },
      });

      await tx.enrollmentCampaign.delete({
        where: { id },
      });
    });

    await activityLogService.logActivity({
      userId,
      action: "DELETE_ENROLLMENT_CAMPAIGN",
      details: `Suppression de la campagne "${campaign.name}"`,
    });

    return campaign;
  },

  /**
   * À l'ouverture d'une campagne : crée un dossier DRAFT par famille
   * ayant déjà des élèves, s'il n'existe pas encore pour cette campagne.
   * Email = membre principal de la famille, sinon premier membre.
   */
  async generateFilesForExistingStudents(campaignId: string, userId: string) {
    const campaign = await prisma.enrollmentCampaign.findUnique({
      where: { id: campaignId },
      select: { id: true, name: true },
    });
    if (!campaign) {
      throw new Error("Campagne d'inscription non trouvée");
    }

    const families = await prisma.family.findMany({
      where: { students: { some: {} } },
      include: {
        students: { select: { id: true } },
        members: {
          include: {
            user: { select: { email: true } },
          },
          orderBy: { isMainAddress: "desc" },
        },
        enrollmentFiles: {
          where: { campaignId },
          select: { id: true },
        },
      },
    });

    let created = 0;
    let skipped = 0;

    for (const family of families) {
      if (family.enrollmentFiles.length > 0) {
        skipped += 1;
        continue;
      }

      const email =
        family.members.find((m) => m.isMainAddress)?.user?.email ||
        family.members[0]?.user?.email;

      if (!email?.includes("@")) {
        skipped += 1;
        continue;
      }

      const file = await prisma.enrollmentFile.create({
        data: {
          campaignId,
          familyId: family.id,
          email,
          status: "DRAFT",
        },
      });

      for (const student of family.students) {
        await prisma.enrollmentStudent.create({
          data: { fileId: file.id, studentId: student.id },
        });
      }

      created += 1;
    }

    await activityLogService.logActivity({
      userId,
      action: "SYNC_CAMPAIGN_STUDENTS",
      details: `Campagne "${campaign.name}" : ${created} dossier(s) créé(s) pour élèves existants (${skipped} ignoré(s))`,
    });

    return { campaignId, created, skipped };
  },

  /**
   * Récupère les statistiques d'une campagne
   */
  async getCampaignStats(id: string) {
    const campaign = await prisma.enrollmentCampaign.findUnique({
      where: { id },
      include: {
        enrollmentFiles: {
          where: { deletedAt: null },
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