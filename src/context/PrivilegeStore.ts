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
  devtools((set) => ({
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
        const response = await fetch(`/api/setup-application/privileges/${id}`);

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
  }))
);
