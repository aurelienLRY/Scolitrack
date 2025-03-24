# Guide d'Implémentation et d'Utilisation du Système de Rôles et Privilèges pour Scolitrack

Ce guide explique comment utiliser et étendre le système de rôles et privilèges dynamiques mis en place dans le projet Scolitrack.

## 1. Structure des Fichiers

```plaintext
src/
├── lib/
│   ├── auth/
│   │   ├── auth.ts            # Configuration principale d'authentification
│   │   ├── auth.config.ts     # Callbacks pour JWT avec rôles et privilèges
│   │   └── authMiddleware.ts  # Middleware d'autorisation
│   └── services/
│       ├── role.service.ts    # Service de gestion des rôles
│       └── privilege.service.ts  # Service de gestion des privilèges
├── hooks/
│   └── useAuthorization.ts    # Hooks pour vérifier les privilèges côté client
├── components/
│   └── auth/
│       └── Authorization.tsx  # Composant pour l'UI conditionnelle
├── app/
│   └── api/
│       ├── roles/             # API de gestion des rôles
│       │   ├── route.ts       # Liste et création de rôles
│       │   └── [id]/route.ts  # Détails, mise à jour et suppression d'un rôle
│       ├── privileges/        # API de gestion des privilèges
│       │   ├── route.ts       # Liste et création de privilèges
│       │   └── [id]/route.ts  # Détails, mise à jour et suppression d'un privilège
│       └── users/
│           └── [id]/role/     # API pour attribuer un rôle à un utilisateur
└── types/
    └── next-auth.d.ts        # Types personnalisés pour Next-Auth

prisma/
├── schema.prisma             # Modèles de données pour les rôles et privilèges
└── seed.ts                   # Initialisation des rôles et privilèges de base
```

## 2. Modèle de Données

Le système utilise quatre modèles principaux :

### Table `Role`

| Champ         | Type    | Description                                                   |
| ------------- | ------- | ------------------------------------------------------------- |
| `id`          | UUID    | Identifiant unique du rôle                                    |
| `name`        | String  | Nom unique du rôle (ex. `SUPER_ADMIN`, `ADMIN`, `USER`)       |
| `isPermanent` | Boolean | Indique si le rôle est permanent et ne peut pas être supprimé |
| `description` | String? | Description optionnelle du rôle                               |

### Table `Privilege`

| Champ         | Type    | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| `id`          | UUID    | Identifiant unique du privilège             |
| `name`        | String  | Nom unique du privilège (ex. `CREATE_USER`) |
| `description` | String? | Description optionnelle du privilège        |

### Table `RolePrivilege` (table de jonction)

| Champ         | Type | Description                 |
| ------------- | ---- | --------------------------- |
| `roleId`      | UUID | Référence l'ID du rôle      |
| `privilegeId` | UUID | Référence l'ID du privilège |

### Table `User` (modifiée)

