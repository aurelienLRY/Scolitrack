"use client";

import {
  useApiQuery,
  useApiMutation,
  ApiQueryResult,
  ApiMutationResult,
} from "@/hooks/query/useQuery";
import FetchService from "@/lib/services/fetch.service";
import { EducationLevel } from "@prisma/client";
import {
  EducationLevelFormData,
  EducationLevelUpdateFormData,
} from "@/schemas/educationLevelSchema";

// Clé de query pour les niveaux d'éducation
export const EDUCATION_LEVEL_QUERY_KEY = ["educationLevel"];

/**
 * Hook pour récupérer tous les niveaux d'éducation d'un établissement
 */
export function useEducationLevels(
  establishmentId: string
): ApiQueryResult<EducationLevel[]> {
  return useApiQuery<EducationLevel[]>({
    queryKey: [...EDUCATION_LEVEL_QUERY_KEY, establishmentId],
    url: `/api/setup-application/education-levels?establishmentId=${establishmentId}`,
    enabled: !!establishmentId,
  });
}

/**
 * Hook pour créer un niveau d'éducation
 */
export function useCreateEducationLevel(): ApiMutationResult<
  EducationLevel,
  EducationLevelFormData
> {
  return useApiMutation<EducationLevel, EducationLevelFormData>({
    mutationFn: (data) =>
      FetchService.post("/api/setup-application/education-levels", data),
    invalidateQueries: [EDUCATION_LEVEL_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour un niveau d'éducation
 */
export function useUpdateEducationLevel(
  id: string
): ApiMutationResult<EducationLevel, EducationLevelUpdateFormData> {
  return useApiMutation<EducationLevel, EducationLevelUpdateFormData>({
    mutationFn: (data) =>
      FetchService.put(`/api/setup-application/education-levels/${id}`, data),
    invalidateQueries: [EDUCATION_LEVEL_QUERY_KEY],
  });
}

/**
 * Hook pour supprimer un niveau d'éducation
 */
export function useDeleteEducationLevel(): ApiMutationResult<
  EducationLevel,
  string
> {
  return useApiMutation<EducationLevel, string>({
    mutationFn: (id) =>
      FetchService.delete(`/api/setup-application/education-levels/${id}`),
    invalidateQueries: [EDUCATION_LEVEL_QUERY_KEY],
  });
}
