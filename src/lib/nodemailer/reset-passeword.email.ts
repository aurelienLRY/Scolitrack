import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";
import {
  emailButton,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

/**
 * Send a reset password email
 */
export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const bodyHtml = `
    <p style="margin:0 0 12px;">
      Vous avez demandé à réinitialiser votre mot de passe.
      Cliquez sur le bouton ci-dessous pour en définir un nouveau :
    </p>
    ${emailButton(resetUrl, "Réinitialiser mon mot de passe")}
    <p style="margin:0 0 8px;color:#526072;font-size:13px;">
      Ce lien expirera dans 1 heure.
    </p>
    <p style="margin:0;color:#526072;font-size:13px;">
      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
    </p>
  `;

  await sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    html: await renderEmailLayout({
      title: "Réinitialisation de votre mot de passe",
      bodyHtml,
      recipient: { email },
    }),
  });
}
