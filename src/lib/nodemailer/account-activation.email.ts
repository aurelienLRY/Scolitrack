import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";
import {
  emailButton,
  escapeEmailHtml,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

/**
 * Envoie un email d'invitation pour l'activation d'un compte
 */
export async function sendAccountActivationEmail(
  email: string,
  name: string,
  token: string
) {
  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/activate-account?token=${token}`;
  const safeName = escapeEmailHtml(name);
  const brand = process.env.NEXT_PUBLIC_APP_NAME || "Scolitrack";

  const bodyHtml = `
    <p style="margin:0 0 12px;">Bonjour ${safeName},</p>
    <p style="margin:0 0 12px;">
      Un compte a été créé pour vous sur la plateforme ${escapeEmailHtml(brand)}.
      Veuillez cliquer sur le bouton ci-dessous pour activer votre compte et définir votre mot de passe :
    </p>
    ${emailButton(activationUrl, "Activer mon compte")}
    <p style="margin:0 0 8px;color:#526072;font-size:13px;">
      Ce lien expirera dans 72 heures. Si le bouton ne fonctionne pas, copiez et collez l'URL suivante dans votre navigateur :
    </p>
    <p style="margin:0 0 12px;background-color:#f4f6f8;padding:10px;border-radius:6px;word-break:break-all;font-size:12px;color:#526072;border:1px solid #d5dbe3;">
      ${escapeEmailHtml(activationUrl)}
    </p>
    <p style="margin:0;color:#526072;font-size:13px;">
      Si vous n'avez pas demandé ce compte, vous pouvez ignorer cet email.
    </p>
  `;

  await sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Activation de votre compte ${brand}`,
    html: await renderEmailLayout({
      title: `Bienvenue sur ${brand}`,
      bodyHtml,
      recipient: { email, displayName: name },
    }),
  });
}