| Champ      | Type   | Description                                              |
| ---------- | ------ | -------------------------------------------------------- |
| `roleName` | String | Référence le nom du rôle (remplace l'ancien enum `role`) |

## 3. Rôles Permanents et Privilèges Par Défaut

### Rôles Permanents

Trois rôles sont définis comme permanents et ne peuvent pas être supprimés :

1. **SUPER_ADMIN** : Possède automatiquement tous les privilèges, même ceux ajoutés après sa création
2. **ADMIN** : Possède un ensemble défini de privilèges (modifiable)
3. **USER** : Rôle par défaut avec privilèges minimaux

### Privilèges Par Défaut

Les privilèges suivants sont créés par défaut dans le seed :

| Privilège           | Description                       | Rôles par défaut   |
| ------------------- | --------------------------------- | ------------------ |
| `CREATE_USER`       | Créer un utilisateur              | SUPER_ADMIN, ADMIN |
| `UPDATE_USER`       | Modifier un utilisateur           | SUPER_ADMIN, ADMIN |
| `DELETE_USER`       | Supprimer un utilisateur          | SUPER_ADMIN, ADMIN |
| `VIEW_USER`         | Voir les utilisateurs             | SUPER_ADMIN, ADMIN |
| `CREATE_ROLE`       | Créer un rôle                     | SUPER_ADMIN        |
| `UPDATE_ROLE`       | Modifier un rôle                  | SUPER_ADMIN        |
| `DELETE_ROLE`       | Supprimer un rôle                 | SUPER_ADMIN        |
| `VIEW_ROLE`         | Voir les rôles                    | SUPER_ADMIN, ADMIN |
| `ASSIGN_ROLE`       | Assigner un rôle à un utilisateur | SUPER_ADMIN, ADMIN |
| `MANAGE_PRIVILEGES` | Gérer les privilèges              | SUPER_ADMIN        |

## 4. Utilisation dans les Composants UI

### Composant d'Autorisation

Le composant `Authorization` permet de conditionner l'affichage d'éléments UI en fonction des privilèges :

```tsx
import Authorization from "@/components/auth/Authorization";

function AdminPanel() {
  return (
    <div>
      <h1>Tableau de bord</h1>

      {/* Affichage conditionnel avec un seul privilège */}
      <Authorization privilege="VIEW_USER">
        <UserList />
      </Authorization>

      {/* Privilèges multiples - l'utilisateur doit avoir les deux (AND) */}
      <Authorization privileges={["CREATE_USER", "UPDATE_USER"]} requireAll>
        <button>Gérer les utilisateurs</button>
      </Authorization>

      {/* Privilèges multiples - l'utilisateur doit avoir au moins un (OR) */}
      <Authorization privileges={["CREATE_ROLE", "UPDATE_ROLE"]}>
        <button>Gérer les rôles</button>
      </Authorization>

      {/* Afficher un contenu alternatif si l'utilisateur n'a pas les privilèges */}
      <Authorization
        privilege="DELETE_ROLE"
        fallback={<p>Accès non autorisé</p>}
      >
        <DangerZone />
      </Authorization>

      {/* Afficher un loader pendant la vérification */}
      <Authorization
        privilege="MANAGE_PRIVILEGES"
        loadingComponent={<Spinner />}
      >
        <PrivilegeManager />
      </Authorization>
    </div>
  );
}
```

### Hooks d'Autorisation

Trois hooks sont disponibles pour vérifier les privilèges dans les composants :

```tsx
import {
  useHasPrivilege,
  useHasAnyPrivilege,
  useHasAllPrivileges,
} from "@/hooks/useAuthorization";

function CustomComponent() {
  // Vérifier un seul privilège
  const { isAuthorized, isLoading } = useHasPrivilege("CREATE_USER");

  // Vérifier si l'utilisateur a au moins un privilège parmi plusieurs (OR)
  const { isAuthorized: canManageUsers } = useHasAnyPrivilege([
    "CREATE_USER",
    "UPDATE_USER",
    "DELETE_USER",
  ]);

  // Vérifier si l'utilisateur a tous les privilèges spécifiés (AND)
  const { isAuthorized: isFullAdmin } = useHasAllPrivileges([
    "MANAGE_ROLES",
    "MANAGE_PRIVILEGES",
  ]);

  return (
    <div>
      {isLoading ? (
        <p>Chargement...</p>
      ) : isAuthorized ? (
        <button>Créer un utilisateur</button>
      ) : null}

      {canManageUsers && <UserManagementTools />}

      {isFullAdmin && <AdminControls />}
    </div>
  );
}
```

## 5. Sécurisation des Routes API

### Middleware d'Autorisation

Pour protéger les routes API, utilisez le middleware `withPrivilege` depuis le service d'authentification :

```tsx
// app/api/users/route.ts
import { NextRequest } from "next/server";
import { withPrivilege } from "@/lib/services/auth.service";
import { successResponse, handleApiError } from "@/lib/services/api.service";

// Route protégée par le privilège VIEW_USER
export const GET = withPrivilege("VIEW_USER", async (request: NextRequest) => {
  try {
    // Votre logique de récupération d'utilisateurs ici
    const users = await getUsersFromDatabase();
    return successResponse({
      data: users,
      feedback: "Liste des utilisateurs récupérée avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des utilisateurs"
    );
  }
});

// Route protégée par le privilège CREATE_USER
export const POST = withPrivilege(
  "CREATE_USER",
  async (request: NextRequest) => {
    try {
      const data = await request.json();
      // Votre logique de création d'utilisateur ici
      const user = await createUser(data);
      return createdResponse({
        data: user,
        feedback: "Utilisateur créé avec succès",
      });
    } catch (error) {
      return handleApiError(
        error,
        "Erreur lors de la création de l'utilisateur"
      );
    }
  }
);
```

Le middleware `withPrivilege` :

1. Vérifie si l'utilisateur est authentifié
2. Vérifie si l'utilisateur a le privilège requis
3. Exécute le gestionnaire de route si autorisé, sinon renvoie une erreur 403

### Format de Réponse API Standardisé

Toutes les routes API utilisent désormais un format de réponse standardisé via le service `api.service.ts` :

```typescript
// Réponse de succès
return successResponse({
  data: user,
  feedback: "Utilisateur trouvé",
});

// Réponse d'erreur
return errorResponse({
  feedback: "Identifiants incorrects",
  status: HttpStatus.UNAUTHORIZED,
});

// Ressource non trouvée
return notFoundResponse("Utilisateur introuvable");

// Gestion d'erreur
return handleApiError(error, "Erreur lors de la connexion");
```

Structure de réponse :

```json
{
  "success": true,
  "data": { ... },
  "feedback": "Message pour l'utilisateur",
  "meta": { ... } // Métadonnées optionnelles (pagination, etc.)
}
```

### Routes API disponibles

Le système comprend les routes API suivantes pour la gestion des rôles et privilèges :

#### Routes pour les rôles

```typescript
// GET /api/setup-application/roles - Liste tous les rôles
// Privilège requis: VIEW_ROLE
export const GET = withPrivilege("VIEW_ROLE", async () => {
  try {
    const roles = await roleService.getAllRoles();
    return successResponse({
      data: roles,
      feedback: "Liste des rôles récupérée avec succès",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la récupération des rôles");
  }
});

// POST /api/setup-application/roles - Crée un nouveau rôle
// Privilège requis: CREATE_ROLE
export const POST = withPrivilege("CREATE_ROLE", async (req: NextRequest) => {
  try {
    const data = await req.json();
    const { name, description, privilegeIds } = data;
    // ...
    return createdResponse({
      data: role,
      feedback: "Rôle créé avec succès",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la création du rôle");
  }
});
```

#### Routes pour les privilèges

```typescript
// GET /api/setup-application/privileges - Liste tous les privilèges
// Privilège requis: SETUP_APPLICATION
export const GET = withPrivilege("SETUP_APPLICATION", async () => {
  try {
    const privileges = await privilegeService.getAllPrivileges();
    return successResponse({
      data: privileges,
      feedback: "Liste des privilèges récupérée avec succès",
    });
  } catch (error) {
    return handleApiError(
      error,
      "Erreur lors de la récupération des privilèges"
    );
  }
});

// POST /api/setup-application/privileges - Crée un nouveau privilège
// Privilège requis: SETUP_APPLICATION
export const POST = withPrivilege(
  "SETUP_APPLICATION",
  async (req: NextRequest) => {
    try {
      const data = await req.json();
      const { name, description } = data;
      // ...
      return createdResponse({
        data: privilege,
        feedback: "Privilège créé avec succès",
      });
    } catch (error) {
      return handleApiError(error, "Erreur lors de la création du privilège");
    }
  }
);
```

#### Routes pour l'attribution de rôles

```typescript
// PUT /api/users/[id]/role - Assigne un rôle à un utilisateur
// Privilège requis: ASSIGN_ROLE
export const PUT = withPrivilege("ASSIGN_ROLE", async (req: NextRequest) => {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const userId = pathSegments[pathSegments.indexOf("users") + 1];
    const data = await req.json();
    const { roleName } = data;
    // ...
    return successResponse({
      data: updatedUser,
      feedback: `Rôle '${roleName}' attribué avec succès à l'utilisateur`,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de l'attribution du rôle");
  }
});
```

### Protection des routes API spécifiques

Pour les cas plus complexes, vous pouvez utiliser le middleware global pour restreindre l'accès à certaines routes API en fonction des privilèges de l'utilisateur. Ceci est configuré dans le fichier `middleware.ts` :

```typescript
// Définir les routes d'API nécessitant des privilèges spécifiques
const API_PRIVILEGE_ROUTES = [
  { path: "/api/users", privilege: "VIEW_USER", method: "GET" },
  { path: "/api/users", privilege: "CREATE_USER", method: "POST" },
  { path: "/api/users/:id/role", privilege: "ASSIGN_ROLE", method: "PUT" },
  // ...
];

