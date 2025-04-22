# Système de requêtes API avec TanStack Query

Ce document décrit le système de requêtes API implémenté dans l'application, basé sur TanStack Query (React Query).

## Pourquoi TanStack Query ?

TanStack Query offre plusieurs avantages :

- **Gestion automatique du cache** : évite les requêtes inutiles pour des données déjà chargées
- **État de chargement** : gère facilement les états loading, error, success
- **Invalidation intelligente** : rafraîchit automatiquement les données après mutations
- **Gestion d'erreurs** : capture et traite efficacement les erreurs
- **Refetch automatique** : actualise les données quand nécessaire (focus, reconnexion, etc.)

## Architecture du système

Notre système se compose de plusieurs éléments :

### 1. QueryProvider

Fichier: `src/lib/providers/query-provider.tsx`

Le provider enveloppe l'application et configure TanStack Query avec nos paramètres par défaut :

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### 2. Types de réponse API standardisés

Fichier: `src/types/api.ts`

Définit la structure de toutes les réponses API :

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  feedback?: string;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  feedback: string;
  details?: Record<string, string>;
}
```

### 3. Service Fetch

Fichier: `src/lib/services/fetch.service.ts`

Service central pour effectuer les requêtes HTTP avec gestion des erreurs :

```typescript
class FetchService {
  static async fetchApi<T>(
    url: string,
    options?: FetchOptions
  ): Promise<ApiResponse<T>> {
    // ... implémentation
  }

  static async get<T>(
    url: string,
    options?: Omit<FetchOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    // ... implémentation
  }

  static async post<T>(
    url: string,
    body: unknown,
    options?: Omit<FetchOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    // ... implémentation
  }

  static async put<T>(
    url: string,
    body: unknown,
    options?: Omit<FetchOptions, "method" | "body">
  ): Promise<ApiResponse<T>> {
    // ... implémentation
  }

  static async delete<T>(
    url: string,
    options?: Omit<FetchOptions, "method">
  ): Promise<ApiResponse<T>> {
    // ... implémentation
  }
}
```

### 4. Hooks personnalisés

Fichier: `src/lib/hooks/useQuery.ts`

Hooks génériques pour les requêtes GET et les mutations :

```typescript
// Hook pour les requêtes GET
export function useApiQuery<T>({
  queryKey,
  url,
  enabled = true,
}: // ... autres options
UseApiQueryOptions<T>) {
  return useTanstackQuery({
    queryKey,
    queryFn: async () => await FetchService.get<T>(url),
    // ... autres options
  });
}

// Hook pour les mutations (POST, PUT, DELETE)
export function useApiMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}: UseApiMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useTanstackMutation({
    mutationFn,
    // ... gestion des succès et erreurs
  });
}
```

Et hooks spécifiques aux ressources :

```typescript
// Hook pour créer/mettre à jour un établissement
export function useEstablishmentMutation(establishmentId?: string) {
  // ... implémentation
}

// Hook pour récupérer un établissement
export function useEstablishment() {
  // ... implémentation
}

// Hook pour récupérer les administrateurs
export function useAdmins() {
  // ... implémentation
}
```

## Utilisation dans les composants

### Exemple avec un hook de récupération de données (GET)

```typescript
// Dans un composant React
function MyComponent() {
  const { data, isLoading, error } = useEstablishment();

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  const establishment = data?.data?.establishment;

  return (
    <div>
      <h1>{establishment.name}</h1>
      {/* ... */}
    </div>
  );
}
```

### Exemple avec un hook de mutation (POST/PUT)

```typescript
// Dans un composant de formulaire
function EstablishmentForm() {
  const { mutate, isPending } = useEstablishmentMutation();

  const handleSubmit = (formData) => {
    mutate(formData, {
      onSuccess: () => {
        // Actions à effectuer en cas de succès
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... champs du formulaire */}
      <button type="submit" disabled={isPending}>
        {isPending ? "En cours..." : "Enregistrer"}
      </button>
    </form>
  );
}
```

## Comment créer un nouveau hook de requête

### Pour une requête GET

```typescript
export function useMyResource() {
  return useApiQuery<{ resource: MyResourceType }>({
    queryKey: ["my-resource"],
    url: "/api/my-resource",
  });
}
```

### Pour une mutation

```typescript
export function useMyResourceMutation(resourceId?: string) {
  return useApiMutation<{ resource: MyResourceType }, MyResourceFormData>({
    mutationFn: async (data) => {
      if (resourceId) {
        return FetchService.put(`/api/my-resource/${resourceId}`, data);
      } else {
        return FetchService.post("/api/my-resource", data);
      }
    },
    invalidateQueries: [["my-resource"]],
  });
}
```

## Bonnes pratiques

1. **Définir des types précis** pour les données retournées par l'API
2. **Utiliser les queryKeys appropriées** pour permettre l'invalidation ciblée du cache
3. **Gérer les erreurs** au niveau des hooks et des composants
4. **Utiliser toast** pour notifier les utilisateurs des succès et des erreurs
5. **Invalider le cache** après les mutations pour garantir la cohérence des données
6. **Utiliser les fonctions avancées** comme `onSuccess` et `onError` pour les traitements spécifiques

## Résolution de problèmes courants

### Les données ne sont pas rafraîchies après une mutation

Vérifiez que vous invalidez correctement le cache avec la bonne queryKey :

```typescript
invalidateQueries: [["ma-ressource"]],
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["ma-ressource"] });
}
```

### Erreurs de type TypeScript

Assurez-vous de définir des types précis pour les données de l'API :

```typescript
// Au lieu de
useApiQuery<{ users: any[] }>;

// Utilisez
useApiQuery<{ users: User[] }>;
```

### Requêtes inutiles

Si vous remarquez trop de requêtes, ajustez les paramètres dans le QueryProvider ou dans les hooks spécifiques :

```typescript
staleTime: 300 * 1000, // 5 minutes
```
