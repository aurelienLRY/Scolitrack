# Guide d'Implémentation du Middleware d'Authentification et d'Autorisation

Ce guide explique comment le middleware d'authentification et d'autorisation est implémenté dans Scolitrack pour sécuriser les routes de l'application.

## 1. Vue d'ensemble

Le système de middleware de Scolitrack permet de :

- Vérifier si un utilisateur est authentifié avant d'accéder à certaines routes
- Contrôler l'accès aux routes en fonction des privilèges de l'utilisateur
- Rediriger les utilisateurs non autorisés vers les pages appropriées
- Renvoyer des réponses JSON adaptées pour les routes API

## 2. Architecture du système

Le système repose sur trois composants principaux :

1. **Configuration des routes** (`routes.config.ts`) : définit quelles routes sont protégées et les privilèges requis
2. **Configuration d'authentification** (`auth.config.ts`) : configure NextAuth.js et définit les callbacks de session
3. **Middleware global** (`middleware.ts`) : intercepte les requêtes HTTP pour vérifier les autorisations
4. **Service d'authentification** (`auth.service.ts`) : fournit des fonctions pour la vérification des privilèges au niveau des composants et des API

```plaintext
src/
├── middleware.ts                # Middleware global qui intercepte toutes les requêtes
├── config/
│   └── routes.config.ts         # Configuration des routes protégées et des privilèges
└── lib/
    ├── services/
    │   └── auth.service.ts      # Service pour vérification des privilèges au niveau des composants
    └── auth/
        └── auth.config.ts       # Configuration de NextAuth avec callbacks personnalisés
```

## 3. Configuration des Routes (`routes.config.ts`)

Ce fichier définit quelles routes sont protégées et quels privilèges sont nécessaires pour y accéder :

```typescript
export type TPrivilegeRoute = {
  path: string;
  privilege: string;
};

/**
 * Routes publiques ne nécessitant pas d'authentification
 */
const publicRoutes = [
  "/",
  "/activate-account",
  "/forgot-password",
  "/reset-password",
  "/unauthorized", // Page d'erreur d'autorisation
];

/**
 * Routes API nécessitant des privilèges spécifiques
 */
const privilegesApiRoutes: TPrivilegeRoute[] = [
  {
    path: "/api/setup-application",
    privilege: "SETUP_APPLICATION",
  },
  {
    path: "/api/users/[id]/role",
    privilege: "SETUP_APPLICATION",
  },
  // Ajoutez d'autres routes API protégées ici
];

/**
 * Routes UI nécessitant des privilèges spécifiques
 */
const privilegesRoutes: TPrivilegeRoute[] = [
  {
    path: "/private/setup-application",
    privilege: "SETUP_APPLICATION",
  },
  // Ajoutez d'autres routes UI protégées ici
];

const DEFAULT_LOGIN_REDIRECT: string = "/";

export {
  privilegesApiRoutes,
  publicRoutes,
  privilegesRoutes,
  DEFAULT_LOGIN_REDIRECT,
};
```

### Différents types de routes

