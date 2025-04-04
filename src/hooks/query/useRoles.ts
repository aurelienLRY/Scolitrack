// src/hooks/useRoles.ts
"use client";

import {
  useApiQuery,
  useApiMutation,
  ApiQueryResult,
  ApiMutationResult,
} from "@/hooks/query/useQuery";
import FetchService from "@/lib/services/fetch.service";
import { Role as PrismaRole, Privilege } from "@prisma/client";

// Type pour RolePrivilege retourné par l'API
export interface RolePrivilege {
  id: string;
  roleId: string;
  privilegeId: string;
  createdAt: Date;
  updatedAt: Date;
  privilege: Privilege;
}

// Type enrichi pour Role avec les relations
export interface Role extends PrismaRole {
  privileges?: Privilege[];
  rolePrivileges?: RolePrivilege[];
}

// Clé de query pour les rôles
export const ROLES_QUERY_KEY = ["roles"];

// Type pour la création d'un rôle
export interface CreateRoleData {
  name: string;
  description?: string;
  privilegeIds?: string[];
}

// Type pour la mise à jour d'un rôle
export interface UpdateRoleData {
  name?: string;
  description?: string;
  privilegeIds?: string[];
}

/**
 * Hook pour récupérer tous les rôles
 *
 * Ce hook permet de récupérer la liste complète des rôles depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @returns {ApiQueryResult<Role[]>} Un objet contenant les données des rôles et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useRoles } from "@/hooks";
 *
 * function RolesList() {
 *   const { data, isLoading, error } = useRoles();
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <ul>
 *       {data?.data.map(role => (
 *         <li key={role.id}>{role.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useRoles(): ApiQueryResult<Role[]> {
  return useApiQuery<Role[]>({
    queryKey: ROLES_QUERY_KEY,
    url: "/api/setup-application/roles",
  });
}

/**
 * Hook pour récupérer un rôle par son ID
 *
 * Ce hook permet de récupérer les informations d'un rôle spécifique depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID du rôle à récupérer
 * @returns {ApiQueryResult<Role>} Un objet contenant les données du rôle et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useRole } from "@/hooks";
 *
 * function RoleDetails() {
 *   const { data, isLoading, error } = useRole("123");
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <h1>{data?.data.name}</h1>
 *       <p>{data?.data.description}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRole(id: string): ApiQueryResult<Role> {
  return useApiQuery<Role>({
    queryKey: [...ROLES_QUERY_KEY, id],
    url: `/api/setup-application/roles/${id}`,
    enabled: !!id, // N'exécute la requête que si l'ID existe
  });
}

/**
 * Hook pour créer un rôle
 *
 * Ce hook permet de créer un nouveau rôle depuis l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {CreateRoleData} data - Les données du rôle à créer
 * @returns {ApiMutationResult<Role, CreateRoleData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useCreateRole } from "@/hooks";
 *
 * function CreateRoleForm() {
 *   const { mutate, isLoading, error } = useCreateRole();
 *
 *   const handleSubmit = (data: CreateRoleData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="text" name="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? "Envoi en cours..." : "Envoyer"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateRole(): ApiMutationResult<Role, CreateRoleData> {
  return useApiMutation<Role, CreateRoleData>({
    mutationFn: (data) =>
      FetchService.post("/api/setup-application/roles", data),
    invalidateQueries: [ROLES_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour un rôle
 *
 * Ce hook permet de mettre à jour un rôle existant depuis l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID du rôle à mettre à jour (optionnel)
 * @returns {ApiMutationResult<Role, UpdateRoleData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useUpdateRole } from "@/hooks";
 *
 * function UpdateRoleForm() {
 *   const { mutate, isLoading, error } = useUpdateRole("123");
 *
 *   const handleSubmit = (data: UpdateRoleData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="text" name="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? "Envoi en cours..." : "Envoyer"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateRole(
  id?: string
): ApiMutationResult<Role, UpdateRoleData> {
  return useApiMutation<Role, UpdateRoleData>({
    mutationFn: (data) =>
      FetchService.put(`/api/setup-application/roles/${id}`, data),
    invalidateQueries: id
      ? [ROLES_QUERY_KEY, [...ROLES_QUERY_KEY, id]]
      : [ROLES_QUERY_KEY],
  });
}

/**
 * Hook pour supprimer un rôle
 *
 * Ce hook permet de supprimer un rôle existant depuis l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID du rôle à supprimer
 * @returns {ApiMutationResult<void, string>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useDeleteRole } from "@/hooks";
 *
 * function DeleteRoleForm() {
 *   const { mutate, isLoading, error } = useDeleteRole("123");
 *
 *   const handleSubmit = () => {
 *     mutate();
 *   };
 *
 *   return (
 *     <button onClick={handleSubmit} disabled={isLoading}>
 *       {isLoading ? "Suppression en cours..." : "Supprimer"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteRole(): ApiMutationResult<void, string> {
  return useApiMutation<void, string>({
    mutationFn: (id) =>
      FetchService.delete(`/api/setup-application/roles/${id}`),
    invalidateQueries: [ROLES_QUERY_KEY],
  });
}

/**
 * Hook pour assigner un rôle à un utilisateur
 *
 * Ce hook permet d'assigner un rôle à un utilisateur existant depuis l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} userId - L'ID de l'utilisateur à qui assigner le rôle
 * @param {string} roleName - Le nom du rôle à assigner (optionnel)
 * @returns {ApiMutationResult<{ userId: string; roleName: string }, { userId: string; roleName: string }>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useAssignRoleToUser } from "@/hooks";
 *
 * function AssignRoleForm() {
 *   const { mutate, isLoading, error } = useAssignRoleToUser("123", "admin");
 *
 *   const handleSubmit = (data: { userId: string; roleName: string }) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="text" name="userId" value={data.userId} onChange={(e) => setData({ ...data, userId: e.target.value })} />
 *       <input type="text" name="roleName" value={data.roleName} onChange={(e) => setData({ ...data, roleName: e.target.value })} />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? "Envoi en cours..." : "Envoyer"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAssignRoleToUser(): ApiMutationResult<
  { userId: string; roleName: string },
  { userId: string; roleName: string }
> {
  return useApiMutation<
    { userId: string; roleName: string },
    { userId: string; roleName: string }
  >({
    mutationFn: ({ userId, roleName }) =>
      FetchService.put(`/api/users/${userId}/role`, { roleName }),
    invalidateQueries: [ROLES_QUERY_KEY, ["users"]],
  });
}
