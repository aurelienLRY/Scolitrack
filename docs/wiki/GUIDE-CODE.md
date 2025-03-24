# Guide de Style de Code pour un Projet Next.js avec TypeScript et Tailwind

## 1. Structure Générale du Projet

Voici une architecture standard pour un projet Next.js professionnel avec l’utilisation du routeur `app/`, adaptée aux bonnes pratiques modernes :

```plaintext
my-next-app/
├── src/
│   ├── app/
│   │   ├── (public-pages)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (protected-pages)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── users/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── global-error.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   └── Button.tsx
│   │   ├── layout/
│   │   │   └── Header.tsx
│   │   └── shared/
│   │       └── Card.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── ...
│   ├── styles/
│   │   └── globals.css
│   └── ...
├── public/
│   ├── images/
│   └── ...
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── next.config.js
├── package.json
└── tsconfig.json
```

### Description des Dossiers

#### **1. src/app/**

Le dossier `src/app/` est la pierre angulaire de l’App Router introduit avec Next.js 13+.

- **(public-pages)** : Contient les pages accessibles à tous (public).

  - Exemple : `layout.tsx` pour définir un layout commun (header/footer) pour les pages publiques.

- **(protected-pages)** : Gère les pages protégées nécessitant une authentification.

  - Exemple : `layout.tsx` pour gérer le header spécifique aux utilisateurs connectés.

- **api/** : Contient les routes API avec des endpoints RESTful.

  - Exemple : `src/app/api/users/route.ts` pour gérer les requêtes sur `/api/users`.

- **layout.tsx** : Définit le layout global par défaut (header, footer, providers globaux).

- **page.tsx** : Définit la page d’accueil ou le contenu principal de la route racine (`/`).

- **error.tsx** : Gère les erreurs locales pour des routes spécifiques.

- **loading.tsx** : Affiche un écran de chargement pendant les opérations asynchrones.

- **global-error.tsx** : Gère les erreurs globales de l’application.

#### **2. src/components/**

Regroupe les composants réutilisables de l’application.

- **ui/** : Contient les composants de base du design system (boutons, formulaires, etc.).

  - Exemple : `Button.tsx` pour un bouton réutilisable.

- **layout/** : Contient des composants liés à la mise en page (header, footer, sidebars).

  - Exemple : `Header.tsx`.

- **shared/** : Composants partagés spécifiques (cartes, badges, etc.).

#### **3. src/lib/**

Contient les fonctions utilitaires et la logique métier.

- Exemple :
  - `db.ts` pour gérer la connexion à la base de données.
  - `auth.ts` pour gérer les tokens d’authentification.

#### **4. src/hooks/**

Contient les hooks React personnalisés.

- Exemple : `useAuth.ts` pour gérer l’état d’authentification utilisateur.

#### **5. src/context/**

Stocke les Context Providers React pour l’état global.

- Exemple : `AuthContext.tsx` pour gérer les préférences utilisateur.

#### **6. src/styles/**

Inclut les styles globaux (CSS ou Tailwind).

- Exemple : `globals.css` pour définir les styles de base.

#### **7. public/**

Contient les fichiers statiques accessibles via `/` (images, favicons, etc.).

#### **8. tests/**

Organise les tests de l’application.

- **unit/** : Tests unitaires des composants.
- **integration/** : Tests d’intégration.
- **e2e/** : Tests de bout en bout pour simuler des parcours utilisateur.

---

## 2. Conventions de Nommage

### **1. Fichiers et Dossiers**

- **Dossiers pour les pages** : Utilisez le **kebab-case**.
  - Exemple : `(public-pages)` ou `user-profile`.
- **Dossiers généraux** : Utilisez également le **kebab-case**.
  - Exemple : `src/hooks/`.
- **Fichiers** : Adoptez le **PascalCase** pour les composants et le **camelCase** pour le reste.
  - Exemple : `Button.tsx`, `useAuth.ts`.

### **2. Composants**

- **Composants** : Utilisez des noms descriptifs en **PascalCase**.
  - Exemple : `Navbar.tsx`.

### **3. Variables et Fonctions**

- **Variables locales** : Privilégiez le **camelCase**.
  - Exemple : `const userName = "John"`.
- **Variables globales** : Préférez une convention en MAJUSCULES AVEC UNDERSCORE.
  - Exemple : `const API_URL = "https://api.example.com"`.
- **Fonctions** : Respectez le **camelCase**, avec des verbes descriptifs.
  - Exemple : `fetchUserData()`.

### **4. Types TypeScript**

- Utilisez le **PascalCase** pour les interfaces et types.
  - Exemple :
    ```typescript
    interface User {
      id: number;
      name: string;
    }
    ```

### **5. Server Actions**

- **Noms des fonctions** : Utilisez des verbes descriptifs en **camelCase** avec un préfixe explicite.
  - Exemple : `getUserData`, `createUserSession`.
- **Fichiers** : Conservez des noms courts et descriptifs en **camelCase**.
  - Exemple : `fetchUsers.ts`, `updateUser.ts`.

---

## 3. Bonnes Pratiques

### **1. Structure et Organisation**

- Séparez clairement les responsabilités : composants UI, logique métier, API, etc.
- Regroupez les fonctionnalités connexes dans des dossiers dédiés.

### **2. TypeScript**

- Typage strict pour minimiser les erreurs.
  - Exemple :
    ```typescript
    const add = (a: number, b: number): number => a + b;
    ```

### **3. Tailwind CSS**

- Utilisez des classes utilitaires avec parcimonie et regroupez-les si besoin.
  - Exemple : `className="text-lg font-bold text-blue-500"`.

### **4. Accessibilité (a11y)**

- Respectez les bonnes pratiques pour les utilisateurs handicapés.
  - Exemple : Ajoutez des attributs `aria-label` et évitez les "div vides".

### **5. ESLint et Prettier**

- Intégrez des outils d’analyse statique pour automatiser le respect des règles de style.
  - Exemple de config ESLint :
    ```json
    {
      "extends": [
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended"
      ]
    }
    ```

### **6. Gestion des Erreurs**

- Centralisez la gestion des erreurs pour améliorer le debugging.
  - Exemple :
    ```typescript
    try {
      const data = await fetchUserData();
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
    ```

### **7. Tests**

- Séparez les tests unitaires, d’intégration et E2E pour une meilleure organisation.
  - Exemple : Utilisez `Jest` pour les tests unitaires et `Cypress` ou `Playwright` pour les tests E2E.

---

Ce guide offre une base solide pour structurer un projet Next.js tout en adoptant des pratiques professionnelles. N’hésitez pas à poser des questions ou à demander des ajustements si besoin !
