import { LoginSchema } from "@/schemas/LoginSchema";
import { ActivateAccountSchema } from "@/schemas/UserSchema";
import { educationLevelSchema } from "@/schemas/educationLevelSchema";

describe("LoginSchema", () => {
  it("accepte des identifiants valides", async () => {
    await expect(
      LoginSchema.validate({
        email: "ada@example.com",
        password: "secret",
      })
    ).resolves.toEqual({
      email: "ada@example.com",
      password: "secret",
    });
  });

  it("refuse un email invalide", async () => {
    await expect(
      LoginSchema.validate({ email: "pas-un-email", password: "secret" })
    ).rejects.toThrow("Email invalide");
  });

  it("refuse un mot de passe manquant", async () => {
    await expect(
      LoginSchema.validate({ email: "ada@example.com", password: "" })
    ).rejects.toThrow("Mot de passe requis");
  });
});

describe("ActivateAccountSchema", () => {
  const valid = {
    password: "Secret1!",
    confirmPassword: "Secret1!",
    token: "token-1",
  };

  it("accepte un mot de passe conforme", async () => {
    await expect(ActivateAccountSchema.validate(valid)).resolves.toMatchObject(
      valid
    );
  });

  it("refuse un mot de passe trop simple", async () => {
    await expect(
      ActivateAccountSchema.validate({ ...valid, password: "secret", confirmPassword: "secret" })
    ).rejects.toThrow(/au moins 8 caractères|majuscule/);
  });

  it("refuse une confirmation différente", async () => {
    await expect(
      ActivateAccountSchema.validate({ ...valid, confirmPassword: "Autre1!" })
    ).rejects.toThrow("Les mots de passe ne correspondent pas");
  });
});

describe("educationLevelSchema", () => {
  it("accepte un code en majuscules", async () => {
    await expect(
      educationLevelSchema.validate({
        name: "Cours préparatoire",
        code: "CP",
        establishmentId: "est-1",
      })
    ).resolves.toMatchObject({ code: "CP" });
  });

  it("refuse un code en minuscules", async () => {
    await expect(
      educationLevelSchema.validate({
        name: "Cours préparatoire",
        code: "cp",
        establishmentId: "est-1",
      })
    ).rejects.toThrow(/2 et 10 caractères/);
  });
});
