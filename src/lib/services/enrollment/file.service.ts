import { prisma } from "@/lib/prisma/prisma";
import { Prisma, EnrollmentStatus } from "@prisma/client";
import { activityLogService } from "@/lib/services/crud/activity-log.service";
import { sendEnrollmentInvitationEmail } from "@/lib/nodemailer/enrollment-invitation.email";
import { sendEnrollmentStatusChangeEmail } from "@/lib/nodemailer/enrollment-status-change.email";

interface UpdateStatusParams {
  fileId: string;
  newStatus: EnrollmentStatus;
  actorId: string;
  note?: string;
}

/**
 * Service de gestion des dossiers d'inscription
 */
export const enrollmentFileService = {
  /**
   * Récupère tous les dossiers d'inscription
   */
  async getAllFiles(filters?: {
    status?: EnrollmentStatus;
    campaignId?: string;
    familyId?: string;
    email?: string;
  }) {
    return prisma.enrollmentFile.findMany({
      where: filters,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
        students: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                birthDate: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            students: true,
            history: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  /**
   * Récupère un dossier d'inscription par son ID
   */
  async getFileById(id: string) {
    return prisma.enrollmentFile.findUnique({
      where: { id },
      include: {
        campaign: true,
        family: true,
        students: {
          include: {
            student: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        history: {
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },
    });
  },

  /**
   * Récupère un dossier d'inscription par son token
   */
  async getFileByToken(token: string) {
    return prisma.enrollmentFile.findUnique({
      where: { token },
      include: {
        campaign: true,
        family: true,
        students: {
          include: {
            student: true,
          },
        },
      },
    });
  },

  /**
   * Crée un nouveau dossier d'inscription
   */
  async createFile(data: {
    campaignId: string;
    familyId?: string;
    email: string;
  }, userId: string) {
    const file = await prisma.enrollmentFile.create({
      data: {
        campaignId: data.campaignId,
        email: data.email,
        status: "DRAFT",
        familyId: data.familyId,
      },
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "CREATE_ENROLLMENT_FILE",
      details: `Création du dossier d'inscription #${file.id} pour l'email ${file.email}`,
    });

    return file;
  },

  /**
   * Met à jour un dossier d'inscription
   */
  async updateFile(
    id: string,
    data: Prisma.EnrollmentFileUpdateInput,
    userId: string
  ) {
    const file = await prisma.enrollmentFile.update({
      where: { id },
      data,
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "UPDATE_ENROLLMENT_FILE",
      details: `Mise à jour du dossier d'inscription #${file.id}`,
    });

    return file;
  },

  /**
   * Met à jour le statut d'un dossier d'inscription
   */
  async updateStatus({
    fileId,
    newStatus,
    actorId,
    note,
  }: UpdateStatusParams) {
    const file = await prisma.enrollmentFile.findUnique({
      where: { id: fileId },
      include: {
        campaign: true,
      },
    });

    if (!file) {
      throw new Error("Dossier d'inscription non trouvé");
    }

    const oldStatus = file.status;

    const updatedFile = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedFile = await tx.enrollmentFile.update({
        where: { id: fileId },
        data: {
          status: newStatus,
          reviewedAt: newStatus === "APPROVED" || newStatus === "REJECTED" ? new Date() : file.reviewedAt,
          reviewerId: newStatus === "APPROVED" || newStatus === "REJECTED" || newStatus === "NEED_INFO" ? actorId : file.reviewerId,
          decisionNote: note ? note : file.decisionNote,
          submittedAt: newStatus === "SUBMITTED" && !file.submittedAt ? new Date() : file.submittedAt,
        },
      });

      await tx.enrollmentHistory.create({
        data: {
          fileId,
          oldStatus,
          newStatus,
          actorId,
          note,
        },
      });

      return updatedFile;
    });

    await activityLogService.logActivity({
      userId: actorId,
      action: "UPDATE_ENROLLMENT_STATUS",
      details: `Mise à jour du statut du dossier d'inscription #${fileId} de ${oldStatus} à ${newStatus}`,
    });

    await sendEnrollmentStatusChangeEmail(updatedFile.email, updatedFile.token, file.campaign.name, newStatus, note);

    return updatedFile;
  },

  /**
   * Supprime un dossier d'inscription
   */
  async deleteFile(id: string, userId: string) {
    const file = await prisma.enrollmentFile.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error("Dossier d'inscription non trouvé");
    }

    await prisma.enrollmentFile.delete({
      where: { id },
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "DELETE_ENROLLMENT_FILE",
      details: `Suppression du dossier d'inscription #${id}`,
    });

    return file;
  },

  /**
   * Ajoute un étudiant à un dossier d'inscription
   */
  async addStudentToFile(fileId: string, studentId: string, userId: string) {
    const file = await prisma.enrollmentFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("Dossier d'inscription non trouvé");
    }

    const enrollmentStudent = await prisma.enrollmentStudent.create({
      data: {
        fileId,
        studentId,
      },
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "ADD_STUDENT_TO_ENROLLMENT",
      details: `Ajout de l'étudiant #${studentId} au dossier d'inscription #${fileId}`,
    });

    return enrollmentStudent;
  },

  /**
   * Retire un étudiant d'un dossier d'inscription
   */
  async removeStudentFromFile(fileId: string, studentId: string, userId: string) {
    await prisma.enrollmentStudent.delete({
      where: {
        fileId_studentId: {
          fileId,
          studentId,
        },
      },
    });

    // Journaliser l'action
    await activityLogService.logActivity({
      userId,
      action: "REMOVE_STUDENT_FROM_ENROLLMENT",
      details: `Retrait de l'étudiant #${studentId} du dossier d'inscription #${fileId}`,
    });

    return { fileId, studentId };
  },

  /**
   * Génère des dossiers d'inscription pour une liste d'emails
   */
  async generateFilesForEmails(
    campaignId: string,
    emails: string[],
    userId: string
  ) {
    const campaign = await prisma.enrollmentCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error("Campagne d'inscription non trouvée");
    }

    const createdFiles = await prisma.$transaction(
      emails.map((email) =>
        prisma.enrollmentFile.create({
          data: {
            campaignId,
            email,
            status: "DRAFT",
          },
        })
      )
    );

    await activityLogService.logActivity({
      userId,
      action: "GENERATE_ENROLLMENT_FILES",
      details: `Génération de ${emails.length} dossiers d'inscription pour la campagne "${campaign.name}"`,
    });

    for (const file of createdFiles) {
      await sendEnrollmentInvitationEmail(file.email, file.token, campaign.name);
    }

    return createdFiles;
  },
};
