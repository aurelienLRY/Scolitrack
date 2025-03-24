# Dossier `context/`

## Utilisation

Ce dossier contient tous les contextes React (Context API) et les stores Zustand pour la gestion d'état global de l'application.

## Conventions de nommage

- Noms de fichiers pour Context API : `PascalCase.tsx`
- Noms de contextes : `PascalCaseContext`
- Noms de fichiers pour Zustand : `PascalCaseStore.ts`
- Types/Interfaces : `IPascalCase` ou `TPascalCase`

## Structure

```plaintext
context/
├── AuthContext.tsx           # Contexte d'authentification
├── ThemeContext.tsx          # Contexte de thème
├── UserContext.tsx           # Contexte utilisateur
├── RoleStore.ts              # Store Zustand pour la gestion des rôles
├── PrivilegeStore.ts         # Store Zustand pour la gestion des privilèges
├── RolesPrivilegesProvider.tsx # Provider pour l'initialisation des rôles et privilèges
├── types.ts                  # Types partagés pour les stores
└── index.ts                  # Export central
```

## Context API - Exemple

```typescript
// context/ThemeContext.tsx
import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## Zustand Store - Exemple d'utilisation avec Provider

```tsx
import {
  useRoleStore,
  usePrivilegeStore,
  RolesPrivilegesProvider,
} from "@/context";

// Composant racine de l'application
function App() {
  return (
    <RolesPrivilegesProvider autoLoad={true}>
      <YourAppComponents />
    </RolesPrivilegesProvider>
  );
}

// Composant utilisant les stores
function RoleManagement() {
  // Utilisation du store des rôles
  const { roles, isLoading, error, createRole, deleteRole } = useRoleStore();

  // Utilisation du store des privilèges
  const { privileges } = usePrivilegeStore();

  // Les données sont déjà chargées grâce au Provider
  // Pas besoin d'appeler fetchRoles() et fetchPrivileges()

  const handleCreateRole = async () => {
    await createRole({
      name: "EDITOR",
      description: "Peut éditer du contenu",
      privilegeIds: ["1", "2", "3"],
    });
  };

  return (
    <div>
      {isLoading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p>Erreur: {error}</p>
      ) : (
        <ul>
          {roles.map((role) => (
            <li key={role.id}>
              {role.name}
              <button onClick={() => deleteRole(role.id)}>Supprimer</button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleCreateRole}>Créer un rôle</button>
    </div>
  );
}
```

## Provider Rôles et Privilèges

Le Provider `RolesPrivilegesProvider` facilite l'initialisation des données des rôles et privilèges. Il suffit de l'ajouter à votre composant racine pour avoir accès aux données dans toute l'application.

### Props

| Prop     | Type      | Description                                    | Défaut |
| -------- | --------- | ---------------------------------------------- | ------ |
| children | ReactNode | Composants enfants                             | -      |
| autoLoad | boolean   | Charger automatiquement les données au montage | true   |

### Exemple d'utilisation

```tsx
import { RolesPrivilegesProvider } from "@/context";

function Layout({ children }) {
  return (
    <RolesPrivilegesProvider>
      <Header />
      <main>{children}</main>
      <Footer />
    </RolesPrivilegesProvider>
  );
}
```
