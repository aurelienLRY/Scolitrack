import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";

/**
 * Envoie un email d'invitation pour l'activation d'un compte
 * @param email - Email du destinataire
 * @param name - Nom du destinataire
 * @param token - Token d'activation
 */
export async function sendAccountActivationEmail(
  email: string,
  name: string,
  token: string
) {
  const activationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/activate-account?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Activation de votre compte Scolitrack",
    html: `      
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="color: #333;">Bienvenue sur Scolitrack !</h1>
        <p>Bonjour ${name},</p>
        <p>Un compte a été créé pour vous sur la plateforme Scolitrack. Veuillez cliquer sur le bouton ci-dessous pour activer votre compte et définir votre mot de passe :</p>
        <p style="margin: 20px 0;">
          <a href="${activationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Activer mon compte
          </a>
        </p>
        <p>Ce lien expirera dans 72 heures. Si vous ne parvenez pas à cliquer sur le bouton, copiez et collez l'URL suivante dans votre navigateur :</p>
        <p style="background-color: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${activationUrl}
        </p>
        <p>Si vous n'avez pas demandé ce compte, vous pouvez ignorer cet email.</p>
      </div>
      <div style="text-align: left; margin-top: 20px;">
        <p>Cordialement,</p>
        <p>L'équipe de ${process.env.NEXT_PUBLIC_APP_NAME || "Scolitrack"}</p>
      </div>
    `,
  };

  await sendMail(mailOptions);
}
