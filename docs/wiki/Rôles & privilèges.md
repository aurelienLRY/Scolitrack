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
│       ├── privilege.service.ts  # Service de gestion des privilèges
│       └── auth.service.ts    # Service pour vérifier les privilèges dans les API
├── context/
│   ├── store/
│   │   ├── RoleStore.ts       # Store Zustand pour la gestion des rôles
│   │   ├── PrivilegeStore.ts  # Store Zustand pour la gestion des privilèges
│   │   └── types.ts           # Types partagés pour les stores
│   └── provider/
│       ├── RolesPrivilegesProvider.tsx  # Provider pour initialiser les données
│       └── AppProviders.tsx   # Provider racine de l'application
├── middleware.ts              # Middleware global pour vérifier les autorisations
├── config/
│   └── routes.config.ts       # Configuration des routes protégées par privilèges
└── types/
    └── next-auth.d.ts         # Types personnalisés pour Next-Auth

prisma/
├── schema.prisma              # Modèles de données pour les rôles et privilèges
└── seed.ts                    # Initialisation des rôles et privilèges de base
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

Les privilèges sont définis dans le fichier `prisma/seed.ts` et sont automatiquement créés lors de l'initialisation de la base de données :

| Privilège                     | Description                      | Rôles par défaut   |
| ----------------------------- | -------------------------------- | ------------------ |
| `SETUP_APPLICATION`           | Paramétrer l'application         | SUPER_ADMIN, ADMIN |
| `MANAGE_USERS`                | Gérer les utilisateurs           | SUPER_ADMIN, ADMIN |
| `MANAGE_STUDENTS`             | Gérer les étudiants              | SUPER_ADMIN, ADMIN |
| `MANAGE_MEDICAL_INFORMATIONS` | Gérer les informations médicales | SUPER_ADMIN, ADMIN |
| `DELETE_DATA`                 | Supprimer des données            | SUPER_ADMIN        |
| `UPDATE_DATA`                 | Modifier des données             | SUPER_ADMIN, ADMIN |

**Note importante** : Les privilèges sont définis uniquement dans le fichier `seed.ts` et ne peuvent pas être modifiés ou créés dynamiquement via l'interface utilisateur. Pour ajouter de nouveaux privilèges, vous devez les ajouter directement dans le fichier `seed.ts`.

## 4. État Global avec Zustand

Le système utilise Zustand pour gérer l'état global des rôles et privilèges.

### Stores Zustand

Deux stores principaux sont disponibles :

#### 1. `useRoleStore`

```tsx
import { useRoleStore } from "@/context/store/RoleStore";

function RoleManager() {
  const {
    roles,
    isLoading,
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
  } = useRoleStore();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Reste du composant
}
```

#### 2. `usePrivilegeStore`

```tsx
import { usePrivilegeStore } from "@/context/store/PrivilegeStore";

function PrivilegeViewer() {
  const { privileges, isLoading, fetchPrivileges } = usePrivilegeStore();

  useEffect(() => {
    fetchPrivileges();
  }, [fetchPrivileges]);

  // Reste du composant
}
```

### Provider pour l'initialisation

Le `RolesPrivilegesProvider` initialise automatiquement les données des rôles et privilèges :

```tsx
// Dans layout.tsx ou un composant racine
import { AppProviders } from "@/context/provider/AppProviders";

export default function Layout({ children }) {
  return <AppProviders>{children}</AppProviders>;
}
```

## 5. Sécurisation des Routes avec le Middleware

Le système utilise le middleware Next.js pour vérifier les autorisations globalement.

### Configuration des Routes Protégées

Les routes protégées sont définies dans `src/config/routes.config.ts` :

```typescript
// Routes API nécessitant des privilèges spécifiques
const privilegesApiRoutes: TPrivilegeRoute[] = [
  {
    path: "/api/setup-application",
    privilege: "SETUP_APPLICATION",
  },
  // Autres routes protégées...
];

// Routes UI nécessitant des privilèges spécifiques
const privilegesRoutes: TPrivilegeRoute[] = [
  {
    path: "/private/setup-application",
    privilege: "SETUP_APPLICATION",
  },
  // Autres routes protégées...
];
```

### Fonctionnement du Middleware

Le middleware (`src/middleware.ts`) intercepte automatiquement toutes les requêtes et vérifie les autorisations :

1. Il vérifie si l'utilisateur est authentifié
2. Pour les routes protégées, il vérifie si l'utilisateur possède le privilège requis
3. Si l'accès est refusé, il redirige vers une page appropriée ou renvoie une erreur JSON pour les API

