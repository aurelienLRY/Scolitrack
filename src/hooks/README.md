# Hooks personnalisés

Ce dossier contient les hooks personnalisés pour l'application.

## Architecture des hooks

L'architecture des hooks est organisée de la manière suivante :

- `useApi.ts` : Hooks génériques pour les requêtes API (useApiQuery, useApiMutation)
- Hooks métier spécifiques :
  - `useEstablishment.ts` : Hooks liés à la gestion des établissements
  - `useUsers.ts` : Hooks liés à la gestion des utilisateurs
  - etc.

Chaque fichier métier contient des hooks spécifiques à un domaine fonctionnel,
qui utilisent les hooks génériques de `useApi.ts`.

## Convention de nommage

- Les noms des hooks doivent commencer par `use`
- Les hooks de requête GET doivent être nommés `use[Resource]` (ex: `useEstablishment`)
- Les hooks de mutation doivent être nommés `use[Resource]Mutation` (ex: `useEstablishmentMutation`)

## Bonnes pratiques

1. Définir des types précis pour les données retournées par l'API
2. Utiliser les queryKeys appropriées pour permettre l'invalidation ciblée du cache
3. Gérer les erreurs au niveau des hooks
4. Invalider le cache après les mutations pour garantir la cohérence des données

Pour plus de détails sur l'utilisation des hooks API, consultez la documentation
dans `docs/wiki/Fetching-avec-TanStack-Query.md`.

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
