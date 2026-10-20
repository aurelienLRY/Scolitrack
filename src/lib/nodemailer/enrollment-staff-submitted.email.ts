import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";
import {
  emailButton,
  escapeEmailHtml,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

/**
 * Email interne : nouveau dossier d'inscription soumis (staff).
 */
export async function sendEnrollmentStaffSubmittedEmail(params: {
  to: string;
  campaignName: string;
  familyEmail: string;
  fileId: string;
  recipientName?: string | null;
}) {
  const { to, campaignName, familyEmail, fileId, recipientName } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const fileUrl = `${appUrl}/private/enrollment/files/${fileId}`;
  const safeCampaign = escapeEmailHtml(campaignName);
  const safeEmail = escapeEmailHtml(familyEmail);

  const bodyHtml = `
    <p style="margin:0 0 12px;">
      Un dossier d'inscription vient d'être <strong>soumis</strong> pour la campagne
      <strong>"${safeCampaign}"</strong>.
    </p>
    <p style="margin:0 0 12px;">
      Contact famille : <strong>${safeEmail}</strong>
    </p>
    <p style="margin:0 0 12px;">
      Vous pouvez l'examiner dès maintenant dans l'espace privé :
    </p>
    ${emailButton(fileUrl, "Ouvrir le dossier")}
  `;

  await sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Nouveau dossier soumis - ${campaignName}`,
    html: await renderEmailLayout({
      title: `Nouveau dossier soumis — ${campaignName}`,
      bodyHtml,
      recipient: {
        email: to,
        displayName: recipientName ?? undefined,
      },
    }),
  });
}
