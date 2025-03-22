"use client";
import { useEffect } from "react";
import { useRoleStore, usePrivilegeStore } from "./index";

interface RolesPrivilegesProviderProps {
  children: React.ReactNode;
  autoLoad?: boolean;
}

/**
 * Provider qui initialise les données des rôles et privilèges
 *
 * @param {React.ReactNode} children - Composants enfants
 * @param {boolean} autoLoad - Charger automatiquement les rôles et privilèges au montage (par défaut: true)
 */
export function RolesPrivilegesProvider({
  children,
  autoLoad = true,
}: RolesPrivilegesProviderProps) {
  const { fetchRoles, clearError: clearRoleError } = useRoleStore();
  const { fetchPrivileges, clearError: clearPrivilegeError } =
    usePrivilegeStore();

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    if (autoLoad) {
      const loadData = async () => {
        try {
          // Nettoyer les erreurs précédentes
          clearRoleError();
          clearPrivilegeError();

          // Charger les données en parallèle
          await Promise.all([fetchRoles(), fetchPrivileges()]);
        } catch (error) {
          console.error(
            "Erreur lors du chargement des rôles et privilèges:",
            error
          );
        }
      };

      loadData();
    }
  }, [
    autoLoad,
    fetchRoles,
    fetchPrivileges,
    clearRoleError,
    clearPrivilegeError,
  ]);

  return <>{children}</>;
}

export default RolesPrivilegesProvider;
