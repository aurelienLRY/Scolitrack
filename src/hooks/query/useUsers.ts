"use client";

import { useApiQuery, ApiQueryResult, useApiMutation, ApiMutationResult } from "@/hooks/query/useQuery";
import { User } from "@prisma/client";
import { useState } from "react";
import FetchService from "@/lib/services/fetch.service";
import { useSession } from "next-auth/react";

// Type pour la pagination
export interface PaginationMeta {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Type pour l'utilisateur courant (sans le mot de passe)
export type CurrentUser = Omit<User, "password">;

// Type pour les données de mise à jour d'un utilisateur
export type UpdateUserData = Partial<User>;

// Type pour les données de changement de mot de passe
export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

// Clés de query pour les utilisateurs
export const USERS_QUERY_KEY = ["users"];
export const ADMINS_QUERY_KEY = ["users", "Role", "ADMIN"];
export const CURRENT_USER_QUERY_KEY = ["currentUser"];

/**
 * Hook pour récupérer tous les utilisateurs
 */
export function useUsers(): ApiQueryResult<User[]> {
  return useApiQuery<User[]>({
    queryKey: USERS_QUERY_KEY,
    url: "/api/users",
  });
}

/**
 * Hook pour récupérer un utilisateur par son ID
 */
export function useUser(id: string): ApiQueryResult<User> {
  return useApiQuery<User>({
    queryKey: [...USERS_QUERY_KEY, id],
    url: `/api/users/${id}`,
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer l'utilisateur courant
 */
export function useCurrentUser(): ApiQueryResult<CurrentUser> {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useApiQuery<CurrentUser>({
    queryKey: CURRENT_USER_QUERY_KEY,
    url: userId ? `/api/users/${userId}` : "",
    enabled: !!userId,
  });
}

/**
 * Hook pour récupérer les administrateurs
 */
export function useAdmins(): ApiQueryResult<User[]> {
  return useApiQuery<User[]>({
    queryKey: ADMINS_QUERY_KEY,
    url: "/api/users?roleName=ADMIN",
  });
}

/**
 * Hook pour récupérer les utilisateurs avec pagination
 */
export function usePaginatedUsers(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const { data, isLoading, error, refetch } = useApiQuery<User[]>({
    queryKey: [...USERS_QUERY_KEY, page, limit],
    url: `/api/users?page=${page}&limit=${limit}`,
  });

  const users = data?.data || [];
  // Extraire les métadonnées de pagination de la réponse
  const pagination = data?.meta
    ? (data.meta as unknown as PaginationMeta)
    : {
        total: 0,
        pages: 0,
        page,
        limit,
      };

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && (!pagination.pages || newPage <= pagination.pages)) {
      setPage(newPage);
    }
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return {
    users,
    pagination,
    isLoading,
    error: error ? error.message : null,
    goToPage,
    changeLimit,
    refetch,
  };
}

/**
 * Hook pour mettre à jour un utilisateur
 */
export function useUpdateUser(id: string): ApiMutationResult<User, UpdateUserData> {
  return useApiMutation<User, UpdateUserData>({
    mutationFn: (userData) => 
      FetchService.put(`/api/users/${id}`, userData),
    invalidateQueries: [
      USERS_QUERY_KEY, 
      [...USERS_QUERY_KEY, id],
      ...(id ? [CURRENT_USER_QUERY_KEY] : [])
    ],
  });
}

/**
 * Hook pour mettre à jour l'utilisateur courant
 */
export function useUpdateCurrentUser(): ApiMutationResult<CurrentUser, UpdateUserData> {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useApiMutation<CurrentUser, UpdateUserData>({
    mutationFn: (userData) => {
      if (!userId) throw new Error("Utilisateur non connecté");
      return FetchService.patch<CurrentUser>(`/api/users/${userId}`, userData);
    },
    invalidateQueries: [CURRENT_USER_QUERY_KEY, [...USERS_QUERY_KEY, userId || ""]],
  });
}

/**
 * Hook pour changer le mot de passe d'un utilisateur
 */
export function useChangePassword(): ApiMutationResult<unknown, ChangePasswordData> {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useApiMutation<unknown, ChangePasswordData>({
    mutationFn: (passwordData) => {
      if (!userId) throw new Error("Utilisateur non connecté");
      return FetchService.put<unknown>(`/api/users/${userId}/password`, passwordData);
    },
    invalidateQueries: [],
  });
}

/**
 * Hook pour créer un utilisateur
 */
export function useCreateUser(): ApiMutationResult<User, Partial<User>> {
  return useApiMutation<User, Partial<User>>({
    mutationFn: (userData) => 
      FetchService.post("/api/users", userData),
    invalidateQueries: [USERS_QUERY_KEY],
  });
}

/**
 * Hook pour supprimer un utilisateur
 */
export function useDeleteUser(): ApiMutationResult<unknown, string> {
  return useApiMutation<unknown, string>({
    mutationFn: (id) => 
      FetchService.delete(`/api/users/${id}`),
    invalidateQueries: [USERS_QUERY_KEY],
  });
}