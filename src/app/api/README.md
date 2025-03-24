# Dossier `api/`

Contient les routes API (anciennement dans pages/api en Next.js 12).
Chaque sous-dossier ou fichier représente une endpoint.
Exemple : app/api/users/route.ts pour gérer les requêtes sur /api/users.

## API Routes de l'application

Ce dossier contient les routes API de l'application.

### Structure des routes

- `auth/` - Routes d'authentification

  - `[...nextauth]/` - Route principale de NextAuth.js
  - `forgot-password/` - Route pour la récupération de mot de passe
  - `reset-password/` - Route pour la réinitialisation de mot de passe

- `users/` - Routes de gestion des utilisateurs

  - `route.ts` - Route pour lister (GET) et créer (POST) des utilisateurs
  - `activate/` - Route pour activer un compte utilisateur et définir un mot de passe
  - `[id]/role/` - Route pour attribuer un rôle à un utilisateur (PUT)

- `setup-application/` - Routes pour la configuration de l'application

  - `roles/` - Routes pour gérer les rôles
    - `route.ts` - Route pour lister (GET) et créer (POST) des rôles
    - `[id]/route.ts` - Route pour récupérer (GET), mettre à jour (PUT) et supprimer (DELETE) un rôle
  - `privileges/` - Routes pour gérer les privilèges
    - `route.ts` - Route pour lister (GET) et créer (POST) des privilèges
    - `[id]/route.ts` - Route pour récupérer (GET), mettre à jour (PUT) et supprimer (DELETE) un privilège

- `notification/` - Routes pour les notifications push
  - `push/` - Route pour envoyer des notifications push
  - `subscribe/` - Route pour s'abonner aux notifications push
  - `unsubscribe/` - Route pour se désabonner des notifications push

### Format de réponse API standardisé

Toutes les API de l'application utilisent désormais un format de réponse standardisé défini dans `src/lib/services/api.service.ts`.

#### Structure de la réponse

```typescript
interface ApiResponse<T = unknown> {
  success: boolean; // Indique si la requête a réussi
  data?: T; // Données de la réponse (optionnel)
  feedback?: string; // Message informatif pour l'utilisateur
  meta?: Record<string, unknown>; // Métadonnées (ex: pagination)
}
```

#### Fonctions utilitaires pour les réponses

- `successResponse` : Réponse de succès (code 200)
- `createdResponse` : Réponse de création de ressource (code 201)
- `errorResponse` : Réponse d'erreur (code 4xx)
- `notFoundResponse` : Réponse de ressource non trouvée (code 404)
- `handleApiError` : Gestion générique des erreurs avec mapping des messages d'erreur

#### Exemple d'utilisation

```typescript
// Réponse de succès
return successResponse({
  data: users,
  feedback: "Liste des utilisateurs récupérée avec succès",
  meta: pagination,
});

// Réponse d'erreur
return errorResponse({
  feedback: "Accès non autorisé",
  status: HttpStatus.FORBIDDEN,
});
```

### Système de contrôle des privilèges

L'application utilise un système de contrôle d'accès basé sur les rôles et les privilèges.

#### Middleware d'authentification et autorisation

- `withPrivilege` : Middleware dans `src/lib/services/auth.service.ts` qui protège les routes API en vérifiant si l'utilisateur possède le privilège requis.

```typescript
// Protéger une route API avec un privilège
export const GET = withPrivilege("VIEW_USER", async (request) => {
  // Logique de la route ici
});
```

### Droits d'accès

