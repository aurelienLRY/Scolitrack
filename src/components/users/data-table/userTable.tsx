// components/users/user-table.tsx
"use client"

import { DataTable } from "@/components/users/data-table/dataTable"
import { columns } from "@/components/users/data-table/columns"
import { User } from "@prisma/client"
import { usePaginatedUsers } from "@/hooks/query/useUsers"
import { Loading } from "@/components/ui/Loading"
import { toast } from "sonner" // Si vous utilisez sonner pour les notifications

export function UserTable() {
  const { users, pagination, isLoading, error, goToPage, refetch } = usePaginatedUsers()

   console.log(users)

  const handleDelete = async (selectedUsers: User[]) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`)) {

      try {
        // Implémentation fictive - à remplacer par votre API réelle
        // Exemple : await Promise.all(selectedUsers.map(user => deleteUser(user.id)))
        console.log("Suppression des utilisateurs:", selectedUsers)
        
        // Simuler un délai pour montrer le processus
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast.success(`${selectedUsers.length} utilisateur(s) supprimé(s) avec succès`)
        refetch()
      } catch (error) {
        toast.error("Une erreur s'est produite lors de la suppression")
        console.error(error)
      } 
    }
  }

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
    )
  }

  if (isLoading || !users) {
    return <Loading />
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        onPageChange={goToPage}
        onDelete={handleDelete}
      />
    </div>
  )
}