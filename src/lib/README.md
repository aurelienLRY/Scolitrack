# Dossier `lib/`

## Utilisation

Ce dossier contient les utilitaires, les fonctions de service et la logique métier réutilisable de l'application.

## Conventions de nommage

- Noms de fichiers : `camelCase.ts`
- Noms de fonctions : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`

## Structure

```plaintext
lib/
├── api/         # Fonctions d'appel API
├── utils/       # Fonctions utilitaires
└── db/          # Logique base de données
```

## Exemple

```typescript
// lib/api/auth.ts
export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
};

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
}
```

## Contenu type

- Fonctions d'aide (helpers)
- Configuration de la base de données
- Services d'API
- Utilitaires de validation
- Types et interfaces TypeScript partagés

## Bonnes pratiques

- Organiser le code en modules logiques
- Documenter les fonctions et leur utilisation
- Utiliser TypeScript pour un meilleur typage
- Éviter la duplication de code