## 6. Sécurisation des API avec le Service d'Authentification

Pour une sécurité plus granulaire dans les API, utilisez le service `auth.service.ts` :

```typescript
// app/api/some-endpoint/route.ts
import { NextRequest } from "next/server";
import { withPrivilege } from "@/lib/services/auth.service";
import { successResponse, handleApiError } from "@/lib/services/api.service";

// Route protégée par le privilège DELETE_DATA
export const DELETE = withPrivilege("DELETE_DATA", async (req: NextRequest) => {
  try {
    // Logique de suppression
    return successResponse({
      data: result,
      feedback: "Données supprimées avec succès",
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de la suppression");
  }
});
```

### Implémentation du Wrapper `withPrivilege`

Le service `auth.service.ts` fournit un wrapper pour les routes d'API qui vérifie les privilèges de manière élégante et cohérente :

```typescript
// src/lib/services/auth.service.ts
export function withPrivilege(
  requiredPrivilege: string,
  handler: RouteHandler
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    try {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { message: "Non authentifié" },
          { status: 401 }
        );
      }

      // Si c'est un SUPER_ADMIN, autoriser automatiquement
      if (session.user.roleName === "SUPER_ADMIN") {
        return handler(request, ...args);
      }

      // Vérifier si l'utilisateur a le privilège requis
      const hasPrivilege = session.user.privileges.includes(requiredPrivilege);

      if (!hasPrivilege) {
        return NextResponse.json(
          { message: "Accès non autorisé" },
          { status: 403 }
        );
      }

      return handler(request, ...args);
    } catch (error) {
      console.error("Erreur d'autorisation:", error);
      return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
  };
}
```

### Exemples Pratiques d'Utilisation

#### Exemple 1: Mise à jour du rôle d'un utilisateur

```typescript
// src/app/api/users/[id]/role/route.ts
import { NextRequest } from "next/server";
import { withPrivilege } from "@/lib/services/auth.service";
import { roleService } from "@/lib/services/role.service";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/services/api.service";

export const PUT = withPrivilege("UPDATE_DATA", async (req: NextRequest) => {
  try {
    // Extraire l'ID de l'utilisateur des paramètres de l'URL
    const pathSegments = req.nextUrl.pathname.split("/");
    const userId = pathSegments[pathSegments.indexOf("users") + 1];

    // Récupérer et valider les données
    const data = await req.json();
    const { roleName } = data;

    if (!roleName) {
      return errorResponse({
        feedback: "Le nom du rôle est requis",
        status: 400,
      });
    }

    // Assigner le rôle à l'utilisateur
    const updatedUser = await roleService.assignRoleToUser(userId, roleName);

    return successResponse({
      data: updatedUser,
      feedback: `Rôle '${roleName}' attribué avec succès à l'utilisateur`,
    });
  } catch (error) {
    return handleApiError(error, "Erreur lors de l'attribution du rôle");
  }
});
```

#### Exemple 2: Création d'un étudiant (requiert MANAGE_STUDENTS)

```typescript
// src/app/api/students/route.ts
import { NextRequest } from "next/server";
import { withPrivilege } from "@/lib/services/auth.service";
import { studentService } from "@/lib/services/student.service";
import { successResponse, handleApiError } from "@/lib/services/api.service";

export const POST = withPrivilege(
  "MANAGE_STUDENTS",
  async (req: NextRequest) => {
    try {
      const data = await req.json();

      const newStudent = await studentService.createStudent(data);

      return successResponse({
        data: newStudent,
        feedback: "Étudiant créé avec succès",
      });
    } catch (error) {
      return handleApiError(error, "Erreur lors de la création de l'étudiant");
    }
  }
);
```

### Avantages du Wrapper `withPrivilege`

1. **Centralisation de la logique d'autorisation** :

   - Toute la logique de vérification des privilèges est centralisée dans une seule fonction
   - Réduction du code dupliqué et meilleure maintenabilité

2. **Gestion automatique des erreurs** :

   - Réponses d'erreur standardisées pour les problèmes d'authentification (401) et d'autorisation (403)
   - Gestion des exceptions avec logging approprié

3. **Traitement spécial pour SUPER_ADMIN** :

   - Les utilisateurs avec le rôle SUPER_ADMIN contournent automatiquement les vérifications de privilèges
   - Assurant que les administrateurs système ont toujours accès à toutes les fonctionnalités

4. **Composition facile** :

   - Permet une composition simple avec d'autres middlewares si nécessaire
   - S'intègre parfaitement avec le pattern des handlers de route Next.js

5. **Cohérence dans les API** :
   - Assure que toutes les routes API protégées suivent le même pattern pour les vérifications de privilèges

### Vérification des Privilèges dans les Services

Vous pouvez également vérifier les privilèges directement :

```typescript
import { checkPrivilege } from "@/lib/services/auth.service";