// Vérifier si l'utilisateur a accès à la route API
async function verifyApiRoutePermission(req: NextRequest, session: Session) {
  const path = req.nextUrl.pathname;
  const method = req.method;

  // Vérifier si la route nécessite un privilège spécifique
  const matchingRoute = API_PRIVILEGE_ROUTES.find((route) => {
    return (
      path.startsWith(route.path) && (route.method === method || !route.method)
    );
  });

  if (matchingRoute) {
    // Super admin a accès à tout
    if (session.user.roleName === "SUPER_ADMIN") {
      return true;
    }

    // Vérifier si l'utilisateur a le privilège requis
    return session.user.privileges.includes(matchingRoute.privilege);
  }

  // Aucune restriction pour cette route
  return true;
}
```

## 6. Gestion des Rôles et Privilèges via les Services

### Service de Rôles

Le `roleService` fournit toutes les fonctions nécessaires pour gérer les rôles :

```typescript
import { roleService } from "@/lib/services/role.service";

// Récupérer tous les rôles
const roles = await roleService.getAllRoles();

// Récupérer un rôle par son ID
const role = await roleService.getRoleById(roleId);

// Récupérer un rôle par son nom
const roleByName = await roleService.getRoleByName(roleName);

// Créer un nouveau rôle
const newRole = await roleService.createRole({
  name: "MANAGER",
  description: "Gestionnaire d'équipe",
  privilegeIds: ["privilege1", "privilege2"],
});

