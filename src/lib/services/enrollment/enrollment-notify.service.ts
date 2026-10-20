import { EnrollmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma/prisma";
import { PrivilegeName } from "@/config/privileges.config";
import { sendEnrollmentStaffSubmittedEmail } from "@/lib/nodemailer/enrollment-staff-submitted.email";
import {
  findUserIdsWithPrivilege,
  sendWebPushToUserIds,
} from "@/lib/services/web-push.service";

type NotifyFileContext = {
  id: string;
  email: string;
  token: string;
  familyId?: string | null;
  campaignName: string;
};

const PARENT_PUSH_COPY: Partial<
  Record<EnrollmentStatus, { title: string; message: string }>
> = {
  SUBMITTED: {
    title: "Dossier reçu",
    message: "Votre dossier d'inscription a bien été soumis.",
  },
  NEED_INFO: {
    title: "Informations demandées",
    message:
      "Des informations complémentaires sont nécessaires pour votre dossier.",
  },
  APPROVED: {
    title: "Dossier accepté",
    message: "Votre dossier d'inscription a été accepté.",
  },
  REJECTED: {
    title: "Dossier refusé",
    message: "Votre dossier d'inscription n'a pas pu être accepté.",
  },
};

/**
 * Résout les User parents susceptibles de recevoir un push
 * (même email que le dossier, ou membres de la famille liée).
 */
async function resolveParentUserIds(file: {
  email: string;
  familyId?: string | null;
}): Promise<string[]> {
  const ids = new Set<string>();

  const byEmail = await prisma.user.findMany({
    where: { email: file.email },
    select: { id: true },
  });
  for (const u of byEmail) ids.add(u.id);

  if (file.familyId) {
    const members = await prisma.familyMember.findMany({
      where: { familyId: file.familyId },
      select: { userId: true },
    });
    for (const m of members) ids.add(m.userId);
  }

  return [...ids];
}

/**
 * Alerte staff (email + push) : nouveau dossier soumis.
 */
export async function notifyStaffEnrollmentSubmitted(
  file: NotifyFileContext
): Promise<void> {
  const staff = await findUserIdsWithPrivilege(
    PrivilegeName.MANAGE_ENROLLMENTS
  );

  await Promise.allSettled(
    staff.map((user) =>
      sendEnrollmentStaffSubmittedEmail({
        to: user.email,
        campaignName: file.campaignName,
        familyEmail: file.email,
        fileId: file.id,
        recipientName: user.name,
      })
    )
  );

  await sendWebPushToUserIds(
    staff.map((u) => u.id),
    {
      title: "Dossier soumis",
      message: `${file.email} — ${file.campaignName}`,
      path: `/private/enrollment/files/${file.id}`,
      data: {
        type: "enrollment_submitted",
        fileId: file.id,
      },
    }
  );
}

/**
 * Push parent si un User abonné est identifiable (email / famille).
 */
export async function notifyParentEnrollmentStatusPush(params: {
  file: {
    id: string;
    email: string;
    token: string;
    familyId?: string | null;
  };
  newStatus: EnrollmentStatus;
  campaignName: string;
}): Promise<void> {
  const copy = PARENT_PUSH_COPY[params.newStatus];
  if (!copy) return;

  const userIds = await resolveParentUserIds(params.file);
  if (userIds.length === 0) return;

  await sendWebPushToUserIds(userIds, {
    title: copy.title,
    message: `${copy.message} (${params.campaignName})`,
    path: `/enrollment/${params.file.token}`,
    data: {
      type: "enrollment_status",
      status: params.newStatus,
      fileId: params.file.id,
    },
  });
}

/**
 * Soumission publique : staff (mail+push) + push parent si possible.
 * L'email parent de confirmation reste géré séparément.
 */
export async function notifyEnrollmentSubmitted(file: NotifyFileContext) {
  await Promise.allSettled([
    notifyStaffEnrollmentSubmitted(file),
    notifyParentEnrollmentStatusPush({
      file,
      newStatus: "SUBMITTED",
      campaignName: file.campaignName,
    }),
  ]);
}
