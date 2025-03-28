import crypto from "crypto-js";

const key = process.env.ENCRYPTION_KEY as string;

function encrypt(text: string | null | undefined) {
  if (!text) return text;
  const encrypted = crypto.AES.encrypt(text, key).toString();
  return "ENC:" + encrypted;
}

function decrypt(text: string | null | undefined) {
  // Vérification avec l'opérateur de nullish
  if (!text) return text;
  try {
    const isCrypted = text.split(":")[0] === "ENC";
    if (isCrypted) {
      const ciphertext = text.slice(4); // Retire le préfixe
      const bytes = crypto.AES.decrypt(ciphertext, key);
      return bytes.toString(crypto.enc.Utf8);
    }
    // La donnée n'est pas chiffrée, on la retourne telle quelle
    return text;
  } catch (error) {
    console.error("Erreur de déchiffrement:", error);
    return text; // En cas d'erreur, on retourne le texte original
  }
}

export { encrypt, decrypt };
