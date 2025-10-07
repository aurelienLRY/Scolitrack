import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";

type EnrollmentStatus = "DRAFT" | "SUBMITTED" | "NEED_INFO" | "APPROVED" | "REJECTED";

/**
 * Send an enrollment status change notification email
 * @param email - Email address of the recipient
 * @param token - Unique token for the enrollment file
 * @param campaignName - Name of the enrollment campaign
 * @param newStatus - New status of the enrollment file
 * @param note - Optional note from the administration
 */
export async function sendEnrollmentStatusChangeEmail(
  email: string,
  token: string,
  campaignName: string,
  newStatus: EnrollmentStatus,
  note?: string
) {
  const fileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enrollment/${token}`;

  let emailTitle = "";
  let emailContent = "";
  let buttonText = "";
  let buttonColor = "#4F46E5";

  switch (newStatus) {
    case "SUBMITTED":
      emailTitle = `Confirmation de réception - ${campaignName}`;
      emailContent = `
        <p>Nous avons bien reçu votre dossier d'inscription pour la campagne <strong>"${campaignName}"</strong>.</p>
        <p>Votre dossier est actuellement en cours d'examen par notre équipe administrative.</p>
        <p>Vous serez informé(e) de l'avancement de votre dossier.</p>
      `;
      buttonText = "Consulter mon dossier";
      break;

    case "NEED_INFO":
      emailTitle = `Informations complémentaires requises - ${campaignName}`;
      emailContent = `
        <p>Nous avons besoin d'informations complémentaires concernant votre dossier d'inscription pour la campagne <strong>"${campaignName}"</strong>.</p>
        ${note ? `<div style="background-color: #FEF3C7; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400E;">Message de l'administration :</p>
          <p style="margin: 5px 0 0 0; color: #92400E;">${note}</p>
        </div>` : ""}
        <p>Veuillez cliquer sur le lien ci-dessous pour accéder à votre dossier et apporter les modifications nécessaires :</p>
      `;
      buttonText = "Modifier mon dossier";
      buttonColor = "#F59E0B";
      break;

    case "APPROVED":
      emailTitle = `Dossier d'inscription accepté - ${campaignName}`;
      emailContent = `
        <p>Nous avons le plaisir de vous informer que votre dossier d'inscription pour la campagne <strong>"${campaignName}"</strong> a été accepté.</p>
        ${note ? `<div style="background-color: #D1FAE5; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #065F46;">Message de l'administration :</p>
          <p style="margin: 5px 0 0 0; color: #065F46;">${note}</p>
        </div>` : ""}
        <p>Vous pouvez consulter les détails de votre dossier en cliquant sur le lien ci-dessous :</p>
      `;
      buttonText = "Consulter mon dossier";
      buttonColor = "#10B981";
      break;

    case "REJECTED":
      emailTitle = `Dossier d'inscription refusé - ${campaignName}`;
      emailContent = `
        <p>Nous sommes au regret de vous informer que votre dossier d'inscription pour la campagne <strong>"${campaignName}"</strong> n'a pas pu être accepté.</p>
        ${note ? `<div style="background-color: #FEE2E2; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #991B1B;">Motif du refus :</p>
          <p style="margin: 5px 0 0 0; color: #991B1B;">${note}</p>
        </div>` : ""}
        <p>Pour toute question, veuillez contacter notre administration.</p>
      `;
      buttonText = "Contacter l'administration";
      buttonColor = "#EF4444";
      break;

    default:
      return; // Ne pas envoyer d'email pour les autres transitions
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: emailTitle,
    html: `      
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #333;">${emailTitle}</h1>
        <div style="text-align: left; margin: 20px 0;">
          ${emailContent}
        </div>
        ${buttonText ? `
          <p style="margin: 20px 0;">
            <a href="${fileUrl}" 
               style="background-color: ${buttonColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              ${buttonText}
            </a>
          </p>
        ` : ""}
        <p style="color: #666; font-size: 14px;">
          Ce lien est personnel et sécurisé. Ne le partagez pas avec d'autres personnes.
        </p>
      </div>
      <div style="text-align: left; margin-top: 30px;">
        <p>Cordialement,</p>
        <p>L'équipe administrative de ${process.env.NEXT_PUBLIC_APP_NAME}</p>
      </div>
    `,
  };

  await sendMail(mailOptions);
}
