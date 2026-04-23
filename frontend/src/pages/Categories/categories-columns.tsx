'use client'

import { Button } from '@/components/ui/button'
import { SortableHeader } from '@/components/ui/sortable-header'
import { Category } from '@/types/models'
import { ColumnDef } from '@tanstack/react-table'
import { Edit2, Trash2 } from 'lucide-react'

export type CategoryColumn = Category

/**
 * Definición de columnas para la tabla de categorías
 * Soporta:
 * - Ordenamiento por nombre
 * - Acciones: edit y delete (solo se muestra si se pasan callbacks)
 */
export const createCategoriesColumns = (
  onEdit?: (category: Category) => void,
  onDelete?: (category: Category) => void
): ColumnDef<CategoryColumn>[] => {
  const columns: ColumnDef<CategoryColumn>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: ({ column }) => <SortableHeader column={column} title="Nombre" />,
      cell: ({ row }) => {
        const name = row.getValue('name') as string
        return <div className="text-sm text-gray-900">{name}</div>
      },
      size: 300,
    },
  ]

  // Agregar columna de acciones solo si hay callbacks
  if (onEdit || onDelete) {
    columns.push({
      id: 'actions',
      header: () => <div className="w-full text-center text-sm font-medium">Acciones</div>,
      cell: ({ row }) => {
        const category = row.original
        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(category)
                }}
                title="Editar categoría"
                className="h-8 w-8 p-0">
                <Edit2 className="h-4 w-4 text-blue-600 hover:text-blue-800" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(category)
                }}
                title="Eliminar categoría"
                className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-800" />
              </Button>
            )}
          </div>
        )
      },
      size: 100,
      enableSorting: false,
      enableHiding: false,
    })
  }

  return columns
}
