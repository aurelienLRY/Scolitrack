import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";
import {
  emailButton,
  escapeEmailHtml,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

/**
 * Send an enrollment invitation email
 * @param email - Email address of the recipient
 * @param token - Unique token for the enrollment file
 * @param campaignName - Name of the enrollment campaign
 */
export async function sendEnrollmentInvitationEmail(
  email: string,
  token: string,
  campaignName: string
) {
  const enrollmentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enrollment/${token}`;
  const safeCampaign = escapeEmailHtml(campaignName);

  const bodyHtml = `
    <p style="margin:0 0 12px;">
      Vous êtes invité(e) à compléter un dossier d'inscription pour la campagne
      <strong>"${safeCampaign}"</strong>.
    </p>
    <p style="margin:0 0 12px;">
      Veuillez cliquer sur le bouton ci-dessous pour accéder à votre dossier d'inscription :
    </p>
    ${emailButton(enrollmentUrl, "Compléter mon dossier d'inscription")}
    <p style="margin:16px 0 0;color:#526072;font-size:13px;">
      Ce lien est personnel et sécurisé. Ne le partagez pas avec d'autres personnes.
    </p>
    <p style="margin:8px 0 0;color:#526072;font-size:13px;">
      Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.
    </p>
  `;

  await sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Inscription scolaire - ${campaignName}`,
    html: await renderEmailLayout({
      title: `Inscription scolaire — ${campaignName}`,
      bodyHtml,
      recipient: { email },
    }),
  });
}
