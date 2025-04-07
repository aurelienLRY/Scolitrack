"use client";

import {
  useApiQuery,
  useApiMutation,
  ApiQueryResult,
  ApiMutationResult,
} from "@/hooks/query/useQuery";
import { Establishment, User, EducationLevel } from "@prisma/client";
import FetchService from "@/lib/services/fetch.service";
import {
  establishmentUpdateSchema,
  establishmentSchema,
} from "@/schemas/establishmentSchema";

// Type pour les données d'établissement

// Clé de query pour les établissements
export const ESTABLISHMENT_QUERY_KEY = ["establishment"];
export type EstablishmentWithAdmin = Establishment & {
  admin?: User;
  EducationLevel: EducationLevel[];
};

/**
 * Hook pour récupérer un établissement
 *
 * Ce hook permet de récupérer les informations d'un établissement depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @returns {ApiQueryResult<EstablishmentWithAdmin>} Un objet contenant les données de l'établissement et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useEstablishment } from "@/hooks";
 *
 * function EstablishmentDetails() {
 *   const { data, isLoading, error } = useEstablishment();
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   const establishment = data?.data;
 *
 *   return (
 *     <div>
 *       <h1>{establishment?.name}</h1>
 *       <p>Adresse: {establishment?.address}</p>
 *       <p>Téléphone: {establishment?.phone}</p>
 *       {establishment?.admin && (
 *         <p>Administrateur: {establishment.admin.name}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useEstablishment(): ApiQueryResult<EstablishmentWithAdmin> {
  return useApiQuery<EstablishmentWithAdmin>({
    queryKey: ESTABLISHMENT_QUERY_KEY,
    url: "/api/setup-application/establishment",
  });
}

/**
 * Hook pour créer ou mettre à jour un établissement
 *
 * Ce hook permet de créer ou mettre à jour un établissement depuis l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} establishmentId - L'ID de l'établissement à mettre à jour (optionnel)
 * @returns {ApiMutationResult<EstablishmentWithAdmin, Record<string, unknown>>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useEstablishmentMutation } from "@/hooks";
 *
 * function EstablishmentForm() {
 *   const { mutate, isLoading, error } = useEstablishmentMutation();
 *
 *   const handleSubmit = (data: EstablishmentWithAdmin) => {
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

export function useEstablishmentMutation(
  establishmentId?: string
): ApiMutationResult<EstablishmentWithAdmin, Record<string, unknown>> {
  return useApiMutation<EstablishmentWithAdmin, Record<string, unknown>>({
    mutationFn: async (data) => {
      if (establishmentId) {
        await establishmentUpdateSchema.validate(data);
        return FetchService.put(
          `/api/setup-application/establishment?id=${establishmentId}`,
          data
        );
      } else {
        await establishmentSchema.validate(data);
        return FetchService.post("/api/setup-application/establishment", data);
      }
    },
    invalidateQueries: [ESTABLISHMENT_QUERY_KEY],
  });
}
