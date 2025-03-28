# Guide d'Implémentation du Chiffrement des Données avec Prisma

Ce guide explique comment implémenter un système de chiffrement transparent des données sensibles dans une application utilisant Prisma ORM.

## 1. Vue d'ensemble

Le système de chiffrement mis en place dans Scolitrack permet de :

- Chiffrer automatiquement certaines données sensibles avant leur stockage en base de données
- Déchiffrer automatiquement ces données lors de leur récupération
- Être transparent pour les développeurs qui utilisent Prisma
- Protéger les données sensibles même en cas d'accès non autorisé à la base de données

## 2. Architecture du système

Le système repose sur trois composants principaux :

1. **Service de chiffrement** (`crypto.service.ts`) : fournit les fonctions pour chiffrer/déchiffrer les données
2. **Client Prisma principal** (`prisma.ts`) : client Prisma avec middleware de chiffrement pour les opérations générales
3. **Client Prisma d'authentification** (`prismaForAuth.ts`) : client Prisma dédié à l'authentification, sans middleware de chiffrement

```plaintext
src/
├── lib/
│   ├── prisma/
│   │   ├── prisma.ts         # Client Prisma principal avec middleware de chiffrement
│   │   └── prismaForAuth.ts  # Client Prisma dédié à l'authentification (sans chiffrement)
│   └── services/
│       └── crypto.service.ts # Service de chiffrement/déchiffrement
```

### Pourquoi deux clients Prisma ?

La séparation en deux clients Prisma distincts offre plusieurs avantages :

1. **Évite les conflits** : Le middleware de chiffrement n'interfère pas avec les opérations d'authentification
2. **Optimisation des performances** : Le client d'authentification est plus léger (sans middleware)
3. **Séparation des préoccupations** : Chaque client a une responsabilité claire et distincte
4. **Prévention des erreurs** : Évite les problèmes potentiels avec NextAuth qui utilise son propre contexte Prisma

## 3. Service de chiffrement

Le service de chiffrement (`crypto.service.ts`) utilise l'algorithme AES (Advanced Encryption Standard) via la bibliothèque `crypto-js` :

```typescript
import crypto from "crypto-js";

const key = process.env.ENCRYPTION_KEY as string;

function encrypt(text: string | null | undefined) {
  if (!text) return text;
  const encrypted = crypto.AES.encrypt(text, key).toString();
  return "ENC:" + encrypted; // Préfixe pour identifier les données chiffrées
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
```

### Points importants :

1. **Clé de chiffrement** : stockée dans la variable d'environnement `ENCRYPTION_KEY`
2. **Préfixe "ENC:"** : permet d'identifier les données déjà chiffrées
3. **Gestion des valeurs null/undefined** : évite les erreurs sur les champs optionnels
4. **Gestion des erreurs** : prévient les plantages en cas d'erreur de déchiffrement

## 4. Clients Prisma et middleware

### 4.1 Client Prisma principal (avec chiffrement)

Le client Prisma principal (`prisma.ts`) est utilisé pour toutes les opérations générales et inclut le middleware de chiffrement :

```typescript
import { PrismaClient } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/services/crypto.service";

// Singleton pour Prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Middleware pour chiffrer/déchiffrer
prisma.$use(async (params, next) => {
  // Avant l'opération
  if (params.model === "User") {
    if (params.action === "create" || params.action === "update") {
      if (params.args.data?.name) {
        params.args.data.name = await encrypt(params.args.data.name);
      }
    }
  }

  // Exécution de la requête
  const result = await next(params);

  // Après l'opération - déchiffrement
  if (params.model === "User") {
    if (
      ["findMany", "findFirst", "findUnique", "count"].includes(params.action)
    ) {
      if (Array.isArray(result)) {
        // Pour findMany
        return result.map((user) => ({
          ...user,
          name: decrypt(user.name),
        }));
      } else if (result) {
        // Pour findFirst/findUnique
        return {
          ...result,
          name: decrypt(result.name),
        };
      }
    }
  }

  return result;
});
```

### 4.2 Client Prisma pour l'authentification (sans chiffrement)

Le client Prisma dédié à l'authentification (`prismaForAuth.ts`) est utilisé exclusivement par NextAuth et n'inclut pas de middleware de chiffrement :

