// Hooks génériques de requêtes API
export { useApiQuery, useApiMutation } from "./query/useQuery";

// Hooks pour les établissements
export {
  useEstablishment,
  useEstablishmentMutation,
  ESTABLISHMENT_QUERY_KEY,
  type EstablishmentWithAdmin,
} from "./query/useEstablishment";

// Hooks pour les classes
export {
  useClassRooms,
  useCreateClassRoom,
  useUpdateClassRoom,
  useDeleteClassRoom,
  useClassRoomPersonnel,
  useAssignPersonnelToClassRoom,
  useRemovePersonnelFromClassRoom,
} from "./query/useClassRoom";

// Hooks pour les utilisateurs
export {
  useUsers,
  useAdmins,
  USERS_QUERY_KEY,
  ADMINS_QUERY_KEY,
} from "./query/useUsers";

// Hooks pour les rôles et privilèges
export { usePrivileges } from "./query/usePrivileges";
export { useRoles } from "./query/useRoles";

// Hooks pour les inscriptions scolaires
export {
  useEnrollmentCampaigns,
  useEnrollmentCampaign,
  useCreateEnrollmentCampaign,
  useUpdateEnrollmentCampaign,
  useDeleteEnrollmentCampaign,
  useGenerateEnrollmentFiles,
  useEnrollmentFiles,
  useEnrollmentFile,
  useEnrollmentFileByToken,
  useCreateEnrollmentFile,
  useUpdateEnrollmentFile,
  useUpdateEnrollmentFileStatus,
  useUpdateEnrollmentFileByToken,
  useDeleteEnrollmentFile,
  useResendEnrollmentInvitation,
  useAddStudentToEnrollment,
  useRemoveStudentFromEnrollment,
  useEnrollmentStats,
  ENROLLMENT_CAMPAIGN_QUERY_KEY,
  ENROLLMENT_FILE_QUERY_KEY,
  ENROLLMENT_STATS_QUERY_KEY,
} from "./query/useEnrollment";

// Types pour les inscriptions
export type {
  EnrollmentCampaignComplete,
  EnrollmentCampaignWithStats,
  EnrollmentFileWithDetails,
  EnrollmentFileWithStats,
  EnrollmentStats,
  CreateEnrollmentCampaignData,
  UpdateEnrollmentCampaignData,
  CreateEnrollmentFileData,
  UpdateEnrollmentFileData,
  UpdateEnrollmentStatusData,
  AddStudentToEnrollmentData,
  GenerateEnrollmentFilesData,
  EnrollmentCampaignFilters,
  EnrollmentFileFilters,
} from "../types/enrollment.type";

// Hooks commissions (formulaire public inscription)
export { useCommissions } from "./query/useCommission";

// Autres hooks existants
export { useNotification } from "./useNotification";
export { usePWA } from "./usePWA";
