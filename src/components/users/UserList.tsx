"use client";
import React from "react";
import { formatRelative } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badges";
import ScrollableTable from "@/components/ui/ScrollableTable";
import { usePaginatedUsers } from "@/hooks/useUsers";
import { Loading } from "@/components/ui/Loading";

/**
 * Composant qui affiche la liste des utilisateurs avec pagination
 */
export default function UserList() {
  const { users, pagination, isLoading, error, goToPage } = usePaginatedUsers();

  // Formater la date relative
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non vérifié";

    return formatRelative(new Date(dateString), new Date(), {
      locale: fr,
    });
  };

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="px-4 py-5 sm:p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un indicateur de chargement
  if (isLoading || !users) {
    return <Loading />;
  }

  // Afficher un message si aucun utilisateur n'est trouvé
  if (users.length === 0) {
    return (
      <div className="px-4 py-5 sm:p-6">
        <p className="text-gray-500 text-center">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  // Afficher la liste des utilisateurs
  return (
    <div>
      <ScrollableTable
        scrollbarStyle="custom"
        enableWheelScroll={true}
        scrollButtonPosition="outsideTable"
      >
        <table className="min-w-full divide-y divide-gray-200 overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Utilisateur
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rôle
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Statut
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Créé le
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || "Sans nom"}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={
                      user.roleName === "SUPER_ADMIN"
                        ? "primary"
                        : user.roleName === "ADMIN"
                        ? "secondary"
                        : user.roleName === "TEACHER"
                        ? "accent"
                        : "success"
                    }
                    styleVariant="soft"
                    size="sm"
                  >
                    {user.roleName}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={user.emailVerified ? "success" : "warning"}
                    styleVariant="soft"
                    size="sm"
                  >
                    {user.emailVerified ? "Vérifié" : "En attente"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt.toISOString())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Précédent
            </button>
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page === pagination.pages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de{" "}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                à{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{" "}
                sur <span className="font-medium">{pagination.total}</span>{" "}
                utilisateurs
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    pagination.page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Précédent</span>
                  &lsaquo;
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    pagination.page === pagination.pages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Suivant</span>
                  &rsaquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