```typescript
import { PrismaClient } from "@prisma/client";

/**
 * Prisma client pour l'authentification (sans middleware de chiffrement)
 */

// Singleton pour Prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 4.3 Utilisation appropriée des clients Prisma

Pour éviter les erreurs, il est important d'utiliser le bon client Prisma selon le contexte :

```typescript
// Pour l'authentification (sans chiffrement)
import { prisma } from "@/lib/prisma/prismaForAuth";

// Pour les opérations générales (avec chiffrement)
import { prisma } from "@/lib/prisma/prisma";
```

### Fonctionnement du middleware de chiffrement :

1. **Avant les opérations d'écriture** (`create`, `update`) :

   - Intercepte les données à sauvegarder
   - Chiffre les champs sensibles (ici, `name` sur le modèle `User`)

2. **Après les opérations de lecture** (`findMany`, `findFirst`, `findUnique`, `count`) :
   - Intercepte les résultats
   - Déchiffre les champs sensibles avant de les retourner
   - Gère différemment les résultats unitaires et les tableaux de résultats

## 5. Configuration et sécurité

### Clé de chiffrement

La clé de chiffrement doit être :

- Aléatoire et forte (au moins 32 octets / 256 bits)
- Stockée uniquement dans les variables d'environnement
- Différente pour chaque environnement (dev, staging, prod)
- Sauvegardée de manière sécurisée (pas dans le code)

Exemple de génération d'une clé sécurisée :

```typescript
// Script utilitaire pour générer une clé
import crypto from "crypto";
const key = crypto.randomBytes(32).toString("base64");
console.log(key); // Par exemple: "zIziwomhMPWYhuAOM5fguKlSExyT9sHISbgZl5POQB4A"
```

Configuration dans le fichier `.env` :

```env
ENCRYPTION_KEY="votre_clé_secrète_ici"
```

### Stockage des données chiffrées

Les colonnes qui contiendront des données chiffrées doivent :

- Être de type `TEXT` ou équivalent, car les données chiffrées sont plus longues
- Ne pas avoir de contraintes de longueur trop restrictives

## 6. Extension du système

Pour chiffrer d'autres champs ou modèles, modifiez le middleware Prisma :

```typescript
prisma.$use(async (params, next) => {
  // Avant l'opération - CHIFFREMENT
  if (params.action === "create" || params.action === "update") {
    // Modèle User
    if (params.model === "User") {
      if (params.args.data?.name) {
        params.args.data.name = await encrypt(params.args.data.name);
      }
      if (params.args.data?.email) {
        params.args.data.email = await encrypt(params.args.data.email);
      }
    }

    // Modèle Patient
    if (params.model === "Patient") {
      if (params.args.data?.medicalNotes) {
        params.args.data.medicalNotes = await encrypt(
          params.args.data.medicalNotes
        );
      }
    }
  }

  // Exécution de la requête
  const result = await next(params);

  // Après l'opération - DÉCHIFFREMENT
  if (
    ["findMany", "findFirst", "findUnique", "count"].includes(params.action)
  ) {
    // Modèle User
    if (params.model === "User" && result) {
      if (Array.isArray(result)) {
        return result.map((user) => ({
          ...user,
          name: decrypt(user.name),
          email: decrypt(user.email),
        }));
      } else {
        return {
          ...result,
          name: decrypt(result.name),
          email: decrypt(result.email),
        };
      }
    }

    // Modèle Patient
    if (params.model === "Patient" && result) {
      if (Array.isArray(result)) {
        return result.map((patient) => ({
          ...patient,
          medicalNotes: decrypt(patient.medicalNotes),
        }));
      } else {
        return {
          ...result,
          medicalNotes: decrypt(patient.medicalNotes),
        };
      }
    }
  }

  return result;
});
```

## 7. Limites et considérations

### Limitations techniques

1. **Performances** : Le chiffrement/déchiffrement a un impact sur les performances, surtout avec de grandes quantités de données.

2. **Recherches** : Il n'est pas possible de faire des recherches directes sur les champs chiffrés :

   ```typescript
   // Ceci ne fonctionnera PAS comme prévu
   const users = await prisma.user.findMany({
     where: { name: "Jean Dupont" },
   });
   ```

3. **Indexation** : Les champs chiffrés ne peuvent pas être efficacement indexés.

4. **Tri** : Le tri sur les champs chiffrés ne fonctionne pas comme attendu.

### Solutions de contournement

1. **Double stockage** : Pour les champs qui nécessitent des recherches, envisagez de stocker à la fois la version chiffrée et une version hachée.

2. **Champs de recherche dédiés** : Créez des champs spécifiques pour la recherche qui contiennent des versions non-chiffrées ou partiellement masquées.

3. **Filtrage côté application** : Récupérez plus de données et filtrez/triez après déchiffrement.

## 8. Rotation des clés et migration des données

Pour changer votre clé de chiffrement (recommandé périodiquement) :

1. **Création d'un script de migration** :

```typescript
async function reencryptData() {
  const oldKey = process.env.OLD_ENCRYPTION_KEY;
  const newKey = process.env.NEW_ENCRYPTION_KEY;

  // 1. Récupérer toutes les données
  const users = await prisma.user.findMany();

  // 2. Pour chaque enregistrement
  for (const user of users) {
    // 3. Déchiffrer avec l'ancienne clé
    const decryptedName = decryptWithKey(user.name, oldKey);

    // 4. Chiffrer avec la nouvelle clé
    const newEncryptedName = encryptWithKey(decryptedName, newKey);

    // 5. Mettre à jour l'enregistrement
    await prisma.user.update({
      where: { id: user.id },
      data: { name: newEncryptedName },
    });
  }
}
```

## 9. Tests et vérification

Voici un exemple de test pour vérifier que le chiffrement/déchiffrement fonctionne correctement :

```typescript
// test/crypto.test.ts
import { encrypt, decrypt } from "@/lib/services/crypto.service";

