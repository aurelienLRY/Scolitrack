// src/hooks/usePrivileges.ts (nouveau fichier)
"use client";

import { useApiQuery, ApiQueryResult } from "@/hooks/query/useQuery";
import { Privilege } from "@prisma/client";

// Clé de query pour les privilèges
export const PRIVILEGES_QUERY_KEY = ["privileges"];

/**
 * Hook pour récupérer tous les privilèges
 *
 * Ce hook permet de récupérer la liste complète des privilèges depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @returns {Object} Un objet contenant les données des privilèges et l'état de la requête
 *
 * @example
 * ```tsx
 * import { usePrivileges } from "@/hooks";
 *
 * function PrivilegesList() {
 *   const { data, isLoading, error } = usePrivileges();
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <ul>
 *       {data?.data.map(privilege => (
 *         <li key={privilege.id}>{privilege.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function usePrivileges(): ApiQueryResult<Privilege[]> {
  return useApiQuery<Privilege[]>({
    queryKey: PRIVILEGES_QUERY_KEY,
    url: "/api/setup-application/privileges",
  });
}

/**
 * Hook pour récupérer un privilège par son ID
 *
 * Ce hook permet de récupérer les informations d'un privilège spécifique depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID du privilège à récupérer
 * @returns {Object} Un objet contenant les données du privilège et l'état de la requête
 *
 * @example
 * ```tsx
 * import { usePrivilege } from "@/hooks";
 *
 * function PrivilegeDetails() {
 *   const { data, isLoading, error } = usePrivilege("123");
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
export function usePrivilege(id: string): ApiQueryResult<Privilege> {
  return useApiQuery<Privilege>({
    queryKey: [...PRIVILEGES_QUERY_KEY, id],
    url: `/api/setup-application/privileges/${id}`,
    enabled: !!id, // N'exécute la requête que si l'ID existe
  });
}
