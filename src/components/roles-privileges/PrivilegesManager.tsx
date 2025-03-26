"use client";
import { useState, useEffect } from "react";
import { useRoleStore } from "@/context/store/RoleStore";
import { usePrivilegeStore } from "@/context/store/PrivilegeStore";
import { toast } from "sonner";
import { Role, RolePrivilege } from "@/context/store/types";
import Card from "../ui/card";
import { UpdateButton, SaveButton, Button } from "../ui/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";

/**
 * Composant de gestion des privilèges
 *
 * Ce composant permet aux utilisateurs autorisés de visualiser et de modifier
 * les privilèges associés à chaque rôle. Il affiche un tableau croisé des rôles
 * et privilèges avec des cases à cocher pour gérer les associations.
 */
export default function PrivilegesManager() {
  // État et fonctions du store de rôles
  const { roles, updateRole, isLoading: rolesLoading } = useRoleStore();

  // État et fonctions du store de privilèges
  const { privileges, isLoading: privilegesLoading } = usePrivilegeStore();

  // État local pour suivre les privilèges sélectionnés pour chaque rôle
  const [selectedPrivileges, setSelectedPrivileges] = useState<
    Record<string, string[]>
  >({});
  // ID du rôle en cours d'édition (null si aucun)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  // Indicateur de sauvegarde en cours
  const [savingPrivileges, setSavingPrivileges] = useState(false);

  // Initialiser les privilèges sélectionnés à partir des rôles chargés
  useEffect(() => {
    if (roles.length === 0) return;

    const initialPrivileges: Record<string, string[]> = {};

    roles.forEach((role) => {
      // Extraire les IDs des privilèges à partir de rolePrivileges
      if (role.rolePrivileges && role.rolePrivileges.length > 0) {
        initialPrivileges[role.id] = role.rolePrivileges.map(
          (rp: RolePrivilege) => rp.privilege.id
        );
      } else {
        initialPrivileges[role.id] = [];
      }
    });

    setSelectedPrivileges(initialPrivileges);
  }, [roles]);

  /**
   * Active/désactive le mode édition pour un rôle
   * @param roleId ID du rôle à éditer, ou null pour annuler l'édition
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
   * @param roleId ID du rôle
   * @param privilegeId ID du privilège à activer/désactiver
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
   * @param roleId ID du rôle dont les privilèges ont été modifiés
   */
  const handleSaveRolePrivileges = async (roleId: string) => {
    if (!roleId) return;

    setSavingPrivileges(true);
    try {
      await updateRole(roleId, {
        privilegeIds: selectedPrivileges[roleId] || [],
      });

      const roleName = roles.find((r) => r.id === roleId)?.name;
      toast.success(`Privilèges mis à jour pour le rôle ${roleName}`);
      setEditingRoleId(null);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour des privilèges");
      console.error(error);
    } finally {
      setSavingPrivileges(false);
    }
  };

  /**
   * Vérifie si une case à cocher doit être désactivée
   * @param role Le rôle concerné
   * @returns true si la case à cocher doit être désactivée
   */
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

  /**
   * Vérifie si un bouton d'édition doit être affiché pour un rôle
   * @param role Le rôle concerné
   * @returns true si le bouton d'édition doit être affiché
   */
  const showEditButton = (role: Role) => {
    // Le super admin peut modifier les privilèges du rôle ADMIN même s'il est permanent
    return !role.isPermanent || role.name === "ADMIN";
  };

  // État de chargement global
  const isLoading = rolesLoading || privilegesLoading;

  /**
   * Vérifie si un privilège est associé à un rôle
   * @param roleId ID du rôle
   * @param privilegeId ID du privilège
   * @returns true si le privilège est associé au rôle
   */
  const hasPrivilege = (roleId: string, privilegeId: string) => {
    return selectedPrivileges[roleId]?.includes(privilegeId) || false;
  };

  /**
   * Trie les rôles par nombre de privilèges décroissant
   * @returns Les rôles triés
   */
  const getSortedRoles = () => {
    return [...roles].sort((a, b) => {
      const privilegesA = a.rolePrivileges?.length || 0;
      const privilegesB = b.rolePrivileges?.length || 0;
      return privilegesB - privilegesA;
    });
  };

  // Rôles triés par nombre de privilèges (décroissant)
  const sortedRoles = getSortedRoles();

  return (
    <div>
      <Card className="flex flex-col gap-4  justify-center items-center">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="leading-6">Gestion des privilèges</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Attribuez des privilèges aux différents rôles.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center w-full py-10">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="max-w-[1200px] ">
              <div className="overflow-x-auto">
                <table className="divide-y divide-primary overflow-x-auto border-collapse border-2 border-primary">
                  <thead className="bg-primary/10">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left font-medium text-xl text-text/80 uppercase tracking-wider"
                      >
                        Privilège
                      </th>
                      {sortedRoles.map((role) => (
                        <th
                          key={role.id}
                          scope="col"
                          className="px-6 py-3  font-medium text-xl text-text/50 uppercase tracking-wider"
                        >
                          <div className="flex flex-col items-center">
                            <span>{role.name}</span>
                            <span className="text-xs text-gray-400 mt-1 normal-case">
                              {role.rolePrivileges?.length || 0} privilège(s)
                            </span>
                            {showEditButton(role) && (
                              <div className="mt-2">
                                {editingRoleId === role.id ? (
                                  <SaveButton
                                    onClick={() =>
                                      handleSaveRolePrivileges(role.id)
                                    }
                                    disabled={savingPrivileges}
                                    size="icon-sm"
                                    variant="outline"
                                    iconOnly
                                  >
                                    {savingPrivileges
                                      ? "Enregistrement..."
                                      : "Enregistrer"}
                                  </SaveButton>
                                ) : (
                                  <UpdateButton
                                    onClick={() => handleToggleEdit(role.id)}
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
                  <tbody className="divide-y divide-primary/20 py-4">
                    {privileges.map((privilege) => (
                      <tr key={privilege.id} className="hover:bg-slate-400/10">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium ">
                            {privilege.description}
                          </span>
                        </td>

                        {sortedRoles.map((role) => {
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
                                  onCheckedChange={() =>
                                    handlePrivilegeToggle(role.id, privilege.id)
                                  }
                                  disabled={isCheckboxDisabled(role)}
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {editingRoleId && (
              <div className="mt-4 bg-blue-50/50 p-3 rounded-md mx-4 mb-4">
                <p className="text-sm text-blue-700">
                  Vous êtes en train de modifier les privilèges pour le rôle{" "}
                  <strong>
                    {roles.find((r) => r.id === editingRoleId)?.name}
                  </strong>
                  . Cochez ou décochez les cases pour modifier les privilèges,
                  puis cliquez sur &quot;Enregistrer&quot;.
                </p>
                <div className="mt-2 flex space-x-2">
                  <Button
                    onClick={() => handleToggleEdit(null)}
                    variant="solid"
                    color="secondary"
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
