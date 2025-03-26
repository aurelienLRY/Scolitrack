import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Role, CreateRoleData, UpdateRoleData } from "./types";
import { toast } from "sonner";
import { ApiResponse } from "@/lib/services/api.service";

interface RoleState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRoles: () => Promise<Role[] | null>;
  fetchRoleById: (id: string) => Promise<Role | null>;
  createRole: (data: CreateRoleData) => Promise<Role | null>;
  updateRole: (id: string, data: UpdateRoleData) => Promise<Role | null>;
  deleteRole: (id: string) => Promise<boolean>;
  assignRoleToUser: (userId: string, roleName: string) => Promise<boolean>;
}

export const useRoleStore = create<RoleState>()(
  devtools(
    (set) => ({
      roles: [],
      isLoading: false,
      error: null,

      fetchRoles: async () => {
        set({ isLoading: true, error: null }, false, "roles/fetch/start");
        try {
          const response: ApiResponse<Role[]> = await fetch(
            "/api/setup-application/roles"
          ).then((res) => res.json());

          if (!response.success) {
            throw new Error(
              response.feedback || "Erreur lors de la récupération des rôles"
            );
          }

          const roles = response.data || [];
          set({ roles }, false, "roles/fetch/success");
          return roles;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "roles/fetch/error"
          );
          toast.error(
            (error as Error).message ||
              "Erreur lors de la récupération des rôles"
          );
          return null;
        } finally {
          set({ isLoading: false }, false, "roles/fetch/end");
        }
      },

      fetchRoleById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: ApiResponse<Role> = await fetch(
            `/api/setup-application/roles/${id}`
          ).then((res) => res.json());

          if (!response.success) {
            throw new Error(
              response.feedback || "Erreur lors de la récupération du rôle"
            );
          }

          const role = response.data;
          return role;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "roles/fetchById/error"
          );
          toast.error(
            (error as Error).message || "Erreur lors de la récupération du rôle"
          );
          return null;
        } finally {
          set({ isLoading: false }, false, "roles/fetchById/end");
        }
      },

      createRole: async (data: CreateRoleData) => {
        set({ isLoading: true, error: null });
        try {
          const response: ApiResponse<Role> = await fetch(
            "/api/setup-application/roles",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          ).then((res) => res.json());

          if (!response.success || !response.data) {
            throw new Error(
              response.feedback || "Erreur lors de la création du rôle"
            );
          }

          const newRole = response.data;

          // Mettre à jour la liste des rôles
          set(
            (state: RoleState) => ({
              roles: [...state.roles, newRole],
              isLoading: false,
              error: null,
            }),
            false,
            "roles/create/success"
          );
          toast.success(`Rôle "${data.name}" créé avec succès`);
          return newRole;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "roles/create/error"
          );
          toast.error(
            (error as Error).message || "Erreur lors de la création du rôle"
          );
          return null;
        } finally {
          set({ isLoading: false }, false, "roles/create/end");
        }
      },

      updateRole: async (id: string, data: UpdateRoleData) => {
        set({ isLoading: true, error: null });
        try {
          const response: ApiResponse<Role> = await fetch(
            `/api/setup-application/roles/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          ).then((res) => res.json());

          if (!response.success || !response.data) {
            throw new Error(
              response.feedback || "Erreur lors de la mise à jour du rôle"
            );
          }

          const updatedRole = response.data;

          // Mettre à jour la liste des rôles
          set(
            (state: RoleState) => ({
              roles: state.roles.map((role) =>
                role.id === id ? updatedRole : role
              ),
              isLoading: false,
              error: null,
            }),
            false,
            "roles/update/success"
          );

          toast.success(
            `Rôle "${data.name || updatedRole.name}" mis à jour avec succès`
          );
          return updatedRole;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "roles/update/error"
          );
          toast.error(
            (error as Error).message || "Erreur lors de la mise à jour du rôle"
          );
          return null;
        } finally {
          set({ isLoading: false }, false, "roles/update/end");
        }
      },

      deleteRole: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: ApiResponse<Role> = await fetch(
            `/api/setup-application/roles/${id}`,
            {
              method: "DELETE",
            }
          ).then((res) => res.json());

          if (!response.success || !response.data) {
            throw new Error(
              response.feedback || "Erreur lors de la suppression du rôle"
            );
          }

          // Récupérer le nom du rôle avant de le supprimer de l'état
          const roleName =
            useRoleStore.getState().roles.find((role) => role.id === id)
              ?.name || "Rôle";

          // Mettre à jour la liste des rôles
          set(
            (state: RoleState) => ({
              roles: state.roles.filter((role) => role.id !== id),
              isLoading: false,
              error: null,
            }),
            false,
            "roles/delete/success"
          );

          toast.success(`Rôle "${roleName}" supprimé avec succès`);
          return true;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "roles/delete/error"
          );
          toast.error(
            (error as Error).message || "Erreur lors de la suppression du rôle"
          );
          return false;
        } finally {
          set({ isLoading: false }, false, "roles/delete/end");
        }
      },

      assignRoleToUser: async (userId: string, roleName: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/users/${userId}/role`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ roleName }),
          }).then((res) => res.json());

          if (!response.success || !response.data) {
            throw new Error(
              response.feedback || "Erreur lors de l'assignation du rôle"
            );
          }

          set({ isLoading: false }, false, "roles/assign/success");
          toast.success(
            `Rôle "${roleName}" assigné à l'utilisateur avec succès`
          );
          return true;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "roles/assign/error"
          );
          toast.error(
            (error as Error).message || "Erreur lors de l'assignation du rôle"
          );
          return false;
        } finally {
          set({ isLoading: false }, false, "roles/assign/end");
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "roles/store" }
  )
);
