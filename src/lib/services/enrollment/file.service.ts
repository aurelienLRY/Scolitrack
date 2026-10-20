import { prisma } from "@/lib/prisma/prisma";
import { Prisma, EnrollmentStatus } from "@prisma/client";
import { activityLogService } from "@/lib/services/crud/activity-log.service";
import { sendEnrollmentInvitationEmail } from "@/lib/nodemailer/enrollment-invitation.email";
import { sendEnrollmentStatusChangeEmail } from "@/lib/nodemailer/enrollment-status-change.email";
import type { EnrollmentFormPayload } from "@/types/enrollment-form.type";
import {
  createEmptyFormPayload,
  normalizeFormPayload,
} from "@/types/enrollment-form.type";
import { evaluateEnrollmentCompleteness } from "@/lib/enrollment/completeness";
import { hydrateEnrollmentOnApprove } from "@/lib/services/enrollment/hydrate.service";
import { enrollmentDocumentService } from "@/lib/services/enrollment/document.service";
import { enrollmentSignatureService } from "@/lib/services/enrollment/signature.service";

function parseFormPayload(
  raw: string | null | undefined,
  fallbackEmail?: string
): EnrollmentFormPayload {
  if (!raw) return createEmptyFormPayload(fallbackEmail);
  try {
    const parsed = JSON.parse(raw) as EnrollmentFormPayload;
    return normalizeFormPayload(parsed, fallbackEmail);
  } catch {
    return createEmptyFormPayload(fallbackEmail);
  }
}

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
    const file = await prisma.enrollmentFile.findUnique({
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

    if (!file) return null;

    return {
      ...file,
      parsedFormPayload: parseFormPayload(file.formPayload, file.email),
    };
  },

  /**
   * Récupère un dossier d'inscription par son token
   */
  async getFileByToken(token: string) {
    const file = await prisma.enrollmentFile.findUnique({
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

    if (!file) return null;

    return {
      ...file,
      parsedFormPayload: parseFormPayload(file.formPayload, file.email),
    };
  },

  /**
   * Checklist docs + signatures pour un dossier (staff / soumission).
   */
  async getCompleteness(fileIdOrToken: { id?: string; token?: string }) {
    const file = fileIdOrToken.id
      ? await prisma.enrollmentFile.findUnique({
          where: { id: fileIdOrToken.id },
        })
      : await prisma.enrollmentFile.findUnique({
          where: { token: fileIdOrToken.token! },
        });

    if (!file) {
      throw new Error("Dossier d'inscription non trouvé");
    }

    const form = parseFormPayload(file.formPayload, file.email);
    const [documents, signatures] = await Promise.all([
      enrollmentDocumentService.listByFileToken(file.token),
      enrollmentSignatureService.listByFileToken(file.token),
    ]);

    const result = evaluateEnrollmentCompleteness({
      form,
      documents,
      signatures,
    });

    return {
      fileId: file.id,
      token: file.token,
      status: file.status,
      form,
      documents,
      signatures,
      ...result,
    };
  },

  /**
   * Enregistre le formulaire public (payload chiffré) via token.
   * Soumission bloquée si documents / signatures obligatoires manquants.
   */
  async savePublicFormByToken(
    token: string,
    input: {
      email?: string;
      status?: "DRAFT" | "SUBMITTED";
      formPayload: EnrollmentFormPayload;
    }
  ) {
    const existing = await prisma.enrollmentFile.findUnique({
      where: { token },
      include: { campaign: { select: { name: true } } },
    });

    if (!existing) {
      throw new Error("Dossier d'inscription non trouvé ou token invalide");
    }

    if (existing.status !== "DRAFT" && existing.status !== "NEED_INFO") {
      throw new Error("Ce dossier ne peut plus être modifié");
    }

    const consents = input.formPayload.consents;
    const primaryEmail =
      input.email ||
      input.formPayload.parents?.[0]?.email ||
      existing.email;

    if (input.status === "SUBMITTED") {
      const [documents, signatures] = await Promise.all([
        enrollmentDocumentService.listByFileToken(token),
        enrollmentSignatureService.listByFileToken(token),
      ]);
      const completeness = evaluateEnrollmentCompleteness({
        form: input.formPayload,
        documents,
        signatures,
      });
      if (completeness.blockers.length > 0) {
        throw new Error(
          `Dossier incomplet : ${completeness.blockers.join(" ; ")}`
        );
      }
    }

    const nextStatus = input.status === "SUBMITTED" ? "SUBMITTED" : existing.status;
    const oldStatus = existing.status;

    const updated = await prisma.$transaction(async (tx) => {
      const file = await tx.enrollmentFile.update({
        where: { id: existing.id },
        data: {
          email: primaryEmail,
          formPayload: JSON.stringify(input.formPayload),
          authorizeOutings: consents.authorizeOutings ?? false,
          authorizeLeaveAlone: consents.authorizeLeaveAlone ?? false,
          acceptRegulations: consents.acceptRegulations ?? false,
          authorizeImageRights: consents.authorizeImageRights ?? false,
          acceptAssociation: consents.acceptAssociation ?? false,
          acceptCanteenRules: consents.acceptCanteenRules ?? false,
          saquetasQuantity: consents.saquetasQuantity ?? 0,
          status: nextStatus,
          submittedAt:
            nextStatus === "SUBMITTED" && !existing.submittedAt
              ? new Date()
              : existing.submittedAt,
        },
        include: {
          campaign: true,
          family: true,
          students: {
            include: { student: true },
          },
        },
      });

      if (nextStatus === "SUBMITTED") {
        await tx.enrollmentHistory.create({
          data: {
            fileId: existing.id,
            oldStatus,
            newStatus: "SUBMITTED",
            note: "Soumission du dossier par le parent (lien public)",
          },
        });
      }

      return file;
    });

    if (nextStatus === "SUBMITTED") {
      try {
        await sendEnrollmentStatusChangeEmail(
          updated.email,
          updated.token,
          existing.campaign.name,
          "SUBMITTED"
        );
      } catch (err) {
        console.error("Email soumission inscription:", err);
      }
    }

    return {
      ...updated,
      parsedFormPayload: parseFormPayload(updated.formPayload, updated.email),
    };
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

    const campaign = await prisma.enrollmentCampaign.findUnique({
      where: { id: data.campaignId },
      select: { name: true },
    });

    if (!campaign) {
      throw new Error("Campagne d'inscription non trouvée");
    }

    await sendEnrollmentInvitationEmail(file.email, file.token, campaign.name);

    return file;
  },

  /**
   * Met à jour un dossier d'inscription
   */
  async updateFile(
    id: string,
    data: Prisma.EnrollmentFileUpdateInput & {
      formPayload?: EnrollmentFormPayload | string;
      familyId?: string | null;
    },
    userId: string
  ) {
    const { formPayload, familyId, ...rest } = data;
    const prismaData: Prisma.EnrollmentFileUpdateInput = { ...rest };

    if (familyId === null) {
      prismaData.family = { disconnect: true };
    } else if (typeof familyId === "string" && familyId.length > 0) {
      prismaData.family = { connect: { id: familyId } };
    }

    if (formPayload != null) {
      const payload =
        typeof formPayload === "string"
          ? (JSON.parse(formPayload) as EnrollmentFormPayload)
          : formPayload;
      const consents = payload.consents;
      prismaData.formPayload = JSON.stringify(payload);
      prismaData.authorizeOutings = consents?.authorizeOutings ?? false;
      prismaData.authorizeLeaveAlone = consents?.authorizeLeaveAlone ?? false;
      prismaData.acceptRegulations = consents?.acceptRegulations ?? false;
      prismaData.authorizeImageRights = consents?.authorizeImageRights ?? false;
      prismaData.acceptAssociation = consents?.acceptAssociation ?? false;
      prismaData.acceptCanteenRules = consents?.acceptCanteenRules ?? false;
      prismaData.saquetasQuantity = consents?.saquetasQuantity ?? 0;
      if (payload.parents?.[0]?.email) {
        prismaData.email = payload.parents[0].email;
      }
    }

    const file = await prisma.enrollmentFile.update({
      where: { id },
      data: prismaData,
      include: {
        campaign: true,
        family: true,
        students: { include: { student: true } },
      },
    });

    await activityLogService.logActivity({
      userId,
      action: "UPDATE_ENROLLMENT_FILE",
      details: `Mise à jour du dossier d'inscription #${file.id}`,
    });

    return {
      ...file,
      parsedFormPayload: parseFormPayload(file.formPayload, file.email),
    };
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

    if (newStatus === "NEED_INFO" && !note?.trim()) {
      throw new Error(
        "Une note est obligatoire pour demander des informations complémentaires"
      );
    }

    if (newStatus === "APPROVED") {
      const hydrated = await hydrateEnrollmentOnApprove(fileId);
      await activityLogService.logActivity({
        userId: actorId,
        action: "HYDRATE_ENROLLMENT_FILE",
        details: `Hydratation famille/élèves dossier #${fileId} (famille ${hydrated.familyId}, ${hydrated.createdStudents} élève(s))`,
      });
    }

    const oldStatus = file.status;

    const updatedFile = await prisma.$transaction(async (tx) => {
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

    await sendEnrollmentStatusChangeEmail(
      updatedFile.email,
      updatedFile.token,
      file.campaign.name,
      newStatus,
      note
    );

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

  /**
   * Renvoie l'invitation d'un dossier d'inscription existant
   */
  async resendInvitation(fileId: string, userId: string) {
    const file = await prisma.enrollmentFile.findUnique({
      where: { id: fileId },
      include: {
        campaign: {
          select: { name: true },
        },
      },
    });

    if (!file) {
      throw new Error("Dossier d'inscription non trouvé");
    }

    await sendEnrollmentInvitationEmail(file.email, file.token, file.campaign.name);

    await activityLogService.logActivity({
      userId,
      action: "RESEND_ENROLLMENT_INVITATION",
      details: `Renvoi de l'invitation du dossier d'inscription #${file.id} vers ${file.email}`,
    });

    return file;
  },
};