// Mettre à jour un rôle
const updatedRole = await roleService.updateRole(roleId, {
  name: "TEAM_MANAGER",
  description: "Nouveau nom de rôle",
  privilegeIds: ["privilege1", "privilege2", "privilege3"],
});

// Supprimer un rôle
await roleService.deleteRole(roleId);

// Assigner un rôle à un utilisateur
await roleService.assignRoleToUser(userId, roleName);
```

### Service de Privilèges

Le `privilegeService` fournit toutes les fonctions nécessaires pour gérer les privilèges :

```typescript
import { privilegeService } from "@/lib/services/privilege.service";

// Récupérer tous les privilèges
const privileges = await privilegeService.getAllPrivileges();

// Récupérer un privilège par son ID
const privilege = await privilegeService.getPrivilegeById(privilegeId);

// Récupérer un privilège par son nom
const privilegeByName = await privilegeService.getPrivilegeByName(
  privilegeName
);

// Récupérer les privilèges d'un rôle par son ID
const rolePrivileges = await privilegeService.getPrivilegesByRoleId(roleId);

// Récupérer les privilèges d'un rôle par son nom
const rolePrivilegesByName = await privilegeService.getPrivilegesByRoleName(
  roleName
);

// Créer un nouveau privilège
const newPrivilege = await privilegeService.createPrivilege({
  name: "MANAGE_REPORTS",
  description: "Permet de gérer les rapports",
});

