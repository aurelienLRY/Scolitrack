import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Privilege } from "./types";
import { toast } from "sonner";
import { ApiResponse } from "@/lib/services/api.service";

interface PrivilegeState {
  privileges: Privilege[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPrivileges: () => Promise<Privilege[] | null>;
  fetchPrivilegeById: (id: string) => Promise<Privilege | null>;
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
          const response: ApiResponse<Privilege[]> = await fetch(
            "/api/setup-application/privileges"
          ).then((res) => res.json());
          if (!response.success || !response.data) {
            throw new Error(
              response.feedback ||
                "Erreur lors de la récupération des privilèges"
            );
          }
          const privileges = response.data || [];
          set({ privileges }, false, "privileges/fetch/success");
          return privileges;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "privileges/fetch/error"
          );
          toast.error(
            (error as Error).message ||
              "Erreur lors de la récupération des privilèges"
          );
          return null;
        } finally {
          set({ isLoading: false }, false, "privileges/fetch/end");
        }
      },

      fetchPrivilegeById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: ApiResponse<Privilege> = await fetch(
            `/api/setup-application/privileges/${id}`
          ).then((res) => res.json());

          if (!response.success || !response.data) {
            throw new Error(
              response.feedback || "Erreur lors de la récupération du privilège"
            );
          }

          const privilege = response.data;
          return privilege;
        } catch (error) {
          set(
            { error: (error as Error).message, isLoading: false },
            false,
            "privileges/fetchById/error"
          );
          toast.error(
            (error as Error).message ||
              "Erreur lors de la récupération du privilège"
          );
          return null;
        } finally {
          set({ isLoading: false }, false, "privileges/fetchById/end");
        }
      },
    }),
    { name: "privileges/store" }
  )
);