1. **Routes publiques** (`publicRoutes`)
   - Accessibles sans authentification (page d'accueil, pages de connexion, etc.)
2. **Routes API protégées** (`privilegesApiRoutes`)
   - Endpoints d'API qui nécessitent des privilèges spécifiques
   - Définies par un chemin et un privilège requis
3. **Routes UI protégées** (`privilegesRoutes`)
   - Pages de l'interface utilisateur qui nécessitent des privilèges spécifiques
   - Également définies par un chemin et un privilège requis

## 4. Configuration de l'Authentification (`auth.config.ts`)

Le fichier `auth.config.ts` configure NextAuth.js avec un provider d'authentification par identifiants et définit des callbacks pour enrichir la session avec les privilèges de l'utilisateur :

```typescript
// Version simplifiée pour exemple
export default {
  providers: [
    // Configuration du provider Credentials
  ],
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Ajouter les informations de rôle et privilèges au token JWT
        token.roleName = user.roleName;
        token.id = user.id;
        token.privileges = user.privileges || [];
      }
      return token;
    },
    async session({ session, token }) {
      // Ajouter les informations de rôle et privilèges à la session
      if (session.user) {
        session.user.roleName = token.roleName;
        session.user.id = token.id;
        session.user.privileges = token.privileges || [];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
```

### Points importants :

1. **Extraction des privilèges** : Lors de l'authentification, les privilèges de l'utilisateur sont extraits de sa relation avec son rôle et ajoutés à la session.
2. **Callbacks JWT** : Enrichissent le token JWT avec les informations de rôle et privilèges.
3. **Callbacks Session** : Synchronisent la session avec les informations du token JWT.

## 5. Middleware Global (`middleware.ts`)

Le middleware intercepte toutes les requêtes HTTP pour vérifier les autorisations :

```typescript
import { NextResponse } from "next/server";
import { privilegesApiRoutes, privilegesRoutes } from "@/config/routes.config";
import authConfig from "@/lib/auth/auth.config";
import NextAuth from "next-auth";

const { auth: authMiddleware } = NextAuth(authConfig);

export default authMiddleware(async function middleware(req) {
  const session = req.auth;
  const isLoggedIn = !!session;
  const { nextUrl } = req;

  // Fonction de vérification des privilèges
  const checkRoutePrivileges = (routes) => {
    const matchedRoute = routes.find((route) =>
      nextUrl.pathname.startsWith(route.path)
    );

    if (!matchedRoute) return undefined;

    if (!isLoggedIn) {
      // Redirection ou erreur pour utilisateur non authentifié
      if (nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }

    const hasPrivilege = session?.user?.privileges?.includes(
      matchedRoute.privilege
    );

    if (!hasPrivilege) {
      // Redirection ou erreur pour utilisateur sans privilège
      if (nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/unauthorized", nextUrl.origin));
    }

    return undefined;
  };

  // Vérification des routes privées génériques
  if (nextUrl.pathname.startsWith("/private") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // Vérification des routes API avec privilèges
  if (nextUrl.pathname.startsWith("/api/")) {
    const apiResult = checkRoutePrivileges(privilegesApiRoutes);
    if (apiResult) return apiResult;
  } else {
    // Vérification des routes UI avec privilèges
    const routeResult = checkRoutePrivileges(privilegesRoutes);
    if (routeResult) return routeResult;
  }

  return undefined;
});

// Configuration du matcher de routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/api/auth/:path*",
  ],
};
```

### Fonctionnement du middleware :

1. **Wrapper NextAuth** : Le middleware utilise le wrapper d'authentification de NextAuth v5.
2. **Extraction de la session** : La session est extraite via `req.auth`.
3. **Vérification des privilèges** :
   - La fonction `checkRoutePrivileges` vérifie si l'utilisateur a les privilèges nécessaires pour accéder à une route.
   - Elle gère différemment les routes API (réponse JSON) et les routes UI (redirection).
4. **Routes génériques protégées** :
   - Toutes les routes commençant par `/private` sont protégées et nécessitent une authentification.
5. **Configuration matcher** :
   - La propriété `config.matcher` définit quelles routes doivent être interceptées par le middleware.
   - Cela exclut les ressources statiques pour des raisons de performance.

## 6. Service d'Authentification Régional (`auth.service.ts`)

En complément du middleware global, Scolitrack utilise un service d'authentification pour une protection plus granulaire des fonctionnalités au niveau des composants, des routes API spécifiques, et pour des vérifications de privilèges ponctuelles :

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

/**
 * Middleware pour protéger une route d'API par un privilège
 */
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

// Autres fonctions du service d'authentification...
```

### Fonctionnalités principales

1. **Protection des routes API spécifiques** (`withPrivilege`) :

   - Enveloppe le gestionnaire de route d'API avec une vérification de privilège
   - Beaucoup plus granulaire que le middleware global
   - Parfait pour les routes qui nécessitent une logique d'autorisation spécifique

2. **Vérification de privilèges à la demande** (`checkPrivilege`) :

   - Permet de vérifier si un utilisateur possède un privilège particulier
   - Utile pour des vérifications conditionnelles dans la logique métier

3. **Vérification de privilèges côté client** (`useHasPrivilege`) :
   - Fonction pour vérifier les privilèges dans les composants React
   - Permet de contrôler l'affichage des éléments UI en fonction des privilèges

### Exemples d'utilisation

#### Protection d'une route API

```typescript
// Dans un fichier de route API (app/api/some-protected-route/route.ts)
import { withPrivilege } from "@/lib/services/auth.service";

async function handler(req: NextRequest) {
  // Logique de la route protégée
  return NextResponse.json({ success: true });
}

// Exporter le handler protégé par le privilège
export const POST = withPrivilege("MANAGE_SOMETHING", handler);
```

#### Vérification conditionnelle dans un service

```typescript
// Dans un service métier
import { checkPrivilege } from "@/lib/services/auth.service";

async function deleteUserData(userId: string) {
  // Vérifier si l'utilisateur a le privilège de suppression
  const canDelete = await checkPrivilege("DELETE_USER_DATA");

  if (!canDelete) {
    throw new Error("Opération non autorisée");
  }

  // Procéder à la suppression
  return prisma.userData.delete({
    where: { id: userId },
  });
}
```

#### Affichage conditionnel dans un composant React

```tsx
// Dans un composant React
"use client";
import { useEffect, useState } from "react";
import { useHasPrivilege } from "@/lib/services/auth.service";

export default function AdminPanel() {
  const [canManageUsers, setCanManageUsers] = useState(false);

  useEffect(() => {
    async function checkPrivilege() {
      const hasPrivilege = await useHasPrivilege("MANAGE_USERS");
      setCanManageUsers(hasPrivilege);
    }

    checkPrivilege();
  }, []);

  if (!canManageUsers) {
    return <p>Accès non autorisé</p>;
  }

  return (
    <div>
      <h1>Panneau d'administration des utilisateurs</h1>
      {/* Contenu du panneau */}
    </div>
  );
}
```

### Avantages de l'approche à deux niveaux

1. **Sécurité en profondeur** :

   - Le middleware global sécurise les routes au niveau HTTP
   - Le service d'authentification ajoute une couche de sécurité supplémentaire au niveau des composants et des API

2. **Flexibilité accrue** :

   - Certaines routes peuvent nécessiter des vérifications plus complexes
   - Possibilité de combiner plusieurs privilèges ou d'ajouter une logique conditionnelle

3. **Séparation des préoccupations** :
   - Le middleware gère la sécurité globale
   - Le service d'authentification gère les vérifications spécifiques

## 7. Flux d'Autorisation

Voici le flux complet de vérification d'autorisation pour une requête entrante :

1. Le middleware intercepte la requête HTTP
2. NextAuth vérifie si l'utilisateur est authentifié
3. Si la route commence par `/private`, l'utilisateur doit être connecté
4. Si la route correspond à une route protégée, le middleware vérifie si l'utilisateur a le privilège requis
5. Si l'utilisateur n'a pas les privilèges nécessaires :
   - Routes API : retourne une erreur 403 en JSON
   - Routes UI : redirige vers `/unauthorized`
6. Si l'utilisateur n'est pas connecté :
   - Routes API : retourne une erreur 401 en JSON
   - Routes UI : redirige vers la page de connexion
7. Pour les composants et fonctionnalités spécifiques, le service `auth.service.ts` peut être utilisé pour des vérifications supplémentaires

## 8. Extension du Système

### Ajouter une nouvelle route protégée

Pour ajouter une nouvelle route protégée, modifiez `routes.config.ts` :

```typescript
// Pour une route API
const privilegesApiRoutes: TPrivilegeRoute[] = [
  // ... routes existantes
  {
    path: "/api/analytics",
    privilege: "VIEW_ANALYTICS",
  },
];

// Pour une route UI
const privilegesRoutes: TPrivilegeRoute[] = [
  // ... routes existantes
  {
    path: "/private/analytics",
    privilege: "VIEW_ANALYTICS",
  },
];
```

### Configurer des routes avec des paramètres dynamiques

Les routes avec paramètres dynamiques sont également supportées :

```typescript
{
  path: "/api/users/[id]",  // Correspond à /api/users/123, /api/users/456, etc.
  privilege: "MANAGE_USERS"
}
```

### Route avec privilège composite

Pour les routes nécessitant plusieurs privilèges, vous pouvez :

1. Créer un privilège spécifique regroupant les permissions
2. Vérifier les multiples privilèges dans le contrôleur de route

## 9. Bonnes Pratiques

1. **Nomenclature des privilèges** :

   - Utilisez des noms explicites et cohérents
   - Suivez une convention comme `ACTION_RESOURCE` (ex: `MANAGE_USERS`, `VIEW_ANALYTICS`)

2. **Granularité des privilèges** :

   - Privilèges trop génériques : risque de donner trop d'accès
   - Privilèges trop spécifiques : complexité de gestion accrue
   - Trouvez le bon équilibre selon vos besoins

3. **Documentation des routes protégées** :

   - Documentez clairement quels privilèges sont nécessaires pour chaque route
   - Mettez à jour la documentation lorsque de nouvelles routes sont ajoutées

4. **Tests d'autorisation** :
   - Écrivez des tests pour vérifier que les routes protégées refusent l'accès aux utilisateurs non autorisés
   - Testez tous les scénarios : non connecté, connecté sans privilèges, connecté avec privilèges

## 10. Résolution des Problèmes Courants

### Accès refusé malgré les privilèges appropriés

1. Vérifiez que les privilèges sont correctement ajoutés au token JWT :

   ```typescript
   console.log("Token:", token);
   ```

2. Vérifiez que la session contient bien les privilèges :

   ```typescript
   console.log("Session:", session?.user?.privileges);
   ```

3. Assurez-vous que le chemin de la route correspond exactement à celui défini dans `routes.config.ts`.

### Redirection en boucle

Si vous observez des redirections en boucle :

1. Vérifiez que la page de connexion n'est pas protégée elle-même
2. Assurez-vous que les routes publiques sont correctement configurées
3. Vérifiez les exclusions dans le matcher du middleware

## 11. Résumé

Le système de middleware d'authentification et d'autorisation de Scolitrack offre :

1. Une **séparation claire des préoccupations** :

   - Configuration des routes protégées dans un fichier dédié
   - Logique d'authentification dans NextAuth
   - Vérification des autorisations dans le middleware

2. Un **contrôle d'accès granulaire** basé sur les privilèges des utilisateurs

3. Une **expérience utilisateur adaptée** avec des redirections pour les pages UI et des réponses JSON pour les API

4. Une **architecture extensible** permettant d'ajouter facilement de nouvelles routes protégées
