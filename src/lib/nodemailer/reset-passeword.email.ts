import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";

/**
 * Send a reset password email
 * @param email
 * @param token
 */
export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: `      
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #333;">Réinitialisation de votre mot de passe</h1>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
      </div>
      <div style="text-align: left;">
        <p>Cordialement,</p>
        <p>L'équipe de ${process.env.NEXT_PUBLIC_APP_NAME}</p>
      </div>
    `,
  };

  await sendMail(mailOptions);
}
