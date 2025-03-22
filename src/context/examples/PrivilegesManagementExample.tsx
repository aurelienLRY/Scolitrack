"use client";

import { useState } from "react";
import { usePrivilegeStore, Privilege, CreatePrivilegeData } from "@/context";

export default function PrivilegesManagementExample() {
  // États locaux pour le formulaire
  const [newPrivilegeName, setNewPrivilegeName] = useState("");
  const [newPrivilegeDescription, setNewPrivilegeDescription] = useState("");
  const [editingPrivilegeId, setEditingPrivilegeId] = useState<string | null>(
    null
  );

  // Utiliser le store des privilèges
  const {
    privileges,
    isLoading,
    error,
    createPrivilege,
    updatePrivilege,
    deletePrivilege,
  } = usePrivilegeStore();

  // Gestionnaire pour la création/mise à jour d'un privilège
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const privilegeData: CreatePrivilegeData = {
      name: newPrivilegeName,
      description: newPrivilegeDescription || undefined,
    };

    try {
      if (editingPrivilegeId) {
        // Mode mise à jour
        await updatePrivilege(editingPrivilegeId, privilegeData);
        setEditingPrivilegeId(null);
      } else {
        // Mode création
        await createPrivilege(privilegeData);
      }

      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la gestion du privilège:", error);
    }
  };

  // Gestionnaire pour la suppression d'un privilège
  const handleDeletePrivilege = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce privilège ?")) {
      try {
        await deletePrivilege(id);
      } catch (error) {
        console.error("Erreur lors de la suppression du privilège:", error);
      }
    }
  };

  // Gestionnaire pour l'édition d'un privilège
  const handleEditPrivilege = (privilege: Privilege) => {
    setEditingPrivilegeId(privilege.id);
    setNewPrivilegeName(privilege.name);
    setNewPrivilegeDescription(privilege.description || "");
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewPrivilegeName("");
    setNewPrivilegeDescription("");
    setEditingPrivilegeId(null);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des Privilèges</h1>

      {isLoading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formulaire de création/édition */}
          <div className="md:col-span-1 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              {editingPrivilegeId
                ? "Modifier le privilège"
                : "Nouveau privilège"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  value={newPrivilegeName}
                  onChange={(e) => setNewPrivilegeName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Utilisez le format SNAKE_CASE (ex: CREATE_USER)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={newPrivilegeDescription}
                  onChange={(e) => setNewPrivilegeDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editingPrivilegeId ? "Mettre à jour" : "Créer"}
                </button>

                {editingPrivilegeId && (
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

          {/* Liste des privilèges */}
          <div className="md:col-span-2 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Privilèges existants</h2>

            {privileges.length === 0 ? (
              <p className="text-gray-500">Aucun privilège trouvé</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Nom</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {privileges.map((privilege) => (
                      <tr
                        key={privilege.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-mono text-sm">
                          {privilege.name}
                        </td>
                        <td className="px-4 py-3">
                          {privilege.description || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditPrivilege(privilege)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() =>
                                handleDeletePrivilege(privilege.id)
                              }
                              className="text-red-500 hover:text-red-700"
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
