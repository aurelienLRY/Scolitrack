"use client";

import {
  useApiQuery,
  useApiMutation,
  ApiQueryResult,
  ApiMutationResult,
} from "@/hooks/query/useQuery";
import FetchService from "@/lib/services/fetch.service";
import {
  EnrollmentCampaignComplete,
  EnrollmentFileWithDetails,
  CreateEnrollmentCampaignData,
  UpdateEnrollmentCampaignData,
  CreateEnrollmentFileData,
  UpdateEnrollmentFileData,
  UpdateEnrollmentStatusData,
  AddStudentToEnrollmentData,
  GenerateEnrollmentFilesData,
  EnrollmentCampaignFilters,
  EnrollmentFileFilters,
  GenerateFilesResponse,
} from "@/types/enrollment.type";

// Clés de query pour les campagnes d'inscription
export const ENROLLMENT_CAMPAIGN_QUERY_KEY = ["enrollment-campaign"];
export const ENROLLMENT_FILE_QUERY_KEY = ["enrollment-file"];
export const ENROLLMENT_STATS_QUERY_KEY = ["enrollment-stats"];

/**
 * Hook pour récupérer toutes les campagnes d'inscription
 *
 * Ce hook permet de récupérer la liste des campagnes d'inscription depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {EnrollmentCampaignFilters} filters - Filtres optionnels pour les campagnes
 * @returns {ApiQueryResult<EnrollmentCampaignComplete[]>} Un objet contenant les données des campagnes et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useEnrollmentCampaigns } from "@/hooks/query/useEnrollment";
 *
 * function EnrollmentCampaignsList() {
 *   const { data, isLoading, error } = useEnrollmentCampaigns({ status: "active" });
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <ul>
 *       {data?.data.campaigns.map(campaign => (
 *         <li key={campaign.id}>{campaign.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useEnrollmentCampaigns(
  filters?: EnrollmentCampaignFilters
): ApiQueryResult<EnrollmentCampaignComplete[]> {
  const queryParams = new URLSearchParams();
  
  if (filters?.status) {
    queryParams.append("status", filters.status);
  }
  if (filters?.creatorId) {
    queryParams.append("creatorId", filters.creatorId);
  }

  const url = `/api/enrollment/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return useApiQuery<EnrollmentCampaignComplete[]>({
    queryKey: [...ENROLLMENT_CAMPAIGN_QUERY_KEY, filters],
    url,
  });
}

/**
 * Hook pour récupérer une campagne d'inscription par son ID
 *
 * Ce hook permet de récupérer les informations d'une campagne d'inscription spécifique depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID de la campagne à récupérer
 * @returns {ApiQueryResult<EnrollmentCampaignComplete>} Un objet contenant les données de la campagne et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useEnrollmentCampaign } from "@/hooks/query/useEnrollment";
 *
 * function EnrollmentCampaignDetails({ id }) {
 *   const { data, isLoading, error } = useEnrollmentCampaign(id);
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <h1>{data?.data.campaign.name}</h1>
 *       <p>Créée par: {data?.data.campaign.creator.name}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnrollmentCampaign(
  id: string
): ApiQueryResult<EnrollmentCampaignComplete> {
  return useApiQuery<EnrollmentCampaignComplete>({
    queryKey: [...ENROLLMENT_CAMPAIGN_QUERY_KEY, id],
    url: `/api/enrollment/campaigns/${id}`,
    enabled: !!id,
  });
}


/**
 * Hook pour créer une campagne d'inscription
 *
 * Ce hook permet de créer une nouvelle campagne d'inscription via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @returns {ApiMutationResult<EnrollmentCampaignComplete, CreateEnrollmentCampaignData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useCreateEnrollmentCampaign } from "@/hooks/query/useEnrollment";
 *
 * function CreateCampaignForm() {
 *   const { mutate, isPending, error } = useCreateEnrollmentCampaign();
 *
 *   const handleSubmit = (data: CreateEnrollmentCampaignData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Nom de la campagne" />
 *       <input name="startDate" type="date" />
 *       <input name="endDate" type="date" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Création en cours..." : "Créer"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateEnrollmentCampaign(): ApiMutationResult<
  EnrollmentCampaignComplete,
  CreateEnrollmentCampaignData
> {
  return useApiMutation<EnrollmentCampaignComplete, CreateEnrollmentCampaignData>({
    mutationFn: (data) =>
      FetchService.post("/api/enrollment/campaigns", data),
    invalidateQueries: [ENROLLMENT_CAMPAIGN_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour une campagne d'inscription
 *
 * Ce hook permet de mettre à jour une campagne d'inscription existante via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID de la campagne à mettre à jour
 * @returns {ApiMutationResult<EnrollmentCampaignComplete, UpdateEnrollmentCampaignData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useUpdateEnrollmentCampaign } from "@/hooks/query/useEnrollment";
 *
 * function UpdateCampaignForm({ id }) {
 *   const { mutate, isPending, error } = useUpdateEnrollmentCampaign(id);
 *
 *   const handleSubmit = (data: UpdateEnrollmentCampaignData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="name" placeholder="Nom de la campagne" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Mise à jour en cours..." : "Mettre à jour"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateEnrollmentCampaign(
  id: string
): ApiMutationResult<EnrollmentCampaignComplete, UpdateEnrollmentCampaignData> {
  return useApiMutation<EnrollmentCampaignComplete, UpdateEnrollmentCampaignData>({
    mutationFn: (data) =>
      FetchService.put(`/api/enrollment/campaigns/${id}`, data),
    invalidateQueries: id
      ? [ENROLLMENT_CAMPAIGN_QUERY_KEY, [...ENROLLMENT_CAMPAIGN_QUERY_KEY, id]]
      : [ENROLLMENT_CAMPAIGN_QUERY_KEY],
  });
}

/**
 * Hook pour supprimer une campagne d'inscription
 *
 * Ce hook permet de supprimer une campagne d'inscription existante via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @returns {ApiMutationResult<EnrollmentCampaignComplete, string>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useDeleteEnrollmentCampaign } from "@/hooks/query/useEnrollment";
 *
 * function DeleteCampaignButton({ id }) {
 *   const { mutate, isPending } = useDeleteEnrollmentCampaign();
 *
 *   const handleDelete = () => {
 *     mutate(id);
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isPending}>
 *       {isPending ? "Suppression en cours..." : "Supprimer"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteEnrollmentCampaign(): ApiMutationResult<
  EnrollmentCampaignComplete,
  string
> {
  return useApiMutation<EnrollmentCampaignComplete, string>({
    mutationFn: (id) =>
      FetchService.delete(`/api/enrollment/campaigns/${id}`),
    invalidateQueries: [ENROLLMENT_CAMPAIGN_QUERY_KEY, ENROLLMENT_FILE_QUERY_KEY],
  });
}

/**
 * Hook pour générer des dossiers d'inscription en masse
 *
 * Ce hook permet de générer des dossiers d'inscription pour une campagne via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} campaignId - L'ID de la campagne
 * @returns {ApiMutationResult<GenerateFilesResponse, GenerateEnrollmentFilesData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useGenerateEnrollmentFiles } from "@/hooks/query/useEnrollment";
 *
 * function GenerateFilesForm({ campaignId }) {
 *   const { mutate, isPending } = useGenerateEnrollmentFiles(campaignId);
 *
 *   const handleSubmit = (data: GenerateEnrollmentFilesData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <textarea name="emails" placeholder="Emails séparés par des virgules" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Génération en cours..." : "Générer les dossiers"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useGenerateEnrollmentFiles(
  campaignId: string
): ApiMutationResult<GenerateFilesResponse, GenerateEnrollmentFilesData> {
  return useApiMutation<GenerateFilesResponse, GenerateEnrollmentFilesData>({
    mutationFn: (data) =>
      FetchService.post(`/api/enrollment/campaigns/${campaignId}/generate`, data),
    invalidateQueries: [
      ENROLLMENT_CAMPAIGN_QUERY_KEY,
      [...ENROLLMENT_CAMPAIGN_QUERY_KEY, campaignId],
      ENROLLMENT_FILE_QUERY_KEY,
    ],
  });
}

/**
 * Hook pour récupérer tous les dossiers d'inscription
 *
 * Ce hook permet de récupérer la liste des dossiers d'inscription depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {EnrollmentFileFilters} filters - Filtres optionnels pour les dossiers
 * @returns {ApiQueryResult<EnrollmentFileWithDetails[]>} Un objet contenant les données des dossiers et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useEnrollmentFiles } from "@/hooks/query/useEnrollment";
 *
 * function EnrollmentFilesList() {
 *   const { data, isLoading, error } = useEnrollmentFiles({ status: "SUBMITTED" });
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <ul>
 *       {data?.data.files.map(file => (
 *         <li key={file.id}>{file.email}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useEnrollmentFiles(
  filters?: EnrollmentFileFilters
): ApiQueryResult<EnrollmentFileWithDetails[]> {
  const queryParams = new URLSearchParams();
  
  if (filters?.status) {
    queryParams.append("status", filters.status);
  }
  if (filters?.campaignId) {
    queryParams.append("campaignId", filters.campaignId);
  }
  if (filters?.familyId) {
    queryParams.append("familyId", filters.familyId);
  }
  if (filters?.email) {
    queryParams.append("email", filters.email);
  }

  const url = `/api/enrollment/files${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return useApiQuery<EnrollmentFileWithDetails[]>({
    queryKey: [...ENROLLMENT_FILE_QUERY_KEY, filters],
    url,
  });
}

/**
 * Hook pour récupérer un dossier d'inscription par son ID
 *
 * Ce hook permet de récupérer les informations d'un dossier d'inscription spécifique depuis l'API.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID du dossier à récupérer
 * @returns {ApiQueryResult<EnrollmentFileWithDetails>} Un objet contenant les données du dossier et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useEnrollmentFile } from "@/hooks/query/useEnrollment";
 *
 * function EnrollmentFileDetails({ id }) {
 *   const { data, isLoading, error } = useEnrollmentFile(id);
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <div>
 *       <h1>Dossier: {data?.data.file.email}</h1>
 *       <p>Statut: {data?.data.file.status}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnrollmentFile(
  id: string
): ApiQueryResult<EnrollmentFileWithDetails> {
  return useApiQuery<EnrollmentFileWithDetails>({
    queryKey: [...ENROLLMENT_FILE_QUERY_KEY, id],
    url: `/api/enrollment/files/${id}`,
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer un dossier d'inscription par son token (accès public)
 *
 * Ce hook permet de récupérer un dossier d'inscription via son token pour l'accès public.
 * Il utilise useApiQuery pour gérer la requête et le cache.
 *
 * @param {string} token - Le token du dossier
 * @returns {ApiQueryResult<EnrollmentFileWithDetails>} Un objet contenant les données du dossier et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useEnrollmentFileByToken } from "@/hooks/query/useEnrollment";
 *
 * function PublicEnrollmentForm({ token }) {
 *   const { data, isLoading, error } = useEnrollmentFileByToken(token);
 *
 *   if (isLoading) return <p>Chargement en cours...</p>;
 *   if (error) return <p>Erreur: {error.message}</p>;
 *
 *   return (
 *     <form>
 *       <h1>Dossier d'inscription</h1>
 *       <p>Email: {data?.data.file.email}</p>
 *     </form>
 *   );
 * }
 * ```
 */
