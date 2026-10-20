import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

/**
 * Retire les guillemets éventuels autour d'une valeur .env (ex: "secret")
 */
function stripQuotes(value: string | undefined): string | undefined {
  if (!value) return value;
  const t = value.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parsePort(): number {
  const p = Number(process.env.SMTP_PORT);
  return Number.isFinite(p) && p > 0 ? p : 465;
}

/**
 * Port 465 = SSL direct (secure: true)
 * Port 587 = STARTTLS (secure: false, requireTLS: true)
 * SMTP_SECURE=true|false peut forcer (optionnel)
 */
function buildTransportOptions(): SMTPTransport.Options {
  const port = parsePort();
  const secureEnv = process.env.SMTP_SECURE?.toLowerCase();
  let secure: boolean;
  if (secureEnv === "true") secure = true;
  else if (secureEnv === "false") secure = false;
  else secure = port === 465;

  const host = stripQuotes(process.env.SMTP_HOST);
  const user = stripQuotes(process.env.SMTP_USER);
  const pass = stripQuotes(process.env.SMTP_PASSWORD);

  const options: SMTPTransport.Options = {
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  };

  if (!secure && port === 587) {
    options.requireTLS = true;
  }

  return options;
}

const transporter = nodemailer.createTransport(buildTransportOptions());

function formatSmtpError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const e = error as { code?: string; response?: string; responseCode?: number };
    const parts = [
      e.code && `code=${e.code}`,
      e.responseCode && `smtp=${e.responseCode}`,
      e.response && String(e.response).slice(0, 200),
    ].filter(Boolean);
    if (parts.length) return `Échec SMTP (${parts.join(" — ")})`;
  }
  if (error instanceof Error) return error.message;
  return "Échec d'envoi de l'email";
}

/**
 * Send a mail
 */
const sendMail = async (mailOptions: nodemailer.SendMailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("[nodemailer]", error);
    throw new Error(formatSmtpError(error));
  }
};

export { sendMail, transporter };
