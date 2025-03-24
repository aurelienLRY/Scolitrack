import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Privilege,
  CreatePrivilegeData,
  UpdatePrivilegeData,
  ApiResponse,
} from "./types";
import { toast } from "sonner";

interface PrivilegeState {
  privileges: Privilege[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPrivileges: () => Promise<Privilege[] | null>;
  fetchPrivilegeById: (id: string) => Promise<Privilege | null>;
  createPrivilege: (data: CreatePrivilegeData) => Promise<Privilege | null>;
  updatePrivilege: (
    id: string,
    data: UpdatePrivilegeData
  ) => Promise<Privilege | null>;
  deletePrivilege: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const usePrivilegeStore = create<PrivilegeState>()(
  devtools(
    (set) => ({
      privileges: [],
      isLoading: false,
      error: null,

      fetchPrivileges: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/setup-application/privileges");

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la récupération des privilèges"
            );
          }

          const data = (await response.json()) as ApiResponse<Privilege[]>;
          const privileges = data.data || (data as unknown as Privilege[]);
          set({ privileges, isLoading: false });
          return privileges;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message ||
              "Erreur lors de la récupération des privilèges"
          );
          return null;
        }
      },

      fetchPrivilegeById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/setup-application/privileges/${id}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la récupération du privilège"
            );
          }

          const data = (await response.json()) as ApiResponse<Privilege>;
          const privilege = data.data || (data as unknown as Privilege);
          return privilege;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message ||
              "Erreur lors de la récupération du privilège"
          );
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      createPrivilege: async (data: CreatePrivilegeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/setup-application/privileges", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la création du privilège"
            );
          }

          const result = (await response.json()) as ApiResponse<Privilege>;
          const newPrivilege = result.data || (result as unknown as Privilege);

          // Mettre à jour la liste des privilèges
          set((state: PrivilegeState) => ({
            privileges: [...state.privileges, newPrivilege],
            isLoading: false,
            error: null,
          }));

          toast.success(`Privilège "${data.name}" créé avec succès`);
          return newPrivilege;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message ||
              "Erreur lors de la création du privilège"
          );
          return null;
        }
      },

      updatePrivilege: async (id: string, data: UpdatePrivilegeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/setup-application/privileges/${id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(data),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la mise à jour du privilège"
            );
          }

          const result = (await response.json()) as ApiResponse<Privilege>;
          const updatedPrivilege =
            result.data || (result as unknown as Privilege);

          // Mettre à jour la liste des privilèges
          set((state: PrivilegeState) => ({
            privileges: state.privileges.map((privilege) =>
              privilege.id === id ? updatedPrivilege : privilege
            ),
            isLoading: false,
            error: null,
          }));

          toast.success(
            `Privilège "${
              data.name || updatedPrivilege.name
            }" mis à jour avec succès`
          );
          return updatedPrivilege;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message ||
              "Erreur lors de la mise à jour du privilège"
          );
          return null;
        }
      },

      deletePrivilege: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/setup-application/privileges/${id}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Erreur lors de la suppression du privilège"
            );
          }

          // Récupérer le nom du privilège avant de le supprimer de l'état
          const privilegeName =
            usePrivilegeStore
              .getState()
              .privileges.find((privilege) => privilege.id === id)?.name ||
            "Privilège";

          // Mettre à jour la liste des privilèges
          set((state: PrivilegeState) => ({
            privileges: state.privileges.filter(
              (privilege) => privilege.id !== id
            ),
            isLoading: false,
            error: null,
          }));

          toast.success(`Privilège "${privilegeName}" supprimé avec succès`);
          return true;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error(
            (error as Error).message ||
              "Erreur lors de la suppression du privilège"
          );
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "privilege-store" }
  )
);
