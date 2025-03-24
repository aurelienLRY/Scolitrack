import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Role, CreateRoleData, UpdateRoleData, ApiResponse } from "./types";
import { toast } from "sonner";

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
  clearError: () => void;
}

export const useRoleStore = create<RoleState>()(
  devtools(
    (set) => ({
      roles: [],
      isLoading: false,
      error: null,

      fetchRoles: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/setup-application/roles");

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la récupération des rôles"
            );
          }

          const data = (await response.json()) as ApiResponse<Role[]>;
          const roles = data.data || (data as unknown as Role[]);
          set({ roles, isLoading: false });
          return roles;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message ||
              "Erreur lors de la récupération des rôles"
          );
          return null;
        }
      },

      fetchRoleById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/setup-application/roles/${id}`);

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la récupération du rôle"
            );
          }

          const data = (await response.json()) as ApiResponse<Role>;
          const role = data.data || (data as unknown as Role);
          return role;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message || "Erreur lors de la récupération du rôle"
          );
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      createRole: async (data: CreateRoleData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/setup-application/roles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la création du rôle"
            );
          }

          const result = (await response.json()) as ApiResponse<Role>;
          const newRole = result.data || (result as unknown as Role);

          // Mettre à jour la liste des rôles
          set((state: RoleState) => ({
            roles: [...state.roles, newRole],
            isLoading: false,
            error: null,
          }));

          toast.success(`Rôle "${data.name}" créé avec succès`);
          return newRole;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message || "Erreur lors de la création du rôle"
          );
          return null;
        }
      },

      updateRole: async (id: string, data: UpdateRoleData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/setup-application/roles/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la mise à jour du rôle"
            );
          }

          const result = (await response.json()) as ApiResponse<Role>;
          const updatedRole = result.data || (result as unknown as Role);

          // Mettre à jour la liste des rôles
          set((state: RoleState) => ({
            roles: state.roles.map((role) =>
              role.id === id ? updatedRole : role
            ),
            isLoading: false,
            error: null,
          }));

          toast.success(
            `Rôle "${data.name || updatedRole.name}" mis à jour avec succès`
          );
          return updatedRole;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message || "Erreur lors de la mise à jour du rôle"
          );
          return null;
        }
      },

      deleteRole: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/setup-application/roles/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la suppression du rôle"
            );
          }

          // Récupérer le nom du rôle avant de le supprimer de l'état
          const roleName =
            useRoleStore.getState().roles.find((role) => role.id === id)
              ?.name || "Rôle";

          // Mettre à jour la liste des rôles
          set((state: RoleState) => ({
            roles: state.roles.filter((role) => role.id !== id),
            isLoading: false,
            error: null,
          }));

          toast.success(`Rôle "${roleName}" supprimé avec succès`);
          return true;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message || "Erreur lors de la suppression du rôle"
          );
          return false;
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
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de l'assignation du rôle"
            );
          }

          set({ isLoading: false });
          toast.success(
            `Rôle "${roleName}" assigné à l'utilisateur avec succès`
          );
          return true;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message || "Erreur lors de l'assignation du rôle"
          );
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "role-store" }
  )
);