// Mettre à jour un privilège
const updatedPrivilege = await privilegeService.updatePrivilege(privilegeId, {
  name: "VIEW_REPORTS",
  description: "Permet de voir les rapports",
});

// Supprimer un privilège
await privilegeService.deletePrivilege(privilegeId);
```

### Comportements Spéciaux

1. **Rôle SUPER_ADMIN**

   - Ce rôle a automatiquement tous les privilèges, même ceux ajoutés ultérieurement
   - Un seul utilisateur peut avoir ce rôle

2. **Suppression d'un Rôle**

   - Les rôles permanents ne peuvent pas être supprimés
   - Si un rôle non-permanent est supprimé, tous les utilisateurs ayant ce rôle basculent automatiquement sur le rôle USER

3. **Utilisateur par Défaut**

   - Les nouveaux utilisateurs ont automatiquement le rôle USER

4. **Nouveaux privilèges**
   - Lors de la création d'un nouveau privilège, il est automatiquement accordé au rôle SUPER_ADMIN

## 7. Exemples de Cas d'Utilisation

### 1. Création d'un Panneau d'Administration de Rôles

```tsx
// app/admin/roles/page.tsx
"use client";

import { useState, useEffect } from "react";
import Authorization from "@/components/auth/Authorization";
import { useSession } from "next-auth/react";

interface Role {
  id: string;
  name: string;
  description?: string;
  isPermanent: boolean;
}

