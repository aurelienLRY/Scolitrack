import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";
import {
  EMAIL_COLORS,
  emailButton,
  escapeEmailHtml,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

type EnrollmentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "NEED_INFO"
  | "APPROVED"
  | "REJECTED";

/**
 * Send an enrollment status change notification email
 */
export async function sendEnrollmentStatusChangeEmail(
  email: string,
  token: string,
  campaignName: string,
  newStatus: EnrollmentStatus,
  note?: string
) {
  const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enrollment/${token}`;
  const safeCampaign = escapeEmailHtml(campaignName);
  const safeNote = note ? escapeEmailHtml(note) : "";

  let title = "";
  let emailContent = "";
  let buttonText = "";
  let buttonColor = EMAIL_COLORS.primary;

  switch (newStatus) {
    case "SUBMITTED":
      title = `Confirmation de réception — ${campaignName}`;
      emailContent = `
        <p style="margin:0 0 12px;">Nous avons bien reçu votre dossier d'inscription pour la campagne <strong>"${safeCampaign}"</strong>.</p>
        <p style="margin:0 0 12px;">Votre dossier est actuellement en cours d'examen par notre équipe administrative.</p>
        <p style="margin:0;">Vous serez informé(e) de l'avancement de votre dossier.</p>
      `;
      buttonText = "Consulter mon dossier";
      break;

    case "NEED_INFO":
      title = `Informations complémentaires requises — ${campaignName}`;
      emailContent = `
        <p style="margin:0 0 12px;">Nous avons besoin d'informations complémentaires concernant votre dossier d'inscription pour la campagne <strong>"${safeCampaign}"</strong>.</p>
        ${
          safeNote
            ? `<div style="background-color:#FEF3C7;padding:15px;border-radius:6px;margin:15px 0;">
          <p style="margin:0;font-weight:bold;color:#92400E;">Message de l'administration :</p>
          <p style="margin:5px 0 0;color:#92400E;">${safeNote}</p>
        </div>`
            : ""
        }
        <p style="margin:0;">Veuillez cliquer sur le bouton ci-dessous pour accéder à votre dossier et apporter les modifications nécessaires :</p>
      `;
      buttonText = "Modifier mon dossier";
      buttonColor = "#F59E0B";
      break;

    case "APPROVED":
      title = `Dossier d'inscription accepté — ${campaignName}`;
      emailContent = `
        <p style="margin:0 0 12px;">Nous avons le plaisir de vous informer que votre dossier d'inscription pour la campagne <strong>"${safeCampaign}"</strong> a été accepté.</p>
        ${
          safeNote
            ? `<div style="background-color:#D1FAE5;padding:15px;border-radius:6px;margin:15px 0;">
          <p style="margin:0;font-weight:bold;color:#065F46;">Message de l'administration :</p>
          <p style="margin:5px 0 0;color:#065F46;">${safeNote}</p>
        </div>`
            : ""
        }
        <p style="margin:0;">Vous pouvez consulter les détails de votre dossier en cliquant sur le bouton ci-dessous :</p>
      `;
      buttonText = "Consulter mon dossier";
      buttonColor = "#10B981";
      break;

    case "REJECTED":
      title = `Dossier d'inscription refusé — ${campaignName}`;
      emailContent = `
        <p style="margin:0 0 12px;">Nous sommes au regret de vous informer que votre dossier d'inscription pour la campagne <strong>"${safeCampaign}"</strong> n'a pas pu être accepté.</p>
        ${
          safeNote
            ? `<div style="background-color:#FEE2E2;padding:15px;border-radius:6px;margin:15px 0;">
          <p style="margin:0;font-weight:bold;color:#991B1B;">Motif du refus :</p>
          <p style="margin:5px 0 0;color:#991B1B;">${safeNote}</p>
        </div>`
            : ""
        }
        <p style="margin:0;">Pour toute question, veuillez contacter notre administration.</p>
      `;
      buttonText = "Consulter mon dossier";
      buttonColor = "#EF4444";
      break;

    default:
      return;
  }

  const bodyHtml = `
    ${emailContent}
    ${buttonText ? emailButton(fileUrl, buttonText, buttonColor) : ""}
    <p style="margin:16px 0 0;color:#526072;font-size:13px;">
      Ce lien est personnel et sécurisé. Ne le partagez pas avec d'autres personnes.
    </p>
  `;

  await sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: title.replace(/ — /g, " - "),
    html: await renderEmailLayout({
      title,
      bodyHtml,
      recipient: { email },
    }),
  });
}