describe("Crypto Service", () => {
  test("should encrypt and decrypt data correctly", () => {
    const original = "Donnée sensible";
    const encrypted = encrypt(original);

    // Vérifier que la donnée est chiffrée
    expect(encrypted).not.toBe(original);
    expect(encrypted?.startsWith("ENC:")).toBe(true);

    // Vérifier que le déchiffrement fonctionne
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  test("should handle null and undefined values", () => {
    expect(encrypt(null)).toBe(null);
    expect(encrypt(undefined)).toBe(undefined);
    expect(decrypt(null)).toBe(null);
    expect(decrypt(undefined)).toBe(undefined);
  });

  test("should handle non-encrypted data", () => {
    const plainText = "Texte non chiffré";
    expect(decrypt(plainText)).toBe(plainText);
  });
});
```

## 10. Résumé et bonnes pratiques

### Résumé

1. **Architecture à deux clients Prisma** :

   - Client principal avec middleware de chiffrement pour les opérations générales
   - Client d'authentification dédié sans middleware pour NextAuth

2. **Chiffrement sécurisé** :
   - Utilisation de l'algorithme AES-256
   - Préfixe "ENC:" pour identifier les données chiffrées
   - Gestion des erreurs et des valeurs nulles

### Bonnes pratiques

1. **Utilisation correcte des clients** :

   - Utiliser `prismaForAuth.ts` uniquement pour l'authentification
   - Utiliser `prisma.ts` pour toutes les autres opérations nécessitant le chiffrement

2. **Sécurité de la clé** :

   - Stockez la clé dans les variables d'environnement
   - Ne versionnez jamais la clé
   - Utilisez une clé différente par environnement

3. **Minimisation des données sensibles** :

   - Ne chiffrez que les données réellement sensibles
   - Privilégiez des solutions côté DB pour les données moins sensibles (comme les contraintes d'accès)

4. **Plan de rotation des clés** :

   - Prévoyez un processus de rotation périodique
   - Gardez une copie sécurisée des anciennes clés pour les migrations

5. **Documentation** :

   - Documentez quels champs sont chiffrés
   - Indiquez les limites du système aux développeurs

6. **Sauvegarde** :
   - Assurez-vous que la clé est sauvegardée de manière sécurisée
   - Sans la clé, les données chiffrées sont irrécupérables
