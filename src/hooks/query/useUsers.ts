"use client";

import { useApiQuery, ApiQueryResult } from "@/hooks/query/useQuery";
import { User } from "@prisma/client";
import { useState } from "react";

// Type pour la pagination
export interface PaginationMeta {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Clés de query pour les utilisateurs
export const USERS_QUERY_KEY = ["users"];
export const ADMINS_QUERY_KEY = ["users", "Role", "ADMIN"];

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
