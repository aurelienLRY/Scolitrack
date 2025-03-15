# Dossier `api/`

Contient les routes API (anciennement dans pages/api en Next.js 12).
Chaque sous-dossier ou fichier représente une endpoint.
Exemple : app/api/users/route.ts pour gérer les requêtes sur /api/users.

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
  // logiques de création d’utilisateur
  return NextResponse.json({ success: true });
}
```