async function someServiceFunction() {
  const canDeleteData = await checkPrivilege("DELETE_DATA");

  if (!canDeleteData) {
    throw new Error("Accès refusé");
  }

  // Suite de la logique
}
```

## 7. Gestion des Rôles et Privilèges via les Services

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

Le `privilegeService` fournit des fonctions pour lire les privilèges :

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
```

**Note importante** : La création, modification et suppression des privilèges se fait uniquement via le fichier `prisma/seed.ts`.

## 8. Comportements Spéciaux

1. **Rôle SUPER_ADMIN**

   - Ce rôle a automatiquement tous les privilèges, même ceux ajoutés ultérieurement
   - Un seul utilisateur peut avoir ce rôle

2. **Suppression d'un Rôle**

   - Les rôles permanents ne peuvent pas être supprimés
   - Si un rôle non-permanent est supprimé, tous les utilisateurs ayant ce rôle basculent automatiquement sur le rôle USER

3. **Utilisateur par Défaut**

   - Les nouveaux utilisateurs ont automatiquement le rôle USER

4. **Nouveaux privilèges**
   - Les privilèges sont définis dans le fichier `seed.ts`
   - Lors de l'ajout d'un nouveau privilège dans le seed, il est automatiquement accordé au rôle SUPER_ADMIN

## 9. Exemple d'Interface de Gestion des Rôles

```tsx
"use client";
import { useEffect } from "react";
import { useRoleStore } from "@/context/store/RoleStore";
import { usePrivilegeStore } from "@/context/store/PrivilegeStore";

export default function RolesManager() {
  const { roles, isLoading, fetchRoles, createRole, deleteRole } =
    useRoleStore();
  const { privileges, fetchPrivileges } = usePrivilegeStore();

  useEffect(() => {
    // Chargement initial des données
    fetchRoles();
    fetchPrivileges();
  }, [fetchRoles, fetchPrivileges]);

  async function handleCreateRole(data) {
    await createRole(data);
  }

  async function handleDeleteRole(id) {
    await deleteRole(id);
  }

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Gestion des Rôles</h1>

      <div>
        {roles.map((role) => (
          <div key={role.id}>
            <h3>{role.name}</h3>
            <p>{role.description}</p>
            {!role.isPermanent && (
              <button onClick={() => handleDeleteRole(role.id)}>
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Formulaire de création */}
      <form onSubmit={/* ... */}>{/* ... */}</form>
    </div>
  );
}
```

## 10. Vérification des Privilèges dans les Composants Client

Pour vérifier les privilèges côté client, utilisez le service d'authentification :

```tsx
"use client";
import { useEffect, useState } from "react";
import { useHasPrivilege } from "@/lib/services/auth.service";

function DeleteButton({ itemId }) {
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      const hasAccess = await useHasPrivilege("DELETE_DATA");
      setCanDelete(hasAccess);
    }

    checkAccess();
  }, []);

  if (!canDelete) return null;

  return <button onClick={() => handleDelete(itemId)}>Supprimer</button>;
}
```

## 11. Résolution des Problèmes Courants

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

2. Vérifiez que le middleware est correctement configuré

3. Assurez-vous que le store Zustand est correctement initialisé via le provider

### Accès refusé malgré les privilèges appropriés

1. Vérifiez les privilèges dans le token JWT :

   ```typescript
   console.log("Session:", session);
   console.log("Privilèges:", session?.user?.privileges);
   ```

2. Vérifiez que le rôle est correctement assigné à l'utilisateur dans la base de données.

3. Assurez-vous que les privilèges sont correctement associés au rôle dans la table `RolePrivilege`.

4. Vérifiez la configuration des routes dans `routes.config.ts`.

## 12. Ressources et Documentation

- [Documentation Next-Auth](https://next-auth.js.org/)
- [Documentation Zustand](https://github.com/pmndrs/zustand)
- [Guide des autorisations RBAC](https://auth0.com/docs/manage-users/access-control/rbac)
- [Prisma Relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations)
