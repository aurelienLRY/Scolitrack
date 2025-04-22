"use client";

import {
  useApiQuery,
  useApiMutation,
  ApiQueryResult,
  ApiMutationResult,
} from "@/hooks/query/useQuery";
import { 
  CommissionFormData, 
  CommissionUpdateFormData,
  CommissionMemberFormData
} from "@/schemas/commissionSchema";
import FetchService from "@/lib/services/fetch.service";
import { TCommissionWithAllRelations, TCommissionMemberWithUser } from "@/types/commission.type";



// Clés de query pour les commissions
export const COMMISSIONS_QUERY_KEY = ["commissions"];
export const COMMISSION_QUERY_KEY = "commission";
export const USER_COMMISSIONS_QUERY_KEY = "userCommissions";

/**
 * Hook pour récupérer toutes les commissions
 * @param establishmentId - Filtre par établissement (optionnel)
 */
export function useCommissions(establishmentId?: string): ApiQueryResult<TCommissionWithAllRelations[]> {
  const url = establishmentId 
    ? `/api/setup-application/commissions?establishmentId=${establishmentId}` 
    : "/api/setup-application/commissions";

  return useApiQuery<TCommissionWithAllRelations[]>({
    queryKey: establishmentId 
      ? [...COMMISSIONS_QUERY_KEY, { establishmentId }] 
      : COMMISSIONS_QUERY_KEY,
    url,
  });
}

/**
 * Hook pour récupérer une commission par son ID
 * @param id - ID de la commission
 */
export function useCommission(id?: string): ApiQueryResult<TCommissionWithAllRelations> {
  return useApiQuery<TCommissionWithAllRelations>({
    queryKey: [COMMISSION_QUERY_KEY, id],
    url: `/api/setup-application/commissions/${id}`,
    enabled: !!id,
  });
}

/**
 * Hook pour créer une nouvelle commission
 */
export function useCreateCommission(): ApiMutationResult<TCommissionWithAllRelations, CommissionFormData> {
  return useApiMutation<TCommissionWithAllRelations, CommissionFormData>({
    mutationFn: async (data) => {
      return FetchService.post<TCommissionWithAllRelations>("/api/setup-application/commissions", data);
    },
    invalidateQueries: [COMMISSIONS_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour une commission
 * @param id - ID de la commission
 */
export function useUpdateCommission(id?: string): ApiMutationResult<TCommissionWithAllRelations, CommissionUpdateFormData> {
  return useApiMutation<TCommissionWithAllRelations, CommissionUpdateFormData>({
    mutationFn: async (data) => {
      if (!id) throw new Error("ID de commission requis");
      return FetchService.put<TCommissionWithAllRelations>(`/api/setup-application/commissions/${id}`, data);
    },
    invalidateQueries: [COMMISSIONS_QUERY_KEY, [COMMISSION_QUERY_KEY, id]],
  });
}

/**
 * Hook pour supprimer une commission
 */
export function useDeleteCommission(): ApiMutationResult<unknown, string> {
  return useApiMutation<unknown, string>({
    mutationFn: async (id) => {
      return FetchService.delete(`/api/setup-application/commissions/${id}`);
    },
    invalidateQueries: [COMMISSIONS_QUERY_KEY],
  });
}

/**
 * Hook pour récupérer les commissions d'un utilisateur
 * @param userId - ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 */
export function useUserCommissions(userId?: string): ApiQueryResult<TCommissionMemberWithUser[]> {
  const url = userId 
    ? `/api/setup-application/commissions/members?userId=${userId}` 
    : "/api/setup-application/commissions/members";
  
  return useApiQuery<TCommissionMemberWithUser[]>({
    queryKey: [USER_COMMISSIONS_QUERY_KEY, userId],
    url,
  });
}

/**
 * Hook pour ajouter un membre à une commission
 */
export function useAddCommissionMember(): ApiMutationResult<TCommissionMemberWithUser, CommissionMemberFormData> {
  return useApiMutation<TCommissionMemberWithUser, CommissionMemberFormData>({
    mutationFn: async (data) => {
      return FetchService.post<TCommissionMemberWithUser>("/api/setup-application/commissions/members", data);
    },
    invalidateQueries: [
      [COMMISSION_QUERY_KEY, (variables: CommissionMemberFormData) => variables?.commissionId],
      [USER_COMMISSIONS_QUERY_KEY, (variables: CommissionMemberFormData) => variables?.userId]
    ],
  });
}

/**
 * Type pour les paramètres de mise à jour du rôle d'un membre
 */
type UpdateMemberRoleParams = {
  userId: string;
  commissionId: string;
  role: string;
};

/**
 * Hook pour mettre à jour le rôle d'un membre
 */
export function useUpdateMemberRole(): ApiMutationResult<
  TCommissionMemberWithUser, 
  UpdateMemberRoleParams
> {
  return useApiMutation<TCommissionMemberWithUser, UpdateMemberRoleParams>({
    mutationFn: async ({ userId, commissionId, role }) => {
      return FetchService.put<TCommissionMemberWithUser>(
        `/api/setup-application/commissions/members/${userId}/${commissionId}`,
        { role }
      );
    },
    invalidateQueries: [
      [COMMISSION_QUERY_KEY, (variables: UpdateMemberRoleParams) => variables?.commissionId],
      [USER_COMMISSIONS_QUERY_KEY, (variables: UpdateMemberRoleParams) => variables?.userId]
    ],
  });
}

/**
 * Type pour les paramètres de suppression d'un membre
 */
type RemoveMemberParams = {
  userId: string;
  commissionId: string;
};

/**
 * Hook pour supprimer un membre d'une commission
 */
export function useRemoveCommissionMember(): ApiMutationResult<
  unknown, 
  RemoveMemberParams
> {
  return useApiMutation<unknown, RemoveMemberParams>({
    mutationFn: async ({ userId, commissionId }) => {
      return FetchService.delete(
        `/api/setup-application/commissions/members/${userId}/${commissionId}`
      );
    },
    invalidateQueries: [
      [COMMISSION_QUERY_KEY, (variables: RemoveMemberParams) => variables?.commissionId],
      [USER_COMMISSIONS_QUERY_KEY, (variables: RemoveMemberParams) => variables?.userId]
    ],
  });
} 