export function useEnrollmentFileByToken(
  token: string
): ApiQueryResult<EnrollmentFileWithDetails> {
  return useApiQuery<EnrollmentFileWithDetails>({
    queryKey: [...ENROLLMENT_FILE_QUERY_KEY, "token", token],
    url: `/api/enrollment/files/token/${token}`,
    enabled: !!token,
  });
}

/**
 * Hook pour créer un dossier d'inscription
 *
 * Ce hook permet de créer un nouveau dossier d'inscription via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @returns {ApiMutationResult<EnrollmentFileWithDetails, CreateEnrollmentFileData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useCreateEnrollmentFile } from "@/hooks/query/useEnrollment";
 *
 * function CreateFileForm() {
 *   const { mutate, isPending, error } = useCreateEnrollmentFile();
 *
 *   const handleSubmit = (data: CreateEnrollmentFileData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="campaignId" placeholder="ID de la campagne" />
 *       <input name="email" type="email" placeholder="Email" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Création en cours..." : "Créer"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreateEnrollmentFile(): ApiMutationResult<
  EnrollmentFileWithDetails,
  CreateEnrollmentFileData
> {
  return useApiMutation<EnrollmentFileWithDetails, CreateEnrollmentFileData>({
    mutationFn: (data) =>
      FetchService.post("/api/enrollment/files", data),
    invalidateQueries: [ENROLLMENT_FILE_QUERY_KEY, ENROLLMENT_CAMPAIGN_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour un dossier d'inscription
 *
 * Ce hook permet de mettre à jour un dossier d'inscription existant via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID du dossier à mettre à jour
 * @returns {ApiMutationResult<EnrollmentFileWithDetails, UpdateEnrollmentFileData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useUpdateEnrollmentFile } from "@/hooks/query/useEnrollment";
 *
 * function UpdateFileForm({ id }) {
 *   const { mutate, isPending, error } = useUpdateEnrollmentFile(id);
 *
 *   const handleSubmit = (data: UpdateEnrollmentFileData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <select name="status">
 *         <option value="DRAFT">Brouillon</option>
 *         <option value="SUBMITTED">Soumis</option>
 *       </select>
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Mise à jour en cours..." : "Mettre à jour"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateEnrollmentFile(
  id: string
): ApiMutationResult<EnrollmentFileWithDetails, UpdateEnrollmentFileData> {
  return useApiMutation<EnrollmentFileWithDetails, UpdateEnrollmentFileData>({
    mutationFn: (data) =>
      FetchService.put(`/api/enrollment/files/${id}`, data),
    invalidateQueries: id
      ? [
          ENROLLMENT_FILE_QUERY_KEY,
          ENROLLMENT_CAMPAIGN_QUERY_KEY,
          [...ENROLLMENT_FILE_QUERY_KEY, id],
        ]
      : [ENROLLMENT_FILE_QUERY_KEY, ENROLLMENT_CAMPAIGN_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour le statut d'un dossier d'inscription
 *
 * Ce hook permet de mettre à jour le statut d'un dossier d'inscription via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} id - L'ID du dossier à mettre à jour
 * @returns {ApiMutationResult<EnrollmentFileWithDetails, UpdateEnrollmentStatusData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useUpdateEnrollmentFileStatus } from "@/hooks/query/useEnrollment";
 *
 * function UpdateFileStatusForm({ id }) {
 *   const { mutate, isPending, error } = useUpdateEnrollmentFileStatus(id);
 *
 *   const handleSubmit = (data: UpdateEnrollmentStatusData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <select name="status">
 *         <option value="APPROVED">Approuvé</option>
 *         <option value="REJECTED">Refusé</option>
 *         <option value="NEED_INFO">À compléter</option>
 *       </select>
 *       <textarea name="note" placeholder="Note (optionnel)" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Mise à jour en cours..." : "Mettre à jour"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateEnrollmentFileStatus(
  id: string
): ApiMutationResult<EnrollmentFileWithDetails, UpdateEnrollmentStatusData> {
  return useApiMutation<EnrollmentFileWithDetails, UpdateEnrollmentStatusData>({
    mutationFn: (data) =>
      FetchService.put(`/api/enrollment/files/${id}/status`, data),
    invalidateQueries: id
      ? [
          ENROLLMENT_FILE_QUERY_KEY,
          ENROLLMENT_CAMPAIGN_QUERY_KEY,
          [...ENROLLMENT_FILE_QUERY_KEY, id],
        ]
      : [ENROLLMENT_FILE_QUERY_KEY, ENROLLMENT_CAMPAIGN_QUERY_KEY],
  });
}

/**
 * Hook pour mettre à jour un dossier d'inscription par token (accès public)
 *
 * Ce hook permet de mettre à jour un dossier d'inscription via son token pour l'accès public.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} token - Le token du dossier
 * @returns {ApiMutationResult<EnrollmentFileWithDetails, UpdateEnrollmentFileData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useUpdateEnrollmentFileByToken } from "@/hooks/query/useEnrollment";
 *
 * function PublicUpdateFileForm({ token }) {
 *   const { mutate, isPending, error } = useUpdateEnrollmentFileByToken(token);
 *
 *   const handleSubmit = (data: UpdateEnrollmentFileData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="familyId" placeholder="ID de la famille" />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Mise à jour en cours..." : "Mettre à jour"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useUpdateEnrollmentFileByToken(
  token: string
): ApiMutationResult<EnrollmentFileWithDetails, UpdateEnrollmentFileData> {
  return useApiMutation<EnrollmentFileWithDetails, UpdateEnrollmentFileData>({
    mutationFn: (data) =>
      FetchService.put(`/api/enrollment/files/token/${token}`, data),
    invalidateQueries: [
      ENROLLMENT_FILE_QUERY_KEY,
      ENROLLMENT_CAMPAIGN_QUERY_KEY,
      [...ENROLLMENT_FILE_QUERY_KEY, "token", token],
    ],
  });
}

/**
 * Hook pour supprimer un dossier d'inscription
 *
 * Ce hook permet de supprimer un dossier d'inscription existant via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @returns {ApiMutationResult<EnrollmentFileWithDetails, string>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useDeleteEnrollmentFile } from "@/hooks/query/useEnrollment";
 *
 * function DeleteFileButton({ id }) {
 *   const { mutate, isPending } = useDeleteEnrollmentFile();
 *
 *   const handleDelete = () => {
 *     mutate(id);
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isPending}>
 *       {isPending ? "Suppression en cours..." : "Supprimer"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDeleteEnrollmentFile(): ApiMutationResult<
  EnrollmentFileWithDetails,
  string
> {
  return useApiMutation<EnrollmentFileWithDetails, string>({
    mutationFn: (id) =>
      FetchService.delete(`/api/enrollment/files/${id}`),
    invalidateQueries: [
      ENROLLMENT_FILE_QUERY_KEY,
      ENROLLMENT_CAMPAIGN_QUERY_KEY,
    ],
  });
}

/**
 * Hook pour renvoyer l'invitation (email + token) d'un dossier d'inscription
 */
