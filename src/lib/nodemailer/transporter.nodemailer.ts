import nodemailer from "nodemailer";

/**
 * Transporter for nodemailer
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send a mail
 * @param mailOptions
 * @returns
 */
const sendMail = async (mailOptions: nodemailer.SendMailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }
};

export { sendMail, transporter };
