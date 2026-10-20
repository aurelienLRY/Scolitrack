import { decrypt, encrypt, safeDecrypt } from "@/lib/services/crypto.service";

describe("encrypt", () => {
  it("préfixe le texte chiffré", () => {
    const encrypted = encrypt("Ada Lovelace");

    expect(encrypted?.startsWith("ENC:")).toBe(true);
    expect(encrypted).not.toContain("Ada Lovelace");
  });

  it("ne rechiffre pas une valeur déjà préfixée", () => {
    const encrypted = encrypt("secret");

    expect(encrypt(encrypted)).toBe(encrypted);
  });

  it("laisse passer null et une chaîne vide", () => {
    expect(encrypt(null)).toBeNull();
    expect(encrypt("")).toBe("");
  });
});

describe("decrypt", () => {
  it("restaure le texte d'origine", () => {
    expect(decrypt(encrypt("Marie Curie"))).toBe("Marie Curie");
  });

  it("retourne le texte clair tel quel", () => {
    expect(decrypt("déjà lisible")).toBe("déjà lisible");
  });

  it("retire un préfixe en trop sur un double chiffrement", () => {
    expect(decrypt("ENC:ENC:payload")).toBe("ENC:payload");
  });

  it("laisse passer null", () => {
    expect(decrypt(null)).toBeNull();
  });
});

describe("safeDecrypt", () => {
  it("retourne null pour une valeur vide", () => {
    expect(safeDecrypt(null)).toBeNull();
    expect(safeDecrypt(undefined)).toBeNull();
  });

  it("déchiffre une valeur préfixée", () => {
    expect(safeDecrypt(encrypt("0612345678"))).toBe("0612345678");
  });
});