export function useResendEnrollmentInvitation(
  id: string
): ApiMutationResult<EnrollmentFileWithDetails, void> {
  return useApiMutation<EnrollmentFileWithDetails, void>({
    mutationFn: () => FetchService.post(`/api/enrollment/files/${id}/resend`, {}),
    invalidateQueries: [
      ENROLLMENT_FILE_QUERY_KEY,
      [...ENROLLMENT_FILE_QUERY_KEY, id],
    ],
  });
}

/**
 * Hook pour ajouter un étudiant à un dossier d'inscription
 *
 * Ce hook permet d'ajouter un étudiant à un dossier d'inscription via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} fileId - L'ID du dossier d'inscription
 * @returns {ApiMutationResult<EnrollmentFileWithDetails, AddStudentToEnrollmentData>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useAddStudentToEnrollment } from "@/hooks/query/useEnrollment";
 *
 * function AddStudentForm({ fileId }) {
 *   const { mutate, isPending } = useAddStudentToEnrollment(fileId);
 *
 *   const handleSubmit = (data: AddStudentToEnrollmentData) => {
 *     mutate(data);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <select name="studentId">
 *         {students.map(student => (
 *           <option key={student.id} value={student.id}>
 *             {student.firstName} {student.lastName}
 *           </option>
 *         ))}
 *       </select>
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? "Ajout en cours..." : "Ajouter"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAddStudentToEnrollment(
  fileId: string
): ApiMutationResult<EnrollmentFileWithDetails, AddStudentToEnrollmentData> {
  return useApiMutation<EnrollmentFileWithDetails, AddStudentToEnrollmentData>({
    mutationFn: (data) =>
      FetchService.post(`/api/enrollment/files/${fileId}/students`, data),
    invalidateQueries: [
      ENROLLMENT_FILE_QUERY_KEY,
      ENROLLMENT_CAMPAIGN_QUERY_KEY,
      [...ENROLLMENT_FILE_QUERY_KEY, fileId],
    ],
  });
}

/**
 * Hook pour retirer un étudiant d'un dossier d'inscription
 *
 * Ce hook permet de retirer un étudiant d'un dossier d'inscription via l'API.
 * Il utilise useApiMutation pour gérer la requête et le cache.
 *
 * @param {string} fileId - L'ID du dossier d'inscription
 * @returns {ApiMutationResult<EnrollmentFileWithDetails, string>} Un objet contenant la mutation et l'état de la requête
 *
 * @example
 * ```tsx
 * import { useRemoveStudentFromEnrollment } from "@/hooks/query/useEnrollment";
 *
 * function RemoveStudentButton({ fileId, studentId }) {
 *   const { mutate, isPending } = useRemoveStudentFromEnrollment(fileId);
 *
 *   const handleRemove = () => {
 *     mutate(studentId);
 *   };
 *
 *   return (
 *     <button onClick={handleRemove} disabled={isPending}>
 *       {isPending ? "Retrait en cours..." : "Retirer"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useRemoveStudentFromEnrollment(
  fileId: string
): ApiMutationResult<EnrollmentFileWithDetails, string> {
  return useApiMutation<EnrollmentFileWithDetails, string>({
    mutationFn: (studentId) =>
      FetchService.delete(`/api/enrollment/files/${fileId}/students?studentId=${studentId}`),
    invalidateQueries: [
      ENROLLMENT_FILE_QUERY_KEY,
      ENROLLMENT_CAMPAIGN_QUERY_KEY,
      [...ENROLLMENT_FILE_QUERY_KEY, fileId],
    ],
  });
}

/**
 * Hook pour calculer les statistiques d'inscription à partir des données des fichiers
 *
 * Ce hook calcule les statistiques localement sans faire d'appel API.
 * Il prend en paramètre une liste de fichiers d'inscription et retourne les statistiques calculées.
 *
 * @param {EnrollmentFileWithDetails[]} files - Liste des fichiers d'inscription
 * @returns {object} Un objet contenant les statistiques calculées
 *
 * @example
 * ```tsx
 * import { useEnrollmentStats } from "@/hooks/query/useEnrollment";
 * import { useEnrollmentFiles } from "@/hooks";
 *
 * function CampaignStatsComponent({ campaignId }) {
 *   const { data: filesData } = useEnrollmentFiles({ campaignId });
 *   const files = filesData?.data || [];
 *   
 *   const stats = useEnrollmentStats(files);
 *
 *   return (
 *     <div>
 *       <p>Total: {stats.totalFiles}</p>
 *       <p>Soumis: {stats.submittedFiles}</p>
 *       <p>Approuvés: {stats.approvedFiles}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useEnrollmentStats(files: EnrollmentFileWithDetails[]) {
  return {
    totalFiles: files.length,
    submittedFiles: files.filter(file => file.status === "SUBMITTED").length,
    approvedFiles: files.filter(file => file.status === "APPROVED").length,
    rejectedFiles: files.filter(file => file.status === "REJECTED").length,
    pendingFiles: files.filter(file => file.status === "DRAFT" || file.status === "NEED_INFO").length,
    draftFiles: files.filter(file => file.status === "DRAFT").length,
    needInfoFiles: files.filter(file => file.status === "NEED_INFO").length,
  };
}