# Dossier `hooks/`

## Utilisation

Ce dossier contient tous les hooks React personnalisés de l'application.

## Conventions de nommage

- Préfixe obligatoire : `use`
- Noms de fichiers : `useNomDuHook.ts`
- Noms de hooks : `useNomDuHook`

## Structure

```plaintext
hooks/
├── useAuth.ts          # Hook d'authentification
├── useForm.ts          # Hook de gestion de formulaire
└── useLocalStorage.ts  # Hook de stockage local
```

## Exemple

```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
```