- Routes publiques (ne nécessitent pas d'authentification) :

  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/users/activate`

- Routes protégées (nécessitent une authentification et des privilèges spécifiques) :
  - `GET /api/users` - Privilège requis: `VIEW_USER`
  - `POST /api/users` - Privilège requis: `CREATE_USER`
  - `PUT /api/users/[id]/role` - Privilège requis: `ASSIGN_ROLE`
  - `GET /api/setup-application/roles` - Privilège requis: `VIEW_ROLE`
  - `POST /api/setup-application/roles` - Privilège requis: `CREATE_ROLE`
  - `PUT /api/setup-application/roles/[id]` - Privilège requis: `UPDATE_ROLE`
  - `DELETE /api/setup-application/roles/[id]` - Privilège requis: `DELETE_ROLE`
  - `GET|POST|PUT|DELETE /api/setup-application/privileges/*` - Privilège requis: `SETUP_APPLICATION`
  - `POST /api/notification/push` - Admin/Super Admin uniquement
  - `POST /api/notification/subscribe` - Utilisateur authentifié
  - `POST /api/notification/unsubscribe` - Utilisateur authentifié

### Fonctionnalités d'inscription et de gestion des utilisateurs

1. **Création d'utilisateur par un administrateur**

   - Route: `POST /api/users`
   - Permissions requises: Privilège `CREATE_USER`
   - Description: Permet à un administrateur de créer un nouveau compte utilisateur
   - Fonctionnement:
     - L'admin remplit un formulaire avec le nom, l'email et le rôle de l'utilisateur
     - Le système génère un token d'activation et envoie un email d'invitation
     - L'utilisateur n'a pas de mot de passe à ce stade
   - Réponse: Confirmation de création du compte avec les détails de l'utilisateur

2. **Activation de compte par l'utilisateur invité**

   - Route: `POST /api/users/activate`
   - Permissions requises: Aucune (route publique)
   - Description: Permet à un utilisateur d'activer son compte via un lien reçu par email
   - Fonctionnement:
     - L'utilisateur clique sur le lien d'activation dans l'email
     - Il est redirigé vers la page `/activate-account` avec le token en paramètre
     - Il définit son mot de passe dans le formulaire d'activation
     - Le système valide le token, enregistre le mot de passe et marque le compte comme vérifié
   - Réponse: Confirmation d'activation du compte

3. **Liste des utilisateurs**
   - Route: `GET /api/users`
   - Permissions requises: Privilège `VIEW_USER`
   - Description: Récupère la liste des utilisateurs avec pagination
   - Paramètres: `page` (défaut: 1), `limit` (défaut: 10)
   - Réponse: Liste des utilisateurs avec pagination

### Gestion des rôles et privilèges

1. **Liste des rôles**

   - Route: `GET /api/setup-application/roles`
   - Privilège requis: `VIEW_ROLE`
   - Description: Récupère la liste de tous les rôles disponibles

2. **Création d'un rôle**

   - Route: `POST /api/setup-application/roles`
   - Privilège requis: `CREATE_ROLE`
   - Description: Crée un nouveau rôle avec des privilèges associés
   - Corps de la requête: `{ name, description, privilegeIds }`

3. **Modification d'un rôle**

   - Route: `PUT /api/setup-application/roles/[id]`
   - Privilège requis: `UPDATE_ROLE`
   - Description: Met à jour les informations d'un rôle existant
   - Corps de la requête: `{ name, description, privilegeIds }`

4. **Suppression d'un rôle**

   - Route: `DELETE /api/setup-application/roles/[id]`
   - Privilège requis: `DELETE_ROLE`
   - Description: Supprime un rôle existant (sauf s'il est permanent)

5. **Attribuer un rôle à un utilisateur**
   - Route: `PUT /api/users/[id]/role`
   - Privilège requis: `ASSIGN_ROLE`
   - Description: Attribue un rôle à un utilisateur existant
   - Corps de la requête: `{ roleName }`

## Structure

- `users/route.ts` : Gestion des utilisateurs
- `auth/route.ts` : Authentification
- `[id]/route.ts` : Gestion des endpoints dynamiques
- `[...params]/route.ts` : Gestion des endpoints dynamiques avec plusieurs paramètres
- `.../route.ts` : Autres endpoints

## Bonnes pratiques

- Chaque endpoint doit être dans son propre fichier
- Utiliser TypeScript pour le typage des données
- Documenter les endpoints et leurs utilisations
- Utiliser les fonctions d'api.service.ts pour standardiser les réponses
- Protéger les routes avec le middleware withPrivilege approprié

## Convention de nommage

- `route.ts` : fichier principal pour l'endpoint

## exemple

```bash
app/api/
├── users/
│   └── route.ts   // GET, POST, etc. sur /api/users
├── auth/
│   └── route.ts   // POST /api/auth (login, logout, etc.)
└── ...
```

Dans route.ts, vous pouvez exporter des fonctions GET, POST, etc.
Exemple rapide :

```ts
// app/api/users/route.ts
import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/db";

export async function GET() {
  const users = await getAllUsers();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const data = await req.json();
  // logiques de création d'utilisateur
  return NextResponse.json({ success: true });
}
```
