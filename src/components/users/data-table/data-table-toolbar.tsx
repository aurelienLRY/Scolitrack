"use client"

import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import Input from "@/components/ui/inputs/Input"
import { X, Download, Settings2 } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { User } from "@prisma/client"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  data: User[]
}

export function DataTableToolbar<TData>({
  table,
  data,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  
  // Récupérer les lignes sélectionnées
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0
  const selectedData = hasSelection 
    ? selectedRows.map(row => row.original as User) 
    : data

  // Fonction pour extraire les valeurs des champs en toute sécurité
  const safeGetUserValue = (user: User, field: keyof User): string => {
    if (field === "name") return user.name || "Sans nom";
    if (field === "email") return user.email;
    if (field === "roleName") return user.roleName;
    if (field === "emailVerified") return user.emailVerified ? "Vérifié" : "En attente";
    if (field === "createdAt") {
      // S'assurer que createdAt existe et est valide
      if (!user.createdAt) return "";
      try {
        return new Date(user.createdAt).toLocaleDateString("fr-FR");
      } catch {
        return String(user.createdAt);
      }
    }
    // Pour les autres champs
    const value = user[field];
    if (value === null || value === undefined) return "";
    return String(value);
  };

  // Fonction utilitaire pour télécharger un fichier proprement
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    // Créer un blob
    const blob = new Blob([content], { type: mimeType })
    // Créer une URL pour le blob
    const url = URL.createObjectURL(blob)
    
    // Créer un élément <a> pour déclencher le téléchargement
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    
    // Ajouter l'élément au DOM, cliquer dessus puis le supprimer
    document.body.appendChild(link)
    link.click()
    
    // Important: un petit délai avant de nettoyer pour s'assurer que le téléchargement démarre
    setTimeout(() => {
      // Supprimer l'élément du DOM
      document.body.removeChild(link)
      // Révoquer l'URL pour libérer la mémoire et éviter les fuites
      URL.revokeObjectURL(url)
    }, 100)
  }

  // Fonction pour exporter en CSV
  const exportToCSV = () => {
    // Obtenir les colonnes visibles uniquement
    const visibleColumns = table.getAllColumns()
      .filter(column => column.getIsVisible() && column.id !== "select")
    
    // Entêtes du CSV - uniquement pour les colonnes visibles
    const headers = visibleColumns.map(column => {
      // Obtenir le titre de la colonne
      if (column.id === "name") return "Nom";
      if (column.id === "email") return "Email";
      if (column.id === "roleName") return "Rôle";
      if (column.id === "emailVerified") return "Statut";
      if (column.id === "createdAt") return "Créé le";
      return column.id;
    });
    
    // Convertir les données en lignes CSV
    const csvRows = selectedData.map((user) => {
      return visibleColumns.map(column => {
        const id = column.id as keyof User;
        return safeGetUserValue(user, id);
      });
    });
    
    // Ajouter les entêtes aux lignes
    const allRows = [headers, ...csvRows]
    
    // Convertir en chaîne CSV
    const csv = allRows.map(row => row.join(',')).join('\n')
    
    // Télécharger le fichier
    downloadFile(
      csv,
      `utilisateurs${hasSelection ? '_selection' : ''}.csv`,
      'text/csv;charset=utf-8;'
    )
  }

  // Fonction pour exporter en JSON
  const exportToJSON = () => {
    // Filtrer pour inclure uniquement les colonnes visibles
    const visibleColumns = table.getAllColumns()
      .filter(column => column.getIsVisible() && column.id !== "select")
      .map(column => column.id as keyof User)
    
    // Créer un nouvel objet pour chaque utilisateur avec uniquement les colonnes visibles
    const filteredData = selectedData.map(user => {
      const filteredUser: Record<string, unknown> = {};
      visibleColumns.forEach(key => {
        if (key === "emailVerified") {
          filteredUser[key] = user[key] ? "Vérifié" : "En attente";
        } else if (key === "createdAt" && user[key]) {
          try {
            filteredUser[key] = new Date(user[key] as Date).toISOString();
          } catch {
            filteredUser[key] = user[key];
          }
        } else {
          filteredUser[key] = user[key];
        }
      });
      return filteredUser;
    });
    
    // Générer la chaîne JSON
    const jsonString = JSON.stringify(filteredData, null, 2)
    
    // Télécharger le fichier
    downloadFile(
      jsonString,
      `utilisateurs${hasSelection ? '_selection' : ''}.json`,
      'application/json'
    )
  }

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Réinitialiser
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        {/* Visibilité des colonnes */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" color="accent" className="h-8 flex gap-1">
              <Settings2 className="h-4 w-4" />
              Colonnes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Afficher/Masquer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table.getAllColumns()
              .filter(column => column.id !== "select" && column.getCanHide())
              .map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id === "name" ? "Utilisateur" : 
                   column.id === "roleName" ? "Rôle" : 
                   column.id === "emailVerified" ? "Statut" : 
                   column.id === "createdAt" ? "Créé le" : column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Exportation */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" color="accent" className="ml-auto h-8 flex gap-1">
              <Download className="h-4 w-4" />
              {hasSelection ? `Exporter (${selectedRows.length})` : "Exporter"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToCSV}>
              Exporter en CSV {hasSelection && `(${selectedRows.length})`}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToJSON}>
              Exporter en JSON {hasSelection && `(${selectedRows.length})`}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 