import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  getMisdirectedReplyEmail,
  renderEmailLayout,
} from "@/lib/nodemailer/email-layout";

vi.mock("@/lib/prisma/prisma", () => ({
  prisma: {
    establishment: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

describe("getMisdirectedReplyEmail", () => {
  const prev = { ...process.env };

  afterEach(() => {
    process.env = { ...prev };
  });

  it("priorise EMAIL_MISDIRECTED_REPLY_TO", () => {
    process.env.EMAIL_MISDIRECTED_REPLY_TO = "repli@ecole.fr";
    process.env.SMTP_FROM = "noreply@app.fr";
    expect(getMisdirectedReplyEmail("etab@ecole.fr")).toBe("repli@ecole.fr");
  });

  it("retombe sur l'email établissement puis SMTP_FROM", () => {
    delete process.env.EMAIL_MISDIRECTED_REPLY_TO;
    process.env.SMTP_FROM = "noreply@app.fr";
    expect(getMisdirectedReplyEmail("etab@ecole.fr")).toBe("etab@ecole.fr");
    expect(getMisdirectedReplyEmail(null)).toBe("noreply@app.fr");
  });
});

describe("renderEmailLayout — destinataire", () => {
  beforeEach(() => {
    process.env.EMAIL_MISDIRECTED_REPLY_TO = "contact@ecole.fr";
    process.env.NEXT_PUBLIC_APP_NAME = "Scolitrack";
  });

  it("affiche le destinataire avec nom + email et l'adresse de repli", async () => {
    const html = await renderEmailLayout({
      title: "Test",
      bodyHtml: "<p>Corps</p>",
      establishment: null,
      recipient: {
        email: "jean@exemple.com",
        firstName: "Jean",
        lastName: "Dupont",
      },
    });

    expect(html).toContain("Cet email est destiné à");
    expect(html).toContain("Jean Dupont");
    expect(html).toContain("jean@exemple.com");
    expect(html).toContain("contact@ecole.fr");
    expect(html).toContain(
      "Si vous n'êtes pas le destinataire prévu"
    );
  });

  it("affiche seulement l'email s'il n'y a pas de nom", async () => {
    const html = await renderEmailLayout({
      title: "Test",
      bodyHtml: "<p>Corps</p>",
      establishment: null,
      recipient: { email: "seul@exemple.com" },
    });

    expect(html).toContain("seul@exemple.com");
    expect(html).not.toContain("()");
  });
});