export default function RolesAdminPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch("/api/roles");
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des rôles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, []);

  async function handleDeleteRole(id: string) {
    try {
      const response = await fetch(`/api/roles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Mettre à jour la liste des rôles
        setRoles(roles.filter((role) => role.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || "Impossible de supprimer le rôle");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du rôle:", error);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Rôles</h1>

      <Authorization privilege="VIEW_ROLE" fallback={<p>Accès non autorisé</p>}>
        {loading ? (
          <p>Chargement des rôles...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Nom</th>
                  <th className="py-2 px-4 border">Description</th>
                  <th className="py-2 px-4 border">Permanent</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className="py-2 px-4 border">{role.name}</td>
                    <td className="py-2 px-4 border">
                      {role.description || "-"}
                    </td>
                    <td className="py-2 px-4 border">
                      {role.isPermanent ? "Oui" : "Non"}
                    </td>
                    <td className="py-2 px-4 border">
                      <Authorization privilege="UPDATE_ROLE">
                        <button className="mr-2 text-blue-500">Modifier</button>
                      </Authorization>
                      <Authorization privilege="DELETE_ROLE">
                        {!role.isPermanent && (
                          <button
                            className="text-red-500"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            Supprimer
                          </button>
                        )}
                      </Authorization>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Authorization privilege="CREATE_ROLE">
          <button className="mt-4 bg-green-500 text-white py-2 px-4 rounded">
            Créer un nouveau rôle
          </button>
        </Authorization>
      </Authorization>
    </div>
  );
}
```

### 2. Menu de Navigation Dynamique

```tsx
// components/layout/Sidebar.tsx
import { useSession } from "next-auth/react";
import Authorization from "@/components/auth/Authorization";
import Link from "next/link";

export default function Sidebar() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <nav className="sidebar">
      <div className="user-info">
        <span>{session.user.name}</span>
        <small>{session.user.roleName}</small>
      </div>

      <ul>
        <li>
          <Link href="/dashboard">Tableau de bord</Link>
        </li>

        <Authorization privilege="VIEW_USER">
          <li>
            <Link href="/users">Utilisateurs</Link>
          </li>
        </Authorization>

        <Authorization
          privileges={[
            "CREATE_ROLE",
            "UPDATE_ROLE",
            "DELETE_ROLE",
            "VIEW_ROLE",
          ]}
          requireAll={false}
        >
          <li>
            <Link href="/roles">Gestion des rôles</Link>
          </li>
        </Authorization>

        <Authorization privilege="MANAGE_PRIVILEGES">
          <li>
            <Link href="/privileges">Gestion des privilèges</Link>
          </li>
        </Authorization>
      </ul>
    </nav>
  );
}
```

## 8. Personnalisation et Extension

### Ajout de Nouveaux Privilèges

Pour ajouter de nouveaux privilèges, vous pouvez utiliser l'API ou modifier le fichier `prisma/seed.ts` :

#### Méthode 1: Via l'API (recommandé pour la production)

```tsx
// Créer un nouveau privilège
async function createPrivilege(name: string, description?: string) {
  const response = await fetch("/api/privileges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la création du privilège");
  }

  return response.json();
}

// Exemple d'utilisation
await createPrivilege("EXPORT_DATA", "Permet d'exporter des données");
```

#### Méthode 2: Via le seed (pour les environnements de développement)

Modifiez le fichier `prisma/seed.ts` et ajoutez vos privilèges :

```typescript
const privileges = [
  // ... privilèges existants
  { name: "EXPORT_DATA", description: "Exporter les données" },
  { name: "IMPORT_DATA", description: "Importer des données" },
];
```

Ensuite, exécutez :

```bash
npx prisma db seed
```

### Création d'un Middleware d'Accès aux Pages

Pour protéger l'accès aux pages côté serveur :

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Pages d'administration
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Vérifier si l'utilisateur est connecté et a les privilèges
    if (
      !token ||
      (token.roleName !== "SUPER_ADMIN" && token.roleName !== "ADMIN")
    ) {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  // Pages de gestion des rôles
  if (request.nextUrl.pathname.startsWith("/roles")) {
    if (
      !token ||
      (!token.privileges?.includes("VIEW_ROLE") &&
        token.roleName !== "SUPER_ADMIN")
    ) {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/roles/:path*",
    "/privileges/:path*",
    "/protected/:path*",
  ],
};
```

## 9. Résolution des Problèmes Courants

### Les privilèges ne sont pas actualisés immédiatement

Si les privilèges ne semblent pas mis à jour après une modification :

1. Vérifiez que la session est bien mise à jour :

   ```typescript
   // Déconnectez et reconnectez l'utilisateur
   await signOut({ redirect: false });
   await signIn("credentials", {
     email: user.email,
     password: password,
     redirect: false,
   });
   ```

2. Si nécessaire, forcez une revalidation de la session après modification des privilèges :

   ```typescript
   import { useSession } from "next-auth/react";

   const { update } = useSession();

   // Après modification des privilèges
   await update(); // Force la mise à jour de la session
   ```

### Accès refusé malgré les privilèges appropriés

1. Vérifiez les privilèges dans le token JWT :

   ```typescript
   console.log("Session:", session);
   console.log("Privilèges:", session?.user?.privileges);
   ```

2. Vérifiez que le rôle est correctement assigné à l'utilisateur dans la base de données.

3. Assurez-vous que les privilèges sont correctement associés au rôle dans la table `RolePrivilege`.

### Problèmes de transition de l'ancien système vers le nouveau

Si vous rencontrez des erreurs lors de la transition de l'ancien système (enum) vers le nouveau système (dynamique) :

1. Vérifiez que les migrations sont bien appliquées
2. Assurez-vous que tous les utilisateurs ont un rôle valide :

```typescript
// Script de migration pour assigner les rôles aux utilisateurs
async function migrateUserRoles() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Assurez-vous que l'utilisateur a un rôle valide
    if (!user.roleName) {
      // Utilisez l'ancien rôle s'il existe, sinon USER par défaut
      const roleName = user.role || "USER";

      await prisma.user.update({
        where: { id: user.id },
        data: { roleName },
      });
    }
  }
}
```

## 10. Ressources et Documentation

- [Documentation Next-Auth](https://next-auth.js.org/)
- [Guide des autorisations RBAC](https://auth0.com/docs/manage-users/access-control/rbac)
- [Prisma Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
- [React Hooks avancés](https://react.dev/reference/react/hooks)
- [API Next.js](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
