"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Card from "@/components/ui/card";
import { UpdateButton, SaveButton, Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { usePrivileges } from "@/hooks/query/usePrivileges";
import {
  useRoles,
  useUpdateRole,
  Role,
  RolePrivilege,
} from "@/hooks/query/useRoles";
import { Privilege } from "@prisma/client";
import { SkeletonPrivilegesManager } from "./skeleton-PrivilegesManager";
import { InfoIcon } from "lucide-react";

// Interface pour les props du tableau de privilèges
interface PrivilegesTableProps {
  roles: Role[];
  privileges: Privilege[];
  selectedPrivileges: Record<string, string[]>;
  editingRoleId: string | null;
  savingPrivileges: boolean;
  onPrivilegeToggle: (roleId: string, privilegeId: string) => void;
  onToggleEdit: (roleId: string | null) => void;
  onSavePrivileges: (roleId: string) => void;
}

// Sous-composant pour l'en-tête du tableau avec les noms des rôles
function TableHeader({
  roles,
  editingRoleId,
  savingPrivileges,
  onToggleEdit,
  onSavePrivileges,
}: Pick<
  PrivilegesTableProps,
  | "roles"
  | "editingRoleId"
  | "savingPrivileges"
  | "onToggleEdit"
  | "onSavePrivileges"
>) {
  // Vérifie si un bouton d'édition doit être affiché pour un rôle
  const showEditButton = (role: Role) => {
    // Le super admin peut modifier les privilèges du rôle ADMIN même s'il est permanent
    return !role.isPermanent || role.name === "ADMIN";
  };

  // Compte le nombre de privilèges pour un rôle
  const countPrivileges = (role: Role): number => {
    if (role.rolePrivileges && role.rolePrivileges.length > 0) {
      return role.rolePrivileges.length;
    }
    if (role.privileges && role.privileges.length > 0) {
      return role.privileges.length;
    }
    return 0;
  };

  return (
    <thead className=" bg-gradient-to-b from-primary/0 to-primary/20 rounded-lg">
      <tr>
        <th
          scope="col"
          className="px-6 py-3 text-left font-medium text-xl text-text/80 uppercase tracking-wider"
        >
          Privilège
        </th>
        {roles.map((role) => (
          <th
            key={role.id}
            scope="col"
            className="px-6 py-3 font-medium text-xl text-text/50 uppercase tracking-wider"
          >
            <div className="flex flex-col items-center">
              <span>{role.name}</span>
              <span className="text-xs text-gray-400 mt-1 normal-case">
                {countPrivileges(role)} privilège(s)
              </span>
              {showEditButton(role) && (
                <div className="mt-2">
                  {editingRoleId === role.id ? (
                    <SaveButton
                      onClick={() => onSavePrivileges(role.id)}
                      disabled={savingPrivileges}
                      size="icon-sm"
                      variant="outline"
                      iconOnly
                    >
                      {savingPrivileges ? "Enregistrement..." : "Enregistrer"}
                    </SaveButton>
                  ) : (
                    <UpdateButton
                      onClick={() => onToggleEdit(role.id)}
                      disabled={editingRoleId !== null}
                      size="icon-sm"
                      variant="outline"
                      iconOnly
                    >
                      Modifier
                    </UpdateButton>
                  )}
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Sous-composant pour afficher une ligne de privilège
function PrivilegeRow({
  privilege,
  roles,
  selectedPrivileges,
  editingRoleId,
  savingPrivileges,
  onPrivilegeToggle,
}: {
  privilege: Privilege;
} & Pick<
  PrivilegesTableProps,
  | "roles"
  | "selectedPrivileges"
  | "editingRoleId"
  | "savingPrivileges"
  | "onPrivilegeToggle"
>) {
  // Vérifier si un privilège est associé à un rôle
  const hasPrivilege = (roleId: string, privilegeId: string) => {
    return selectedPrivileges[roleId]?.includes(privilegeId) || false;
  };

  // Vérifie si une case à cocher doit être désactivée
  const isCheckboxDisabled = (role: Role) => {
    // Le super admin peut modifier les privilèges du rôle ADMIN
    if (role.name === "ADMIN") {
      return editingRoleId !== role.id || savingPrivileges;
    }

    // Les rôles permanents (SUPER_ADMIN, USER) ne peuvent pas être modifiés
    return (
      (role.isPermanent && role.name !== "ADMIN") ||
      editingRoleId !== role.id ||
      savingPrivileges
    );
  };

  return (
    <tr key={privilege.id} className="hover:bg-slate-400/10">
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-medium">
          {privilege.description || privilege.name}
        </span>
      </td>

      {roles.map((role) => {
        const isChecked = hasPrivilege(role.id, privilege.id);
        return (
          <td
            key={`${privilege.id}-${role.id}`}
            className={`px-6 py-4 text-center ${
              editingRoleId === role.id
                ? "bg-blue-50/50"
                : isChecked
                ? "bg-emerald-500/30 dark:bg-emerald-500/10"
                : "bg-red-500/30 dark:bg-red-500/10"
            }`}
          >
            <div className="flex justify-center">
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onPrivilegeToggle(role.id, privilege.id)}
                disabled={isCheckboxDisabled(role)}
              />
            </div>
          </td>
        );
      })}
    </tr>
  );
}

// Sous-composant pour le tableau des privilèges
function PrivilegesTable(props: PrivilegesTableProps) {
  const { roles, privileges, editingRoleId, onToggleEdit } = props;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col gap-4 w-full"
    >
      <div className="w-full overflow-x-auto">
        <table className="divide-y divide-primary border-collapse rounded-lg w-full min-w-[800px]">
          <TableHeader {...props} />
          <tbody className="divide-y divide-primary/20 py-4">
            {privileges.map((privilege) => (
              <PrivilegeRow
                key={privilege.id}
                privilege={privilege}
                {...props}
              />
            ))}
          </tbody>
        </table>
      </div>

      {editingRoleId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-info p-3 rounded-md w-full max-w-[800px] mx-auto overflow-y-hidden"
          aria-label="Information sur le rôle en cours de modification"
          role="tooltip"
        >
          <div className="flex items-center gap-4">
            <InfoIcon className="w-12 h-12 flex-shrink-0" />
            <div className="flex flex-col">
              <p className="text-sm">
                Vous êtes en train de modifier les privilèges pour le rôle{" "}
                <strong>
                  {roles.find((r) => r.id === editingRoleId)?.name ||
                    "sélectionné"}
                </strong>
                . Cochez ou décochez les cases pour modifier les privilèges,
                puis cliquez sur &quot;Enregistrer&quot;.
              </p>

              <div className="mt-2 flex space-x-2">
                <Button
                  onClick={() => onToggleEdit(null)}
                  variant="solid"
                  color="accent"
                  size="sm"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Composant principal de gestion des privilèges
 */
export default function PrivilegesManager() {
  // Récupérer les rôles
  const { data: rolesResponse, isLoading: rolesLoading } = useRoles();

  // Récupérer les privilèges
  const { data: privilegesResponse, isLoading: privilegesLoading } =
    usePrivileges();

  // Extraire les données des réponses
  const roles = rolesResponse?.data || [];
  const privileges = privilegesResponse?.data || [];

  // État local pour suivre les privilèges sélectionnés pour chaque rôle
  const [selectedPrivileges, setSelectedPrivileges] = useState<
    Record<string, string[]>
  >({});

  // ID du rôle en cours d'édition (null si aucun)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Indicateur de sauvegarde en cours
  const [savingPrivileges, setSavingPrivileges] = useState(false);

  // Hook pour mettre à jour un rôle
  const updateRoleMutation = useUpdateRole(editingRoleId || undefined);

  const [sortedRoles, setSortedRoles] = useState<Role[]>([]);

  // Initialiser les privilèges sélectionnés à partir des rôles chargés
  useEffect(() => {
    if (!roles || roles.length === 0) return;
    console.log("Initializing privileges from roles:", roles);

    const initialPrivileges: Record<string, string[]> = {};

    roles.forEach((role) => {
      // Extraire les IDs des privilèges à partir des rolePrivileges
      const privilegeIds: string[] = [];

      // Vérifier si nous avons rolePrivileges (format API) ou privileges (format transformé)
      if (role.rolePrivileges && role.rolePrivileges.length > 0) {
        role.rolePrivileges.forEach((rp: RolePrivilege) => {
          if (rp.privilege && rp.privilege.id) {
            privilegeIds.push(rp.privilege.id);
          }
        });
        console.log(
          `Role ${role.name} privileges (from rolePrivileges):`,
          privilegeIds
        );
      }
      // Si nous avons directement un tableau de privileges
      else if (role.privileges && role.privileges.length > 0) {
        role.privileges.forEach((privilege) => {
          privilegeIds.push(privilege.id);
        });
        console.log(
          `Role ${role.name} privileges (from privileges):`,
          privilegeIds
        );
      }

      initialPrivileges[role.id] = privilegeIds;
    });

    setSelectedPrivileges(initialPrivileges);
    setSortedRoles(getSortedRoles());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles]);

  /**
   * Active/désactive le mode édition pour un rôle
   */
  const handleToggleEdit = (roleId: string | null) => {
    if (editingRoleId === roleId) {
      setEditingRoleId(null);
    } else {
      setEditingRoleId(roleId);
    }
  };

  /**
   * Gère l'activation/désactivation d'un privilège pour un rôle
   */
  const handlePrivilegeToggle = (roleId: string, privilegeId: string) => {
    if (editingRoleId !== roleId) return;

    setSelectedPrivileges((prev) => {
      const rolePrivileges = prev[roleId] || [];
      const updatedPrivileges = rolePrivileges.includes(privilegeId)
        ? rolePrivileges.filter((id) => id !== privilegeId)
        : [...rolePrivileges, privilegeId];

      return {
        ...prev,
        [roleId]: updatedPrivileges,
      };
    });
  };

  /**
   * Enregistre les modifications de privilèges pour un rôle
   */
  const handleSaveRolePrivileges = async (roleId: string) => {
    if (!roleId) return;

    setSavingPrivileges(true);
    try {
      await updateRoleMutation.mutateAsync({
        privilegeIds: selectedPrivileges[roleId] || [],
      });

      const roleName = roles.find((r) => r.id === roleId)?.name;
      toast.success(
        `Privilèges mis à jour pour le rôle ${roleName || "sélectionné"}`
      );
      setEditingRoleId(null);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des privilèges");
      console.error(error);
    } finally {
      setSavingPrivileges(false);
    }
  };

  /**
   * Trie les rôles par nombre de privilèges décroissant
   */
  const getSortedRoles = (): Role[] => {
    if (!roles || roles.length === 0) return [];

    return [...roles].sort((a, b) => {
      // Compter le nombre de privilèges pour chaque rôle
      const privilegesA = a.rolePrivileges?.length || a.privileges?.length || 0;
      const privilegesB = b.rolePrivileges?.length || b.privileges?.length || 0;
      return privilegesB - privilegesA;
    });
  };

  // État de chargement global
  const isLoading = rolesLoading || privilegesLoading;

  if (isLoading) return <SkeletonPrivilegesManager />;

  return (
    <Card
      className="flex flex-col gap-4 w-fit max-w-full overflow-hidden"
      variant="primary"
    >
      <div className="px-4 py-5 sm:px-6">
        <h3 className="leading-6">Gestion des privilèges</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Attribuez des privilèges aux différents rôles.
        </p>
      </div>

      {roles.length === 0 || privileges.length === 0 ? (
        <div className="flex justify-center w-full py-10">
          <p className="text-gray-500">
            {roles.length === 0
              ? "Aucun rôle disponible."
              : "Aucun privilège disponible."}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-auto px-4 pb-4">
          <PrivilegesTable
            roles={sortedRoles}
            privileges={privileges}
            selectedPrivileges={selectedPrivileges}
            editingRoleId={editingRoleId}
            savingPrivileges={savingPrivileges}
            onPrivilegeToggle={handlePrivilegeToggle}
            onToggleEdit={handleToggleEdit}
            onSavePrivileges={handleSaveRolePrivileges}
          />
        </div>
      )}
    </Card>
  );
}
