import { prisma } from "@/lib/prisma/prisma";

const BRAND_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Scolitrack";
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

/** Couleurs alignées sur la charte Scolitrack (mode clair, emails) */
const COLORS = {
  primary: "#3545d6",
  dark: "#0e1a27",
  muted: "#526072",
  border: "#d5dbe3",
  background: "#f4f6f8",
  white: "#ffffff",
  accent: "#7a5600",
} as const;

export type EmailEstablishment = {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toAbsoluteUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!APP_URL) return pathOrUrl;
  return `${APP_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Établissement unique de l'installation (premier créé).
 */
export async function getEmailEstablishment(): Promise<EmailEstablishment | null> {
  const establishment = await prisma.establishment.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      name: true,
      address: true,
      postalCode: true,
      city: true,
      email: true,
      phone: true,
      website: true,
      logoUrl: true,
    },
  });

  return establishment;
}

/** Destinataire affiché en pied de mail (mentions légales). */
export type EmailRecipient = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  /** Remplace prénom + nom s'il est fourni */
  displayName?: string | null;
};

export type RenderEmailLayoutOptions = {
  /** Titre affiché sous le header (objet du mail) */
  title: string;
  /** Corps HTML du message (sans header/footer) */
  bodyHtml: string;
  /** Précharge établissement si déjà récupéré */
  establishment?: EmailEstablishment | null;
  /**
   * Destinataire prévu du message (affiché en petit en bas).
   * Fortement recommandé pour tous les mails.
   */
  recipient?: EmailRecipient | null;
};

/**
 * Adresse de repli si le destinataire n'est pas la bonne personne.
 * EMAIL_MISDIRECTED_REPLY_TO → email établissement → SMTP_FROM
 */
export function getMisdirectedReplyEmail(
  establishmentEmail?: string | null
): string {
  return (
    process.env.EMAIL_MISDIRECTED_REPLY_TO?.trim() ||
    establishmentEmail?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    ""
  );
}

function formatRecipientLabel(recipient: EmailRecipient): string {
  const email = recipient.email.trim();
  const fromParts = [recipient.firstName, recipient.lastName]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
    .join(" ");
  const name =
    (recipient.displayName && recipient.displayName.trim()) || fromParts;
  if (name) {
    return `${escapeHtml(name)} (${escapeHtml(email)})`;
  }
  return escapeHtml(email);
}

function buildRecipientLegalNotice(input: {
  recipient: EmailRecipient;
  replyTo: string;
}): string {
  const destined = formatRecipientLabel(input.recipient);
  const reply = input.replyTo.trim();
  const replyLink = reply
    ? `<a href="mailto:${escapeHtml(reply)}" style="color:${COLORS.muted};text-decoration:underline;">${escapeHtml(reply)}</a>`
    : "l'administration de l'établissement";

  return `
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid ${COLORS.border};">
      <p style="margin:0 0 6px;font-size:10px;line-height:1.45;color:${COLORS.muted};">
        Cet email est destiné à <strong style="color:${COLORS.muted};">${destined}</strong>.
      </p>
      <p style="margin:0;font-size:10px;line-height:1.45;color:${COLORS.muted};">
        Si vous n'êtes pas le destinataire prévu, merci de ne pas en tenir compte,
        de ne pas utiliser les informations ou liens qu'il contient, et d'en informer
        l'expéditeur en écrivant à ${replyLink}.
      </p>
    </div>
  `.trim();
}

/**
 * Enveloppe le contenu dans un template HTML commun (header + footer).
 */
export async function renderEmailLayout({
  title,
  bodyHtml,
  establishment: establishmentProp,
  recipient,
}: RenderEmailLayoutOptions): Promise<string> {
  const establishment =
    establishmentProp !== undefined
      ? establishmentProp
      : await getEmailEstablishment();

  const schoolName = establishment?.name
    ? escapeHtml(establishment.name)
    : escapeHtml(BRAND_NAME);
  const logoUrl = toAbsoluteUrl(establishment?.logoUrl);
  const safeTitle = escapeHtml(title);
  const replyTo = getMisdirectedReplyEmail(establishment?.email);
  const recipientNotice =
    recipient?.email?.trim()
      ? buildRecipientLegalNotice({ recipient, replyTo })
      : "";

  const addressLine = establishment
    ? escapeHtml(
        `${establishment.address}, ${establishment.postalCode} ${establishment.city}`
      )
    : null;

  const contactParts: string[] = [];
  if (establishment?.phone) {
    contactParts.push(escapeHtml(establishment.phone));
  }
  if (establishment?.email) {
    const mail = escapeHtml(establishment.email);
    contactParts.push(
      `<a href="mailto:${mail}" style="color:${COLORS.primary};text-decoration:none;">${mail}</a>`
    );
  }
  if (establishment?.website) {
    const site = escapeHtml(establishment.website);
    const href = establishment.website.startsWith("http")
      ? establishment.website
      : `https://${establishment.website}`;
    contactParts.push(
      `<a href="${escapeHtml(href)}" style="color:${COLORS.primary};text-decoration:none;">${site}</a>`
    );
  }

  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${schoolName}" width="48" height="48" style="display:block;border-radius:8px;width:48px;height:48px;object-fit:cover;" />`
    : `<div style="width:48px;height:48px;border-radius:8px;background:${COLORS.primary};color:${COLORS.white};font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;line-height:48px;text-align:center;">${schoolName.charAt(0).toUpperCase()}</div>`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.background};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.background};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${COLORS.white};border-radius:12px;overflow:hidden;border:1px solid ${COLORS.border};">
          <!-- Header -->
          <tr>
            <td style="background-color:${COLORS.dark};padding:20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="56" valign="middle" style="padding-right:14px;">
                    ${logoBlock}
                  </td>
                  <td valign="middle">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:${COLORS.white};line-height:1.3;">
                      ${schoolName}
                    </p>
                    <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#b7c3d0;line-height:1.3;">
                      via <span style="color:#e7a906;font-weight:bold;">${escapeHtml(BRAND_NAME)}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td style="height:4px;background-color:${COLORS.primary};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0;font-size:22px;font-weight:bold;color:${COLORS.dark};line-height:1.3;">
                ${safeTitle}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:8px 28px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${COLORS.dark};">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 28px;background-color:${COLORS.background};border-top:1px solid ${COLORS.border};font-family:Arial,Helvetica,sans-serif;">
              ${
                establishment
                  ? `
              <p style="margin:0 0 6px;font-size:14px;font-weight:bold;color:${COLORS.dark};">
                ${schoolName}
              </p>
              ${
                addressLine
                  ? `<p style="margin:0 0 4px;font-size:12px;color:${COLORS.muted};line-height:1.4;">${addressLine}</p>`
                  : ""
              }
              ${
                contactParts.length
                  ? `<p style="margin:0 0 12px;font-size:12px;color:${COLORS.muted};line-height:1.4;">${contactParts.join(" · ")}</p>`
                  : `<p style="margin:0 0 12px;"></p>`
              }
              `
                  : ""
              }
              <p style="margin:0;font-size:11px;color:${COLORS.muted};line-height:1.4;">
                Message envoyé via <strong style="color:${COLORS.dark};">${escapeHtml(BRAND_NAME)}</strong>
                — logiciel de gestion scolaire.
              </p>
              ${recipientNotice}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

/**
 * Bouton CTA compatible clients mail.
 */
export function emailButton(
  href: string,
  label: string,
  backgroundColor: string = COLORS.primary
): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;">
      <tr>
        <td align="center" bgcolor="${backgroundColor}" style="border-radius:6px;">
          <a href="${escapeHtml(href)}"
             style="display:inline-block;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${COLORS.white};text-decoration:none;border-radius:6px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}

export { COLORS as EMAIL_COLORS, escapeHtml as escapeEmailHtml };
