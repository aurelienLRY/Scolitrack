import * as CryptoJs from "crypto-js";

const key = process.env.ENCRYPTION_KEY as string;
const PREFIX = "ENC:"; // Préfixe standard pour identifier les données chiffrées

/**
 * Chiffre une chaîne de texte
 * @param text Texte à chiffrer
 * @returns Texte chiffré avec préfixe ou texte original si null/undefined
 */
function encrypt(text: string | null | undefined) {
  if (!text) return text;
  try {
    // Si le texte est déjà chiffré, ne pas le rechiffrer
    if (text.startsWith(PREFIX)) {
      return text;
    }
    const encrypted = CryptoJs.AES.encrypt(text, key).toString();
    const result = PREFIX + encrypted;
    return result;
  } catch (error) {
    console.error("Erreur de chiffrement:", error);
    return text; // En cas d'erreur, retourner le texte original
  }
}

/**
 * Déchiffre une chaîne de texte
 * @param text Texte à déchiffrer
 * @returns Texte déchiffré ou texte original si non chiffré/erreur
 */
function decrypt(text: string | null | undefined) {
  try {
    if (!text) return text;

    // Nettoyer le texte (enlever les espaces qui pourraient s'être glissés)
    const cleanText = text.trim();

    // Vérifier si le texte est chiffré (commence par le préfixe)
    if (cleanText.startsWith(PREFIX)) {
      try {
        // Cas particulier: texte doublement chiffré "ENC:ENC:..."
        if (cleanText.startsWith(PREFIX + PREFIX)) {
          const doubleEncrypted = cleanText.slice(PREFIX.length);
          // Retourner avec un seul préfixe pour tenter de déchiffrer au prochain passage
          return doubleEncrypted;
        }

        // Extraire la partie chiffrée sans le préfixe et nettoyer
        const ciphertext = cleanText.slice(PREFIX.length).trim();

        // Vérification de la validité du texte chiffré (doit être du Base64 valide)
        const isValidBase64 = /^[A-Za-z0-9+/=]+$/.test(
          ciphertext.replace(/\s/g, "")
        );
        if (!isValidBase64) {
          console.warn(
            "Format de texte chiffré invalide:",
            ciphertext.substring(0, 20) + "..."
          );
          return cleanText; // Texte mal formaté, retourner tel quel
        }

        // Déchiffrer
        const bytes = CryptoJs.AES.decrypt(ciphertext, key);

        // Convertir en texte
        const decrypted = bytes.toString(CryptoJs.enc.Utf8);

        // Si le résultat du déchiffrement est vide ou invalide, retourner le texte original
        if (!decrypted || decrypted.length === 0) {
          console.warn("Déchiffrement a produit une chaîne vide");
          return cleanText.replace(PREFIX, ""); // Enlever le préfixe pour éviter de futurs échecs
        }

        return decrypted;
      } catch (decryptError) {
        console.warn("Erreur spécifique de déchiffrement:", decryptError);
        return cleanText.replace(PREFIX, ""); // Enlever le préfixe pour éviter de futurs échecs
      }
    }

    return cleanText; // Retourner le texte original s'il n'est pas chiffré
  } catch (error) {
    console.error("Erreur générale de déchiffrement:", error);
    return text; // En cas d'erreur, retourner le texte original
  }
}

/**
 * Version sécurisée de decrypt, avec gestion des erreurs et vérification du type
 * Utilisée par les middlewares pour éviter la duplication de code
 * @param value Valeur à déchiffrer
 * @returns Valeur déchiffrée ou null si non déchiffrable
 */
function safeDecrypt(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const decrypted = decrypt(value);
    return typeof decrypted === "string" ? decrypted : null;
  } catch (error) {
    console.error("Erreur dans safeDecrypt:", error);
    return value; // En cas d'échec, retourner la valeur originale
  }
}

export { encrypt, decrypt, safeDecrypt };
