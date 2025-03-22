"use client";

import { useState } from "react";
import {
  useRoleStore,
  usePrivilegeStore,
  Role,
  CreateRoleData,
} from "@/context";

export default function RolesManagementExample() {
  // États locaux pour le formulaire
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Utiliser les stores
  const {
    roles,
    isLoading: rolesLoading,
    error: rolesError,
    createRole,
    updateRole,
    deleteRole,
  } = useRoleStore();

  const {
    privileges,
    isLoading: privilegesLoading,
    error: privilegesError,
  } = usePrivilegeStore();

  // Gestionnaire pour la création/mise à jour d'un rôle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleData: CreateRoleData = {
      name: newRoleName,
      description: newRoleDescription || undefined,
      privilegeIds:
        selectedPrivileges.length > 0 ? selectedPrivileges : undefined,
    };

    try {
      if (editingRoleId) {
        // Mode mise à jour
        await updateRole(editingRoleId, roleData);
        setEditingRoleId(null);
      } else {
        // Mode création
        await createRole(roleData);
      }

      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la gestion du rôle:", error);
    }
  };

  // Gestionnaire pour la suppression d'un rôle
  const handleDeleteRole = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rôle ?")) {
      try {
        await deleteRole(id);
      } catch (error) {
        console.error("Erreur lors de la suppression du rôle:", error);
      }
    }
  };

  // Gestionnaire pour l'édition d'un rôle
  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description || "");

    // Sélectionner les privilèges du rôle
    const rolePrivilegeIds = role.privileges?.map((p) => p.id) || [];
    setSelectedPrivileges(rolePrivilegeIds);
  };

  // Gestionnaire pour la sélection/désélection d'un privilège
  const handlePrivilegeToggle = (privilegeId: string) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privilegeId)
        ? prev.filter((id) => id !== privilegeId)
        : [...prev, privilegeId]
    );
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewRoleName("");
    setNewRoleDescription("");
    setSelectedPrivileges([]);
    setEditingRoleId(null);
  };

  // État de chargement global
  const isLoading = rolesLoading || privilegesLoading;
  const hasError = rolesError || privilegesError;

  return (
    <div className="p-4 max-w-6xl mx-auto bg-background">
      <h1 className="text-2xl font-bold mb-6">Gestion des Rôles</h1>

      {isLoading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : hasError ? (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700">{rolesError || privilegesError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formulaire de création/édition */}
          <div className="md:col-span-1 bg-background p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingRoleId ? "Modifier le rôle" : "Nouveau rôle"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Privilèges
                </label>
                <div className="max-h-60 overflow-y-auto border rounded p-2">
                  {privileges.map((privilege) => (
                    <div key={privilege.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`privilege-${privilege.id}`}
                        checked={selectedPrivileges.includes(privilege.id)}
                        onChange={() => handlePrivilegeToggle(privilege.id)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`privilege-${privilege.id}`}
                        className="text-sm"
                      >
                        {privilege.name}
                        {privilege.description && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({privilege.description})
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editingRoleId ? "Mettre à jour" : "Créer"}
                </button>

                {editingRoleId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Liste des rôles */}
          <div className="md:col-span-2 bg-background p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Rôles existants</h2>

            {roles.length === 0 ? (
              <p className="text-gray-500">Aucun rôle trouvé</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Nom</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Privilèges</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{role.name}</td>
                        <td className="px-4 py-3">{role.description || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {role.privileges?.map((privilege) => (
                              <span
                                key={privilege.id}
                                className="bg-gray-200 text-xs px-2 py-1 rounded"
                              >
                                {privilege.name}
                              </span>
                            ))}
                            {!role.privileges?.length && "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditRole(role)}
                              className="text-blue-500 hover:text-blue-700"
                              disabled={role.isPermanent}
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={role.isPermanent}
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
