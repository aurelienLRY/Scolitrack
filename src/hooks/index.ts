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
} from "./useUsers";

// Hooks pour les rôles et privilèges
export { usePrivileges } from "./query/usePrivileges";
export { useRoles } from "./query/useRoles";

// Autres hooks existants
export { useNotification } from "./useNotification";
export { usePWA } from "./usePWA";
