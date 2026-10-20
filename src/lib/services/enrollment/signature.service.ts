import { createHash, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma/prisma";
import { sendEnrollmentSignatureEmail } from "@/lib/nodemailer/enrollment-signature.email";
import { sendEnrollmentSignatureBatchEmail } from "@/lib/nodemailer/enrollment-signature-batch.email";
import {
  getSignatureSubject,
  type EnrollmentSignatureSubjectKey,
} from "@/config/enrollment-signatures.config";
import { OPTIONAL_CHILD_SIGNATURES } from "@/lib/enrollment/completeness";

const LINK_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

export function hashEnrollmentEmail(email: string): string {
  return createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");
}

function personalizeForChild(
  subject: NonNullable<ReturnType<typeof getSignatureSubject>>,
  childName?: string
) {
  if (!childName?.trim()) return subject;
  const name = childName.trim();
  return {
    ...subject,
    label: `${subject.label} — ${name}`,
    acceptanceText: subject.acceptanceText.replace(/mon enfant/gi, name),
  };
}

export type SignatureBatchItemInput = {
  subjectKey: EnrollmentSignatureSubjectKey;
  scopeRef?: string;
  childName?: string;
};

export const enrollmentSignatureService = {
  async listByFileToken(fileToken: string) {
    return prisma.enrollmentSignature.findMany({
      where: { fileToken },
      orderBy: { requestedAt: "desc" },
      select: {
        id: true,
        campaignId: true,
        fileToken: true,
        email: true,
        subjectKey: true,
        scopeRef: true,
        subjectLabel: true,
        status: true,
        batchToken: true,
        requestedAt: true,
        confirmedAt: true,
        linkExpiresAt: true,
      },
    });
  },

  /**
   * Demande une signature unitaire (rétrocompat).
   * skipEmail + batchToken : utilisé pour le lot.
   */
  async requestSignature(input: {
    fileToken: string;
    email: string;
    subjectKey: EnrollmentSignatureSubjectKey;
    scopeRef?: string;
    childName?: string;
    skipEmail?: boolean;
    batchToken?: string;
    linkExpiresAt?: Date;
  }) {
    const base = getSignatureSubject(input.subjectKey);
    if (!base) {
      throw new Error("Sujet de signature inconnu");
    }

    const subject = personalizeForChild(base, input.childName);
    const scopeRef = (input.scopeRef ?? "").trim();

    const email = input.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      throw new Error("Email invalide");
    }

    const file = await prisma.enrollmentFile.findUnique({
      where: { token: input.fileToken },
      include: {
        campaign: { select: { id: true, name: true, startDate: true } },
      },
    });

    if (!file) {
      throw new Error("Dossier d'inscription introuvable");
    }

    if (file.status !== "DRAFT" && file.status !== "NEED_INFO") {
      throw new Error("Ce dossier ne peut plus recevoir de nouvelles signatures");
    }

    const emailHash = hashEnrollmentEmail(email);
    const confirmToken = randomUUID();
    const linkExpiresAt =
      input.linkExpiresAt ?? new Date(Date.now() + LINK_TTL_MS);

    const existing = await prisma.enrollmentSignature.findUnique({
      where: {
        campaignId_fileToken_emailHash_subjectKey_scopeRef: {
          campaignId: file.campaignId,
          fileToken: input.fileToken,
          emailHash,
          subjectKey: subject.key,
          scopeRef,
        },
      },
    });

    if (existing?.status === "SIGNED") {
      return {
        signature: existing,
        alreadySigned: true as const,
        campaignName: file.campaign.name,
      };
    }

    const signature = existing
      ? await prisma.enrollmentSignature.update({
          where: { id: existing.id },
          data: {
            email,
            scopeRef,
            subjectLabel: subject.label,
            acceptanceText: subject.acceptanceText,
            confirmToken,
            batchToken: input.batchToken ?? existing.batchToken,
            status: "PENDING",
            requestedAt: new Date(),
            linkExpiresAt,
            confirmedAt: null,
            signerIp: null,
            userAgent: null,
          },
        })
      : await prisma.enrollmentSignature.create({
          data: {
            campaignId: file.campaignId,
            enrollmentFileId: file.id,
            fileToken: input.fileToken,
            email,
            emailHash,
            subjectKey: subject.key,
            scopeRef,
            subjectLabel: subject.label,
            acceptanceText: subject.acceptanceText,
            confirmToken,
            batchToken: input.batchToken ?? null,
            status: "PENDING",
            linkExpiresAt,
          },
        });

    if (!input.skipEmail) {
      await sendEnrollmentSignatureEmail({
        email,
        confirmToken,
        subjectLabel: subject.label,
        acceptanceText: subject.acceptanceText,
        campaignName: file.campaign.name,
      });
    }

    return {
      signature,
      alreadySigned: false as const,
      campaignName: file.campaign.name,
    };
  },

  /**
   * Crée / remet en PENDING toutes les clauses, un seul batchToken, un seul email.
   */
  async requestSignatureBatch(input: {
    fileToken: string;
    email: string;
    items: SignatureBatchItemInput[];
  }) {
    if (!input.items.length) {
      throw new Error("Aucune signature à demander");
    }

    const email = input.email.trim().toLowerCase();
    if (!email?.includes("@")) {
      throw new Error("Email invalide");
    }

    const batchToken = randomUUID();
    const linkExpiresAt = new Date(Date.now() + LINK_TTL_MS);
    const labels: string[] = [];
    let createdOrRefreshed = 0;
    let alreadySigned = 0;
    let campaignName = "";

    for (const item of input.items) {
      const result = await this.requestSignature({
        fileToken: input.fileToken,
        email,
        subjectKey: item.subjectKey,
        scopeRef: item.scopeRef,
        childName: item.childName,
        skipEmail: true,
        batchToken,
        linkExpiresAt,
      });
      campaignName = result.campaignName;
      if (result.alreadySigned) {
        alreadySigned += 1;
        // Lier aussi les déjà signées au lot pour affichage sur la page
        await prisma.enrollmentSignature.update({
          where: { id: result.signature.id },
          data: { batchToken },
        });
        labels.push(result.signature.subjectLabel);
      } else {
        createdOrRefreshed += 1;
        labels.push(result.signature.subjectLabel);
      }
    }

    if (createdOrRefreshed === 0 && alreadySigned === input.items.length) {
      return {
        batchToken,
        alreadyFullySigned: true as const,
        count: alreadySigned,
        labels,
      };
    }

    await sendEnrollmentSignatureBatchEmail({
      email,
      batchToken,
      campaignName,
      itemLabels: labels,
    });

    return {
      batchToken,
      alreadyFullySigned: false as const,
      count: createdOrRefreshed + alreadySigned,
      pendingCount: createdOrRefreshed,
      labels,
    };
  },

  async getByConfirmToken(confirmToken: string) {
    const signature = await prisma.enrollmentSignature.findUnique({
      where: { confirmToken },
      include: {
        campaign: {
          select: { id: true, name: true, startDate: true, endDate: true },
        },
      },
    });

    if (!signature) return null;

    if (
      signature.status === "PENDING" &&
      signature.linkExpiresAt &&
      signature.linkExpiresAt < new Date()
    ) {
      await prisma.enrollmentSignature.update({
        where: { id: signature.id },
        data: { status: "EXPIRED" },
      });
      return { ...signature, status: "EXPIRED" as const };
    }

    return signature;
  },

  async getBatchByToken(batchToken: string) {
    const rows = await prisma.enrollmentSignature.findMany({
      where: { batchToken },
      orderBy: { requestedAt: "asc" },
      include: {
        campaign: { select: { id: true, name: true } },
      },
    });

    if (rows.length === 0) return null;

    const expired =
      rows.some(
        (r) =>
          r.status === "PENDING" &&
          r.linkExpiresAt &&
          r.linkExpiresAt < new Date()
      ) ?? false;

    if (expired) {
      await prisma.enrollmentSignature.updateMany({
        where: {
          batchToken,
          status: "PENDING",
          linkExpiresAt: { lt: new Date() },
        },
        data: { status: "EXPIRED" },
      });
      return this.getBatchByToken(batchToken);
    }

    return {
      batchToken,
      email: rows[0].email,
      campaign: rows[0].campaign,
      linkExpiresAt: rows[0].linkExpiresAt,
      items: rows.map((r) => ({
        id: r.id,
        subjectKey: r.subjectKey,
        subjectLabel: r.subjectLabel,
        acceptanceText: r.acceptanceText,
        scopeRef: r.scopeRef,
        status: r.status,
        confirmedAt: r.confirmedAt,
        optional: OPTIONAL_CHILD_SIGNATURES.has(
          r.subjectKey as EnrollmentSignatureSubjectKey
        ),
      })),
    };
  },

  async confirmSignature(input: {
    confirmToken: string;
    accepted: boolean;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    if (!input.accepted) {
      throw new Error("Vous devez accepter pour valider la signature");
    }

    const signature = await this.getByConfirmToken(input.confirmToken);
    if (!signature) {
      throw new Error("Lien de signature invalide");
    }

    if (signature.status === "SIGNED") {
      return signature;
    }

    if (signature.status === "EXPIRED") {
      throw new Error("Ce lien de signature a expiré — redemandez un email");
    }

    return prisma.enrollmentSignature.update({
      where: { id: signature.id },
      data: {
        status: "SIGNED",
        confirmedAt: new Date(),
        signerIp: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
      include: {
        campaign: { select: { id: true, name: true } },
      },
    });
  },

  /**
   * Valide un lot : chaque item { id, accepted }.
   * accepted=false → DECLINED (autorisé pour les optionnels ; sinon erreur).
   */
  async confirmBatch(input: {
    batchToken: string;
    decisions: Array<{ id: string; accepted: boolean }>;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    const batch = await this.getBatchByToken(input.batchToken);
    if (!batch) {
      throw new Error("Lien de signatures invalide");
    }

    const byId = new Map(batch.items.map((i) => [i.id, i]));
    if (input.decisions.length !== batch.items.length) {
      throw new Error("Répondez à chaque clause avant de valider");
    }

    for (const d of input.decisions) {
      const item = byId.get(d.id);
      if (!item) {
        throw new Error("Clause inconnue dans ce lot");
      }
      if (item.status === "SIGNED" || item.status === "DECLINED") {
        continue;
      }
      if (item.status === "EXPIRED") {
        throw new Error("Ce lien a expiré — redemandez un email depuis le dossier");
      }
      if (!d.accepted && !item.optional) {
        throw new Error(
          `« ${item.subjectLabel} » est obligatoire : choisissez oui`
        );
      }
    }

    const now = new Date();
    const toUpdate = input.decisions.filter((d) => {
      const item = byId.get(d.id)!;
      return item.status !== "SIGNED" && item.status !== "DECLINED";
    });

    if (toUpdate.length > 0) {
      await prisma.$transaction(
        toUpdate.map((d) =>
          prisma.enrollmentSignature.update({
            where: { id: d.id },
            data: {
              status: d.accepted ? "SIGNED" : "DECLINED",
              confirmedAt: now,
              signerIp: input.ip ?? null,
              userAgent: input.userAgent ?? null,
            },
          })
        )
      );
    }

    return this.getBatchByToken(input.batchToken);
  },
};
