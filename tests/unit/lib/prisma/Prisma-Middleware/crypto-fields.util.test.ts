import {
  decryptRecordFields,
  encryptDataFields,
  ENROLLMENT_FILE_SENSITIVE_FIELDS,
  MEDICAL_SENSITIVE_FIELDS,
  STUDENT_SENSITIVE_FIELDS,
  USER_SENSITIVE_FIELDS,
} from "@/lib/prisma/Prisma-Middleware/crypto-fields.util";
import { decrypt } from "@/lib/services/crypto.service";

describe("encryptDataFields", () => {
  it("chiffre uniquement les champs listés", () => {
    const data: Record<string, unknown> = {
      name: "Ada",
      email: "ada@example.com",
    };

    encryptDataFields(data, ["name"]);

    expect(String(data.name).startsWith("ENC:")).toBe(true);
    expect(decrypt(String(data.name))).toBe("Ada");
    expect(data.email).toBe("ada@example.com");
  });

  it("ignore une donnée absente ou un champ non textuel", () => {
    expect(() => encryptDataFields(undefined, ["name"])).not.toThrow();

    const data = { age: 12 };
    encryptDataFields(data, ["age"]);
    expect(data.age).toBe(12);
  });
});

describe("decryptRecordFields", () => {
  it("retourne une copie déchiffrée sans modifier l'original", () => {
    const record = { name: "Ada", city: "Lyon" };
    encryptDataFields(record, ["name"]);
    const encryptedName = record.name;

    const decrypted = decryptRecordFields(record, ["name", "city"]);

    expect(encryptedName.startsWith("ENC:")).toBe(true);
    expect(decrypted.name).toBe("Ada");
    expect(decrypted.city).toBe("Lyon");
    expect(record.name).toBe(encryptedName);
  });
});

describe("listes de champs sensibles", () => {
  it("n'inclut pas l'email utilisateur, utilisé en clair pour l'authentification", () => {
    expect(USER_SENSITIVE_FIELDS).not.toContain("email");
    expect(USER_SENSITIVE_FIELDS).toContain("name");
    expect(USER_SENSITIVE_FIELDS).toContain("phoneNumber");
  });

  it("couvre élève, médical et dossier d'inscription", () => {
    expect(STUDENT_SENSITIVE_FIELDS).toEqual(
      expect.arrayContaining(["firstName", "lastName", "insuranceNumber"])
    );
    expect(MEDICAL_SENSITIVE_FIELDS).toEqual(
      expect.arrayContaining(["healthDetails", "doctorName"])
    );
    expect(ENROLLMENT_FILE_SENSITIVE_FIELDS).toEqual(
      expect.arrayContaining(["email", "formPayload", "decisionNote"])
    );
  });
});
