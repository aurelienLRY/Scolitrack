import {
  ENROLLMENT_SIGNATURE_POST_MIDDLEWARE,
  ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE,
} from "@/lib/prisma/Prisma-Middleware/EnrollmentSignatureMiddleware";
import { decrypt } from "@/lib/services/crypto.service";
import type { PrismaMiddlewareParams } from "@/lib/prisma/prisma-middleware.types";

function params(
  overrides: Partial<PrismaMiddlewareParams>
): PrismaMiddlewareParams {
  return {
    model: "EnrollmentSignature",
    action: "create",
    args: { data: {} },
    ...overrides,
  };
}

describe("ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE", () => {
  it("chiffre l'email en create/update", () => {
    const data = { email: "parent@example.com", subjectKey: "FICHE1_HORAIRES" };

    ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE(
      params({ action: "create", args: { data } })
    );

    expect(String(data.email).startsWith("ENC:")).toBe(true);
    expect(decrypt(data.email)).toBe("parent@example.com");
  });

  it("n'agit pas sur un autre modèle", () => {
    const data = { email: "parent@example.com" };
    ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE(
      params({ model: "User", args: { data } })
    );
    expect(data.email).toBe("parent@example.com");
  });
});

describe("ENROLLMENT_SIGNATURE_POST_MIDDLEWARE", () => {
  it("déchiffre un enregistrement unique", () => {
    const encrypted = { email: "clair@example.com", id: "1" };
    ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE(
      params({ args: { data: encrypted } })
    );

    const result = ENROLLMENT_SIGNATURE_POST_MIDDLEWARE(
      params({ action: "findUnique" }),
      encrypted as never
    );

    expect(result?.email).toBe("clair@example.com");
  });

  it("déchiffre une liste", () => {
    const rows = [
      { id: "1", email: "a@example.com" },
      { id: "2", email: "b@example.com" },
    ];
    rows.forEach((row) =>
      ENROLLMENT_SIGNATURE_PRE_MIDDLEWARE(params({ args: { data: row } }))
    );

    const result = ENROLLMENT_SIGNATURE_POST_MIDDLEWARE(
      params({ action: "findMany" }),
      rows as never
    ) as Array<{ email: string }>;

    expect(result.map((r) => r.email)).toEqual([
      "a@example.com",
      "b@example.com",
    ]);
  });
});
