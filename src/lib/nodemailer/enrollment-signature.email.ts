import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";
import {
  emailButton,
  escapeEmailHtml,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

/**
 * Email de confirmation de signature (lien unique à cliquer).
 */
export async function sendEnrollmentSignatureEmail(input: {
  email: string;
  confirmToken: string;
  subjectLabel: string;
  acceptanceText: string;
  campaignName: string;
}) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enrollment/sign/${input.confirmToken}`;
  const safeCampaign = escapeEmailHtml(input.campaignName);
  const safeLabel = escapeEmailHtml(input.subjectLabel);
  const safeEmail = escapeEmailHtml(input.email);
  // Texte d'acceptation : déjà du contenu métier (peut contenir du HTML simple)
  const acceptanceText = input.acceptanceText;

  const bodyHtml = `
    <p style="margin:0 0 8px;">Campagne : <strong>${safeCampaign}</strong></p>
    <p style="margin:0 0 12px;">Document / clause : <strong>${safeLabel}</strong></p>
    <div style="background:#f4f6f8;padding:14px;border-radius:6px;margin:16px 0;font-size:14px;line-height:1.5;border:1px solid #d5dbe3;">
      ${acceptanceText}
    </div>
    <p style="margin:0 0 8px;">
      Pour confirmer que c'est bien vous (${safeEmail}), ouvrez le lien ci-dessous,
      cochez la case d'acceptation, puis validez.
    </p>
    ${emailButton(confirmUrl, "Signer / confirmer", "#0f766e")}
    <p style="margin:16px 0 0;color:#526072;font-size:13px;">
      Ce lien est personnel et expire après quelques jours. Ne le transférez pas.
    </p>
  `;

  await sendMail({
    from: process.env.SMTP_FROM,
    to: input.email,
    subject: `Signature requise — ${input.subjectLabel}`,
    html: await renderEmailLayout({
      title: "Confirmation de signature",
      bodyHtml,
      recipient: { email: input.email },
    }),
  });
}
