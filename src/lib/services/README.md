# Services de l'application

## Service API (`api.service.ts`)

Ce service fournit des fonctions utilitaires pour standardiser les réponses API de l'application.

### Aperçu

Le service API assure la cohérence des réponses à travers toutes les routes API en fournissant :

1. Une structure de réponse uniforme
2. Des codes HTTP standardisés
3. Une gestion d'erreur centralisée
4. Des utilitaires pour les cas d'usage courants

### Structure de réponse standardisée

```typescript
interface ApiResponse<T = unknown> {
  success: boolean; // Indique si la requête a réussi
  data?: T; // Données de la réponse (optionnel)
  feedback?: string; // Message informatif pour l'utilisateur
  meta?: Record<string, unknown>; // Métadonnées (ex: pagination)
}
```

### Codes HTTP standardisés

Le service définit des constantes pour les codes HTTP couramment utilisés :

```typescript
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
```

### Fonctions utilitaires

#### `successResponse<T>`

Crée une réponse de succès (code 200 par défaut).

```typescript
successResponse({
  data: users,
  feedback: "Liste des utilisateurs récupérée avec succès",
  meta: { total: 100, page: 1 },
});
```

#### `createdResponse<T>`

Crée une réponse pour la création réussie d'une ressource (code 201).

```typescript
createdResponse({
  data: newUser,
  feedback: "Utilisateur créé avec succès",
});
```

#### `errorResponse<T>`

Crée une réponse d'erreur (code 400 par défaut).

```typescript
errorResponse({
  feedback: "Données invalides",
  status: HttpStatus.BAD_REQUEST,
});
```

#### `notFoundResponse`

Crée une réponse pour une ressource non trouvée (code 404).

```typescript
notFoundResponse("Utilisateur introuvable");
```

#### `handleApiError`

Gère les erreurs et produit une réponse appropriée en fonction du type d'erreur.

```typescript
try {
  // Code qui peut générer une erreur
} catch (error) {
  return handleApiError(error, "Erreur lors de la récupération des données");
}
```

Le gestionnaire d'erreur analyse automatiquement :

- Les erreurs de validation (status 400)
- Les erreurs de conflit/duplication (status 409)
- Les autres erreurs avec messages explicites (status 500)

### Exemple d'implémentation dans une route API

```typescript
import { NextRequest } from "next/server";
import { withPrivilege } from "@/lib/services/auth.service";
import { userService } from "@/lib/services/user.service";
import {
  successResponse,
  handleApiError,
  HttpStatus,
} from "@/lib/services/api.service";

export const GET = withPrivilege("VIEW_USER", async (request: NextRequest) => {
  try {
    const users = await userService.getUsers();

    return successResponse({
      data: users,
      feedback: "Utilisateurs récupérés avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des utilisateurs"
    );
  }
});
```

### Avantages de l'utilisation du service API

1. **Cohérence** : Format de réponse uniforme à travers toutes les API
2. **Maintenabilité** : Modifications centralisées de format et de comportement
3. **Lisibilité** : Code plus concis et plus expressif
4. **Expérience utilisateur** : Messages d'erreur cohérents et informatifs
5. **Typage** : Support complet de TypeScript pour la sécurité de type
