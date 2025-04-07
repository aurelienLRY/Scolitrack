"use client";

import {
  useApiQuery,
  useApiMutation,
  ApiQueryResult,
  ApiMutationResult,
} from "@/hooks/query/useQuery";
import FetchService from "@/lib/services/fetch.service";
import { ClassRoomWithPersonnel } from "@/types/classroom.type";
import { ClassRoom, ClassRoomPersonnel } from "@prisma/client";
import {
  ClassRoomFormData,
  ClassRoomUpdateFormData,
  ClassRoomPersonnelFormData,
} from "@/schemas/ClassRoomSchema";
import { ClassRoomFullData } from "@/types/classroom.type";

// Clé de query pour les salles de classe
export const CLASSROOM_QUERY_KEY = ["classroom"];

/**
 * Hook pour récupérer toutes les salles de classe d'un établissement
 *
 * Ce hook permet de récupérer la liste des salles de classe d'un établissement depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} establishmentId - L'ID de l'établissement
 * @returns {ApiQueryResult<ClassRoomWithPersonnel[]>} Un objet contenant les données des salles de classe et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useClassRooms } from "@/hooks/query/useClassRoom";
 *
 * function ClassRoomsList() {
 *   const { data, isLoading, error } = useClassRooms("123");
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <ul>
 *       {data?.data.map(classroom => (
 *         <li key={classroom.id}>{classroom.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useClassRooms(
  establishmentId: string
): ApiQueryResult<ClassRoomWithPersonnel[]> {
  return useApiQuery<ClassRoomWithPersonnel[]>({
    queryKey: [...CLASSROOM_QUERY_KEY, establishmentId],
    url: `/api/setup-application/classrooms?establishmentId=${establishmentId}`,
    enabled: !!establishmentId,
  });
}

/**
 * Hook pour récupérer une salle de classe par son ID
 *
 * Ce hook permet de récupérer les informations d'une salle de classe spécifique depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID de la salle de classe à récupérer
 * @returns {ApiQueryResult<ClassRoomWithPersonnel>} Un objet contenant les données de la salle de classe et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useClassRoom } from "@/hooks/query/useClassRoom";
 *
 * function ClassRoomDetails() {
 *   const { data, isLoading, error } = useClassRoom("123");
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <h1>{data?.data.name}</h1>
 *       <p>Niveau: {data?.data.level}</p>
 *       <p>Capacité: {data?.data.capacity}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useClassRoom(id: string): ApiQueryResult<ClassRoomFullData> {
  return useApiQuery<ClassRoomFullData>({
    queryKey: [...CLASSROOM_QUERY_KEY, id],
    url: `/api/setup-application/classrooms/${id}`,
    enabled: !!id,
  });
}

/**
 * Hook pour créer une salle de classe
 *
 * Ce hook permet de créer une nouvelle salle de classe via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @returns {ApiMutationResult<ClassRoom, ClassRoomFormData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useCreateClassRoom } from "@/hooks/query/useClassRoom";
 *
 * function CreateClassRoomForm() {
 *   const { mutate, isLoading, error } = useCreateClassRoom();
 *
 *   const handleSubmit = (data: ClassRoomFormData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Nom de la classe" />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? "Création en cours..." : "Créer"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateClassRoom(): ApiMutationResult<
  ClassRoom,
  ClassRoomFormData
> {
  return useApiMutation<ClassRoom, ClassRoomFormData>({
    mutationFn: (data) =>
      FetchService.post("/api/setup-application/classrooms", data),
    invalidateQueries: [CLASSROOM_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour une salle de classe
 *
 * Ce hook permet de mettre à jour une salle de classe existante via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID de la salle de classe à mettre à jour
 * @returns {ApiMutationResult<ClassRoom, ClassRoomUpdateFormData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useUpdateClassRoom } from "@/hooks/query/useClassRoom";
 *
 * function UpdateClassRoomForm({ id }) {
 *   const { mutate, isLoading, error } = useUpdateClassRoom(id);
 *
 *   const handleSubmit = (data: ClassRoomUpdateFormData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Nom de la classe" />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? "Mise à jour en cours..." : "Mettre à jour"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateClassRoom(
  id: string
): ApiMutationResult<ClassRoom, ClassRoomUpdateFormData> {
  return useApiMutation<ClassRoom, ClassRoomUpdateFormData>({
    mutationFn: (data) =>
      FetchService.put(`/api/setup-application/classrooms/${id}`, data),
    invalidateQueries: id
      ? [CLASSROOM_QUERY_KEY, [...CLASSROOM_QUERY_KEY, id]]
      : [CLASSROOM_QUERY_KEY],
  });
}

/**
 * Hook pour supprimer une salle de classe
 *
 * Ce hook permet de supprimer une salle de classe existante via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @returns {ApiMutationResult<ClassRoom, string>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useDeleteClassRoom } from "@/hooks/query/useClassRoom";
 *
 * function DeleteClassRoomButton({ id }) {
 *   const { mutate, isLoading } = useDeleteClassRoom();
 *
 *   const handleDelete = () => {
 *     mutate(id);
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isLoading}>
 *       {isLoading ? "Suppression en cours..." : "Supprimer"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteClassRoom(): ApiMutationResult<ClassRoom, string> {
  return useApiMutation<ClassRoom, string>({
    mutationFn: (id) =>
      FetchService.delete(`/api/setup-application/classrooms/${id}`),
    invalidateQueries: [CLASSROOM_QUERY_KEY],
  });
}

/**
 * Hook pour récupérer le personnel d'une salle de classe
 *
 * Ce hook permet de récupérer la liste du personnel assigné à une salle de classe depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} classRoomId - L'ID de la salle de classe
 * @returns {ApiQueryResult<ClassRoomPersonnel[]>} Un objet contenant les données du personnel et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useClassRoomPersonnel } from "@/hooks/query/useClassRoom";
 *
 * function ClassRoomPersonnelList({ classRoomId }) {
 *   const { data, isLoading, error } = useClassRoomPersonnel(classRoomId);
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <ul>
 *       {data?.data.map(person => (
 *         <li key={person.userId}>{person.user.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useClassRoomPersonnel(
  classRoomId: string
): ApiQueryResult<ClassRoomPersonnel[]> {
  return useApiQuery<ClassRoomPersonnel[]>({
    queryKey: [...CLASSROOM_QUERY_KEY, classRoomId, "personnel"],
    url: `/api/setup-application/classrooms/${classRoomId}/personnel`,
    enabled: !!classRoomId,
  });
}

/**
 * Hook pour assigner un membre du personnel à une salle de classe
 *
 * Ce hook permet d'assigner un membre du personnel à une salle de classe via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} classRoomId - L'ID de la salle de classe
 * @returns {ApiMutationResult<ClassRoomPersonnel, ClassRoomPersonnelFormData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useAssignPersonnelToClassRoom } from "@/hooks/query/useClassRoom";
 *
 * function AssignPersonnelForm({ classRoomId }) {
 *   const { mutate, isLoading } = useAssignPersonnelToClassRoom(classRoomId);
 *
 *   const handleSubmit = (data: ClassRoomPersonnelFormData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <select name="userId">
 *         {users.map(user => (
 *           <option key={user.id} value={user.id}>{user.name}</option>
 *         ))}
 *       </select>
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? "Attribution en cours..." : "Attribuer"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAssignPersonnelToClassRoom(
  classRoomId: string
): ApiMutationResult<ClassRoomPersonnel, ClassRoomPersonnelFormData> {
  return useApiMutation<ClassRoomPersonnel, ClassRoomPersonnelFormData>({
    mutationFn: (data) =>
      FetchService.post(
        `/api/setup-application/classrooms/${classRoomId}/personnel`,
        data
      ),
    invalidateQueries: [
      CLASSROOM_QUERY_KEY,
      [...CLASSROOM_QUERY_KEY, classRoomId],
      [...CLASSROOM_QUERY_KEY, classRoomId, "personnel"],
    ],
  });
}

/**
 * Hook pour retirer un membre du personnel d'une salle de classe
 *
 * Ce hook permet de retirer un membre du personnel d'une salle de classe via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} classRoomId - L'ID de la salle de classe
 * @returns {ApiMutationResult<ClassRoomPersonnel, string>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useRemovePersonnelFromClassRoom } from "@/hooks/query/useClassRoom";
 *
 * function RemovePersonnelButton({ classRoomId, userId }) {
 *   const { mutate, isLoading } = useRemovePersonnelFromClassRoom(classRoomId);
 *
 *   const handleRemove = () => {
 *     mutate(userId);
 *   };
 *
 *   return (
 *     <button onClick={handleRemove} disabled={isLoading}>
 *       {isLoading ? "Retrait en cours..." : "Retirer"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useRemovePersonnelFromClassRoom(
  classRoomId: string
): ApiMutationResult<ClassRoomPersonnel, string> {
  return useApiMutation<ClassRoomPersonnel, string>({
    mutationFn: (userId) =>
      FetchService.delete(
        `/api/setup-application/classrooms/${classRoomId}/personnel?userId=${userId}`
      ),
    invalidateQueries: [
      CLASSROOM_QUERY_KEY,
      [...CLASSROOM_QUERY_KEY, classRoomId],
      [...CLASSROOM_QUERY_KEY, classRoomId, "personnel"],
    ],
  });
}
