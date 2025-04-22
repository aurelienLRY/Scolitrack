"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import FetchService from "@/lib/services/fetch.service";
import { ApiResponse } from "@/types/api.type";
import { toast } from "sonner";

/**
 * Type pour le retour de useApiQuery
 */
export type ApiQueryResult<T> = UseQueryResult<ApiResponse<T>, Error>;

/**
 * Type pour le retour de useApiMutation
 */
export type ApiMutationResult<TData, TVariables> = UseMutationResult<
  ApiResponse<TData>,
  Error,
  TVariables,
  unknown
>;

/**
 * Options pour useApiQuery
 */
interface UseApiQueryOptions<T> {
  queryKey: QueryKey; // Clé de la requête
  url: string; // URL de la requête
  enabled?: boolean; // Indique si la requête est active
  onSuccess?: (data: ApiResponse<T>) => void; // Callback de succès
  onError?: (error: Error) => void; // Callback d'erreur
  placeholderData?: ApiResponse<T>; // Données à afficher pendant la requête
  staleTime?: number; // Temps de validité des données
  refetchOnWindowFocus?: boolean; // Indique si la requête doit être rafraîchie lorsque la fenêtre est active
}

/**
 * Hook personnalisé pour effectuer des requêtes GET avec TanStack Query
 */
export function useApiQuery<T = unknown>({
  queryKey,
  url,
  enabled = true,
  onSuccess,
  onError,
  placeholderData,
  staleTime = 1000 * 60 * 5,
  refetchOnWindowFocus = true,
}: UseApiQueryOptions<T>): ApiQueryResult<T> {
  return useQuery<ApiResponse<T>, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await FetchService.get<T>(url);
      } catch (error) {
        toast.error((error as Error).message || "Une erreur est survenue");
        throw error;
      }
    },
    enabled,
    placeholderData,
    staleTime,
    refetchOnWindowFocus,
    ...(onSuccess ? { onSuccess } : {}),
    ...(onError ? { onError } : {}),
  });
}

/**
 * Options pour useApiMutation
 */
interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>; // Fonction de mutation
  onSuccess?: (data: ApiResponse<TData>, variables: TVariables) => void; // Callback de succès
  onError?: (error: Error, variables: TVariables) => void; // Callback d'erreur
  invalidateQueries?: QueryKey[]; // Clés de requêtes à invalider
}

/**
 * Hook personnalisé pour effectuer des mutations (POST, PUT, DELETE) avec TanStack Query
 */
export function useApiMutation<TData = unknown, TVariables = unknown>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries = [],
}: UseApiMutationOptions<TData, TVariables>): ApiMutationResult<
  TData,
  TVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onSuccess: (data, variables) => {
      // Afficher le feedback de succès
      if (data.feedback) {
        toast.success(data.feedback);
      }

      // Invalider les queries concernées pour forcer un rafraîchissement
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // Appeler le callback onSuccess
      if (onSuccess) {
        onSuccess(data, variables);
      }
    },
    onError: (error: Error, variables) => {
      // Afficher l'erreur
      toast.error(error.message || "Une erreur est survenue");

      // Appeler le callback onError
      if (onError) {
        onError(error, variables);
      }
    },
  });
}
