import { sendMail } from "@/lib/nodemailer/transporter.nodemailer";
import {
  emailButton,
  escapeEmailHtml,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

/**
 * Un seul email pour signer plusieurs clauses sur une page.
 */
export async function sendEnrollmentSignatureBatchEmail(input: {
  email: string;
  batchToken: string;
  campaignName: string;
  itemLabels: string[];
}) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/enrollment/sign/batch/${input.batchToken}`;
  const safeCampaign = escapeEmailHtml(input.campaignName);
  const safeEmail = escapeEmailHtml(input.email);
  const list = input.itemLabels
    .map((l) => `<li style="margin:0 0 4px;">${escapeEmailHtml(l)}</li>`)
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 8px;">Campagne : <strong>${safeCampaign}</strong></p>
    <p style="margin:0 0 12px;">
      Bonjour, merci de signer vos autorisations d'inscription en une seule fois
      (${safeEmail}).
    </p>
    <p style="margin:0 0 8px;font-weight:600;">Documents / clauses concernés :</p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.45;">
      ${list}
    </ul>
    <p style="margin:0 0 8px;">
      Sur la page, lisez chaque texte, choisissez <strong>oui</strong> ou
      <strong>non</strong> selon le cas, puis validez en bas de page.
    </p>
    ${emailButton(confirmUrl, "Ouvrir la page de signatures", "#0f766e")}
    <p style="margin:16px 0 0;color:#526072;font-size:13px;">
      Ce lien est personnel et expire après quelques jours. Ne le transférez pas.
    </p>
  `;

  await sendMail({
    from: process.env.SMTP_FROM,
    to: input.email,
    subject: `Signatures d'inscription — ${input.campaignName}`,
    html: await renderEmailLayout({
      title: "Vos signatures d'inscription",
      bodyHtml,
      recipient: { email: input.email },
    }),
  });
}
