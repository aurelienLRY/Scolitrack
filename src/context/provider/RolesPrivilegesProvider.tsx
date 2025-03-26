"use client";
import { useEffect, useState } from "react";
import { usePrivilegeStore } from "@/context/store/PrivilegeStore";
import { useRoleStore } from "@/context/store/RoleStore";

import { useSession } from "next-auth/react";
import { Loading } from "@/components/ui/Loading";

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
  const { fetchRoles, isLoading: isRoleLoading } = useRoleStore();
  const { fetchPrivileges, isLoading: isPrivilegeLoading } =
    usePrivilegeStore();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading" || status === "unauthenticated") {
      return;
    } else if (autoLoad && (isRoleLoading || isPrivilegeLoading)) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [status, isRoleLoading, isPrivilegeLoading, autoLoad]);

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    if (autoLoad) {
      const loadData = async () => {
        try {
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
  }, [status, autoLoad, fetchRoles, fetchPrivileges]);

  if (isLoading) {
    return <Loading />;
  }
  return <>{children}</>;
}

export default RolesPrivilegesProvider;
