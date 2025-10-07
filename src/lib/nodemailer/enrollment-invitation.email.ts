import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";

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

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Inscription scolaire - ${campaignName}`,
    html: `      
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #333;">Inscription scolaire</h1>
        <h2 style="color: #4F46E5;">${campaignName}</h2>
        <p>Vous êtes invité(e) à compléter un dossier d'inscription pour la campagne <strong>"${campaignName}"</strong>.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour accéder à votre dossier d'inscription :</p>
        <p style="margin: 20px 0;">
          <a href="${enrollmentUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Compléter mon dossier d'inscription
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Ce lien est personnel et sécurisé. Ne le partagez pas avec d'autres personnes.
        </p>
        <p style="color: #666; font-size: 14px;">
          Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.
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
