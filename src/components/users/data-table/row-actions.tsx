"use client"

import { Button } from "@/components/ui/button"
import { User } from "@prisma/client"
import { Table } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"

interface RowActionsProps<TData> {
  table: Table<TData>
  onDelete?: (selectedUsers: User[]) => void
}

export function RowActions<TData>({
  table,
  onDelete,
}: RowActionsProps<TData>) {
  const selectedUsers = table.getFilteredSelectedRowModel().rows.map(
    (row) => row.original
  ) as User[]

  const hasSelected = selectedUsers.length > 0

  return (
    <div className="flex items-center gap-2">
      {hasSelected && (
        <>
          <Button
            color="destructive"
            size="sm"
            onClick={() => onDelete?.(selectedUsers)}
            disabled={!hasSelected}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer ({selectedUsers.length})
          </Button>
          {/* Vous pouvez ajouter d'autres actions ici */}
        </>
      )}
    </div>
  )
} 