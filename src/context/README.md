# Dossier `context/`

## Utilisation

Ce dossier contient tous les contextes React (Context API) pour la gestion d'état global de l'application.

## Conventions de nommage

- Noms de fichiers : `PascalCase.tsx`
- Noms de contextes : `PascalCaseContext`
- Types/Interfaces : `IPascalCase` ou `TPascalCase`

## Structure

```plaintext
context/
├── AuthContext.tsx     # Contexte d'authentification
├── ThemeContext.tsx    # Contexte de thème
└── UserContext.tsx     # Contexte utilisateur
```

## Exemple

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
