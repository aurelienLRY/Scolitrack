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

- `notification/` - Routes pour les notifications push
  - `push/` - Route pour envoyer des notifications push
  - `subscribe/` - Route pour s'abonner aux notifications push
  - `unsubscribe/` - Route pour se désabonner des notifications push

### Droits d'accès

- Routes publiques (ne nécessitent pas d'authentification) :

  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `POST /api/users/activate`

- Routes protégées (nécessitent une authentification) :
  - `GET /api/users` - Admin/Super Admin uniquement
  - `POST /api/users` - Admin/Super Admin uniquement
  - `POST /api/notification/push` - Admin/Super Admin uniquement
  - `POST /api/notification/subscribe` - Utilisateur authentifié
  - `POST /api/notification/unsubscribe` - Utilisateur authentifié

### Fonctionnalités d'inscription et de gestion des utilisateurs

1. **Création d'utilisateur par un administrateur**

   - Route: `POST /api/users`
   - Permissions requises: Admin ou Super Admin
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
   - Permissions requises: Admin ou Super Admin
   - Description: Récupère la liste des utilisateurs avec pagination
   - Paramètres: `page` (défaut: 1), `limit` (défaut: 10)
   - Réponse: Liste des utilisateurs avec pagination

## Structure

- `users/route.ts` : Gestion des utilisateurs
- `auth/route.ts` : Authentification
- `[id]/route.ts` : Gestion des endpoints dynamiques
- `[...params]/route.ts` : Gestion des endpoints dynamiques avec plusieurs paramètres
- `.../route.ts` : Autres endpoints

## Bonnes pratiques

- Chaque endpoint doit être dans son propre fichier
- Utiliser TypeScript pour le typage des données
- Documenter les endpoints et les utilisations

## convention de nommage

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
